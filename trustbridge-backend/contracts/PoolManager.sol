// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title PoolManager
 * @dev Manages secondary trading pools for RWA tokens (inspired by Centrifuge)
 * @author TrustBridge
 */
contract PoolManager {
    
    struct Pool {
        address tokenId;
        address creator;
        uint256 totalSupply;
        uint256 availableSupply;
        uint256 pricePerToken;
        uint256 minInvestment;
        uint256 maxInvestment;
        uint256 tradingFee; // in basis points (100 = 1%)
        uint256 liquidityReward; // in basis points
        bool isActive;
        bool tradingEnabled;
        uint256 createdAt;
        uint256 totalVolume;
        uint256 activeTraders;
    }
    
    struct Trade {
        address trader;
        address tokenId;
        uint256 amount;
        uint256 price;
        bool isBuy;
        uint256 timestamp;
        uint256 fee;
    }
    
    mapping(bytes32 => Pool) public pools;
    mapping(address => mapping(address => uint256)) public balances; // user => token => balance
    mapping(address => uint256) public liquidityRewards; // user => reward amount
    
    address public owner;
    uint256 public platformFee = 25; // 0.25% platform fee
    uint256 public constant BASIS_POINTS = 10000;
    
    event PoolCreated(
        bytes32 indexed poolId,
        address indexed tokenId,
        address indexed creator,
        uint256 totalSupply,
        uint256 pricePerToken
    );
    
    event TradeExecuted(
        bytes32 indexed poolId,
        address indexed trader,
        address indexed tokenId,
        uint256 amount,
        uint256 price,
        bool isBuy,
        uint256 fee
    );
    
    event LiquidityAdded(
        bytes32 indexed poolId,
        address indexed provider,
        uint256 amount,
        uint256 reward
    );
    
    event TradingEnabled(bytes32 indexed poolId, address indexed tokenId);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier poolExists(bytes32 poolId) {
        require(pools[poolId].creator != address(0), "Pool does not exist");
        _;
    }
    
    modifier tradingEnabled(bytes32 poolId) {
        require(pools[poolId].tradingEnabled, "Trading not enabled for this pool");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Create a new trading pool for RWA token
     * @param tokenId The RWA token address
     * @param totalSupply Total supply of tokens in the pool
     * @param pricePerToken Price per token in wei
     * @param minInvestment Minimum investment amount
     * @param maxInvestment Maximum investment amount
     * @param tradingFee Trading fee in basis points
     * @param liquidityReward Liquidity reward in basis points
     */
    function createPool(
        address tokenId,
        uint256 totalSupply,
        uint256 pricePerToken,
        uint256 minInvestment,
        uint256 maxInvestment,
        uint256 tradingFee,
        uint256 liquidityReward
    ) external returns (bytes32) {
        require(tokenId != address(0), "Invalid token address");
        require(totalSupply > 0, "Total supply must be greater than 0");
        require(pricePerToken > 0, "Price per token must be greater than 0");
        require(tradingFee <= 1000, "Trading fee cannot exceed 10%");
        require(liquidityReward <= 500, "Liquidity reward cannot exceed 5%");
        
        bytes32 poolId = keccak256(abi.encodePacked(
            tokenId,
            msg.sender,
            block.timestamp,
            block.number
        ));
        
        pools[poolId] = Pool({
            tokenId: tokenId,
            creator: msg.sender,
            totalSupply: totalSupply,
            availableSupply: totalSupply,
            pricePerToken: pricePerToken,
            minInvestment: minInvestment,
            maxInvestment: maxInvestment,
            tradingFee: tradingFee,
            liquidityReward: liquidityReward,
            isActive: true,
            tradingEnabled: false,
            createdAt: block.timestamp,
            totalVolume: 0,
            activeTraders: 0
        });
        
        emit PoolCreated(poolId, tokenId, msg.sender, totalSupply, pricePerToken);
        
        return poolId;
    }
    
    /**
     * @dev Enable trading for a pool (after AMC approval)
     * @param poolId The pool ID
     */
    function enableTrading(bytes32 poolId) external poolExists(poolId) {
        require(msg.sender == pools[poolId].creator || msg.sender == owner, "Not authorized");
        require(pools[poolId].isActive, "Pool is not active");
        
        pools[poolId].tradingEnabled = true;
        
        emit TradingEnabled(poolId, pools[poolId].tokenId);
    }
    
    /**
     * @dev Execute a trade in the pool
     * @param poolId The pool ID
     * @param amount Amount of tokens to trade
     * @param isBuy True if buying, false if selling
     */
    function executeTrade(
        bytes32 poolId,
        uint256 amount,
        bool isBuy
    ) external payable poolExists(poolId) tradingEnabled(poolId) {
        Pool storage pool = pools[poolId];
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= pool.availableSupply, "Insufficient supply");
        
        if (isBuy) {
            require(amount >= pool.minInvestment, "Below minimum investment");
            require(amount <= pool.maxInvestment, "Above maximum investment");
        } else {
            require(balances[msg.sender][pool.tokenId] >= amount, "Insufficient balance");
        }
        
        uint256 totalPrice = amount * pool.pricePerToken;
        uint256 tradingFeeAmount = (totalPrice * pool.tradingFee) / BASIS_POINTS;
        uint256 platformFeeAmount = (totalPrice * platformFee) / BASIS_POINTS;
        uint256 netAmount = totalPrice - tradingFeeAmount - platformFeeAmount;
        
        if (isBuy) {
            require(msg.value >= totalPrice, "Insufficient payment");
            
            // Transfer tokens to buyer
            balances[msg.sender][pool.tokenId] += amount;
            pool.availableSupply -= amount;
            
            // Refund excess payment
            if (msg.value > totalPrice) {
                payable(msg.sender).transfer(msg.value - totalPrice);
            }
            
            // Distribute fees
            if (tradingFeeAmount > 0) {
                payable(pool.creator).transfer(tradingFeeAmount);
            }
            if (platformFeeAmount > 0) {
                payable(owner).transfer(platformFeeAmount);
            }
            
        } else {
            // Selling tokens
            balances[msg.sender][pool.tokenId] -= amount;
            pool.availableSupply += amount;
            
            // Pay seller
            payable(msg.sender).transfer(netAmount);
            
            // Distribute fees from pool
            if (tradingFeeAmount > 0) {
                payable(pool.creator).transfer(tradingFeeAmount);
            }
            if (platformFeeAmount > 0) {
                payable(owner).transfer(platformFeeAmount);
            }
        }
        
        // Update pool statistics
        pool.totalVolume += totalPrice;
        if (isBuy) {
            pool.activeTraders += 1;
        }
        
        emit TradeExecuted(poolId, msg.sender, pool.tokenId, amount, pool.pricePerToken, isBuy, tradingFeeAmount);
    }
    
    /**
     * @dev Add liquidity to a pool and earn rewards
     * @param poolId The pool ID
     * @param amount Amount of tokens to add
     */
    function addLiquidity(bytes32 poolId, uint256 amount) external payable poolExists(poolId) {
        Pool storage pool = pools[poolId];
        require(amount > 0, "Amount must be greater than 0");
        require(msg.value >= amount * pool.pricePerToken, "Insufficient payment");
        
        // Calculate liquidity reward
        uint256 reward = (amount * pool.liquidityReward) / BASIS_POINTS;
        liquidityRewards[msg.sender] += reward;
        
        // Add liquidity
        pool.availableSupply += amount;
        
        emit LiquidityAdded(poolId, msg.sender, amount, reward);
    }
    
    /**
     * @dev Get pool information
     * @param poolId The pool ID
     */
    function getPool(bytes32 poolId) external view returns (Pool memory) {
        return pools[poolId];
    }
    
    /**
     * @dev Get user's token balance
     * @param user User address
     * @param tokenId Token address
     */
    function getBalance(address user, address tokenId) external view returns (uint256) {
        return balances[user][tokenId];
    }
    
    /**
     * @dev Get user's liquidity rewards
     * @param user User address
     */
    function getLiquidityRewards(address user) external view returns (uint256) {
        return liquidityRewards[user];
    }
    
    /**
     * @dev Update platform fee (owner only)
     * @param newFee New platform fee in basis points
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Platform fee cannot exceed 10%");
        platformFee = newFee;
    }
    
    /**
     * @dev Emergency pause for a pool
     * @param poolId The pool ID
     */
    function pausePool(bytes32 poolId) external onlyOwner poolExists(poolId) {
        pools[poolId].isActive = false;
        pools[poolId].tradingEnabled = false;
    }
    
    /**
     * @dev Resume trading for a pool
     * @param poolId The pool ID
     */
    function resumePool(bytes32 poolId) external onlyOwner poolExists(poolId) {
        pools[poolId].isActive = true;
    }
    
    /**
     * @dev Withdraw liquidity rewards
     */
    function withdrawRewards() external {
        uint256 reward = liquidityRewards[msg.sender];
        require(reward > 0, "No rewards to withdraw");
        
        liquidityRewards[msg.sender] = 0;
        payable(msg.sender).transfer(reward);
    }
}


