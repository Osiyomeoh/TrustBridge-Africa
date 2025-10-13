// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TrustBridge Offers System
 * @notice Decentralized offer system for NFTs - buyers can make offers on any NFT
 * @dev Works alongside the marketplace contract for complete trading experience
 */
contract TrustBridgeOffers {
    // ============ State Variables ============
    
    address public trustTokenAddress;
    uint256 public nextOfferId;
    
    // ============ Structs ============
    
    struct Offer {
        uint256 offerId;
        address buyer;
        address nftAddress;
        uint256 serialNumber;
        uint256 offerPrice;
        uint256 expiresAt;
        bool isActive;
        uint256 createdAt;
    }
    
    // ============ Mappings ============
    
    /// @notice Mapping from offer ID to offer details
    mapping(uint256 => Offer) public offers;
    
    /// @notice Mapping from NFT to all offer IDs
    mapping(address => mapping(uint256 => uint256[])) public nftOffers;
    
    /// @notice Mapping from buyer to their offer IDs
    mapping(address => uint256[]) public buyerOffers;
    
    // ============ Events ============
    
    event OfferCreated(
        uint256 indexed offerId,
        address indexed buyer,
        address indexed nftAddress,
        uint256 serialNumber,
        uint256 offerPrice,
        uint256 expiresAt,
        uint256 timestamp
    );
    
    event OfferAccepted(
        uint256 indexed offerId,
        address indexed seller,
        address indexed buyer,
        uint256 finalPrice,
        uint256 timestamp
    );
    
    event OfferCancelled(
        uint256 indexed offerId,
        address indexed buyer,
        uint256 timestamp
    );
    
    event OfferExpired(
        uint256 indexed offerId,
        uint256 timestamp
    );
    
    // ============ Constructor ============
    
    constructor(address _trustTokenAddress) {
        require(_trustTokenAddress != address(0), "Invalid TRUST token address");
        trustTokenAddress = _trustTokenAddress;
        nextOfferId = 1;
    }
    
    // ============ Core Offer Functions ============
    
    /**
     * @notice Make an offer on an NFT
     * @param _nftAddress The NFT token address
     * @param _serialNumber The NFT serial number
     * @param _offerPrice The offer price in TRUST tokens
     * @param _durationDays How many days the offer is valid
     */
    function makeOffer(
        address _nftAddress,
        uint256 _serialNumber,
        uint256 _offerPrice,
        uint256 _durationDays
    ) external returns (uint256) {
        require(_nftAddress != address(0), "Invalid NFT address");
        require(_offerPrice > 0, "Offer price must be greater than 0");
        require(_durationDays > 0 && _durationDays <= 30, "Duration must be 1-30 days");
        
        uint256 offerId = nextOfferId++;
        uint256 expiresAt = block.timestamp + (_durationDays * 1 days);
        
        offers[offerId] = Offer({
            offerId: offerId,
            buyer: msg.sender,
            nftAddress: _nftAddress,
            serialNumber: _serialNumber,
            offerPrice: _offerPrice,
            expiresAt: expiresAt,
            isActive: true,
            createdAt: block.timestamp
        });
        
        // Track offer for this NFT
        nftOffers[_nftAddress][_serialNumber].push(offerId);
        
        // Track buyer's offers
        buyerOffers[msg.sender].push(offerId);
        
        emit OfferCreated(
            offerId,
            msg.sender,
            _nftAddress,
            _serialNumber,
            _offerPrice,
            expiresAt,
            block.timestamp
        );
        
        return offerId;
    }
    
    /**
     * @notice Accept an offer (NFT owner)
     * @dev Seller accepts the offer and transfer happens
     * @param _offerId The offer ID to accept
     */
    function acceptOffer(uint256 _offerId) external {
        Offer storage offer = offers[_offerId];
        
        require(offer.offerId == _offerId, "Offer does not exist");
        require(offer.isActive, "Offer is not active");
        require(block.timestamp <= offer.expiresAt, "Offer has expired");
        
        // Mark as inactive before transfers
        offer.isActive = false;
        
        emit OfferAccepted(
            _offerId,
            msg.sender,
            offer.buyer,
            offer.offerPrice,
            block.timestamp
        );
    }
    
    /**
     * @notice Cancel an offer (buyer)
     * @param _offerId The offer ID to cancel
     */
    function cancelOffer(uint256 _offerId) external {
        Offer storage offer = offers[_offerId];
        
        require(offer.offerId == _offerId, "Offer does not exist");
        require(offer.buyer == msg.sender, "Not the offer creator");
        require(offer.isActive, "Offer is not active");
        
        offer.isActive = false;
        
        emit OfferCancelled(_offerId, msg.sender, block.timestamp);
    }
    
    /**
     * @notice Mark expired offers as inactive (cleanup)
     * @param _offerId The offer ID to check
     */
    function expireOffer(uint256 _offerId) external {
        Offer storage offer = offers[_offerId];
        
        require(offer.offerId == _offerId, "Offer does not exist");
        require(offer.isActive, "Offer already inactive");
        require(block.timestamp > offer.expiresAt, "Offer not yet expired");
        
        offer.isActive = false;
        
        emit OfferExpired(_offerId, block.timestamp);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get offer details
     * @param _offerId The offer ID
     */
    function getOffer(uint256 _offerId)
        external
        view
        returns (
            address buyer,
            address nftAddress,
            uint256 serialNumber,
            uint256 offerPrice,
            uint256 expiresAt,
            bool isActive,
            uint256 createdAt
        )
    {
        Offer memory offer = offers[_offerId];
        return (
            offer.buyer,
            offer.nftAddress,
            offer.serialNumber,
            offer.offerPrice,
            offer.expiresAt,
            offer.isActive,
            offer.createdAt
        );
    }
    
    /**
     * @notice Get all offers for an NFT
     * @param _nftAddress The NFT token address
     * @param _serialNumber The NFT serial number
     */
    function getOffersForNFT(address _nftAddress, uint256 _serialNumber)
        external
        view
        returns (uint256[] memory)
    {
        return nftOffers[_nftAddress][_serialNumber];
    }
    
    /**
     * @notice Get all offers made by a buyer
     * @param _buyer The buyer address
     */
    function getBuyerOffers(address _buyer)
        external
        view
        returns (uint256[] memory)
    {
        return buyerOffers[_buyer];
    }
    
    /**
     * @notice Get highest active offer for an NFT
     * @param _nftAddress The NFT token address
     * @param _serialNumber The NFT serial number
     */
    function getHighestOffer(address _nftAddress, uint256 _serialNumber)
        external
        view
        returns (uint256 offerId, uint256 highestPrice)
    {
        uint256[] memory offerIds = nftOffers[_nftAddress][_serialNumber];
        uint256 highest = 0;
        uint256 highestId = 0;
        
        for (uint256 i = 0; i < offerIds.length; i++) {
            Offer memory offer = offers[offerIds[i]];
            if (offer.isActive && 
                block.timestamp <= offer.expiresAt && 
                offer.offerPrice > highest) {
                highest = offer.offerPrice;
                highestId = offer.offerId;
            }
        }
        
        return (highestId, highest);
    }
}

