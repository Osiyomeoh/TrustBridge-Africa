// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Fee Distribution - Manages protocol fee allocation
 */
contract FeeDistribution is AccessControl, ReentrancyGuard {
    struct FeeAllocation {
        uint256 treasury;      // 40%
        uint256 stakers;       // 30%
        uint256 insurance;     // 20%
        uint256 validators;    // 10%
    }
    
    address public treasuryWallet;
    address public insurancePool;
    address public trustToken;
    
    mapping(address => uint256) public validatorRewards;
    uint256 public totalStakerRewards;
    
    event FeesDistributed(uint256 treasury, uint256 stakers, uint256 insurance, uint256 validators);
    event ValidatorRewarded(address validator, uint256 amount);
    
    constructor(
        address _treasuryWallet,
        address _insurancePool,
        address _trustToken
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        treasuryWallet = _treasuryWallet;
        insurancePool = _insurancePool;
        trustToken = _trustToken;
    }
    
    function distributeFees() external payable nonReentrant {
        require(msg.value > 0, "No fees to distribute");
        
        FeeAllocation memory allocation = FeeAllocation({
            treasury: (msg.value * 4000) / 10000,
            stakers: (msg.value * 3000) / 10000,
            insurance: (msg.value * 2000) / 10000,
            validators: (msg.value * 1000) / 10000
        });
        
        // Distribute to treasury
        payable(treasuryWallet).transfer(allocation.treasury);
        
        // Add to staker rewards pool
        totalStakerRewards += allocation.stakers;
        
        // Transfer to insurance pool
        payable(insurancePool).transfer(allocation.insurance);
        
        // Validators pool remains in contract for individual claims
        
        emit FeesDistributed(
            allocation.treasury,
            allocation.stakers,
            allocation.insurance,
            allocation.validators
        );
    }
    
    function claimValidatorRewards() external nonReentrant {
        uint256 reward = validatorRewards[msg.sender];
        require(reward > 0, "No rewards available");
        
        validatorRewards[msg.sender] = 0;
        payable(msg.sender).transfer(reward);
        
        emit ValidatorRewarded(msg.sender, reward);
    }
}
