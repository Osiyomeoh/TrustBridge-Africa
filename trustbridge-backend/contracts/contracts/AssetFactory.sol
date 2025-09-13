// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./AssetToken.sol";
import "./interfaces/IVerificationRegistry.sol";

/**
 * @title Asset Factory - Creates and manages asset tokenization
 */
contract AssetFactory is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    struct Asset {
        bytes32 id;
        address owner;
        string assetType;
        string name;
        string location;
        uint256 totalValue;
        uint256 tokenSupply;
        uint256 tokenizedAmount;
        uint256 maturityDate;
        uint8 verificationScore;
        bool isActive;
        uint256 createdAt;
        address tokenContract;
    }
    
    struct Verification {
        bool satelliteVerified;
        bool communityVerified;
        bool documentVerified;
        uint256 timestamp;
        address verifier;
    }
    
    mapping(bytes32 => Asset) public assets;
    mapping(bytes32 => Verification) public verifications;
    mapping(address => bytes32[]) public userAssets;
    mapping(string => uint256) public countryAssetCount;
    
    uint256 public totalAssetsTokenized;
    uint256 public totalValueLocked;
    uint256 public tokenizationFee = 200; // 2% in basis points
    
    address public feeRecipient;
    address public trustToken;
    IVerificationRegistry public verificationRegistry;
    
    event AssetTokenized(
        bytes32 indexed assetId,
        address indexed owner,
        string assetType,
        uint256 totalValue,
        address tokenContract
    );
    event AssetVerified(bytes32 indexed assetId, uint8 score);
    event AssetMatured(bytes32 indexed assetId, uint256 finalValue);
    
    constructor(address _trustToken, address _feeRecipient, address _verificationRegistry) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        trustToken = _trustToken;
        feeRecipient = _feeRecipient;
        verificationRegistry = IVerificationRegistry(_verificationRegistry);
    }

    modifier onlyVerified(bytes32 verificationAssetId) {
        (bool verified, , uint256 expiresAt,) = verificationRegistry.getVerificationStatus(verificationAssetId);
        require(verified, "Asset not verified");
        require(block.timestamp < expiresAt, "Verification expired");
        _;
    }
    
    function tokenizeAsset(
        string memory assetType,
        string memory name,
        string memory location,
        uint256 totalValue,
        uint256 tokenSupply,
        uint256 maturityDate,
        bytes32 verificationAssetId
    ) external payable whenNotPaused nonReentrant onlyVerified(verificationAssetId) returns (bytes32) {
        require(totalValue > 0, "Value must be > 0");
        require(tokenSupply > 0, "Token supply must be > 0");
        require(maturityDate > block.timestamp, "Maturity date must be future");
        
        uint256 fee = (totalValue * tokenizationFee) / 10000;
        require(msg.value >= fee, "Insufficient fee");
        
        // Use the verification asset ID as the asset ID
        bytes32 assetId = verificationAssetId;
        
        // Deploy individual asset token contract
        AssetToken assetToken = new AssetToken(
            string(abi.encodePacked("TrustBridge ", name)),
            string(abi.encodePacked(assetType, "-", _getCountryCode(location))),
            tokenSupply,
            assetId
        );
        
        address tokenAddress = address(assetToken);
        
        assets[assetId] = Asset({
            id: assetId,
            owner: msg.sender,
            assetType: assetType,
            name: name,
            location: location,
            totalValue: totalValue,
            tokenSupply: tokenSupply,
            tokenizedAmount: 0,
            maturityDate: maturityDate,
            verificationScore: 0,
            isActive: true,
            createdAt: block.timestamp,
            tokenContract: tokenAddress
        });
        
        userAssets[msg.sender].push(assetId);
        totalAssetsTokenized++;
        totalValueLocked += totalValue;
        
        // Transfer fee
        payable(feeRecipient).transfer(fee);
        
        // Refund excess
        if (msg.value > fee) {
            payable(msg.sender).transfer(msg.value - fee);
        }
        
        emit AssetTokenized(assetId, msg.sender, assetType, totalValue, tokenAddress);
        
        return assetId;
    }
    
    function verifyAsset(
        bytes32 assetId,
        bool satelliteVerified,
        bool communityVerified,
        bool documentVerified
    ) external onlyRole(VERIFIER_ROLE) {
        require(assets[assetId].owner != address(0), "Asset does not exist");
        
        verifications[assetId] = Verification({
            satelliteVerified: satelliteVerified,
            communityVerified: communityVerified,
            documentVerified: documentVerified,
            timestamp: block.timestamp,
            verifier: msg.sender
        });
        
        // Calculate verification score
        uint8 score = 0;
        if (satelliteVerified) score += 40;
        if (communityVerified) score += 30;
        if (documentVerified) score += 30;
        
        assets[assetId].verificationScore = score;
        
        emit AssetVerified(assetId, score);
    }
    
    function _getCountryCode(string memory location) internal pure returns (string memory) {
        // Simplified country code extraction - would be more sophisticated in production
        return "AF"; // Africa generic
    }
    
    function getUserAssets(address user) external view returns (bytes32[] memory) {
        return userAssets[user];
    }
    
    function getAsset(bytes32 assetId) external view returns (Asset memory) {
        return assets[assetId];
    }
    
    function setTokenizationFee(uint256 newFee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        tokenizationFee = newFee;
    }

    function setVerificationRegistry(address _verificationRegistry) external onlyRole(DEFAULT_ADMIN_ROLE) {
        verificationRegistry = IVerificationRegistry(_verificationRegistry);
    }
}
