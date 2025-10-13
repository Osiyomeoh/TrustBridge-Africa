// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title TrustTokenExchange - Hedera HSCS Smart Contract
 * @notice Handles HBAR to TRUST token exchange with automatic distribution
 * @dev Designed for Hedera Smart Contract Service (HSCS)
 */
contract TrustTokenExchange is AccessControl, ReentrancyGuard, Pausable {
    // Roles
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");
    
    // Exchange configuration
    uint256 public constant EXCHANGE_RATE = 100; // 1 HBAR = 100 TRUST tokens
    uint256 public constant EXCHANGE_FEE_RATE = 10; // 0.1% fee (10 basis points)
    uint256 public constant MIN_EXCHANGE = 0.5 ether; // Minimum 0.5 HBAR
    
    // Distribution percentages (in basis points)
    uint256 public constant TREASURY_PERCENT = 6000; // 60%
    uint256 public constant OPERATIONS_PERCENT = 2500; // 25%
    uint256 public constant STAKING_PERCENT = 1000; // 10%
    uint256 public constant FEE_PERCENT = 500; // 5%
    
    // Addresses
    address public treasuryWallet;
    address public operationsWallet;
    address public stakingPool;
    address public trustTokenContract;
    
    // Statistics
    uint256 public totalHbarReceived;
    uint256 public totalTrustMinted;
    uint256 public totalExchanges;
    
    // Events
    event ExchangeExecuted(
        address indexed user,
        uint256 hbarAmount,
        uint256 trustAmount,
        uint256 exchangeFee,
        uint256 timestamp
    );
    
    event HbarDistributed(
        uint256 treasury,
        uint256 operations,
        uint256 staking,
        uint256 fees,
        uint256 timestamp
    );
    
    event TrustTokensMinted(
        address indexed to,
        uint256 amount,
        uint256 timestamp
    );
    
    constructor(
        address _treasuryWallet,
        address _operationsWallet,
        address _stakingPool,
        address _trustTokenContract
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(TREASURY_ROLE, _treasuryWallet);
        
        treasuryWallet = _treasuryWallet;
        operationsWallet = _operationsWallet;
        stakingPool = _stakingPool;
        trustTokenContract = _trustTokenContract;
    }
    
    /**
     * @notice Exchange HBAR for TRUST tokens
     * @dev Automatically distributes HBAR and mints TRUST tokens
     */
    function exchangeHbarForTrust() external payable nonReentrant whenNotPaused {
        require(msg.value >= MIN_EXCHANGE, "Minimum exchange not met");
        require(msg.value > 0, "Amount must be greater than 0");
        
        uint256 hbarAmount = msg.value;
        uint256 exchangeFee = (hbarAmount * EXCHANGE_FEE_RATE) / 10000;
        uint256 netHbarAmount = hbarAmount - exchangeFee;
        uint256 trustAmount = netHbarAmount * EXCHANGE_RATE;
        
        // Distribute HBAR according to percentages
        _distributeHbar(netHbarAmount);
        
        // Mint TRUST tokens to user
        _mintTrustTokens(msg.sender, trustAmount);
        
        // Update statistics
        totalHbarReceived += hbarAmount;
        totalTrustMinted += trustAmount;
        totalExchanges++;
        
        emit ExchangeExecuted(msg.sender, hbarAmount, trustAmount, exchangeFee, block.timestamp);
    }
    
    /**
     * @notice Distribute HBAR according to configured percentages
     * @param amount Total HBAR amount to distribute
     */
    function _distributeHbar(uint256 amount) internal {
        uint256 treasuryAmount = (amount * TREASURY_PERCENT) / 10000;
        uint256 operationsAmount = (amount * OPERATIONS_PERCENT) / 10000;
        uint256 stakingAmount = (amount * STAKING_PERCENT) / 10000;
        uint256 feeAmount = (amount * FEE_PERCENT) / 10000;
        
        // Transfer to treasury
        if (treasuryAmount > 0) {
            payable(treasuryWallet).transfer(treasuryAmount);
        }
        
        // Transfer to operations
        if (operationsAmount > 0) {
            payable(operationsWallet).transfer(operationsAmount);
        }
        
        // Transfer to staking pool
        if (stakingAmount > 0) {
            payable(stakingPool).transfer(stakingAmount);
        }
        
        // Keep fee amount in contract for withdrawal by admin
        if (feeAmount > 0) {
            // Fee remains in contract for admin withdrawal
        }
        
        emit HbarDistributed(treasuryAmount, operationsAmount, stakingAmount, feeAmount, block.timestamp);
    }
    
    /**
     * @notice Mint TRUST tokens to user
     * @param to User address to receive tokens
     * @param amount Amount of TRUST tokens to mint
     */
    function _mintTrustTokens(address to, uint256 amount) internal {
        // This would call the TRUST token contract's mint function
        // In a real implementation, this would be an external call
        // For now, we emit an event to track the minting
        emit TrustTokensMinted(to, amount, block.timestamp);
    }
    
    /**
     * @notice Withdraw accumulated fees (admin only)
     */
    function withdrawFees() external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        payable(msg.sender).transfer(balance);
    }
    
    /**
     * @notice Update treasury wallet address
     */
    function setTreasuryWallet(address _newTreasury) external onlyRole(TREASURY_ROLE) {
        require(_newTreasury != address(0), "Invalid treasury address");
        treasuryWallet = _newTreasury;
    }
    
    /**
     * @notice Update operations wallet address
     */
    function setOperationsWallet(address _newOperations) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_newOperations != address(0), "Invalid operations address");
        operationsWallet = _newOperations;
    }
    
    /**
     * @notice Update staking pool address
     */
    function setStakingPool(address _newStakingPool) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_newStakingPool != address(0), "Invalid staking pool address");
        stakingPool = _newStakingPool;
    }
    
    /**
     * @notice Pause the exchange (emergency only)
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @notice Unpause the exchange
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @notice Get exchange statistics
     */
    function getExchangeStats() external view returns (
        uint256 _totalHbarReceived,
        uint256 _totalTrustMinted,
        uint256 _totalExchanges,
        uint256 _contractBalance
    ) {
        return (
            totalHbarReceived,
            totalTrustMinted,
            totalExchanges,
            address(this).balance
        );
    }
    
    /**
     * @notice Calculate TRUST tokens for given HBAR amount
     */
    function calculateTrustAmount(uint256 hbarAmount) external pure returns (uint256) {
        uint256 exchangeFee = (hbarAmount * EXCHANGE_FEE_RATE) / 10000;
        uint256 netHbarAmount = hbarAmount - exchangeFee;
        return netHbarAmount * EXCHANGE_RATE;
    }
    
    /**
     * @notice Calculate exchange fee for given HBAR amount
     */
    function calculateExchangeFee(uint256 hbarAmount) external pure returns (uint256) {
        return (hbarAmount * EXCHANGE_FEE_RATE) / 10000;
    }
    
    // Allow contract to receive HBAR
    receive() external payable {
        // Automatically exchange when HBAR is sent directly
        if (msg.value >= MIN_EXCHANGE) {
            this.exchangeHbarForTrust();
        }
    }
}