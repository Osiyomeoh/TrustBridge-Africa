// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TrustBridge NFT Marketplace
 * @notice Decentralized marketplace for buying and selling NFTs using TRUST tokens
 * @dev Uses Hedera Token Service (HTS) for NFT and TRUST token transfers
 */
contract TrustBridgeMarketplace {
    // ============ State Variables ============
    
    /// @notice Address of the TRUST token (HTS token)
    address public trustTokenAddress;
    
    /// @notice Platform fee percentage (basis points, e.g., 250 = 2.5%)
    uint256 public platformFeeBps;
    
    /// @notice Platform treasury address that receives fees
    address public platformTreasury;
    
    /// @notice Contract owner
    address public owner;
    
    /// @notice Listing counter for unique IDs
    uint256 public nextListingId;
    
    // ============ Structs ============
    
    struct Listing {
        uint256 listingId;
        address seller;
        address nftAddress;
        uint256 serialNumber;
        uint256 price;
        bool isActive;
        uint256 listedAt;
        address creator;
        uint256 royaltyBps; // Royalty in basis points (e.g., 500 = 5%)
    }
    
    // ============ Mappings ============
    
    /// @notice Mapping from listing ID to listing details
    mapping(uint256 => Listing) public listings;
    
    /// @notice Mapping from NFT address + serial number to listing ID
    mapping(address => mapping(uint256 => uint256)) public nftToListing;
    
    /// @notice Total number of active listings
    uint256 public activeListingCount;
    
    /// @notice Mapping from NFT address + serial number to creator address
    mapping(address => mapping(uint256 => address)) public nftCreators;
    
    /// @notice Mapping from NFT address + serial number to royalty percentage (basis points)
    mapping(address => mapping(uint256 => uint256)) public nftRoyalties;
    
    // ============ Events ============
    
    event Listed(
        uint256 indexed listingId,
        address indexed seller,
        address indexed nftAddress,
        uint256 serialNumber,
        uint256 price,
        uint256 timestamp
    );
    
    event Sold(
        uint256 indexed listingId,
        address indexed seller,
        address indexed buyer,
        address nftAddress,
        uint256 serialNumber,
        uint256 price,
        uint256 platformFee,
        uint256 royaltyFee,
        address creator,
        uint256 timestamp
    );
    
    event ListingCancelled(
        uint256 indexed listingId,
        address indexed seller,
        address indexed nftAddress,
        uint256 serialNumber,
        uint256 timestamp
    );
    
    event PriceUpdated(
        uint256 indexed listingId,
        uint256 oldPrice,
        uint256 newPrice,
        uint256 timestamp
    );
    
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    
    event TreasuryUpdated(address oldTreasury, address newTreasury);
    
    // ============ Modifiers ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }
    
    modifier listingExists(uint256 _listingId) {
        require(listings[_listingId].listingId == _listingId, "Listing does not exist");
        _;
    }
    
    modifier listingActive(uint256 _listingId) {
        require(listings[_listingId].isActive, "Listing is not active");
        _;
    }
    
    modifier onlySeller(uint256 _listingId) {
        require(listings[_listingId].seller == msg.sender, "Not the seller");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(
        address _trustTokenAddress,
        address _platformTreasury,
        uint256 _platformFeeBps
    ) {
        require(_trustTokenAddress != address(0), "Invalid TRUST token address");
        require(_platformTreasury != address(0), "Invalid treasury address");
        require(_platformFeeBps <= 1000, "Platform fee too high (max 10%)");
        
        trustTokenAddress = _trustTokenAddress;
        platformTreasury = _platformTreasury;
        platformFeeBps = _platformFeeBps;
        owner = msg.sender;
        nextListingId = 1;
    }
    
    // ============ Core Marketplace Functions ============
    
    /**
     * @notice List an NFT for sale
     * @dev Seller must approve marketplace contract for NFT transfer first
     * @param _nftAddress The HTS NFT token address
     * @param _serialNumber The NFT serial number
     * @param _price The listing price in TRUST tokens (smallest unit)
     */
    function listNFT(
        address _nftAddress,
        uint256 _serialNumber,
        uint256 _price,
        address _creator,
        uint256 _royaltyBps
    ) external returns (uint256) {
        require(_nftAddress != address(0), "Invalid NFT address");
        require(_price > 0, "Price must be greater than 0");
        require(nftToListing[_nftAddress][_serialNumber] == 0, "NFT already listed");
        require(_royaltyBps <= 1000, "Royalty cannot exceed 10%");
        
        uint256 listingId = nextListingId++;
        
        // Set creator and royalty if this is the first listing
        if (nftCreators[_nftAddress][_serialNumber] == address(0)) {
            nftCreators[_nftAddress][_serialNumber] = _creator != address(0) ? _creator : msg.sender;
            nftRoyalties[_nftAddress][_serialNumber] = _royaltyBps;
        }
        
        listings[listingId] = Listing({
            listingId: listingId,
            seller: msg.sender,
            nftAddress: _nftAddress,
            serialNumber: _serialNumber,
            price: _price,
            isActive: true,
            listedAt: block.timestamp,
            creator: nftCreators[_nftAddress][_serialNumber],
            royaltyBps: nftRoyalties[_nftAddress][_serialNumber]
        });
        
        nftToListing[_nftAddress][_serialNumber] = listingId;
        activeListingCount++;
        
        emit Listed(
            listingId,
            msg.sender,
            _nftAddress,
            _serialNumber,
            _price,
            block.timestamp
        );
        
        return listingId;
    }
    
    /**
     * @notice Buy an NFT from the marketplace
     * @dev Buyer must approve marketplace for TRUST token transfer first
     * @dev Marketplace must have NFT allowance from seller
     * @param _listingId The ID of the listing to purchase
     */
    function buyNFT(uint256 _listingId) 
        external 
        listingExists(_listingId) 
        listingActive(_listingId)
    {
        Listing storage listing = listings[_listingId];
        
        require(msg.sender != listing.seller, "Seller cannot buy own NFT");
        
        uint256 price = listing.price;
        uint256 platformFee = (price * platformFeeBps) / 10000;
        
        // Calculate royalty fee
        uint256 royaltyFee = 0;
        address creator = listing.creator;
        
        // Only pay royalty if creator exists and is not the seller (no royalty on primary sales)
        if (creator != address(0) && creator != listing.seller) {
            royaltyFee = (price * listing.royaltyBps) / 10000;
        }
        
        uint256 sellerAmount = price - platformFee - royaltyFee;
        
        // Mark as inactive before transfers to prevent reentrancy
        listing.isActive = false;
        activeListingCount--;
        nftToListing[listing.nftAddress][listing.serialNumber] = 0;
        
        // Note: In Hedera, these transfers are handled by the SDK
        // The actual HTS token transfers will be done through Hedera SDK
        // This contract mainly tracks state and emits events
        // Payment distribution:
        // - Seller receives: sellerAmount
        // - Creator receives: royaltyFee (if applicable)
        // - Platform receives: platformFee
        
        emit Sold(
            _listingId,
            listing.seller,
            msg.sender,
            listing.nftAddress,
            listing.serialNumber,
            price,
            platformFee,
            royaltyFee,
            creator,
            block.timestamp
        );
    }
    
    /**
     * @notice Cancel a listing
     * @param _listingId The ID of the listing to cancel
     */
    function cancelListing(uint256 _listingId)
        external
        listingExists(_listingId)
        listingActive(_listingId)
        onlySeller(_listingId)
    {
        Listing storage listing = listings[_listingId];
        
        listing.isActive = false;
        activeListingCount--;
        nftToListing[listing.nftAddress][listing.serialNumber] = 0;
        
        emit ListingCancelled(
            _listingId,
            msg.sender,
            listing.nftAddress,
            listing.serialNumber,
            block.timestamp
        );
    }
    
    /**
     * @notice Update the price of an active listing
     * @param _listingId The ID of the listing to update
     * @param _newPrice The new price in TRUST tokens
     */
    function updatePrice(uint256 _listingId, uint256 _newPrice)
        external
        listingExists(_listingId)
        listingActive(_listingId)
        onlySeller(_listingId)
    {
        require(_newPrice > 0, "Price must be greater than 0");
        
        Listing storage listing = listings[_listingId];
        uint256 oldPrice = listing.price;
        listing.price = _newPrice;
        
        emit PriceUpdated(_listingId, oldPrice, _newPrice, block.timestamp);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get listing details
     * @param _listingId The listing ID
     */
    function getListing(uint256 _listingId)
        external
        view
        listingExists(_listingId)
        returns (
            address seller,
            address nftAddress,
            uint256 serialNumber,
            uint256 price,
            bool isActive,
            uint256 listedAt
        )
    {
        Listing memory listing = listings[_listingId];
        return (
            listing.seller,
            listing.nftAddress,
            listing.serialNumber,
            listing.price,
            listing.isActive,
            listing.listedAt
        );
    }
    
    /**
     * @notice Check if an NFT is listed
     * @param _nftAddress The NFT token address
     * @param _serialNumber The NFT serial number
     */
    function isNFTListed(address _nftAddress, uint256 _serialNumber)
        external
        view
        returns (bool, uint256)
    {
        uint256 listingId = nftToListing[_nftAddress][_serialNumber];
        if (listingId == 0) {
            return (false, 0);
        }
        return (listings[listingId].isActive, listingId);
    }
    
    /**
     * @notice Calculate fees for a given price
     * @param _price The listing price
     */
    function calculateFees(uint256 _price)
        external
        view
        returns (uint256 platformFee, uint256 sellerAmount)
    {
        platformFee = (_price * platformFeeBps) / 10000;
        sellerAmount = _price - platformFee;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Update platform fee
     * @param _newFeeBps New fee in basis points (max 1000 = 10%)
     */
    function setPlatformFee(uint256 _newFeeBps) external onlyOwner {
        require(_newFeeBps <= 1000, "Fee too high (max 10%)");
        uint256 oldFee = platformFeeBps;
        platformFeeBps = _newFeeBps;
        emit PlatformFeeUpdated(oldFee, _newFeeBps);
    }
    
    /**
     * @notice Update platform treasury address
     * @param _newTreasury New treasury address
     */
    function setPlatformTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid treasury address");
        address oldTreasury = platformTreasury;
        platformTreasury = _newTreasury;
        emit TreasuryUpdated(oldTreasury, _newTreasury);
    }
    
    /**
     * @notice Transfer contract ownership
     * @param _newOwner New owner address
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid new owner");
        owner = _newOwner;
    }
    
    /**
     * @notice Get contract configuration
     */
    function getConfig()
        external
        view
        returns (
            address _trustToken,
            address _treasury,
            uint256 _feeBps,
            address _owner,
            uint256 _activeListings
        )
    {
        return (
            trustTokenAddress,
            platformTreasury,
            platformFeeBps,
            owner,
            activeListingCount
        );
    }
    
    /**
     * @notice Get all active listings
     * @dev Returns listing IDs from 0 to nextListingId that are still active
     * Note: This is gas-intensive for large numbers of listings
     */
    function getActiveListings(uint256 _limit) 
        external 
        view 
        returns (Listing[] memory) 
    {
        // First, count active listings
        uint256 activeCount = 0;
        for (uint256 i = 0; i < nextListingId && activeCount < _limit; i++) {
            if (listings[i].isActive) {
                activeCount++;
            }
        }
        
        // Create array of active listings
        Listing[] memory activeListings = new Listing[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < nextListingId && index < activeCount; i++) {
            if (listings[i].isActive) {
                activeListings[index] = listings[i];
                index++;
            }
        }
        
        return activeListings;
    }
    
    /**
     * @notice Get listing by ID
     * @param _listingId The listing ID to query
     */
    function getListingById(uint256 _listingId) 
        external 
        view 
        returns (Listing memory) 
    {
        require(listings[_listingId].listingId == _listingId, "Listing does not exist");
        return listings[_listingId];
    }
}

