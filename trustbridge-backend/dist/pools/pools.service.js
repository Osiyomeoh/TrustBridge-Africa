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
var PoolsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const pool_schema_1 = require("../schemas/pool.schema");
const hedera_service_1 = require("../hedera/hedera.service");
const asset_schema_1 = require("../schemas/asset.schema");
let PoolsService = PoolsService_1 = class PoolsService {
    constructor(poolModel, assetModel, hederaService) {
        this.poolModel = poolModel;
        this.assetModel = assetModel;
        this.hederaService = hederaService;
        this.logger = new common_1.Logger(PoolsService_1.name);
    }
    async createPool(poolData) {
        try {
            const poolResult = await this.hederaService.createPool({
                name: poolData.name,
                description: poolData.description,
                managementFee: poolData.managementFee,
                performanceFee: poolData.performanceFee,
            });
            const pool = new this.poolModel({
                poolId: poolResult.poolId,
                name: poolData.name,
                description: poolData.description,
                manager: poolData.manager,
                managementFee: poolData.managementFee,
                performanceFee: poolData.performanceFee,
                status: 'active',
                totalValue: 0,
                totalInvestors: 0,
                totalInvested: 0,
                createdAt: new Date(),
                strategy: 'TRUST_TOKEN_POOL',
                assetIds: [],
                dropTokens: 0,
                tinTokens: 0,
                targetAPY: 0,
                actualAPY: 0,
                riskLevel: 'medium',
                minimumInvestment: 100,
                maximumInvestment: 1000000,
                lockupPeriod: 0,
                maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                poolContract: poolResult.poolId,
                performanceMetrics: {
                    totalReturn: 0,
                    monthlyReturn: 0,
                    volatility: 0,
                    sharpeRatio: 0,
                    maxDrawdown: 0
                },
                feeStructure: {
                    managementFee: poolData.managementFee / 100,
                    performanceFee: poolData.performanceFee / 100,
                    entryFee: 0,
                    exitFee: 0
                },
                investors: [],
                distributions: [],
                compliance: {
                    jurisdiction: 'Nigeria',
                    regulatoryStatus: 'active',
                    kycRequired: true,
                    accreditationRequired: false,
                    minimumInvestment: 100
                },
                tags: ['trust-token', 'pool', 'investment'],
                metadata: {
                    website: '',
                    whitepaper: '',
                    socialMedia: {
                        twitter: '',
                        linkedin: '',
                        telegram: ''
                    },
                    documents: []
                }
            });
            await pool.save();
            this.logger.log(`Pool created: ${poolData.name} (${poolResult.poolId})`);
            return {
                success: true,
                poolId: poolResult.poolId,
                pool: pool,
                transactionId: poolResult.transactionId
            };
        }
        catch (error) {
            this.logger.error(`Error creating pool: ${error.message}`);
            throw error;
        }
    }
    async getPool(poolId) {
        try {
            const pool = await this.poolModel.findOne({ poolId });
            if (!pool) {
                throw new Error('Pool not found');
            }
            return pool;
        }
        catch (error) {
            this.logger.error(`Error getting pool: ${error.message}`);
            throw error;
        }
    }
    async getAllPools(filters = {}) {
        try {
            const query = {};
            if (filters.status)
                query.status = filters.status;
            if (filters.riskLevel)
                query.riskLevel = filters.riskLevel;
            if (filters.manager)
                query.manager = filters.manager;
            if (filters.minAPY)
                query.targetAPY = { $gte: filters.minAPY };
            if (filters.maxAPY)
                query.targetAPY = { ...query.targetAPY, $lte: filters.maxAPY };
            const pools = await this.poolModel
                .find(query)
                .sort({ createdAt: -1 })
                .limit(filters.limit || 50)
                .skip(filters.offset || 0);
            const total = await this.poolModel.countDocuments(query);
            return {
                pools,
                total,
                limit: filters.limit || 50,
                offset: filters.offset || 0
            };
        }
        catch (error) {
            this.logger.error(`Error getting pools: ${error.message}`);
            throw error;
        }
    }
    async investInPool(poolId, investorData) {
        try {
            const pool = await this.poolModel.findOne({ poolId });
            if (!pool) {
                throw new Error('Pool not found');
            }
            if (pool.status !== 'active') {
                throw new Error('Pool not active');
            }
            const amount = parseFloat(investorData.amount);
            if (amount < pool.minimumInvestment) {
                throw new Error('Below minimum investment');
            }
            if (amount > pool.maximumInvestment) {
                throw new Error('Above maximum investment');
            }
            const result = await this.hederaService.investInPool(poolId, investorData.amount);
            const existingInvestor = pool.investors.find(inv => inv.address === investorData.address);
            if (existingInvestor) {
                existingInvestor.amount += amount;
                existingInvestor.lastUpdate = new Date();
            }
            else {
                pool.investors.push({
                    address: investorData.address,
                    amount: amount,
                    dropTokens: amount,
                    tinTokens: 0,
                    entryDate: new Date(),
                    lastUpdate: new Date()
                });
                pool.totalInvestors++;
            }
            pool.totalInvested += amount;
            pool.totalValue += amount;
            await pool.save();
            this.logger.log(`Investor added to pool ${poolId}: ${investorData.address} with ${amount} TRUST`);
            return {
                success: true,
                poolTokens: amount,
                transactionId: result
            };
        }
        catch (error) {
            this.logger.error(`Error investing in pool: ${error.message}`);
            throw error;
        }
    }
    async addInvestor(poolId, investorData) {
        return this.investInPool(poolId, {
            address: investorData.address,
            amount: investorData.amount.toString()
        });
    }
    async distributeRewards(poolId, amount) {
        try {
            const pool = await this.poolModel.findOne({ poolId });
            if (!pool) {
                throw new Error('Pool not found');
            }
            if (pool.manager !== pool.manager) {
                throw new Error('Not pool manager');
            }
            const result = await this.hederaService.distributePoolRewards(pool.poolContract, amount);
            const dropAmount = (amount * 70) / 100;
            const tinAmount = (amount * 30) / 100;
            pool.distributions.push({
                date: new Date(),
                amount,
                dropAmount,
                tinAmount,
                type: 'dividend'
            });
            const timeSinceLastDistribution = Date.now() - (pool.distributions[pool.distributions.length - 2]?.date?.getTime() || pool.createdAt.getTime());
            pool.actualAPY = (amount * 365 * 24 * 60 * 60 * 1000) / (pool.totalInvested * timeSinceLastDistribution);
            await pool.save();
            this.logger.log(`Rewards distributed to pool ${poolId}: ${amount}`);
            return {
                success: true,
                dropAmount,
                tinAmount,
                transactionId: result.transactionId
            };
        }
        catch (error) {
            this.logger.error(`Error distributing rewards: ${error.message}`);
            throw error;
        }
    }
    async updatePoolStatus(poolId, status) {
        try {
            const pool = await this.poolModel.findOne({ poolId });
            if (!pool) {
                throw new Error('Pool not found');
            }
            const result = await this.hederaService.updatePoolStatus(pool.poolContract, this.mapStatusToNumber(status));
            pool.status = status;
            await pool.save();
            this.logger.log(`Pool status updated: ${poolId} -> ${status}`);
            return {
                success: true,
                transactionId: result.transactionId
            };
        }
        catch (error) {
            this.logger.error(`Error updating pool status: ${error.message}`);
            throw error;
        }
    }
    async getPoolPerformance(poolId) {
        try {
            const pool = await this.poolModel.findOne({ poolId });
            if (!pool) {
                throw new Error('Pool not found');
            }
            const performance = await this.hederaService.getPoolPerformance(pool.poolContract);
            pool.performanceMetrics = {
                totalReturn: performance.totalReturn,
                monthlyReturn: performance.monthlyReturn,
                volatility: performance.volatility,
                sharpeRatio: performance.sharpeRatio,
                maxDrawdown: performance.maxDrawdown
            };
            await pool.save();
            return pool.performanceMetrics;
        }
        catch (error) {
            this.logger.error(`Error getting pool performance: ${error.message}`);
            throw error;
        }
    }
    mapRiskLevel(riskLevel) {
        switch (riskLevel) {
            case 'low': return 1;
            case 'medium': return 2;
            case 'high': return 3;
            default: return 2;
        }
    }
    mapStatusToNumber(status) {
        switch (status) {
            case 'draft': return 1;
            case 'active': return 2;
            case 'paused': return 3;
            case 'closed': return 4;
            case 'matured': return 5;
            default: return 1;
        }
    }
    generateTags(strategy, riskLevel) {
        const tags = [riskLevel];
        if (strategy.toLowerCase().includes('real estate')) {
            tags.push('real-estate', 'property');
        }
        if (strategy.toLowerCase().includes('agricultural')) {
            tags.push('agriculture', 'farming');
        }
        if (strategy.toLowerCase().includes('commercial')) {
            tags.push('commercial', 'business');
        }
        if (strategy.toLowerCase().includes('residential')) {
            tags.push('residential', 'housing');
        }
        return tags;
    }
};
exports.PoolsService = PoolsService;
exports.PoolsService = PoolsService = PoolsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(pool_schema_1.Pool.name)),
    __param(1, (0, mongoose_1.InjectModel)(asset_schema_1.Asset.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        hedera_service_1.HederaService])
], PoolsService);
//# sourceMappingURL=pools.service.js.map