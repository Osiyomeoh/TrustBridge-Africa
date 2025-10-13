// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title TrustTokenBurner - Hedera HSCS Smart Contract
 * @notice Handles TRUST token burning for platform fees
 * @dev Designed for Hedera Smart Contract Service (HSCS)
 */
contract TrustTokenBurner is AccessControl, ReentrancyGuard, Pausable {
    // Roles
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    
    // Addresses
    address public trustTokenContract;
    address public treasuryWallet;
    
    // Fee structure
    struct FeeTier {
        uint256 baseFee;        // Base TRUST token fee
        uint256 verificationMultiplier; // Premium verification multiplier
        uint256 rarityMultiplier;       // Rarity multiplier
    }
    
    // Fee tiers for different asset types
    mapping(string => FeeTier) public feeTiers;
    
    // Statistics
    uint256 public totalTokensBurned;
    uint256 public totalBurnTransactions;
    mapping(address => uint256) public userBurns;
    
    // Events
    event TokensBurned(
        address indexed user,
        uint256 amount,
        string reason,
        uint256 timestamp
    );
    
    event FeeTierUpdated(
        string tier,
        uint256 baseFee,
        uint256 verificationMultiplier,
        uint256 rarityMultiplier
    );
    
    constructor(
        address _trustTokenContract,
        address _treasuryWallet
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
        
        trustTokenContract = _trustTokenContract;
        treasuryWallet = _treasuryWallet;
        
        // Initialize fee tiers
        _initializeFeeTiers();
    }
    
    /**
     * @notice Initialize default fee tiers
     */
    function _initializeFeeTiers() internal {
        // Basic NFT creation
        feeTiers["basic"] = FeeTier({
            baseFee: 50 * 10**18,      // 50 TRUST tokens
            verificationMultiplier: 1,  // 1x multiplier
            rarityMultiplier: 1         // 1x multiplier
        });
        
        // Premium verification
        feeTiers["premium"] = FeeTier({
            baseFee: 50 * 10**18,      // 50 TRUST tokens base
            verificationMultiplier: 2,  // 2x multiplier = 100 TRUST
            rarityMultiplier: 1         // 1x multiplier
        });
        
        // Epic rarity
        feeTiers["epic"] = FeeTier({
            baseFee: 50 * 10**18,      // 50 TRUST tokens base
            verificationMultiplier: 1,  // 1x multiplier
            rarityMultiplier: 2         // 2x multiplier = 100 TRUST
        });
        
        // Legendary rarity
        feeTiers["legendary"] = FeeTier({
            baseFee: 50 * 10**18,      // 50 TRUST tokens base
            verificationMultiplier: 1,  // 1x multiplier
            rarityMultiplier: 3         // 3x multiplier = 150 TRUST
        });
    }
    
    /**
     * @notice Burn TRUST tokens for NFT creation
     * @param amount Amount of TRUST tokens to burn
     * @param reason Reason for burning (e.g., "NFT_CREATION")
     */
    function burnForNftCreation(
        uint256 amount,
        string memory reason
    ) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(bytes(reason).length > 0, "Reason must be provided");
        
        // In a real implementation, this would:
        // 1. Transfer TRUST tokens from user to this contract
        // 2. Burn the tokens (send to address(0) or treasury)
        // 3. Emit events for tracking
        
        // For now, we simulate the burn by emitting events
        totalTokensBurned += amount;
        totalBurnTransactions++;
        userBurns[msg.sender] += amount;
        
        emit TokensBurned(msg.sender, amount, reason, block.timestamp);
    }
    
    /**
     * @notice Calculate fee for NFT creation
     * @param verificationLevel Verification level ("basic" or "premium")
     * @param rarity Rarity level ("common", "rare", "epic", "legendary")
     * @return Total fee in TRUST tokens
     */
    function calculateNftCreationFee(
        string memory verificationLevel,
        string memory rarity
    ) external view returns (uint256) {
        FeeTier memory tier = feeTiers[verificationLevel];
        require(tier.baseFee > 0, "Invalid verification level");
        
        uint256 baseFee = tier.baseFee;
        uint256 verificationMultiplier = tier.verificationMultiplier;
        
        // Apply rarity multiplier
        uint256 rarityMultiplier = 1;
        if (keccak256(bytes(rarity)) == keccak256(bytes("rare"))) {
            rarityMultiplier = 1;
        } else if (keccak256(bytes(rarity)) == keccak256(bytes("epic"))) {
            rarityMultiplier = 2;
        } else if (keccak256(bytes(rarity)) == keccak256(bytes("legendary"))) {
            rarityMultiplier = 3;
        }
        
        return baseFee * verificationMultiplier * rarityMultiplier;
    }
    
    /**
     * @notice Update fee tier
     * @param tier Tier name
     * @param baseFee Base fee in TRUST tokens
     * @param verificationMultiplier Verification multiplier
     * @param rarityMultiplier Rarity multiplier
     */
    function updateFeeTier(
        string memory tier,
        uint256 baseFee,
        uint256 verificationMultiplier,
        uint256 rarityMultiplier
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(baseFee > 0, "Base fee must be greater than 0");
        require(verificationMultiplier > 0, "Verification multiplier must be greater than 0");
        require(rarityMultiplier > 0, "Rarity multiplier must be greater than 0");
        
        feeTiers[tier] = FeeTier({
            baseFee: baseFee,
            verificationMultiplier: verificationMultiplier,
            rarityMultiplier: rarityMultiplier
        });
        
        emit FeeTierUpdated(tier, baseFee, verificationMultiplier, rarityMultiplier);
    }
    
    /**
     * @notice Get fee tier information
     * @param tier Tier name
     * @return baseFee Base fee in TRUST tokens
     * @return verificationMultiplier Verification multiplier
     * @return rarityMultiplier Rarity multiplier
     */
    function getFeeTier(string memory tier) external view returns (
        uint256 baseFee,
        uint256 verificationMultiplier,
        uint256 rarityMultiplier
    ) {
        FeeTier memory tierInfo = feeTiers[tier];
        return (
            tierInfo.baseFee,
            tierInfo.verificationMultiplier,
            tierInfo.rarityMultiplier
        );
    }
    
    /**
     * @notice Get burning statistics
     * @return _totalTokensBurned Total tokens burned
     * @return _totalBurnTransactions Total burn transactions
     * @return _userBurns User's total burns
     */
    function getBurnStats(address user) external view returns (
        uint256 _totalTokensBurned,
        uint256 _totalBurnTransactions,
        uint256 _userBurns
    ) {
        return (
            totalTokensBurned,
            totalBurnTransactions,
            userBurns[user]
        );
    }
    
    /**
     * @notice Pause burning (emergency only)
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @notice Unpause burning
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @notice Update trust token contract address
     */
    function setTrustTokenContract(address _newContract) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_newContract != address(0), "Invalid contract address");
        trustTokenContract = _newContract;
    }
    
    /**
     * @notice Update treasury wallet address
     */
    function setTreasuryWallet(address _newTreasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_newTreasury != address(0), "Invalid treasury address");
        treasuryWallet = _newTreasury;
    }
}
