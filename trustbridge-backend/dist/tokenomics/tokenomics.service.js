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
var TokenomicsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenomicsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const hedera_service_1 = require("../hedera/hedera.service");
const payment_schema_1 = require("../schemas/payment.schema");
const user_schema_1 = require("../schemas/user.schema");
let TokenomicsService = TokenomicsService_1 = class TokenomicsService {
    constructor(paymentModel, userModel, hederaService) {
        this.paymentModel = paymentModel;
        this.userModel = userModel;
        this.hederaService = hederaService;
        this.logger = new common_1.Logger(TokenomicsService_1.name);
        this.tokenomicsConfig = {
            totalSupply: 1000000000,
            initialCirculating: 200000000,
            communityAllocation: 0.40,
            teamAllocation: 0.20,
            investorAllocation: 0.25,
            treasuryAllocation: 0.15,
            buybackRate: 0.50,
            burnRate: 0.25,
            stakingRewardRate: 0.25,
        };
    }
    getTokenomicsConfig() {
        return this.tokenomicsConfig;
    }
    calculateTokenDistribution() {
        const total = this.tokenomicsConfig.totalSupply;
        return {
            community: Math.floor(total * this.tokenomicsConfig.communityAllocation),
            team: Math.floor(total * this.tokenomicsConfig.teamAllocation),
            investors: Math.floor(total * this.tokenomicsConfig.investorAllocation),
            treasury: Math.floor(total * this.tokenomicsConfig.treasuryAllocation),
            staking: 0,
            liquidity: 0,
        };
    }
    async calculateProtocolRevenue(timeframe) {
        const now = new Date();
        let startDate;
        switch (timeframe) {
            case 'daily':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case 'weekly':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'monthly':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'yearly':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
        }
        const payments = await this.paymentModel.find({
            status: 'COMPLETED',
            createdAt: { $gte: startDate, $lte: now },
        });
        return payments.reduce((total, payment) => {
            return total + (payment.feeAmount || 0);
        }, 0);
    }
    async executeBuybackAndBurn() {
        try {
            const totalRevenue = await this.calculateProtocolRevenue('monthly');
            const buybackAmount = totalRevenue * this.tokenomicsConfig.buybackRate;
            const burnAmount = buybackAmount * this.tokenomicsConfig.burnRate;
            const stakerRewards = buybackAmount * this.tokenomicsConfig.stakingRewardRate;
            this.logger.log(`Executing buyback: ${buybackAmount} TRB, Burn: ${burnAmount} TRB, Staker Rewards: ${stakerRewards} TRB`);
            if (buybackAmount > 0) {
                await this.hederaService.buybackTokens(buybackAmount);
            }
            if (burnAmount > 0) {
                await this.hederaService.burnTokens(burnAmount);
            }
            if (stakerRewards > 0) {
                await this.distributeStakerRewards(stakerRewards);
            }
            const buybackData = {
                totalRevenue,
                buybackAmount,
                burnAmount,
                stakerRewards,
                timestamp: new Date(),
            };
            this.logger.log('Buyback and burn executed successfully:', buybackData);
            return buybackData;
        }
        catch (error) {
            this.logger.error('Failed to execute buyback and burn:', error);
            throw error;
        }
    }
    async distributeStakerRewards(totalRewards) {
        try {
            const stakers = await this.userModel.find({
                stakingBalance: { $gt: 0 }
            });
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
            this.logger.error('Failed to distribute staker rewards:', error);
            throw error;
        }
    }
    async calculateStakingRewards(userId) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const stakedAmount = user.stakingBalance;
        const lockPeriod = 365;
        const apy = this.calculateAPY(lockPeriod);
        const rewardAmount = (stakedAmount * apy) / 100;
        return {
            userId,
            stakedAmount,
            rewardAmount,
            apy,
            lockPeriod,
            timestamp: new Date(),
        };
    }
    calculateAPY(lockPeriodDays) {
        if (lockPeriodDays <= 30)
            return 5;
        if (lockPeriodDays <= 90)
            return 10;
        if (lockPeriodDays <= 180)
            return 15;
        return 25;
    }
    async getTokenomicsMetrics() {
        try {
            const stakers = await this.userModel.find({ stakingBalance: { $gt: 0 } });
            const stakedTokens = stakers.reduce((sum, staker) => sum + staker.stakingBalance, 0);
            const treasuryBalance = await this.hederaService.getTokenBalance('0.0.12345', '0');
            const circulatingSupply = this.tokenomicsConfig.initialCirculating - stakedTokens;
            const tokenPrice = await this.hederaService.getTokenPrice(0);
            const marketCap = circulatingSupply * tokenPrice;
            const monthlyRevenue = await this.calculateProtocolRevenue('monthly');
            const monthlyBuyback = monthlyRevenue * this.tokenomicsConfig.buybackRate;
            const monthlyBurn = monthlyBuyback * this.tokenomicsConfig.burnRate;
            const deflationRate = (monthlyBurn / circulatingSupply) * 100;
            return {
                totalSupply: this.tokenomicsConfig.totalSupply,
                circulatingSupply,
                burnedTokens: 0,
                stakedTokens,
                treasuryBalance,
                marketCap,
                stakingAPY: this.calculateAPY(365),
                inflationRate: 0,
                deflationRate,
            };
        }
        catch (error) {
            this.logger.error('Failed to get tokenomics metrics:', error);
            throw error;
        }
    }
    async updateTokenomicsParameters(updates) {
        try {
            if (updates.buybackRate !== undefined && (updates.buybackRate < 0 || updates.buybackRate > 1)) {
                throw new Error('Buyback rate must be between 0 and 1');
            }
            if (updates.burnRate !== undefined && (updates.burnRate < 0 || updates.burnRate > 1)) {
                throw new Error('Burn rate must be between 0 and 1');
            }
            if (updates.stakingRewardRate !== undefined && (updates.stakingRewardRate < 0 || updates.stakingRewardRate > 1)) {
                throw new Error('Staking reward rate must be between 0 and 1');
            }
            Object.assign(this.tokenomicsConfig, updates);
            this.logger.log('Tokenomics parameters updated:', updates);
        }
        catch (error) {
            this.logger.error('Failed to update tokenomics parameters:', error);
            throw error;
        }
    }
    async getStakingLeaderboard(limit = 50) {
        const stakers = await this.userModel.find({
            stakingBalance: { $gt: 0 }
        })
            .sort({ stakingBalance: -1 })
            .limit(limit);
        return stakers.map((staker, index) => ({
            walletAddress: staker.walletAddress,
            stakedAmount: staker.stakingBalance,
            stakingRewards: staker.stakingRewards,
            apy: this.calculateAPY(365),
            rank: index + 1,
        }));
    }
    async getTokenDistributionAnalytics() {
        const distribution = this.calculateTokenDistribution();
        const stakers = await this.userModel.find({ stakingBalance: { $gt: 0 } });
        const totalStaked = stakers.reduce((sum, staker) => sum + staker.stakingBalance, 0);
        const topStaker = stakers.reduce((max, staker) => staker.stakingBalance > max.stakingBalance ? staker : max, { stakingBalance: 0, walletAddress: '' });
        const revenueStats = {
            daily: await this.calculateProtocolRevenue('daily'),
            weekly: await this.calculateProtocolRevenue('weekly'),
            monthly: await this.calculateProtocolRevenue('monthly'),
            yearly: await this.calculateProtocolRevenue('yearly'),
        };
        return {
            distribution,
            stakingStats: {
                totalStakers: stakers.length,
                totalStaked,
                averageStake: stakers.length > 0 ? totalStaked / stakers.length : 0,
                topStaker: topStaker.walletAddress,
                topStakeAmount: topStaker.stakingBalance,
            },
            revenueStats,
        };
    }
};
exports.TokenomicsService = TokenomicsService;
exports.TokenomicsService = TokenomicsService = TokenomicsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(payment_schema_1.Payment.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        hedera_service_1.HederaService])
], TokenomicsService);
//# sourceMappingURL=tokenomics.service.js.map