// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title TrustTokenStaking - Hedera HSCS Smart Contract
 * @notice Handles TRUST token staking and rewards distribution
 * @dev Designed for Hedera Smart Contract Service (HSCS)
 */
contract TrustTokenStaking is AccessControl, ReentrancyGuard, Pausable {
    // Roles
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant REWARD_MANAGER_ROLE = keccak256("REWARD_MANAGER_ROLE");
    
    // Staking configuration
    uint256 public constant MIN_STAKE = 100 * 10**18; // Minimum 100 TRUST tokens
    uint256 public constant MAX_STAKE = 1000000 * 10**18; // Maximum 1M TRUST tokens
    uint256 public constant MIN_STAKE_DURATION = 30 days; // Minimum 30 days
    uint256 public constant MAX_STAKE_DURATION = 365 days; // Maximum 1 year
    
    // Reward rates (APY in basis points)
    uint256 public constant BASE_APY = 500; // 5% base APY
    uint256 public constant BONUS_APY = 200; // 2% bonus for long-term staking
    
    // Addresses
    address public trustTokenContract;
    address public rewardPool;
    
    // Staking data
    struct StakeInfo {
        uint256 amount;           // Staked amount
        uint256 startTime;        // Staking start time
        uint256 duration;         // Staking duration
        uint256 lastClaimTime;    // Last reward claim time
        bool active;              // Whether stake is active
    }
    
    mapping(address => StakeInfo[]) public userStakes;
    mapping(address => uint256) public totalStaked;
    mapping(address => uint256) public totalRewards;
    
    // Global statistics
    uint256 public totalStakedAmount;
    uint256 public totalRewardsDistributed;
    uint256 public totalStakers;
    
    // Events
    event Staked(
        address indexed user,
        uint256 amount,
        uint256 duration,
        uint256 stakeId,
        uint256 timestamp
    );
    
    event Unstaked(
        address indexed user,
        uint256 amount,
        uint256 reward,
        uint256 stakeId,
        uint256 timestamp
    );
    
    event RewardClaimed(
        address indexed user,
        uint256 amount,
        uint256 stakeId,
        uint256 timestamp
    );
    
    event RewardPoolUpdated(
        address indexed newPool,
        uint256 timestamp
    );
    
    constructor(
        address _trustTokenContract,
        address _rewardPool
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(REWARD_MANAGER_ROLE, msg.sender);
        
        trustTokenContract = _trustTokenContract;
        rewardPool = _rewardPool;
    }
    
    /**
     * @notice Stake TRUST tokens
     * @param amount Amount of TRUST tokens to stake
     * @param duration Staking duration in seconds
     */
    function stake(uint256 amount, uint256 duration) external nonReentrant whenNotPaused {
        require(amount >= MIN_STAKE, "Amount below minimum stake");
        require(amount <= MAX_STAKE, "Amount above maximum stake");
        require(duration >= MIN_STAKE_DURATION, "Duration below minimum");
        require(duration <= MAX_STAKE_DURATION, "Duration above maximum");
        
        // In a real implementation, this would:
        // 1. Transfer TRUST tokens from user to this contract
        // 2. Create stake record
        // 3. Update statistics
        
        // Create new stake
        StakeInfo memory newStake = StakeInfo({
            amount: amount,
            startTime: block.timestamp,
            duration: duration,
            lastClaimTime: block.timestamp,
            active: true
        });
        
        userStakes[msg.sender].push(newStake);
        totalStaked[msg.sender] += amount;
        totalStakedAmount += amount;
        
        if (totalStaked[msg.sender] == amount) {
            totalStakers++;
        }
        
        emit Staked(msg.sender, amount, duration, userStakes[msg.sender].length - 1, block.timestamp);
    }
    
    /**
     * @notice Unstake TRUST tokens
     * @param stakeId ID of the stake to unstake
     */
    function unstake(uint256 stakeId) external nonReentrant {
        require(stakeId < userStakes[msg.sender].length, "Invalid stake ID");
        StakeInfo storage stakeInfo = userStakes[msg.sender][stakeId];
        require(stakeInfo.active, "Stake not active");
        require(
            block.timestamp >= stakeInfo.startTime + stakeInfo.duration,
            "Stake period not completed"
        );
        
        uint256 amount = stakeInfo.amount;
        uint256 reward = calculateReward(msg.sender, stakeId);
        
        // Update stake status
        stakeInfo.active = false;
        totalStaked[msg.sender] -= amount;
        totalStakedAmount -= amount;
        
        if (totalStaked[msg.sender] == 0) {
            totalStakers--;
        }
        
        // In a real implementation, this would:
        // 1. Transfer staked tokens back to user
        // 2. Transfer rewards to user
        // 3. Update reward pool
        
        totalRewards[msg.sender] += reward;
        totalRewardsDistributed += reward;
        
        emit Unstaked(msg.sender, amount, reward, stakeId, block.timestamp);
    }
    
    /**
     * @notice Claim rewards for a specific stake
     * @param stakeId ID of the stake to claim rewards for
     */
    function claimReward(uint256 stakeId) external nonReentrant {
        require(stakeId < userStakes[msg.sender].length, "Invalid stake ID");
        StakeInfo storage stakeInfo = userStakes[msg.sender][stakeId];
        require(stakeInfo.active, "Stake not active");
        
        uint256 reward = calculateReward(msg.sender, stakeId);
        require(reward > 0, "No rewards to claim");
        
        // Update last claim time
        stakeInfo.lastClaimTime = block.timestamp;
        
        // In a real implementation, this would transfer rewards to user
        totalRewards[msg.sender] += reward;
        totalRewardsDistributed += reward;
        
        emit RewardClaimed(msg.sender, reward, stakeId, block.timestamp);
    }
    
    /**
     * @notice Calculate rewards for a specific stake
     * @param user User address
     * @param stakeId Stake ID
     * @return Reward amount
     */
    function calculateReward(address user, uint256 stakeId) public view returns (uint256) {
        require(stakeId < userStakes[user].length, "Invalid stake ID");
        StakeInfo memory stakeInfo = userStakes[user][stakeId];
        require(stakeInfo.active, "Stake not active");
        
        uint256 timeElapsed = block.timestamp - stakeInfo.lastClaimTime;
        uint256 apy = getAPY(stakeInfo.duration);
        
        // Calculate reward: (amount * apy * timeElapsed) / (365 days * 10000)
        uint256 reward = (stakeInfo.amount * apy * timeElapsed) / (365 days * 10000);
        
        return reward;
    }
    
    /**
     * @notice Get APY for a given staking duration
     * @param duration Staking duration in seconds
     * @return APY in basis points
     */
    function getAPY(uint256 duration) public pure returns (uint256) {
        if (duration >= 180 days) {
            return BASE_APY + BONUS_APY; // 7% for 6+ months
        } else if (duration >= 90 days) {
            return BASE_APY + (BONUS_APY / 2); // 6% for 3+ months
        } else {
            return BASE_APY; // 5% for less than 3 months
        }
    }
    
    /**
     * @notice Get user's staking information
     * @param user User address
     * @return stakes Array of user's stakes
     * @return userTotalStaked Total amount staked by user
     * @return userTotalRewards Total rewards earned by user
     */
    function getUserStakingInfo(address user) external view returns (
        StakeInfo[] memory stakes,
        uint256 userTotalStaked,
        uint256 userTotalRewards
    ) {
        return (
            userStakes[user],
            totalStaked[user],
            totalRewards[user]
        );
    }
    
    /**
     * @notice Get global staking statistics
     * @return _totalStaked Total amount staked across all users
     * @return _totalRewards Total rewards distributed
     * @return _totalStakers Total number of stakers
     */
    function getGlobalStats() external view returns (
        uint256 _totalStaked,
        uint256 _totalRewards,
        uint256 _totalStakers
    ) {
        return (
            totalStakedAmount,
            totalRewardsDistributed,
            totalStakers
        );
    }
    
    /**
     * @notice Update reward pool address
     * @param _newRewardPool New reward pool address
     */
    function setRewardPool(address _newRewardPool) external onlyRole(REWARD_MANAGER_ROLE) {
        require(_newRewardPool != address(0), "Invalid reward pool address");
        rewardPool = _newRewardPool;
        emit RewardPoolUpdated(_newRewardPool, block.timestamp);
    }
    
    /**
     * @notice Pause staking (emergency only)
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @notice Unpause staking
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
}
