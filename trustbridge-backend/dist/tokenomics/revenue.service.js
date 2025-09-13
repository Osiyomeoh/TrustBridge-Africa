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
var RevenueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevenueService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const hedera_service_1 = require("../hedera/hedera.service");
const payment_schema_1 = require("../schemas/payment.schema");
const user_schema_1 = require("../schemas/user.schema");
let RevenueService = RevenueService_1 = class RevenueService {
    constructor(paymentModel, userModel, hederaService) {
        this.paymentModel = paymentModel;
        this.userModel = userModel;
        this.hederaService = hederaService;
        this.logger = new common_1.Logger(RevenueService_1.name);
        this.feeAllocationConfig = {
            treasury: 0.40,
            stakers: 0.30,
            insurance: 0.20,
            validators: 0.10,
        };
        this.revenueStreams = {
            [payment_schema_1.PaymentType.TOKENIZATION_FEE]: 'Asset Tokenization',
            [payment_schema_1.PaymentType.VERIFICATION_FEE]: 'Asset Verification',
            [payment_schema_1.PaymentType.INVESTMENT]: 'Investment Fees',
            [payment_schema_1.PaymentType.ESCROW]: 'Escrow Fees',
            [payment_schema_1.PaymentType.PLATFORM_FEE]: 'Platform Fees',
        };
    }
    async calculateRevenue(timeframe) {
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
    async getRevenueMetrics() {
        try {
            const dailyRevenue = await this.calculateRevenue('daily');
            const weeklyRevenue = await this.calculateRevenue('weekly');
            const monthlyRevenue = await this.calculateRevenue('monthly');
            const yearlyRevenue = await this.calculateRevenue('yearly');
            const totalRevenue = yearlyRevenue;
            const revenueStreams = await this.getRevenueStreams('monthly');
            const feeAllocation = this.calculateFeeAllocation(monthlyRevenue);
            const previousMonthRevenue = await this.calculatePreviousMonthRevenue();
            const growthRate = previousMonthRevenue > 0
                ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
                : 0;
            const transactionCount = await this.paymentModel.countDocuments({
                status: 'COMPLETED',
                createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            });
            const averageTransactionValue = transactionCount > 0 ? monthlyRevenue / transactionCount : 0;
            return {
                totalRevenue,
                dailyRevenue,
                weeklyRevenue,
                monthlyRevenue,
                yearlyRevenue,
                revenueStreams,
                feeAllocation,
                growthRate,
                averageTransactionValue,
            };
        }
        catch (error) {
            this.logger.error('Failed to get revenue metrics:', error);
            throw error;
        }
    }
    async getRevenueStreams(timeframe) {
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
        const totalRevenue = payments.reduce((sum, payment) => sum + (payment.feeAmount || 0), 0);
        const revenueByType = payments.reduce((acc, payment) => {
            const type = payment.type;
            const amount = payment.feeAmount || 0;
            acc[type] = (acc[type] || 0) + amount;
            return acc;
        }, {});
        const revenueStreams = Object.entries(revenueByType).map(([type, amount]) => ({
            source: this.revenueStreams[type] || type,
            amount,
            percentage: totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0,
            timestamp: now,
        }));
        return revenueStreams.sort((a, b) => b.amount - a.amount);
    }
    calculateFeeAllocation(totalRevenue) {
        return {
            treasury: totalRevenue * this.feeAllocationConfig.treasury,
            stakers: totalRevenue * this.feeAllocationConfig.stakers,
            insurance: totalRevenue * this.feeAllocationConfig.insurance,
            validators: totalRevenue * this.feeAllocationConfig.validators,
            burn: totalRevenue * 0.25,
        };
    }
    async getTreasuryBalance() {
        try {
            const hbarBalanceStr = await this.hederaService.getAccountBalance('0.0.12345');
            const hbarBalance = parseFloat(hbarBalanceStr);
            const trbBalance = await this.hederaService.getTokenBalance('0.0.12345', '0');
            const hbarPrice = await this.hederaService.getTokenPrice(0);
            const trbPrice = await this.hederaService.getTokenPrice(0);
            const hbarUsdValue = hbarBalance * hbarPrice;
            const trbUsdValue = trbBalance * trbPrice;
            const totalUsdValue = hbarUsdValue + trbUsdValue;
            const totalBalance = hbarBalance + trbBalance;
            return {
                totalBalance,
                hbarBalance,
                trbBalance,
                usdValue: totalUsdValue,
                allocation: {
                    development: totalUsdValue * 0.40,
                    marketing: totalUsdValue * 0.25,
                    operations: totalUsdValue * 0.20,
                    emergency: totalUsdValue * 0.10,
                    staking: totalUsdValue * 0.05,
                },
            };
        }
        catch (error) {
            this.logger.error('Failed to get treasury balance:', error);
            throw error;
        }
    }
    async distributeFees(totalFees) {
        try {
            const allocation = this.calculateFeeAllocation(totalFees);
            if (allocation.treasury > 0) {
                await this.hederaService.transferToTreasury(allocation.treasury);
            }
            if (allocation.stakers > 0) {
                await this.distributeToStakers(allocation.stakers);
            }
            if (allocation.insurance > 0) {
                await this.hederaService.transferToInsurancePool(allocation.insurance);
            }
            if (allocation.validators > 0) {
                await this.distributeToValidators(allocation.validators);
            }
            if (allocation.burn > 0) {
                await this.hederaService.burnTokens(allocation.burn);
            }
            this.logger.log(`Distributed fees: Treasury=${allocation.treasury}, Stakers=${allocation.stakers}, Insurance=${allocation.insurance}, Validators=${allocation.validators}, Burn=${allocation.burn}`);
            return allocation;
        }
        catch (error) {
            this.logger.error('Failed to distribute fees:', error);
            throw error;
        }
    }
    async getRevenueAnalytics(days = 30) {
        try {
            const endDate = new Date();
            const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
            const dailyRevenue = [];
            for (let i = 0; i < days; i++) {
                const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
                const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
                const revenue = await this.paymentModel.aggregate([
                    {
                        $match: {
                            status: 'COMPLETED',
                            createdAt: { $gte: date, $lt: nextDate }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$feeAmount' }
                        }
                    }
                ]);
                dailyRevenue.push({
                    date: date.toISOString().split('T')[0],
                    revenue: revenue.length > 0 ? revenue[0].total : 0,
                });
            }
            const revenueByType = await this.paymentModel.aggregate([
                {
                    $match: {
                        status: 'COMPLETED',
                        createdAt: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: '$type',
                        revenue: { $sum: '$feeAmount' }
                    }
                }
            ]);
            const totalRevenue = revenueByType.reduce((sum, item) => sum + item.revenue, 0);
            const revenueByTypeFormatted = revenueByType.map(item => ({
                type: this.revenueStreams[item._id] || item._id,
                revenue: item.revenue,
                percentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0,
            }));
            const growthTrend = [];
            for (let i = 0; i < Math.floor(days / 7); i++) {
                const weekStart = new Date(startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
                const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
                const prevWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
                const prevWeekEnd = new Date(prevWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
                const currentWeekRevenue = await this.calculateRevenueForPeriod(weekStart, weekEnd);
                const previousWeekRevenue = await this.calculateRevenueForPeriod(prevWeekStart, prevWeekEnd);
                const growth = previousWeekRevenue > 0
                    ? ((currentWeekRevenue - previousWeekRevenue) / previousWeekRevenue) * 100
                    : 0;
                growthTrend.push({
                    period: weekStart.toISOString().split('T')[0],
                    growth,
                });
            }
            return {
                dailyRevenue,
                revenueByType: revenueByTypeFormatted,
                growthTrend,
            };
        }
        catch (error) {
            this.logger.error('Failed to get revenue analytics:', error);
            throw error;
        }
    }
    getFeeConfiguration() {
        return {
            tokenizationFee: 0.02,
            verificationFee: 0.01,
            platformFee: 0.005,
            escrowFee: 0.01,
            feeAllocation: this.feeAllocationConfig,
        };
    }
    async updateFeeConfiguration(updates) {
        try {
            const feeRates = ['tokenizationFee', 'verificationFee', 'platformFee', 'escrowFee'];
            for (const rate of feeRates) {
                if (updates[rate] !== undefined && (updates[rate] < 0 || updates[rate] > 0.1)) {
                    throw new Error(`${rate} must be between 0 and 0.1 (10%)`);
                }
            }
            if (updates.feeAllocation) {
                const total = Object.values(updates.feeAllocation).reduce((sum, value) => sum + value, 0);
                if (total > 1) {
                    throw new Error('Fee allocation percentages cannot exceed 100%');
                }
            }
            this.logger.log('Fee configuration updated:', updates);
        }
        catch (error) {
            this.logger.error('Failed to update fee configuration:', error);
            throw error;
        }
    }
    async calculatePreviousMonthRevenue() {
        const now = new Date();
        const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return this.calculateRevenueForPeriod(twoMonthsAgo, oneMonthAgo);
    }
    async calculateRevenueForPeriod(startDate, endDate) {
        const payments = await this.paymentModel.find({
            status: 'COMPLETED',
            createdAt: { $gte: startDate, $lte: endDate },
        });
        return payments.reduce((total, payment) => {
            return total + (payment.feeAmount || 0);
        }, 0);
    }
    async distributeToStakers(amount) {
        const stakers = await this.userModel.find({ stakingBalance: { $gt: 0 } });
        if (stakers.length === 0)
            return;
        const totalStaked = stakers.reduce((sum, staker) => sum + staker.stakingBalance, 0);
        for (const staker of stakers) {
            const share = (staker.stakingBalance / totalStaked) * amount;
            if (share > 0) {
                await this.hederaService.transferTokens('0.0.12345', staker.walletAddress, share.toString(), 0);
            }
        }
    }
    async distributeToValidators(amount) {
        await this.hederaService.transferToValidatorPool(amount);
    }
};
exports.RevenueService = RevenueService;
exports.RevenueService = RevenueService = RevenueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(payment_schema_1.Payment.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        hedera_service_1.HederaService])
], RevenueService);
//# sourceMappingURL=revenue.service.js.map