// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./CoreAssetFactory.sol";

/**
 * @title TradingEngine
 * @dev Digital asset trading and secondary market functionality
 */
contract TradingEngine is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant TRADER_ROLE = keccak256("TRADER_ROLE");
    bytes32 public constant MATCHER_ROLE = keccak256("MATCHER_ROLE");
    
    CoreAssetFactory public immutable assetFactory;
    IERC20 public immutable trustToken;

    uint256 public constant TRADING_FEE_RATE = 250; // 2.5% trading fee

    struct DigitalAssetOffer {
        bytes32 offerId;
        address buyer;
        bytes32 assetId;
        uint256 offerAmount;
        uint256 expiry;
        bool isActive;
    }

    struct DigitalAssetListing {
        bytes32 assetId;
        address seller;
        uint256 price;
        uint256 expiry;
        bool isActive;
    }
    
    mapping(bytes32 => DigitalAssetOffer) public digitalOffers;
    mapping(bytes32 => DigitalAssetListing) public digitalListings;
    mapping(bytes32 => bytes32[]) public assetOffers;
    mapping(address => uint256) public userBalances;

    event DigitalAssetListed(bytes32 indexed assetId, address indexed seller, uint256 price, uint256 expiry);
    event DigitalAssetDelisted(bytes32 indexed assetId, address indexed seller);
    event DigitalAssetOfferMade(bytes32 indexed offerId, address indexed buyer, bytes32 indexed assetId, uint256 offerAmount, uint256 expiry);
    event DigitalAssetOfferAccepted(bytes32 indexed offerId, address indexed buyer, address indexed seller, bytes32 assetId, uint256 amount);
    event DigitalAssetTraded(bytes32 indexed assetId, address indexed buyer, address indexed seller, uint256 price);
    event DigitalAssetSold(bytes32 indexed assetId, address indexed buyer, address indexed seller, uint256 price);

    constructor(address _assetFactory, address _trustToken) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(TRADER_ROLE, msg.sender);
        _grantRole(MATCHER_ROLE, msg.sender);
        
        assetFactory = CoreAssetFactory(_assetFactory);
        trustToken = IERC20(_trustToken);
    }

    /**
     * @notice List digital asset for sale
     */
    function listDigitalAssetForSale(
        bytes32 _assetId,
        uint256 _price,
        uint256 _expiry
    ) external onlyRole(TRADER_ROLE) {
        CoreAssetFactory.UniversalAsset memory asset = assetFactory.getAsset(_assetId);
        require(asset.assetType == CoreAssetFactory.AssetType.DIGITAL, "Not a digital asset");
        require(asset.currentOwner == msg.sender, "Not the owner");
        require(asset.status == CoreAssetFactory.AssetStatus.DIGITAL_ACTIVE, "Asset not active");
        require(_price > 0, "Invalid price");
        require(_expiry > block.timestamp, "Invalid expiry");

        digitalListings[_assetId] = DigitalAssetListing({
            assetId: _assetId,
            seller: msg.sender,
            price: _price,
            expiry: _expiry,
            isActive: true
        });
        
        emit DigitalAssetListed(_assetId, msg.sender, _price, _expiry);
    }

    /**
     * @notice Delist digital asset
     */
    function delistDigitalAsset(bytes32 _assetId) external {
        DigitalAssetListing storage listing = digitalListings[_assetId];
        require(listing.isActive, "Not listed");
        require(listing.seller == msg.sender, "Not the seller");

        listing.isActive = false;
        emit DigitalAssetDelisted(_assetId, msg.sender);
    }

    /**
     * @notice Make offer on digital asset using TRUST tokens
     */
    function makeOfferOnDigitalAsset(
        bytes32 _assetId,
        uint256 _offerAmount,
        uint256 _expiry
    ) external onlyRole(TRADER_ROLE) {
        DigitalAssetListing memory listing = digitalListings[_assetId];
        require(listing.isActive, "Asset not listed");
        require(_offerAmount > 0, "Invalid offer amount");
        require(_expiry > block.timestamp, "Invalid expiry");

        // Transfer TRUST tokens from buyer to this contract
        require(trustToken.transferFrom(msg.sender, address(this), _offerAmount), "TRUST transfer failed");

        bytes32 offerId = keccak256(abi.encodePacked(msg.sender, _assetId, block.timestamp));
        
        digitalOffers[offerId] = DigitalAssetOffer({
            offerId: offerId,
            buyer: msg.sender,
            assetId: _assetId,
            offerAmount: _offerAmount,
            expiry: _expiry,
            isActive: true
        });

        assetOffers[_assetId].push(offerId);
        userBalances[msg.sender] += _offerAmount;

        emit DigitalAssetOfferMade(offerId, msg.sender, _assetId, _offerAmount, _expiry);
    }

    /**
     * @notice Accept offer on digital asset
     */
    function acceptOfferOnDigitalAsset(bytes32 _offerId) external onlyRole(TRADER_ROLE) {
        DigitalAssetOffer storage offer = digitalOffers[_offerId];
        require(offer.isActive, "Offer not active");
        require(offer.expiry > block.timestamp, "Offer expired");

        DigitalAssetListing storage listing = digitalListings[offer.assetId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.isActive, "Asset not listed");

        // Transfer payment
        uint256 tradingFee = (offer.offerAmount * TRADING_FEE_RATE) / 10000;
        uint256 sellerAmount = offer.offerAmount - tradingFee;

        userBalances[offer.buyer] -= offer.offerAmount;
        userBalances[msg.sender] += sellerAmount;
        userBalances[address(this)] += tradingFee;

        // Mark as sold
        offer.isActive = false;
        listing.isActive = false;

        emit DigitalAssetOfferAccepted(_offerId, offer.buyer, msg.sender, offer.assetId, offer.offerAmount);
    }

    /**
     * @notice Buy digital asset directly using TRUST tokens
     */
    function buyDigitalAsset(bytes32 _assetId) external onlyRole(TRADER_ROLE) {
        DigitalAssetListing storage listing = digitalListings[_assetId];
        require(listing.isActive, "Asset not listed");
        require(listing.expiry > block.timestamp, "Listing expired");

        CoreAssetFactory.UniversalAsset memory asset = assetFactory.getAsset(_assetId);
        require(asset.currentOwner == listing.seller, "Owner mismatch");

        // Transfer TRUST tokens from buyer to this contract
        require(trustToken.transferFrom(msg.sender, address(this), listing.price), "TRUST transfer failed");

        // Transfer payment
        uint256 tradingFee = (listing.price * TRADING_FEE_RATE) / 10000;
        uint256 sellerAmount = listing.price - tradingFee;

        userBalances[listing.seller] += sellerAmount;
        userBalances[address(this)] += tradingFee;

        // Mark as sold
        listing.isActive = false;

        emit DigitalAssetSold(_assetId, msg.sender, listing.seller, listing.price);
    }

    /**
     * @notice Get digital asset offers
     */
    function getDigitalAssetOffers(bytes32 _assetId) external view returns (bytes32[] memory) {
        return assetOffers[_assetId];
    }

    /**
     * @notice Get active listings
     */
    function getActiveListings() external pure returns (bytes32[] memory) {
        // This would return all active listings
        // For now, return empty array
        bytes32[] memory result = new bytes32[](0);
        return result;
    }

    /**
     * @notice Get user balance
     */
    function getUserBalance(address _user) external view returns (uint256) {
        return userBalances[_user];
    }

    /**
     * @notice Withdraw user balance in TRUST tokens
     */
    function withdrawBalance(uint256 _amount) external {
        require(userBalances[msg.sender] >= _amount, "Insufficient balance");
        
        userBalances[msg.sender] -= _amount;
        require(trustToken.transfer(msg.sender, _amount), "TRUST transfer failed");
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}