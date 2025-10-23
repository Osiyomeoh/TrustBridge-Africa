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
var PoolTokensService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolTokensService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const pool_token_holdings_schema_1 = require("../schemas/pool-token-holdings.schema");
const amc_pool_schema_1 = require("../schemas/amc-pool.schema");
const hedera_service_1 = require("../hedera/hedera.service");
let PoolTokensService = PoolTokensService_1 = class PoolTokensService {
    constructor(poolTokenHoldingsModel, amcPoolModel, hederaService) {
        this.poolTokenHoldingsModel = poolTokenHoldingsModel;
        this.amcPoolModel = amcPoolModel;
        this.hederaService = hederaService;
        this.logger = new common_1.Logger(PoolTokensService_1.name);
    }
    async getUserHoldings(holderAddress) {
        try {
            return await this.poolTokenHoldingsModel.find({
                holderAddress,
                isActive: true
            }).sort({ lastActivityDate: -1 });
        }
        catch (error) {
            this.logger.error('Failed to get user holdings:', error);
            throw error;
        }
    }
    async getPoolHolding(holderAddress, poolId) {
        try {
            const holding = await this.poolTokenHoldingsModel.findOne({
                holderAddress,
                poolId
            });
            if (!holding) {
                throw new common_1.NotFoundException('Pool token holding not found');
            }
            return holding;
        }
        catch (error) {
            this.logger.error('Failed to get pool holding:', error);
            throw error;
        }
    }
    async updateHoldingsAfterInvestment(holderAddress, poolId, tokenAmount, pricePerToken, totalValue) {
        try {
            const pool = await this.amcPoolModel.findOne({ poolId });
            if (!pool) {
                throw new common_1.NotFoundException('Pool not found');
            }
            let holding = await this.poolTokenHoldingsModel.findOne({
                holderAddress,
                poolId
            });
            const transferId = `TRANSFER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            if (holding) {
                const newTotalTokens = holding.totalTokens + tokenAmount;
                const newTotalInvested = holding.totalInvested + totalValue;
                const newAverageBuyPrice = newTotalInvested / newTotalTokens;
                holding.totalTokens = newTotalTokens;
                holding.availableTokens = holding.availableTokens + tokenAmount;
                holding.totalInvested = newTotalInvested;
                holding.averageBuyPrice = newAverageBuyPrice;
                holding.lastActivityDate = new Date();
                holding.transfers.push({
                    transferId,
                    type: pool_token_holdings_schema_1.TokenTransferType.INVESTMENT,
                    fromAddress: 'POOL_TREASURY',
                    toAddress: holderAddress,
                    amount: tokenAmount,
                    pricePerToken,
                    totalValue,
                    transactionHash: '',
                    hederaTransactionId: '',
                    description: 'Pool token purchase',
                    transferDate: new Date(),
                    fees: 0,
                    referenceId: ''
                });
                await this.poolTokenHoldingsModel.findByIdAndUpdate(holding._id, holding);
            }
            else {
                holding = new this.poolTokenHoldingsModel({
                    holderAddress,
                    poolId,
                    poolTokenId: pool.hederaTokenId,
                    poolName: pool.name,
                    totalTokens: tokenAmount,
                    availableTokens: tokenAmount,
                    lockedTokens: 0,
                    totalInvested: totalValue,
                    totalDividendsReceived: 0,
                    totalDividendsClaimed: 0,
                    totalDividendsUnclaimed: 0,
                    averageBuyPrice: pricePerToken,
                    currentValue: 0,
                    unrealizedPnL: 0,
                    realizedPnL: 0,
                    totalPnL: 0,
                    roi: 0,
                    transfers: [{
                            transferId,
                            type: pool_token_holdings_schema_1.TokenTransferType.INVESTMENT,
                            fromAddress: 'POOL_TREASURY',
                            toAddress: holderAddress,
                            amount: tokenAmount,
                            pricePerToken,
                            totalValue,
                            transactionHash: '',
                            hederaTransactionId: '',
                            description: 'Pool token purchase',
                            transferDate: new Date(),
                            fees: 0,
                            referenceId: ''
                        }],
                    dividends: [],
                    firstInvestmentDate: new Date(),
                    lastActivityDate: new Date(),
                    isActive: true,
                    metadata: {
                        riskLevel: pool.metadata.riskLevel,
                        poolType: pool.type,
                        expectedAPY: pool.expectedAPY,
                        maturityDate: pool.maturityDate,
                        isTradeable: pool.isTradeable,
                        lastPriceUpdate: new Date(),
                        priceChange24h: 0
                    },
                    stakingRecords: []
                });
                await this.poolTokenHoldingsModel.findByIdAndUpdate(holding._id, holding);
            }
            await this.updateHoldingValue(holding);
            this.logger.log(`Updated holdings for ${holderAddress} in pool ${poolId}: +${tokenAmount} tokens`);
            return holding;
        }
        catch (error) {
            this.logger.error('Failed to update holdings after investment:', error);
            throw error;
        }
    }
    async transferTokens(transferDto) {
        try {
            const { fromAddress, toAddress, amount, transferType, description, referenceId } = transferDto;
            if (fromAddress === toAddress) {
                throw new common_1.BadRequestException('Cannot transfer tokens to the same address');
            }
            const senderHolding = await this.poolTokenHoldingsModel.findOne({
                holderAddress: fromAddress,
                isActive: true
            });
            if (!senderHolding) {
                throw new common_1.NotFoundException('Sender does not have token holdings');
            }
            if (senderHolding.availableTokens < amount) {
                throw new common_1.BadRequestException('Insufficient token balance');
            }
            senderHolding.availableTokens -= amount;
            senderHolding.lastActivityDate = new Date();
            let receiverHolding = await this.poolTokenHoldingsModel.findOne({
                holderAddress: toAddress,
                poolId: senderHolding.poolId
            });
            const transferId = `TRANSFER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const currentPrice = senderHolding.metadata.lastPriceUpdate ?
                await this.getCurrentPoolPrice(senderHolding.poolId) : senderHolding.averageBuyPrice;
            if (receiverHolding) {
                receiverHolding.totalTokens += amount;
                receiverHolding.availableTokens += amount;
                receiverHolding.lastActivityDate = new Date();
                const newTotalInvested = receiverHolding.totalInvested + (amount * currentPrice);
                receiverHolding.averageBuyPrice = newTotalInvested / receiverHolding.totalTokens;
                receiverHolding.totalInvested = newTotalInvested;
            }
            else {
                const pool = await this.amcPoolModel.findOne({ poolId: senderHolding.poolId });
                if (!pool) {
                    throw new common_1.NotFoundException('Pool not found');
                }
                receiverHolding = new this.poolTokenHoldingsModel({
                    holderAddress: toAddress,
                    poolId: senderHolding.poolId,
                    poolTokenId: senderHolding.poolTokenId,
                    poolName: senderHolding.poolName,
                    totalTokens: amount,
                    availableTokens: amount,
                    lockedTokens: 0,
                    totalInvested: amount * currentPrice,
                    totalDividendsReceived: 0,
                    totalDividendsClaimed: 0,
                    totalDividendsUnclaimed: 0,
                    averageBuyPrice: currentPrice,
                    currentValue: 0,
                    unrealizedPnL: 0,
                    realizedPnL: 0,
                    totalPnL: 0,
                    roi: 0,
                    transfers: [],
                    dividends: [],
                    firstInvestmentDate: new Date(),
                    lastActivityDate: new Date(),
                    isActive: true,
                    metadata: senderHolding.metadata,
                    stakingRecords: []
                });
            }
            const transferRecord = {
                transferId,
                type: transferType,
                fromAddress,
                toAddress,
                amount,
                pricePerToken: currentPrice,
                totalValue: amount * currentPrice,
                transactionHash: '',
                hederaTransactionId: '',
                description: description || `Token transfer`,
                transferDate: new Date(),
                fees: 0,
                referenceId: referenceId || ''
            };
            senderHolding.transfers.push(transferRecord);
            receiverHolding.transfers.push(transferRecord);
            await Promise.all([senderHolding.save(), receiverHolding.save()]);
            await Promise.all([
                this.updateHoldingValue(senderHolding),
                this.updateHoldingValue(receiverHolding)
            ]);
            this.logger.log(`Transferred ${amount} tokens from ${fromAddress} to ${toAddress}`);
            return receiverHolding;
        }
        catch (error) {
            this.logger.error('Failed to transfer tokens:', error);
            throw error;
        }
    }
    async updateDividendDistribution(poolId, dividendAmount, perToken, description) {
        try {
            const holdings = await this.poolTokenHoldingsModel.find({
                poolId,
                isActive: true,
                totalTokens: { $gt: 0 }
            });
            const dividendId = `DIVIDEND_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            for (const holding of holdings) {
                const dividendAmount = holding.totalTokens * perToken;
                holding.totalDividendsReceived += dividendAmount;
                holding.totalDividendsUnclaimed += dividendAmount;
                holding.lastActivityDate = new Date();
                holding.dividends.push({
                    dividendId,
                    poolId,
                    amount: dividendAmount,
                    perToken,
                    distributedAt: new Date(),
                    transactionHash: '',
                    description,
                    isClaimed: false,
                    claimedAt: null
                });
                await this.poolTokenHoldingsModel.findByIdAndUpdate(holding._id, holding);
            }
            this.logger.log(`Distributed dividends to ${holdings.length} holders in pool ${poolId}`);
        }
        catch (error) {
            this.logger.error('Failed to update dividend distribution:', error);
            throw error;
        }
    }
    async claimDividends(claimDto) {
        try {
            const { holderAddress, poolId, dividendId } = claimDto;
            const holding = await this.poolTokenHoldingsModel.findOne({
                holderAddress,
                poolId
            });
            if (!holding) {
                throw new common_1.NotFoundException('Pool token holding not found');
            }
            const dividend = holding.dividends.find(d => d.dividendId === dividendId && !d.isClaimed);
            if (!dividend) {
                throw new common_1.NotFoundException('Dividend not found or already claimed');
            }
            dividend.isClaimed = true;
            dividend.claimedAt = new Date();
            holding.totalDividendsClaimed += dividend.amount;
            holding.totalDividendsUnclaimed -= dividend.amount;
            holding.lastActivityDate = new Date();
            await this.poolTokenHoldingsModel.findByIdAndUpdate(holding._id, holding);
            await this.updateHoldingValue(holding);
            this.logger.log(`Claimed dividend ${dividendId} for ${holderAddress}`);
            return holding;
        }
        catch (error) {
            this.logger.error('Failed to claim dividends:', error);
            throw error;
        }
    }
    async stakeTokens(stakeDto) {
        try {
            const { holderAddress, poolId, amount, duration } = stakeDto;
            const holding = await this.poolTokenHoldingsModel.findOne({
                holderAddress,
                poolId
            });
            if (!holding) {
                throw new common_1.NotFoundException('Pool token holding not found');
            }
            if (holding.availableTokens < amount) {
                throw new common_1.BadRequestException('Insufficient available tokens for staking');
            }
            const stakingId = `STAKING_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            holding.availableTokens -= amount;
            holding.lockedTokens += amount;
            holding.lastActivityDate = new Date();
            holding.stakingRecords.push({
                stakingId,
                amount,
                stakedAt: new Date(),
                rewards: 0,
                status: 'ACTIVE'
            });
            await this.poolTokenHoldingsModel.findByIdAndUpdate(holding._id, holding);
            await this.updateHoldingValue(holding);
            this.logger.log(`Staked ${amount} tokens for ${holderAddress} in pool ${poolId}`);
            return holding;
        }
        catch (error) {
            this.logger.error('Failed to stake tokens:', error);
            throw error;
        }
    }
    async unstakeTokens(holderAddress, poolId, stakingId) {
        try {
            const holding = await this.poolTokenHoldingsModel.findOne({
                holderAddress,
                poolId
            });
            if (!holding) {
                throw new common_1.NotFoundException('Pool token holding not found');
            }
            const stakingRecord = holding.stakingRecords.find(s => s.stakingId === stakingId && s.status === 'ACTIVE');
            if (!stakingRecord) {
                throw new common_1.NotFoundException('Active staking record not found');
            }
            holding.lockedTokens -= stakingRecord.amount;
            holding.availableTokens += stakingRecord.amount;
            holding.lastActivityDate = new Date();
            stakingRecord.status = 'UNSTAKED';
            stakingRecord.unstakedAt = new Date();
            await this.poolTokenHoldingsModel.findByIdAndUpdate(holding._id, holding);
            await this.updateHoldingValue(holding);
            this.logger.log(`Unstaked ${stakingRecord.amount} tokens for ${holderAddress}`);
            return holding;
        }
        catch (error) {
            this.logger.error('Failed to unstake tokens:', error);
            throw error;
        }
    }
    async updateHoldingValue(holding) {
        try {
            const currentPrice = await this.getCurrentPoolPrice(holding.poolId);
            holding.currentValue = holding.totalTokens * currentPrice;
            holding.unrealizedPnL = holding.currentValue - holding.totalInvested;
            holding.totalPnL = holding.unrealizedPnL + holding.realizedPnL;
            holding.roi = holding.totalInvested > 0 ? (holding.totalPnL / holding.totalInvested) * 100 : 0;
            holding.metadata.lastPriceUpdate = new Date();
            await this.poolTokenHoldingsModel.findByIdAndUpdate(holding._id, holding);
        }
        catch (error) {
            this.logger.error('Failed to update holding value:', error);
        }
    }
    async getCurrentPoolPrice(poolId) {
        try {
            const pool = await this.amcPoolModel.findOne({ poolId });
            return pool?.currentPrice || 0;
        }
        catch (error) {
            this.logger.error('Failed to get current pool price:', error);
            return 0;
        }
    }
    async getPortfolioSummary(holderAddress) {
        try {
            const holdings = await this.poolTokenHoldingsModel.find({
                holderAddress,
                isActive: true
            });
            const totalInvested = holdings.reduce((sum, h) => sum + h.totalInvested, 0);
            const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
            const totalPnL = holdings.reduce((sum, h) => sum + h.totalPnL, 0);
            const totalDividends = holdings.reduce((sum, h) => sum + h.totalDividendsReceived, 0);
            const totalDividendsClaimed = holdings.reduce((sum, h) => sum + h.totalDividendsClaimed, 0);
            const totalDividendsUnclaimed = holdings.reduce((sum, h) => sum + h.totalDividendsUnclaimed, 0);
            return {
                totalHoldings: holdings.length,
                totalInvested,
                totalValue,
                totalPnL,
                totalDividends,
                totalDividendsClaimed,
                totalDividendsUnclaimed,
                roi: totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0,
                holdings: holdings.map(h => ({
                    poolId: h.poolId,
                    poolName: h.poolName,
                    totalTokens: h.totalTokens,
                    availableTokens: h.availableTokens,
                    lockedTokens: h.lockedTokens,
                    currentValue: h.currentValue,
                    totalPnL: h.totalPnL,
                    roi: h.roi,
                    totalDividendsUnclaimed: h.totalDividendsUnclaimed
                }))
            };
        }
        catch (error) {
            this.logger.error('Failed to get portfolio summary:', error);
            throw error;
        }
    }
};
exports.PoolTokensService = PoolTokensService;
exports.PoolTokensService = PoolTokensService = PoolTokensService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(pool_token_holdings_schema_1.PoolTokenHoldings.name)),
    __param(1, (0, mongoose_1.InjectModel)(amc_pool_schema_1.AMCPool.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        hedera_service_1.HederaService])
], PoolTokensService);
//# sourceMappingURL=pool-tokens.service.js.map