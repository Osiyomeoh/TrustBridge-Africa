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
var DividendsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DividendsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const dividend_distribution_schema_1 = require("../schemas/dividend-distribution.schema");
const pool_token_holdings_schema_1 = require("../schemas/pool-token-holdings.schema");
const amc_pool_schema_1 = require("../schemas/amc-pool.schema");
const hedera_service_1 = require("../hedera/hedera.service");
const admin_service_1 = require("../admin/admin.service");
let DividendsService = DividendsService_1 = class DividendsService {
    constructor(dividendDistributionModel, poolTokenHoldingsModel, amcPoolModel, hederaService, adminService) {
        this.dividendDistributionModel = dividendDistributionModel;
        this.poolTokenHoldingsModel = poolTokenHoldingsModel;
        this.amcPoolModel = amcPoolModel;
        this.hederaService = hederaService;
        this.adminService = adminService;
        this.logger = new common_1.Logger(DividendsService_1.name);
    }
    async createDividendDistribution(createDividendDto, adminAddress) {
        try {
            const adminRole = await this.adminService.checkAdminStatus(adminAddress);
            if (!adminRole.isAmcAdmin && !adminRole.isSuperAdmin && !adminRole.isPlatformAdmin) {
                throw new common_1.BadRequestException('Only AMC Admins can create dividend distributions');
            }
            const pool = await this.amcPoolModel.findOne({ poolId: createDividendDto.poolId });
            if (!pool) {
                throw new common_1.NotFoundException('Pool not found');
            }
            const recordDate = new Date(createDividendDto.recordDate);
            const eligibleHoldings = await this.poolTokenHoldingsModel.find({
                poolId: createDividendDto.poolId,
                isActive: true,
                totalTokens: { $gt: 0 },
                firstInvestmentDate: { $lte: recordDate }
            });
            if (eligibleHoldings.length === 0) {
                throw new common_1.BadRequestException('No eligible token holders found for dividend distribution');
            }
            const totalTokensEligible = eligibleHoldings.reduce((sum, holding) => sum + holding.totalTokens, 0);
            const perTokenRate = createDividendDto.totalDividendAmount / totalTokensEligible;
            const distributionId = `DIV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const recipients = eligibleHoldings.map(holding => ({
                holderAddress: holding.holderAddress,
                tokenAmount: holding.totalTokens,
                dividendAmount: holding.totalTokens * perTokenRate,
                perTokenRate,
                isClaimed: false,
                claimedAt: null,
                claimTransactionHash: '',
                hederaTransactionId: ''
            }));
            const dividendDistribution = new this.dividendDistributionModel({
                distributionId,
                poolId: createDividendDto.poolId,
                poolName: pool.name,
                createdBy: adminAddress,
                dividendType: createDividendDto.dividendType,
                status: dividend_distribution_schema_1.DividendStatus.PENDING,
                totalDividendAmount: createDividendDto.totalDividendAmount,
                perTokenRate,
                totalTokensEligible,
                totalRecipients: recipients.length,
                distributionDate: new Date(createDividendDto.distributionDate),
                recordDate,
                description: createDividendDto.description,
                sourceOfFunds: createDividendDto.sourceOfFunds,
                recipients,
                totalClaimed: 0,
                totalUnclaimed: createDividendDto.totalDividendAmount,
                claimCount: 0,
                metadata: {
                    previousDividendId: createDividendDto.metadata?.previousDividendId || '',
                    dividendYield: createDividendDto.metadata?.dividendYield || 0,
                    payoutRatio: createDividendDto.metadata?.payoutRatio || 0,
                    frequency: createDividendDto.metadata?.frequency || 'SPECIAL',
                    taxWithholding: createDividendDto.metadata?.taxWithholding || 0,
                    currency: createDividendDto.metadata?.currency || 'USD',
                    exchangeRate: createDividendDto.metadata?.exchangeRate || 1
                },
                auditTrail: [{
                        action: 'CREATED',
                        timestamp: new Date(),
                        performedBy: adminAddress,
                        details: 'Dividend distribution created'
                    }]
            });
            const savedDistribution = await dividendDistribution.save();
            this.logger.log(`Created dividend distribution: ${distributionId} for pool ${createDividendDto.poolId}`);
            return savedDistribution;
        }
        catch (error) {
            this.logger.error('Failed to create dividend distribution:', error);
            throw error;
        }
    }
    async executeDividendDistribution(distributionId, adminAddress) {
        try {
            const adminRole = await this.adminService.checkAdminStatus(adminAddress);
            if (!adminRole.isAmcAdmin && !adminRole.isSuperAdmin && !adminRole.isPlatformAdmin) {
                throw new common_1.BadRequestException('Only AMC Admins can execute dividend distributions');
            }
            const distribution = await this.dividendDistributionModel.findOne({ distributionId });
            if (!distribution) {
                throw new common_1.NotFoundException('Dividend distribution not found');
            }
            if (distribution.status !== dividend_distribution_schema_1.DividendStatus.PENDING) {
                throw new common_1.BadRequestException('Dividend distribution is not in pending status');
            }
            if (new Date() < distribution.distributionDate) {
                throw new common_1.BadRequestException('Distribution date has not arrived yet');
            }
            distribution.status = dividend_distribution_schema_1.DividendStatus.DISTRIBUTING;
            distribution.distributedAt = new Date();
            distribution.auditTrail.push({
                action: 'EXECUTION_STARTED',
                timestamp: new Date(),
                performedBy: adminAddress,
                details: 'Dividend distribution execution started'
            });
            await distribution.save();
            for (const recipient of distribution.recipients) {
                await this.updateTokenHoldingsForDividend(recipient, distribution);
            }
            distribution.status = dividend_distribution_schema_1.DividendStatus.DISTRIBUTED;
            distribution.completedAt = new Date();
            distribution.auditTrail.push({
                action: 'EXECUTION_COMPLETED',
                timestamp: new Date(),
                performedBy: adminAddress,
                details: 'Dividend distribution execution completed'
            });
            const updatedDistribution = await distribution.save();
            this.logger.log(`Executed dividend distribution: ${distributionId}`);
            return updatedDistribution;
        }
        catch (error) {
            this.logger.error('Failed to execute dividend distribution:', error);
            throw error;
        }
    }
    async claimDividend(claimDto) {
        try {
            const distribution = await this.dividendDistributionModel.findOne({ distributionId: claimDto.distributionId });
            if (!distribution) {
                throw new common_1.NotFoundException('Dividend distribution not found');
            }
            if (distribution.status !== dividend_distribution_schema_1.DividendStatus.DISTRIBUTED) {
                throw new common_1.BadRequestException('Dividend distribution is not available for claiming');
            }
            const recipient = distribution.recipients.find(r => r.holderAddress === claimDto.holderAddress);
            if (!recipient) {
                throw new common_1.NotFoundException('Recipient not found in dividend distribution');
            }
            if (recipient.isClaimed) {
                throw new common_1.BadRequestException('Dividend has already been claimed');
            }
            recipient.isClaimed = true;
            recipient.claimedAt = new Date();
            recipient.claimTransactionHash = '';
            recipient.hederaTransactionId = '';
            distribution.totalClaimed += recipient.dividendAmount;
            distribution.totalUnclaimed -= recipient.dividendAmount;
            distribution.claimCount += 1;
            await this.updateTokenHoldingsForClaim(claimDto.holderAddress, distribution.poolId, recipient);
            await distribution.save();
            this.logger.log(`Claimed dividend ${claimDto.distributionId} for ${claimDto.holderAddress}`);
            return distribution;
        }
        catch (error) {
            this.logger.error('Failed to claim dividend:', error);
            throw error;
        }
    }
    async getPoolDividendDistributions(poolId) {
        try {
            return await this.dividendDistributionModel
                .find({ poolId })
                .sort({ distributionDate: -1 });
        }
        catch (error) {
            this.logger.error('Failed to get pool dividend distributions:', error);
            throw error;
        }
    }
    async getUserDividendDistributions(holderAddress) {
        try {
            return await this.dividendDistributionModel
                .find({
                'recipients.holderAddress': holderAddress,
                status: dividend_distribution_schema_1.DividendStatus.DISTRIBUTED
            })
                .sort({ distributionDate: -1 });
        }
        catch (error) {
            this.logger.error('Failed to get user dividend distributions:', error);
            throw error;
        }
    }
    async getDividendStats(poolId) {
        try {
            const query = poolId ? { poolId } : {};
            const distributions = await this.dividendDistributionModel.find(query);
            const totalDistributions = distributions.length;
            const totalDistributed = distributions.reduce((sum, d) => sum + d.totalDividendAmount, 0);
            const totalClaimed = distributions.reduce((sum, d) => sum + d.totalClaimed, 0);
            const totalUnclaimed = distributions.reduce((sum, d) => sum + d.totalUnclaimed, 0);
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth();
            const distributionsThisYear = distributions.filter(d => new Date(d.distributionDate).getFullYear() === currentYear).length;
            const distributionsThisMonth = distributions.filter(d => {
                const distDate = new Date(d.distributionDate);
                return distDate.getFullYear() === currentYear && distDate.getMonth() === currentMonth;
            }).length;
            const pendingDistributions = distributions.filter(d => d.status === dividend_distribution_schema_1.DividendStatus.PENDING).length;
            const averageDividendYield = distributions.length > 0 ?
                distributions.reduce((sum, d) => sum + (d.metadata.dividendYield || 0), 0) / distributions.length : 0;
            return {
                totalDistributions,
                totalDistributed,
                totalClaimed,
                totalUnclaimed,
                averageDividendYield,
                distributionsThisYear,
                distributionsThisMonth,
                pendingDistributions
            };
        }
        catch (error) {
            this.logger.error('Failed to get dividend stats:', error);
            throw error;
        }
    }
    async cancelDividendDistribution(distributionId, adminAddress) {
        try {
            const adminRole = await this.adminService.checkAdminStatus(adminAddress);
            if (!adminRole.isAmcAdmin && !adminRole.isSuperAdmin && !adminRole.isPlatformAdmin) {
                throw new common_1.BadRequestException('Only AMC Admins can cancel dividend distributions');
            }
            const distribution = await this.dividendDistributionModel.findOne({ distributionId });
            if (!distribution) {
                throw new common_1.NotFoundException('Dividend distribution not found');
            }
            if (distribution.status === dividend_distribution_schema_1.DividendStatus.DISTRIBUTED) {
                throw new common_1.BadRequestException('Cannot cancel already distributed dividend');
            }
            distribution.status = dividend_distribution_schema_1.DividendStatus.CANCELLED;
            distribution.cancelledAt = new Date();
            distribution.auditTrail.push({
                action: 'CANCELLED',
                timestamp: new Date(),
                performedBy: adminAddress,
                details: 'Dividend distribution cancelled'
            });
            const updatedDistribution = await distribution.save();
            this.logger.log(`Cancelled dividend distribution: ${distributionId}`);
            return updatedDistribution;
        }
        catch (error) {
            this.logger.error('Failed to cancel dividend distribution:', error);
            throw error;
        }
    }
    async updateTokenHoldingsForDividend(recipient, distribution) {
        try {
            const holding = await this.poolTokenHoldingsModel.findOne({
                holderAddress: recipient.holderAddress,
                poolId: distribution.poolId
            });
            if (holding) {
                holding.totalDividendsReceived += recipient.dividendAmount;
                holding.totalDividendsUnclaimed += recipient.dividendAmount;
                holding.lastActivityDate = new Date();
                await holding.save();
            }
        }
        catch (error) {
            this.logger.error('Failed to update token holdings for dividend:', error);
        }
    }
    async updateTokenHoldingsForClaim(holderAddress, poolId, recipient) {
        try {
            const holding = await this.poolTokenHoldingsModel.findOne({
                holderAddress,
                poolId
            });
            if (holding) {
                holding.totalDividendsClaimed += recipient.dividendAmount;
                holding.totalDividendsUnclaimed -= recipient.dividendAmount;
                holding.lastActivityDate = new Date();
                await holding.save();
            }
        }
        catch (error) {
            this.logger.error('Failed to update token holdings for claim:', error);
        }
    }
    async getUpcomingDividendDistributions() {
        try {
            return await this.dividendDistributionModel
                .find({
                status: dividend_distribution_schema_1.DividendStatus.PENDING,
                distributionDate: { $gt: new Date() }
            })
                .sort({ distributionDate: 1 });
        }
        catch (error) {
            this.logger.error('Failed to get upcoming dividend distributions:', error);
            throw error;
        }
    }
    async getDividendDistribution(distributionId) {
        try {
            const distribution = await this.dividendDistributionModel.findOne({ distributionId });
            if (!distribution) {
                throw new common_1.NotFoundException('Dividend distribution not found');
            }
            return distribution;
        }
        catch (error) {
            this.logger.error('Failed to get dividend distribution:', error);
            throw error;
        }
    }
};
exports.DividendsService = DividendsService;
exports.DividendsService = DividendsService = DividendsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(dividend_distribution_schema_1.DividendDistribution.name)),
    __param(1, (0, mongoose_1.InjectModel)(pool_token_holdings_schema_1.PoolTokenHoldings.name)),
    __param(2, (0, mongoose_1.InjectModel)(amc_pool_schema_1.AMCPool.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        hedera_service_1.HederaService,
        admin_service_1.AdminService])
], DividendsService);
//# sourceMappingURL=dividends.service.js.map