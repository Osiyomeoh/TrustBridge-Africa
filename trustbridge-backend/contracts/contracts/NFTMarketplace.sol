// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./AssetNFT.sol";

/**
 * @title NFT Marketplace - Secondary market for asset NFTs
 * @notice Centrifuge-style marketplace for trading tokenized assets
 */
contract NFTMarketplace is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant LISTER_ROLE = keccak256("LISTER_ROLE");
    
    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool isActive;
        uint256 createdAt;
        uint256 expiresAt;
    }
    
    struct Offer {
        address buyer;
        uint256 price;
        bool isActive;
        uint256 createdAt;
        uint256 expiresAt;
    }
    
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => mapping(address => Offer)) public offers;
    mapping(address => uint256[]) public userListings;
    mapping(address => uint256[]) public userOffers;
    
    uint256 public listingCounter;
    uint256 public tradingFee = 250; // 2.5% in basis points
    uint256 public minimumListingPrice = 0.01 ether;
    uint256 public maximumListingPrice = 1000000 ether;
    
    address public feeRecipient;
    AssetNFT public assetNFT;
    
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
        uint256 fee
    );
    
    event OfferMade(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 price
    );
    
    event OfferAccepted(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 price
    );
    
    event ListingCancelled(uint256 indexed listingId);
    event OfferCancelled(uint256 indexed listingId, address indexed buyer);
    
    constructor(address _assetNFT, address payable _feeRecipient) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(LISTER_ROLE, msg.sender);
        
        assetNFT = AssetNFT(_assetNFT);
        feeRecipient = _feeRecipient;
    }
    
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
    
    function buyAsset(uint256 listingId) external payable whenNotPaused nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(block.timestamp <= listing.expiresAt, "Listing expired");
        require(msg.value >= listing.price, "Insufficient payment");
        require(msg.sender != listing.seller, "Cannot buy own asset");
        
        // Calculate fees
        uint256 fee = (listing.price * tradingFee) / 10000;
        uint256 sellerAmount = listing.price - fee;
        
        // Transfer NFT
        IERC721(listing.nftContract).safeTransferFrom(
            listing.seller,
            msg.sender,
            listing.tokenId
        );
        
        // Transfer payment
        (bool success1, ) = payable(listing.seller).call{value: sellerAmount}("");
        require(success1, "Payment to seller failed");
        
        (bool success2, ) = payable(feeRecipient).call{value: fee}("");
        require(success2, "Fee transfer failed");
        
        // Refund excess
        if (msg.value > listing.price) {
            (bool success3, ) = payable(msg.sender).call{value: msg.value - listing.price}("");
            require(success3, "Refund failed");
        }
        
        // Deactivate listing
        listing.isActive = false;
        
        emit AssetSold(listingId, listing.seller, msg.sender, listing.price, fee);
    }
    
    function makeOffer(uint256 listingId, uint256 duration) external payable whenNotPaused nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(block.timestamp <= listing.expiresAt, "Listing expired");
        require(msg.sender != listing.seller, "Cannot offer on own asset");
        require(msg.value > 0, "Offer must be > 0");
        require(duration > 0, "Invalid duration");
        
        offers[listingId][msg.sender] = Offer({
            buyer: msg.sender,
            price: msg.value,
            isActive: true,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + duration
        });
        
        userOffers[msg.sender].push(listingId);
        
        emit OfferMade(listingId, msg.sender, msg.value);
    }
    
    function acceptOffer(uint256 listingId, address buyer) external whenNotPaused nonReentrant {
        Listing storage listing = listings[listingId];
        Offer storage offer = offers[listingId][buyer];
        
        require(listing.seller == msg.sender, "Not seller");
        require(offer.isActive, "Offer not active");
        require(block.timestamp <= offer.expiresAt, "Offer expired");
        require(IERC721(listing.nftContract).ownerOf(listing.tokenId) == msg.sender, "Not owner");
        require(IERC721(listing.nftContract).getApproved(listing.tokenId) == address(this) || 
                IERC721(listing.nftContract).isApprovedForAll(msg.sender, address(this)), "Not approved");
        
        // Calculate fees
        uint256 fee = (offer.price * tradingFee) / 10000;
        uint256 sellerAmount = offer.price - fee;
        
        // Transfer NFT
        IERC721(listing.nftContract).safeTransferFrom(
            msg.sender,
            buyer,
            listing.tokenId
        );
        
        // Transfer payment
        (bool success1, ) = payable(msg.sender).call{value: sellerAmount}("");
        require(success1, "Payment to seller failed");
        
        (bool success2, ) = payable(feeRecipient).call{value: fee}("");
        require(success2, "Fee transfer failed");
        
        // Deactivate listing and offer
        listing.isActive = false;
        offer.isActive = false;
        
        emit OfferAccepted(listingId, buyer, offer.price);
    }
    
    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not seller");
        require(listing.isActive, "Listing not active");
        
        listing.isActive = false;
        
        emit ListingCancelled(listingId);
    }
    
    function cancelOffer(uint256 listingId) external {
        Offer storage offer = offers[listingId][msg.sender];
        require(offer.buyer == msg.sender, "Not buyer");
        require(offer.isActive, "Offer not active");
        
        offer.isActive = false;
        
        // Refund buyer
        (bool success, ) = payable(msg.sender).call{value: offer.price}("");
        require(success, "Refund failed");
        
        emit OfferCancelled(listingId, msg.sender);
    }
    
    function getListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }
    
    function getOffer(uint256 listingId, address buyer) external view returns (Offer memory) {
        return offers[listingId][buyer];
    }
    
    function getUserListings(address user) external view returns (uint256[] memory) {
        return userListings[user];
    }
    
    function getUserOffers(address user) external view returns (uint256[] memory) {
        return userOffers[user];
    }
    
    function getActiveListings() external view returns (uint256[] memory) {
        uint256[] memory activeListings = new uint256[](listingCounter);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= listingCounter; i++) {
            if (listings[i].isActive && block.timestamp <= listings[i].expiresAt) {
                activeListings[count] = i;
                count++;
            }
        }
        
        // Resize array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeListings[i];
        }
        
        return result;
    }
    
    function setTradingFee(uint256 newFee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        tradingFee = newFee;
    }
    
    function setPriceLimits(uint256 minPrice, uint256 maxPrice) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(minPrice < maxPrice, "Invalid limits");
        minimumListingPrice = minPrice;
        maximumListingPrice = maxPrice;
    }
    
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    // Allow contract to receive ETH
    receive() external payable {
        // Accept ETH transfers
    }
}
