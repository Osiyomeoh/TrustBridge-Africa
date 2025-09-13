"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var StakingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StakingService = exports.StakingType = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const hedera_service_1 = require("../hedera/hedera.service");
const user_schema_1 = require("../schemas/user.schema");
var StakingType;
(function (StakingType) {
    StakingType["ATTESTOR"] = "ATTESTOR";
    StakingType["VALIDATOR"] = "VALIDATOR";
    StakingType["LIQUIDITY"] = "LIQUIDITY";
    StakingType["GOVERNANCE"] = "GOVERNANCE";
})(StakingType || (exports.StakingType = StakingType = {}));
let StakingService = StakingService_1 = class StakingService {
    constructor(userModel, hederaService) {
        this.userModel = userModel;
        this.hederaService = hederaService;
        this.logger = new common_1.Logger(StakingService_1.name);
        this.stakingConfig = {
            minStakeAmount: {
                [StakingType.ATTESTOR]: 10000,
                [StakingType.VALIDATOR]: 100000,
                [StakingType.LIQUIDITY]: 5000,
                [StakingType.GOVERNANCE]: 1000,
            },
            maxLockPeriod: 365,
            minLockPeriod: 30,
            apyRates: {
                [StakingType.ATTESTOR]: { min: 8, max: 25 },
                [StakingType.VALIDATOR]: { min: 12, max: 30 },
                [StakingType.LIQUIDITY]: { min: 15, max: 35 },
                [StakingType.GOVERNANCE]: { min: 5, max: 20 },
            },
        };
    }
    async stakeTokens(userId, stakingType, amount, lockPeriod) {
        try {
            this.validateStakingParameters(stakingType, amount, lockPeriod);
            const user = await this.userModel.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            const tokenBalance = await this.hederaService.getTokenBalance(user.walletAddress, '0');
            if (tokenBalance < amount) {
                throw new Error('Insufficient token balance');
            }
            const apy = this.calculateAPY(stakingType, lockPeriod);
            const startDate = new Date();
            const endDate = new Date(startDate.getTime() + lockPeriod * 24 * 60 * 60 * 1000);
            const stakingPosition = {
                userId,
                stakingType,
                amount,
                lockPeriod,
                startDate,
                endDate,
                apy,
                rewards: 0,
                isActive: true,
            };
            await this.hederaService.stakeTokens(user.walletAddress, stakingType, amount, lockPeriod);
            await this.userModel.findByIdAndUpdate(userId, {
                $inc: { stakingBalance: amount }
            });
            this.logger.log(`User ${userId} staked ${amount} TRB for ${stakingType} (${lockPeriod} days)`);
            return stakingPosition;
        }
        catch (error) {
            this.logger.error('Failed to stake tokens:', error);
            throw error;
        }
    }
    async unstakeTokens(userId, stakingType) {
        try {
            const user = await this.userModel.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            if (user.stakingBalance <= 0) {
                throw new Error('No staked tokens to unstake');
            }
            const rewards = await this.calculateStakingRewards(userId, stakingType);
            const unstakedAmount = user.stakingBalance;
            const totalReceived = unstakedAmount + rewards;
            await this.hederaService.unstakeTokens(user.walletAddress, stakingType, unstakedAmount);
            await this.userModel.findByIdAndUpdate(userId, {
                $set: {
                    stakingBalance: 0,
                    stakingRewards: user.stakingRewards + rewards
                }
            });
            this.logger.log(`User ${userId} unstaked ${unstakedAmount} TRB and claimed ${rewards} TRB rewards`);
            return {
                unstakedAmount,
                rewards,
                totalReceived,
            };
        }
        catch (error) {
            this.logger.error('Failed to unstake tokens:', error);
            throw error;
        }
    }
    async calculateStakingRewards(userId, stakingType) {
        try {
            const user = await this.userModel.findById(userId);
            if (!user || user.stakingBalance <= 0) {
                return 0;
            }
            const timeStaked = 365;
            const apy = this.calculateAPY(stakingType, timeStaked);
            const rewards = (user.stakingBalance * apy) / 100;
            return rewards;
        }
        catch (error) {
            this.logger.error('Failed to calculate staking rewards:', error);
            return 0;
        }
    }
    async getUserStakingPositions(userId) {
        try {
            const user = await this.userModel.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            if (user.stakingBalance <= 0) {
                return [];
            }
            const positions = [];
            if (user.stakingBalance >= this.stakingConfig.minStakeAmount[StakingType.ATTESTOR]) {
                positions.push({
                    userId,
                    stakingType: StakingType.ATTESTOR,
                    amount: user.stakingBalance,
                    lockPeriod: 365,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                    apy: this.calculateAPY(StakingType.ATTESTOR, 365),
                    rewards: user.stakingRewards,
                    isActive: true,
                });
            }
            return positions;
        }
        catch (error) {
            this.logger.error('Failed to get user staking positions:', error);
            return [];
        }
    }
    async getStakingStats() {
        try {
            const stakers = await this.userModel.find({ stakingBalance: { $gt: 0 } });
            const totalStaked = stakers.reduce((sum, staker) => sum + staker.stakingBalance, 0);
            const totalRewards = stakers.reduce((sum, staker) => sum + staker.stakingRewards, 0);
            const averageStake = stakers.length > 0 ? totalStaked / stakers.length : 0;
            const stakingBreakdown = {
                [StakingType.ATTESTOR]: { amount: 0, stakers: 0, apy: 0 },
                [StakingType.VALIDATOR]: { amount: 0, stakers: 0, apy: 0 },
                [StakingType.LIQUIDITY]: { amount: 0, stakers: 0, apy: 0 },
                [StakingType.GOVERNANCE]: { amount: 0, stakers: 0, apy: 0 },
            };
            for (const staker of stakers) {
                const amount = staker.stakingBalance;
                if (amount >= this.stakingConfig.minStakeAmount[StakingType.VALIDATOR]) {
                    stakingBreakdown[StakingType.VALIDATOR].amount += amount;
                    stakingBreakdown[StakingType.VALIDATOR].stakers += 1;
                    stakingBreakdown[StakingType.VALIDATOR].apy = this.calculateAPY(StakingType.VALIDATOR, 365);
                }
                else if (amount >= this.stakingConfig.minStakeAmount[StakingType.ATTESTOR]) {
                    stakingBreakdown[StakingType.ATTESTOR].amount += amount;
                    stakingBreakdown[StakingType.ATTESTOR].stakers += 1;
                    stakingBreakdown[StakingType.ATTESTOR].apy = this.calculateAPY(StakingType.ATTESTOR, 365);
                }
                else if (amount >= this.stakingConfig.minStakeAmount[StakingType.LIQUIDITY]) {
                    stakingBreakdown[StakingType.LIQUIDITY].amount += amount;
                    stakingBreakdown[StakingType.LIQUIDITY].stakers += 1;
                    stakingBreakdown[StakingType.LIQUIDITY].apy = this.calculateAPY(StakingType.LIQUIDITY, 365);
                }
                else if (amount >= this.stakingConfig.minStakeAmount[StakingType.GOVERNANCE]) {
                    stakingBreakdown[StakingType.GOVERNANCE].amount += amount;
                    stakingBreakdown[StakingType.GOVERNANCE].stakers += 1;
                    stakingBreakdown[StakingType.GOVERNANCE].apy = this.calculateAPY(StakingType.GOVERNANCE, 365);
                }
            }
            const totalAPY = Object.values(stakingBreakdown).reduce((sum, type) => sum + type.apy, 0);
            const averageAPY = Object.values(stakingBreakdown).filter(type => type.stakers > 0).length > 0
                ? totalAPY / Object.values(stakingBreakdown).filter(type => type.stakers > 0).length
                : 0;
            return {
                totalStaked,
                totalStakers: stakers.length,
                averageStake,
                totalRewards,
                averageAPY,
                stakingBreakdown,
            };
        }
        catch (error) {
            this.logger.error('Failed to get staking stats:', error);
            throw error;
        }
    }
    async getStakingLeaderboard(limit = 50) {
        try {
            const stakers = await this.userModel.find({ stakingBalance: { $gt: 0 } })
                .sort({ stakingBalance: -1 })
                .limit(limit);
            return stakers.map((staker, index) => {
                let stakingType = StakingType.GOVERNANCE;
                if (staker.stakingBalance >= this.stakingConfig.minStakeAmount[StakingType.VALIDATOR]) {
                    stakingType = StakingType.VALIDATOR;
                }
                else if (staker.stakingBalance >= this.stakingConfig.minStakeAmount[StakingType.ATTESTOR]) {
                    stakingType = StakingType.ATTESTOR;
                }
                else if (staker.stakingBalance >= this.stakingConfig.minStakeAmount[StakingType.LIQUIDITY]) {
                    stakingType = StakingType.LIQUIDITY;
                }
                return {
                    walletAddress: staker.walletAddress,
                    stakedAmount: staker.stakingBalance,
                    stakingType,
                    apy: this.calculateAPY(stakingType, 365),
                    rewards: staker.stakingRewards,
                    rank: index + 1,
                };
            });
        }
        catch (error) {
            this.logger.error('Failed to get staking leaderboard:', error);
            return [];
        }
    }
    async distributeStakingRewards(totalRewards) {
        try {
            const stakers = await this.userModel.find({ stakingBalance: { $gt: 0 } });
            if (stakers.length === 0) {
                this.logger.log('No stakers found for reward distribution');
                return;
            }
            const totalStaked = stakers.reduce((sum, staker) => sum + staker.stakingBalance, 0);
            for (const staker of stakers) {
                const rewardAmount = (staker.stakingBalance / totalStaked) * totalRewards;
                if (rewardAmount > 0) {
                    await this.userModel.findByIdAndUpdate(staker._id, {
                        $inc: { stakingRewards: rewardAmount }
                    });
                    await this.hederaService.transferTokens('0.0.12345', staker.walletAddress, rewardAmount.toString(), 0);
                    this.logger.log(`Distributed ${rewardAmount} TRB rewards to ${staker.walletAddress}`);
                }
            }
            this.logger.log(`Distributed ${totalRewards} TRB rewards to ${stakers.length} stakers`);
        }
        catch (error) {
            this.logger.error('Failed to distribute staking rewards:', error);
            throw error;
        }
    }
    getStakingConfig() {
        return this.stakingConfig;
    }
    validateStakingParameters(stakingType, amount, lockPeriod) {
        if (amount < this.stakingConfig.minStakeAmount[stakingType]) {
            throw new Error(`Minimum stake amount for ${stakingType} is ${this.stakingConfig.minStakeAmount[stakingType]} TRB`);
        }
        if (lockPeriod < this.stakingConfig.minLockPeriod || lockPeriod > this.stakingConfig.maxLockPeriod) {
            throw new Error(`Lock period must be between ${this.stakingConfig.minLockPeriod} and ${this.stakingConfig.maxLockPeriod} days`);
        }
    }
    calculateAPY(stakingType, lockPeriod) {
        const apyRange = this.stakingConfig.apyRates[stakingType];
        const minAPY = apyRange.min;
        const maxAPY = apyRange.max;
        const lockPeriodRatio = lockPeriod / this.stakingConfig.maxLockPeriod;
        const apy = minAPY + (maxAPY - minAPY) * lockPeriodRatio;
        return Math.round(apy * 100) / 100;
    }
};
exports.StakingService = StakingService;
exports.StakingService = StakingService = StakingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        hedera_service_1.HederaService])
], StakingService);
//# sourceMappingURL=staking.service.js.map