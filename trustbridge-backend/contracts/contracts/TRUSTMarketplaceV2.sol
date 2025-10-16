// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title TRUST Marketplace V2 - With Royalty Support
 * @notice Enhanced marketplace with creator royalties on secondary sales
 */
contract TRUSTMarketplaceV2 is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant LISTER_ROLE = keccak256("LISTER_ROLE");
    
    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price; // Price in TRUST tokens
        bool isActive;
        uint256 createdAt;
        uint256 expiresAt;
    }
    
    struct Offer {
        address buyer;
        uint256 price; // Price in TRUST tokens
        bool isActive;
        uint256 createdAt;
        uint256 expiresAt;
    }
    
    struct Royalty {
        address creator;
        uint256 percentage; // In basis points (e.g., 500 = 5%)
    }
    
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => mapping(address => Offer)) public offers;
    mapping(address => uint256[]) public userListings;
    mapping(address => uint256[]) public userOffers;
    mapping(address => mapping(uint256 => Royalty)) public royalties; // nftContract => tokenId => Royalty
    
    uint256 public listingCounter;
    uint256 public tradingFee = 250; // 2.5% in basis points
    uint256 public minimumListingPrice = 1e18; // 1 TRUST token minimum
    uint256 public maximumListingPrice = 1000000e18; // 1M TRUST tokens maximum
    uint256 public maxRoyaltyPercentage = 1000; // 10% maximum royalty
    
    address public feeRecipient;
    IERC20 public trustToken;
    
    event AssetListed(
        uint256 indexed listingId,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 price
    );
    
    event AssetSold(
        uint256 indexed listingId,
        address indexed seller,
        address indexed buyer,
        uint256 price,
        uint256 fee,
        uint256 royalty
    );
    
    event RoyaltySet(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed creator,
        uint256 percentage
    );
    
    event OfferMade(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 price
    );
    
    event OfferAccepted(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 price,
        uint256 royalty
    );
    
    event ListingCancelled(uint256 indexed listingId);
    event OfferCancelled(uint256 indexed listingId, address indexed buyer);
    
    constructor(
        address _trustToken,
        address _feeRecipient
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(LISTER_ROLE, msg.sender);
        
        trustToken = IERC20(_trustToken);
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @notice Set royalty for an NFT (only creator can set)
     * @param nftContract The NFT contract address
     * @param tokenId The token ID
     * @param percentage Royalty percentage in basis points (e.g., 500 = 5%)
     */
    function setRoyalty(
        address nftContract,
        uint256 tokenId,
        uint256 percentage
    ) external {
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Not owner");
        require(percentage <= maxRoyaltyPercentage, "Royalty too high");
        
        royalties[nftContract][tokenId] = Royalty({
            creator: msg.sender,
            percentage: percentage
        });
        
        emit RoyaltySet(nftContract, tokenId, msg.sender, percentage);
    }
    
    /**
     * @notice List asset for sale
     */
    function listAsset(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        uint256 duration
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(price >= minimumListingPrice, "Price too low");
        require(price <= maximumListingPrice, "Price too high");
        require(duration > 0, "Invalid duration");
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Not owner");
        require(IERC721(nftContract).getApproved(tokenId) == address(this) || 
                IERC721(nftContract).isApprovedForAll(msg.sender, address(this)), "Not approved");
        
        listingCounter++;
        uint256 listingId = listingCounter;
        
        listings[listingId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            isActive: true,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + duration
        });
        
        userListings[msg.sender].push(listingId);
        
        emit AssetListed(listingId, msg.sender, nftContract, tokenId, price);
        
        return listingId;
    }
    
    /**
     * @notice Buy listed asset (with royalty support)
     */
    function buyAsset(uint256 listingId) external whenNotPaused nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(block.timestamp <= listing.expiresAt, "Listing expired");
        require(msg.sender != listing.seller, "Cannot buy own asset");
        
        // Check TRUST token balance and allowance
        require(trustToken.balanceOf(msg.sender) >= listing.price, "Insufficient TRUST tokens");
        require(trustToken.allowance(msg.sender, address(this)) >= listing.price, "Insufficient TRUST allowance");
        
        // Calculate platform fee
        uint256 platformFee = (listing.price * tradingFee) / 10000;
        
        // Calculate royalty (if exists)
        Royalty memory royalty = royalties[listing.nftContract][listing.tokenId];
        uint256 royaltyAmount = 0;
        
        if (royalty.creator != address(0) && royalty.creator != listing.seller) {
            royaltyAmount = (listing.price * royalty.percentage) / 10000;
        }
        
        // Calculate seller amount
        uint256 sellerAmount = listing.price - platformFee - royaltyAmount;
        
        // Transfer TRUST tokens from buyer
        require(trustToken.transferFrom(msg.sender, address(this), listing.price), "TRUST transfer failed");
        
        // Transfer NFT to buyer
        IERC721(listing.nftContract).safeTransferFrom(
            listing.seller,
            msg.sender,
            listing.tokenId
        );
        
        // Distribute payments
        require(trustToken.transfer(listing.seller, sellerAmount), "Payment to seller failed");
        require(trustToken.transfer(feeRecipient, platformFee), "Fee transfer failed");
        
        if (royaltyAmount > 0 && royalty.creator != address(0)) {
            require(trustToken.transfer(royalty.creator, royaltyAmount), "Royalty payment failed");
        }
        
        // Deactivate listing
        listing.isActive = false;
        
        emit AssetSold(listingId, listing.seller, msg.sender, listing.price, platformFee, royaltyAmount);
    }
    
    /**
     * @notice Make an offer on a listed asset
     */
    function makeOffer(uint256 listingId, uint256 price, uint256 duration) external whenNotPaused nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(block.timestamp <= listing.expiresAt, "Listing expired");
        require(msg.sender != listing.seller, "Cannot offer on own asset");
        require(price > 0, "Offer must be > 0");
        require(duration > 0, "Invalid duration");
        require(trustToken.balanceOf(msg.sender) >= price, "Insufficient TRUST tokens");
        require(trustToken.allowance(msg.sender, address(this)) >= price, "Insufficient TRUST allowance");
        
        // Transfer TRUST tokens to escrow
        require(trustToken.transferFrom(msg.sender, address(this), price), "TRUST transfer failed");
        
        offers[listingId][msg.sender] = Offer({
            buyer: msg.sender,
            price: price,
            isActive: true,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + duration
        });
        
        userOffers[msg.sender].push(listingId);
        
        emit OfferMade(listingId, msg.sender, price);
    }
    
    /**
     * @notice Accept an offer (with royalty support)
     */
    function acceptOffer(uint256 listingId, address buyer) external whenNotPaused nonReentrant {
        Listing storage listing = listings[listingId];
        Offer storage offer = offers[listingId][buyer];
        
        require(listing.isActive, "Listing not active");
        require(listing.seller == msg.sender, "Not seller");
        require(offer.isActive, "Offer not active");
        require(block.timestamp <= offer.expiresAt, "Offer expired");
        
        // Calculate platform fee
        uint256 platformFee = (offer.price * tradingFee) / 10000;
        
        // Calculate royalty (if exists)
        Royalty memory royalty = royalties[listing.nftContract][listing.tokenId];
        uint256 royaltyAmount = 0;
        
        if (royalty.creator != address(0) && royalty.creator != listing.seller) {
            royaltyAmount = (offer.price * royalty.percentage) / 10000;
        }
        
        // Calculate seller amount
        uint256 sellerAmount = offer.price - platformFee - royaltyAmount;
        
        // Transfer NFT to buyer
        IERC721(listing.nftContract).safeTransferFrom(
            listing.seller,
            buyer,
            listing.tokenId
        );
        
        // Distribute payments (TRUST already in escrow)
        require(trustToken.transfer(listing.seller, sellerAmount), "Payment to seller failed");
        require(trustToken.transfer(feeRecipient, platformFee), "Fee transfer failed");
        
        if (royaltyAmount > 0 && royalty.creator != address(0)) {
            require(trustToken.transfer(royalty.creator, royaltyAmount), "Royalty payment failed");
        }
        
        // Deactivate listing and offer
        listing.isActive = false;
        offer.isActive = false;
        
        emit OfferAccepted(listingId, buyer, offer.price, royaltyAmount);
    }
    
    /**
     * @notice Cancel a listing
     */
    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(listing.seller == msg.sender, "Not seller");
        
        listing.isActive = false;
        
        emit ListingCancelled(listingId);
    }
    
    /**
     * @notice Cancel an offer
     */
    function cancelOffer(uint256 listingId) external nonReentrant {
        Offer storage offer = offers[listingId][msg.sender];
        require(offer.isActive, "Offer not active");
        
        // Return escrowed TRUST tokens
        require(trustToken.transfer(msg.sender, offer.price), "Refund failed");
        
        offer.isActive = false;
        
        emit OfferCancelled(listingId, msg.sender);
    }
    
    /**
     * @notice Get royalty info for an NFT
     */
    function getRoyaltyInfo(address nftContract, uint256 tokenId) external view returns (address creator, uint256 percentage) {
        Royalty memory royalty = royalties[nftContract][tokenId];
        return (royalty.creator, royalty.percentage);
    }
    
    /**
     * @notice Update trading fee (admin only)
     */
    function setTradingFee(uint256 _fee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_fee <= 1000, "Fee too high"); // Max 10%
        tradingFee = _fee;
    }
    
    /**
     * @notice Update fee recipient (admin only)
     */
    function setFeeRecipient(address _feeRecipient) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_feeRecipient != address(0), "Invalid address");
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @notice Pause marketplace (admin only)
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @notice Unpause marketplace (admin only)
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    // ============ GETTER FUNCTIONS ============
    
    /**
     * @notice Get trading fee percentage in basis points
     */
    function getTradingFee() external view returns (uint256) {
        return tradingFee;
    }
    
    /**
     * @notice Get maximum royalty percentage allowed
     */
    function getMaxRoyaltyPercentage() external view returns (uint256) {
        return maxRoyaltyPercentage;
    }
    
    /**
     * @notice Get minimum listing price
     */
    function getMinimumListingPrice() external view returns (uint256) {
        return minimumListingPrice;
    }
    
    /**
     * @notice Get maximum listing price
     */
    function getMaximumListingPrice() external view returns (uint256) {
        return maximumListingPrice;
    }
}

