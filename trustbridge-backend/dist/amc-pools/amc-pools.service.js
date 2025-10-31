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
var AMCPoolsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AMCPoolsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const config_1 = require("@nestjs/config");
const amc_pool_schema_1 = require("../schemas/amc-pool.schema");
const asset_schema_1 = require("../schemas/asset.schema");
const hedera_service_1 = require("../hedera/hedera.service");
const admin_service_1 = require("../admin/admin.service");
let AMCPoolsService = AMCPoolsService_1 = class AMCPoolsService {
    constructor(amcPoolModel, assetModel, hederaService, adminService, configService) {
        this.amcPoolModel = amcPoolModel;
        this.assetModel = assetModel;
        this.hederaService = hederaService;
        this.adminService = adminService;
        this.configService = configService;
        this.logger = new common_1.Logger(AMCPoolsService_1.name);
    }
    async createPool(createPoolDto, adminWallet) {
        try {
            this.logger.log('Creating pool with data:', JSON.stringify(createPoolDto, null, 2));
            const adminRole = await this.adminService.checkAdminStatus(adminWallet);
            if (!adminRole.isAmcAdmin && !adminRole.isSuperAdmin && !adminRole.isPlatformAdmin) {
                throw new common_1.BadRequestException('Only AMC Admins can create pools');
            }
            const poolId = `POOL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await this.validatePoolAssets(createPoolDto.assets);
            const calculatedTotalValue = createPoolDto.assets.reduce((sum, asset) => sum + asset.value, 0);
            if (Math.abs(calculatedTotalValue - createPoolDto.totalValue) > 0.01) {
                throw new common_1.BadRequestException('Total value must match sum of asset values');
            }
            const pool = new this.amcPoolModel({
                poolId,
                name: createPoolDto.name,
                description: createPoolDto.description,
                createdBy: adminWallet,
                createdByName: 'AMC Admin',
                type: createPoolDto.type,
                status: amc_pool_schema_1.PoolStatus.DRAFT,
                assets: createPoolDto.assets,
                totalValue: createPoolDto.totalValue,
                tokenSupply: createPoolDto.tokenSupply,
                tokenPrice: createPoolDto.tokenPrice,
                minimumInvestment: createPoolDto.minimumInvestment,
                expectedAPY: createPoolDto.expectedAPY,
                maturityDate: new Date(createPoolDto.maturityDate),
                imageURI: createPoolDto.imageURI || '',
                documentURI: createPoolDto.documentURI || '',
                riskFactors: createPoolDto.riskFactors || [],
                terms: createPoolDto.terms || [],
                isTradeable: createPoolDto.isTradeable || true,
                metadata: createPoolDto.metadata || {
                    riskLevel: 'MEDIUM',
                    liquidity: 'MEDIUM',
                    diversification: createPoolDto.assets.length,
                    geographicDistribution: [],
                    sectorDistribution: {}
                },
                operations: [`Pool created by ${adminWallet}`]
            });
            const savedPool = await pool.save();
            this.logger.log(`Created AMC pool: ${savedPool.poolId}`);
            return savedPool;
        }
        catch (error) {
            this.logger.error('Failed to create AMC pool:', error);
            throw error;
        }
    }
    async launchPool(poolId, adminWallet) {
        try {
            const adminRole = await this.adminService.checkAdminStatus(adminWallet);
            if (!adminRole.isAmcAdmin && !adminRole.isSuperAdmin && !adminRole.isPlatformAdmin) {
                throw new common_1.BadRequestException('Only AMC Admins can launch pools');
            }
            const pool = await this.amcPoolModel.findOne({ poolId });
            if (!pool) {
                throw new common_1.NotFoundException('Pool not found');
            }
            if (pool.status !== amc_pool_schema_1.PoolStatus.DRAFT) {
                throw new common_1.BadRequestException('Pool can only be launched from DRAFT status');
            }
            const operatorAccountId = this.hederaService.getOperatorId();
            this.logger.log(`Creating Hedera token for pool: ${pool.name} (${pool.poolId})`);
            this.logger.log(`Treasury account: ${operatorAccountId}`);
            this.logger.log(`Token supply: ${pool.tokenSupply}`);
            const hederaTokenId = await this.hederaService.createPoolToken({
                name: pool.name,
                symbol: `POOL_${pool.poolId.substring(5, 10)}`,
                decimals: 0,
                initialSupply: pool.tokenSupply,
                maxSupply: pool.tokenSupply,
                treasury: operatorAccountId,
                adminKey: this.configService.get('HEDERA_PRIVATE_KEY'),
                supplyKey: this.configService.get('HEDERA_PRIVATE_KEY'),
                freezeKey: this.configService.get('HEDERA_PRIVATE_KEY'),
                wipeKey: this.configService.get('HEDERA_PRIVATE_KEY')
            });
            this.logger.log(`Successfully created Hedera token: ${hederaTokenId}`);
            pool.status = amc_pool_schema_1.PoolStatus.ACTIVE;
            pool.hederaTokenId = hederaTokenId;
            pool.launchedAt = new Date();
            pool.operations.push(`Pool launched with Hedera token: ${hederaTokenId}`);
            const updatedPool = await pool.save();
            this.logger.log(`Launched AMC pool: ${poolId} with token: ${hederaTokenId}`);
            return updatedPool;
        }
        catch (error) {
            this.logger.error('Failed to launch AMC pool:', error);
            throw error;
        }
    }
    async getAllPools() {
        try {
            return await this.amcPoolModel.find().sort({ createdAt: -1 });
        }
        catch (error) {
            this.logger.error('Failed to get all pools:', error);
            throw error;
        }
    }
    async getActivePools() {
        try {
            return await this.amcPoolModel.find({
                status: amc_pool_schema_1.PoolStatus.ACTIVE
            }).sort({ expectedAPY: -1 });
        }
        catch (error) {
            this.logger.error('Failed to get active pools:', error);
            throw error;
        }
    }
    async getPoolById(poolId) {
        try {
            const pool = await this.amcPoolModel.findOne({ poolId });
            if (!pool) {
                throw new common_1.NotFoundException('Pool not found');
            }
            return pool;
        }
        catch (error) {
            this.logger.error('Failed to get pool by ID:', error);
            throw error;
        }
    }
    async getPoolsByAdmin(adminWallet) {
        try {
            return await this.amcPoolModel.find({ createdBy: adminWallet }).sort({ createdAt: -1 });
        }
        catch (error) {
            this.logger.error('Failed to get pools by admin:', error);
            throw error;
        }
    }
    async investInPool(investDto) {
        try {
            const pool = await this.amcPoolModel.findOne({ poolId: investDto.poolId });
            if (!pool) {
                throw new common_1.NotFoundException('Pool not found');
            }
            if (pool.status !== amc_pool_schema_1.PoolStatus.ACTIVE) {
                throw new common_1.BadRequestException('Pool is not active for investment');
            }
            if (investDto.amount < pool.minimumInvestment) {
                throw new common_1.BadRequestException(`Minimum investment is ${pool.minimumInvestment}`);
            }
            const tokens = Math.floor(investDto.amount / pool.tokenPrice);
            if (tokens === 0) {
                throw new common_1.BadRequestException('Investment amount too small');
            }
            const existingInvestment = pool.investments.find(inv => inv.investorAddress === investDto.investorAddress);
            if (existingInvestment) {
                existingInvestment.amount += investDto.amount;
                existingInvestment.tokens += tokens;
                existingInvestment.investedAt = new Date();
            }
            else {
                pool.investments.push({
                    investorId: investDto.investorAddress,
                    investorAddress: investDto.investorAddress,
                    amount: investDto.amount,
                    tokens: tokens,
                    tokenPrice: pool.tokenPrice,
                    investedAt: new Date(),
                    dividendsReceived: 0,
                    isActive: true
                });
            }
            pool.totalInvested += investDto.amount;
            pool.totalInvestors = pool.investments.filter(inv => inv.isActive).length;
            pool.operations.push(`Investment of ${investDto.amount} by ${investDto.investorAddress}`);
            try {
                if (pool.hederaTokenId && pool.hederaTokenId !== '') {
                    this.logger.log(`Transferring ${tokens} pool tokens to investor ${investDto.investorAddress}`);
                    const treasuryAccount = this.hederaService.getOperatorId();
                    const txId = await this.hederaService.transferTokens(pool.hederaTokenId, treasuryAccount, investDto.investorAddress, tokens);
                    this.logger.log(`Successfully transferred ${tokens} tokens: ${txId}`);
                    pool.operations.push(`Hedera transfer: ${txId}`);
                }
            }
            catch (hederaError) {
                this.logger.error('Failed to transfer pool tokens on Hedera:', hederaError);
            }
            const updatedPool = await pool.save();
            this.logger.log(`Investment in pool ${investDto.poolId}: ${investDto.amount}`);
            await this.updateAssetOwnersEarnings(pool, investDto.amount);
            return updatedPool;
        }
        catch (error) {
            this.logger.error('Failed to invest in pool:', error);
            throw error;
        }
    }
    async distributeDividend(dividendDto, adminWallet) {
        try {
            const adminRole = await this.adminService.checkAdminStatus(adminWallet);
            if (!adminRole.isAmcAdmin && !adminRole.isSuperAdmin && !adminRole.isPlatformAdmin) {
                throw new common_1.BadRequestException('Only AMC Admins can distribute dividends');
            }
            const pool = await this.amcPoolModel.findOne({ poolId: dividendDto.poolId });
            if (!pool) {
                throw new common_1.NotFoundException('Pool not found');
            }
            if (pool.status !== amc_pool_schema_1.PoolStatus.ACTIVE) {
                throw new common_1.BadRequestException('Pool is not active for dividend distribution');
            }
            const totalActiveTokens = pool.investments
                .filter(inv => inv.isActive)
                .reduce((sum, inv) => sum + inv.tokens, 0);
            if (totalActiveTokens === 0) {
                throw new common_1.BadRequestException('No active token holders to distribute dividends to');
            }
            const dividendPerToken = dividendDto.amount / totalActiveTokens;
            pool.investments.forEach(investment => {
                if (investment.isActive) {
                    const investorDividend = investment.tokens * dividendPerToken;
                    investment.dividendsReceived += investorDividend;
                }
            });
            pool.dividends.push({
                amount: dividendDto.amount,
                perToken: dividendPerToken,
                distributedAt: new Date(),
                description: dividendDto.description || 'Dividend distribution',
                transactionHash: ''
            });
            pool.totalDividendsDistributed += dividendDto.amount;
            pool.operations.push(`Dividend distributed: ${dividendDto.amount} by ${adminWallet}`);
            try {
                let txIds = [];
                for (const investment of pool.investments) {
                    if (investment.isActive) {
                        const investorDividend = investment.tokens * dividendPerToken;
                        const txId = await this.hederaService.transferHbar(investment.investorAddress, investorDividend);
                        txIds.push(txId);
                        this.logger.log(`Distributed ${investorDividend} HBAR to ${investment.investorAddress}: ${txId}`);
                    }
                }
                pool.dividends[pool.dividends.length - 1].transactionHash = txIds.join(',');
                this.logger.log(`Distributed ${txIds.length} dividends on-chain`);
            }
            catch (hederaError) {
                this.logger.error('Failed to distribute dividends on Hedera:', hederaError);
            }
            const updatedPool = await pool.save();
            this.logger.log(`Dividend distributed for pool ${dividendDto.poolId}: ${dividendDto.amount}`);
            return updatedPool;
        }
        catch (error) {
            this.logger.error('Failed to distribute dividend:', error);
            throw error;
        }
    }
    async closePool(poolId, adminWallet) {
        try {
            const adminRole = await this.adminService.checkAdminStatus(adminWallet);
            if (!adminRole.isAmcAdmin && !adminRole.isSuperAdmin && !adminRole.isPlatformAdmin) {
                throw new common_1.BadRequestException('Only AMC Admins can close pools');
            }
            const pool = await this.amcPoolModel.findOne({ poolId });
            if (!pool) {
                throw new common_1.NotFoundException('Pool not found');
            }
            if (pool.status !== amc_pool_schema_1.PoolStatus.ACTIVE) {
                throw new common_1.BadRequestException('Pool is not active');
            }
            pool.status = amc_pool_schema_1.PoolStatus.CLOSED;
            pool.closedAt = new Date();
            pool.operations.push(`Pool closed by ${adminWallet}`);
            const updatedPool = await pool.save();
            this.logger.log(`Closed AMC pool: ${poolId}`);
            return updatedPool;
        }
        catch (error) {
            this.logger.error('Failed to close pool:', error);
            throw error;
        }
    }
    async getPoolStats(poolId) {
        try {
            const pool = await this.amcPoolModel.findOne({ poolId });
            if (!pool) {
                throw new common_1.NotFoundException('Pool not found');
            }
            const totalInvestments = pool.investments.length;
            const totalInvested = pool.totalInvested;
            const totalDividends = pool.totalDividendsDistributed;
            const averageInvestment = totalInvestments > 0 ? totalInvested / totalInvestments : 0;
            const roi = totalInvested > 0 ? (totalDividends / totalInvested) * 100 : 0;
            return {
                poolId: pool.poolId,
                name: pool.name,
                status: pool.status,
                totalInvestments,
                totalInvested,
                totalDividends,
                averageInvestment,
                roi,
                totalInvestors: pool.totalInvestors,
                currentPrice: pool.currentPrice,
                priceChange24h: pool.priceChange24h,
                tradingVolume: pool.tradingVolume,
                assets: pool.assets.length,
                diversification: pool.metadata.diversification,
                riskLevel: pool.metadata.riskLevel
            };
        }
        catch (error) {
            this.logger.error('Failed to get pool stats:', error);
            throw error;
        }
    }
    async validatePoolAssets(assets) {
        this.logger.log('Validating pool assets...');
        if (!assets || assets.length === 0) {
            throw new common_1.BadRequestException('Pool must contain at least one asset');
        }
        const hcsMessages = await this.hederaService.getTrustBridgeTopicMessages();
        const assetMessages = hcsMessages.filter(msg => msg.type === 'TRUSTBRIDGE_ASSET_CREATED');
        this.logger.log(`Found ${assetMessages.length} asset creation messages`);
        const statusMessages = hcsMessages.filter(msg => msg.type === 'TRUSTBRIDGE_ASSET_STATUS_UPDATE');
        this.logger.log(`Found ${statusMessages.length} status update messages`);
        const currentStatuses = new Map();
        statusMessages.forEach(statusMsg => {
            currentStatuses.set(statusMsg.rwaTokenId, statusMsg.status);
        });
        const assetsWithStatus = assetMessages.map(asset => ({
            ...asset,
            status: currentStatuses.get(asset.rwaTokenId) || asset.status
        }));
        const approvedAssets = assetsWithStatus.filter(asset => asset.status === 'APPROVED');
        this.logger.log(`Found ${approvedAssets.length} approved assets in HCS topic`);
        this.logger.log('Approved asset IDs:', approvedAssets.map(a => a.rwaTokenId));
        for (const poolAsset of assets) {
            this.logger.log(`Validating asset: ${poolAsset.assetId}`);
            const rwaAsset = approvedAssets.find(asset => asset.rwaTokenId === poolAsset.assetId);
            if (!rwaAsset) {
                this.logger.error(`Asset ${poolAsset.assetId} not found in approved assets`);
                this.logger.error('Available approved assets:', approvedAssets.map(a => a.rwaTokenId));
                throw new common_1.BadRequestException(`Asset ${poolAsset.assetId} not found or not approved`);
            }
            const existingPool = await this.amcPoolModel.findOne({
                'assets.assetId': poolAsset.assetId,
                status: { $in: ['ACTIVE', 'DRAFT'] }
            });
            if (existingPool) {
                throw new common_1.BadRequestException(`Asset ${poolAsset.assetId} is already in pool ${existingPool.poolId}`);
            }
            if (poolAsset.value <= 0) {
                throw new common_1.BadRequestException(`Asset ${poolAsset.assetId} must have a positive value`);
            }
        }
        this.logger.log(`Validated ${assets.length} assets for pool creation`);
    }
    async updateAssetOwnersEarnings(pool, investmentAmount) {
        try {
            for (const poolAsset of pool.assets) {
                const assetPercentage = poolAsset.percentage / 100;
                const earningsForAsset = investmentAmount * assetPercentage;
                const asset = await this.assetModel.findOne({ assetId: poolAsset.assetId });
                if (asset) {
                    asset.earnings = (asset.earnings || 0) + earningsForAsset;
                    await asset.save();
                    this.logger.log(`Updated earnings for asset ${poolAsset.assetId}: +${earningsForAsset}`);
                }
            }
        }
        catch (error) {
            this.logger.error('Failed to update asset owner earnings:', error);
        }
    }
};
exports.AMCPoolsService = AMCPoolsService;
exports.AMCPoolsService = AMCPoolsService = AMCPoolsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(amc_pool_schema_1.AMCPool.name)),
    __param(1, (0, mongoose_1.InjectModel)(asset_schema_1.Asset.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        hedera_service_1.HederaService,
        admin_service_1.AdminService,
        config_1.ConfigService])
], AMCPoolsService);
//# sourceMappingURL=amc-pools.service.js.map