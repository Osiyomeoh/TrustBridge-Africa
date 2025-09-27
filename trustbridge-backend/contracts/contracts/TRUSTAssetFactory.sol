// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./AssetNFT.sol";
import "./TrustToken.sol";
import "./interfaces/IVerificationRegistry.sol";

/**
 * @title TRUST Asset Factory - Handles all asset types using TRUST tokens
 * @notice Comprehensive asset tokenization for the $1B market with TRUST token economy
 */
contract TRUSTAssetFactory is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    enum AssetCategory {
        FARM_PRODUCE,
        FARMLAND,
        REAL_ESTATE,
        VEHICLES,
        ART_COLLECTIBLES,
        COMMODITIES,
        BUSINESS_ASSETS,
        INTELLECTUAL_PROPERTY
    }
    
    enum VerificationLevel {
        BASIC,      // 1 attestor, 1% fee
        STANDARD,   // 2 attestors, 2% fee
        PREMIUM,    // 3 attestors, 3% fee
        ENTERPRISE  // 5+ attestors, 5% fee
    }
    
    struct UniversalAsset {
        bytes32 id;
        address owner;
        AssetCategory category;
        string assetType;
        string name;
        string location;
        uint256 totalValue; // Value in TRUST tokens
        uint256 maturityDate;
        uint8 verificationScore;
        bool isActive;
        uint256 createdAt;
        address nftContract;
        uint256 tokenId;
        VerificationLevel verificationLevel;
        string[] evidenceHashes;
        string[] documentTypes;
    }
    
    mapping(bytes32 => UniversalAsset) public assets;
    mapping(address => bytes32[]) public userAssets;
    mapping(AssetCategory => uint256) public categoryAssetCount;
    mapping(string => uint256) public countryAssetCount;
    
    uint256 public totalAssetsTokenized;
    uint256 public totalValueLocked; // Total value in TRUST tokens
    
    // Fee structure by verification level (in TRUST tokens)
    mapping(VerificationLevel => uint256) public verificationFees;
    
    address public feeRecipient;
    TrustToken public trustToken;
    IVerificationRegistry public verificationRegistry;
    AssetNFT public assetNFT;
    
    // Minimum TRUST token fee for asset creation
    uint256 public constant MIN_CREATION_FEE = 100e18; // 100 TRUST tokens
    
    event AssetTokenized(
        bytes32 indexed assetId,
        address indexed owner,
        AssetCategory category,
        string assetType,
        string name,
        uint256 totalValue,
        VerificationLevel level,
        address nftContract,
        uint256 tokenId,
        uint256 creationFee
    );
    
    event AssetVerified(bytes32 indexed assetId, uint8 verificationScore);
    event AssetVerificationLevelUpdated(bytes32 indexed assetId, uint8 verificationLevel);
    event AssetStatusUpdated(bytes32 indexed assetId, bool isActive);
    event CreationFeeUpdated(uint256 newFee);
    
    constructor(
        address _trustToken, 
        address _feeRecipient,
        address _verificationRegistry,
        address _assetNFT
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        
        trustToken = TrustToken(_trustToken);
        feeRecipient = _feeRecipient;
        verificationRegistry = IVerificationRegistry(_verificationRegistry);
        assetNFT = AssetNFT(_assetNFT);
        
        // Set verification fees (in TRUST tokens)
        verificationFees[VerificationLevel.BASIC] = 100e18;      // 100 TRUST
        verificationFees[VerificationLevel.STANDARD] = 200e18;   // 200 TRUST
        verificationFees[VerificationLevel.PREMIUM] = 300e18;    // 300 TRUST
        verificationFees[VerificationLevel.ENTERPRISE] = 500e18; // 500 TRUST
    }
    
    function tokenizeAsset(
        AssetCategory category,
        string memory assetType,
        string memory name,
        string memory location,
        uint256 totalValue, // Value in TRUST tokens
        uint256 maturityDate,
        VerificationLevel level,
        string[] memory evidenceHashes,
        string[] memory documentTypes,
        string memory imageURI,
        string memory documentURI,
        string memory description
    ) external whenNotPaused nonReentrant returns (bytes32) {
        require(totalValue > 0, "Invalid total value");
        require(maturityDate > block.timestamp, "Invalid maturity date");
        require(bytes(name).length > 0, "Name required");
        require(bytes(location).length > 0, "Location required");
        require(evidenceHashes.length == documentTypes.length, "Evidence mismatch");
        require(evidenceHashes.length > 0, "Evidence required");
        
        // Calculate creation fee in TRUST tokens
        uint256 creationFee = verificationFees[level];
        require(creationFee >= MIN_CREATION_FEE, "Fee too low");
        
        // Check TRUST token balance and allowance
        require(trustToken.balanceOf(msg.sender) >= creationFee, "Insufficient TRUST tokens");
        require(trustToken.allowance(msg.sender, address(this)) >= creationFee, "Insufficient TRUST allowance");
        
        // Transfer creation fee in TRUST tokens
        require(trustToken.transferFrom(msg.sender, feeRecipient, creationFee), "Creation fee transfer failed");
        
        // Generate asset ID
        bytes32 assetId = keccak256(abi.encodePacked(name, msg.sender, block.timestamp));
        
        // Create NFT metadata
        AssetNFT.AssetMetadata memory metadata = AssetNFT.AssetMetadata({
            assetType: assetType,
            name: name,
            location: location,
            totalValue: totalValue,
            tokenizedValue: totalValue,
            maturityDate: maturityDate,
            verificationScore: 0,
            isActive: true,
            createdAt: block.timestamp,
            imageURI: imageURI,
            documentURI: documentURI,
            description: description
        });
        
        // Mint NFT
        uint256 tokenId = assetNFT.mintAsset(msg.sender, metadata);
        
        // Store asset data
        UniversalAsset storage asset = assets[assetId];
        asset.id = assetId;
        asset.owner = msg.sender;
        asset.category = category;
        asset.assetType = assetType;
        asset.name = name;
        asset.location = location;
        asset.totalValue = totalValue;
        asset.maturityDate = maturityDate;
        asset.verificationScore = 0;
        asset.isActive = true;
        asset.createdAt = block.timestamp;
        asset.nftContract = address(assetNFT);
        asset.tokenId = tokenId;
        asset.verificationLevel = level;
        
        // Store evidence
        for (uint256 i = 0; i < evidenceHashes.length; i++) {
            asset.evidenceHashes.push(evidenceHashes[i]);
            asset.documentTypes.push(documentTypes[i]);
        }
        
        userAssets[msg.sender].push(assetId);
        totalAssetsTokenized++;
        totalValueLocked += totalValue;
        
        // Update counts
        categoryAssetCount[category]++;
        countryAssetCount[location]++;
        
        emit AssetTokenized(assetId, msg.sender, category, assetType, name, totalValue, level, address(assetNFT), tokenId, creationFee);
        
        return assetId;
    }
    
    function verifyAsset(bytes32 assetId, uint8 verificationScore) external onlyRole(VERIFIER_ROLE) {
        UniversalAsset storage asset = assets[assetId];
        require(asset.id != bytes32(0), "Asset not found");
        require(verificationScore <= 100, "Invalid verification score");
        
        asset.verificationScore = verificationScore;
        
        // Update NFT metadata
        assetNFT.updateAssetMetadata(
            asset.tokenId,
            "", // Keep existing imageURI
            "", // Keep existing documentURI
            ""  // Keep existing description
        );
        
        emit AssetVerified(assetId, verificationScore);
    }

    function setAssetVerificationLevel(bytes32 assetId, uint8 verificationLevel) external onlyRole(VERIFIER_ROLE) {
        UniversalAsset storage asset = assets[assetId];
        require(asset.id != bytes32(0), "Asset not found");
        require(verificationLevel <= 3, "Invalid verification level"); // 0=Basic, 1=Professional, 2=Expert, 3=Master
        
        asset.verificationLevel = VerificationLevel(verificationLevel);
        
        // Update NFT metadata to reflect new verification level
        assetNFT.updateAssetMetadata(
            asset.tokenId,
            "", // Keep existing imageURI
            "", // Keep existing documentURI
            ""  // Keep existing description
        );
        
        emit AssetVerificationLevelUpdated(assetId, verificationLevel);
    }
    
    function updateAssetStatus(bytes32 assetId, bool isActive) external onlyRole(DEFAULT_ADMIN_ROLE) {
        UniversalAsset storage asset = assets[assetId];
        require(asset.id != bytes32(0), "Asset not found");
        
        asset.isActive = isActive;
        
        // Update NFT status
        assetNFT.updateAssetStatus(asset.tokenId, isActive);
        
        emit AssetStatusUpdated(assetId, isActive);
    }
    
    function getAsset(bytes32 assetId) external view returns (
        bytes32 id,
        address owner,
        AssetCategory category,
        string memory assetType,
        string memory name,
        string memory location,
        uint256 totalValue,
        uint256 maturityDate,
        uint8 verificationScore,
        bool isActive,
        uint256 createdAt,
        address nftContract,
        uint256 tokenId,
        VerificationLevel verificationLevel
    ) {
        UniversalAsset storage asset = assets[assetId];
        return (
            asset.id,
            asset.owner,
            asset.category,
            asset.assetType,
            asset.name,
            asset.location,
            asset.totalValue,
            asset.maturityDate,
            asset.verificationScore,
            asset.isActive,
            asset.createdAt,
            asset.nftContract,
            asset.tokenId,
            asset.verificationLevel
        );
    }
    
    function getAssetEvidence(bytes32 assetId) external view returns (string[] memory evidenceHashes, string[] memory documentTypes) {
        UniversalAsset storage asset = assets[assetId];
        return (asset.evidenceHashes, asset.documentTypes);
    }
    
    function getUserAssets(address user) external view returns (bytes32[] memory) {
        return userAssets[user];
    }
    
    function getCategoryAssets(AssetCategory category) external view returns (uint256) {
        return categoryAssetCount[category];
    }
    
    function getCountryAssets(string memory country) external view returns (uint256) {
        return countryAssetCount[country];
    }
    
    function setVerificationFee(VerificationLevel level, uint256 fee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(fee >= MIN_CREATION_FEE, "Fee too low");
        verificationFees[level] = fee;
    }
    
    function setMinCreationFee(uint256 newFee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newFee > 0, "Invalid fee");
        // Note: MIN_CREATION_FEE is constant, this would require contract upgrade
        emit CreationFeeUpdated(newFee);
    }
    
    function getTotalValueLockedInTRUST() external view returns (uint256) {
        return totalValueLocked;
    }
    
    function getTotalValueLockedInHBAR() external view returns (uint256) {
        // This would require a TRUST to HBAR conversion rate
        // For now, return the TRUST value as if 1 TRUST = 1 HBAR
        return totalValueLocked;
    }
    
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    // Emergency function to recover TRUST tokens
    function emergencyWithdraw(address token, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(IERC20(token).transfer(msg.sender, amount), "Transfer failed");
    }
}
