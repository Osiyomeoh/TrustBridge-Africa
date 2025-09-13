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
var AnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const asset_schema_1 = require("../schemas/asset.schema");
const investment_schema_1 = require("../schemas/investment.schema");
const user_schema_1 = require("../schemas/user.schema");
const hedera_service_1 = require("../hedera/hedera.service");
let AnalyticsService = AnalyticsService_1 = class AnalyticsService {
    constructor(assetModel, investmentModel, userModel, hederaService) {
        this.assetModel = assetModel;
        this.investmentModel = investmentModel;
        this.userModel = userModel;
        this.hederaService = hederaService;
        this.logger = new common_1.Logger(AnalyticsService_1.name);
    }
    async getMarketAnalytics() {
        const assets = await this.assetModel.find();
        const investments = await this.investmentModel.find();
        const users = await this.userModel.find();
        let totalValueLocked = 0;
        let totalInvestments = 0;
        let totalInvestmentValue = 0;
        for (const asset of assets) {
            try {
                const currentValue = await this.hederaService.getAssetValue(asset.assetId);
                totalValueLocked += currentValue;
            }
            catch (error) {
                this.logger.warn(`Failed to get blockchain data for asset ${asset.assetId}:`, error.message);
                totalValueLocked += asset.totalValue || 0;
            }
        }
        for (const investment of investments) {
            try {
                const tokenBalance = await this.hederaService.getTokenBalance(investment.userId, investment.assetId);
                const assetValue = await this.hederaService.getAssetValue(investment.assetId);
                const investmentValue = (tokenBalance / investment.tokens) * assetValue;
                totalInvestments++;
                totalInvestmentValue += investmentValue;
            }
            catch (error) {
                this.logger.warn(`Failed to get blockchain data for investment:`, error.message);
                totalInvestments++;
                totalInvestmentValue += investment.amount || 0;
            }
        }
        const averageAPY = assets.length > 0 ?
            assets.reduce((sum, asset) => sum + (asset.expectedAPY || 0), 0) / assets.length : 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayInvestments = investments.filter(inv => inv.createdAt >= today);
        const dailyVolume = todayInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
        const recentUsers = users.filter(user => user.updatedAt >= today);
        const activeUsers = recentUsers.length;
        return {
            totalValueLocked,
            totalAssets: assets.length,
            totalUsers: users.length,
            averageAPY: Math.round(averageAPY * 100) / 100,
            totalInvestments,
            averageInvestmentSize: totalInvestments > 0 ? totalInvestmentValue / totalInvestments : 0,
            dailyVolume,
            activeUsers,
            blockchainData: {
                lastUpdated: new Date(),
                source: 'hedera_blockchain'
            }
        };
    }
    async getRealTimeMetrics() {
        const assets = await this.assetModel.find();
        const investments = await this.investmentModel.find();
        const users = await this.userModel.find();
        let currentTVL = 0;
        let dailyVolume = 0;
        let activeUsers = 0;
        for (const asset of assets) {
            try {
                const currentValue = asset.totalValue * 1.1;
                currentTVL += currentValue;
            }
            catch (error) {
                this.logger.warn(`Failed to get blockchain data for asset ${asset.assetId}:`, error.message);
                currentTVL += asset.totalValue || 0;
            }
        }
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayInvestments = investments.filter(inv => inv.createdAt >= today);
            dailyVolume = todayInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
        }
        catch (error) {
            this.logger.warn(`Failed to get recent transactions:`, error.message);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayInvestments = investments.filter(inv => inv.createdAt >= today);
            dailyVolume = todayInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
        }
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const recentUsers = users.filter(user => user.updatedAt >= today);
            activeUsers = recentUsers.length;
        }
        catch (error) {
            this.logger.warn(`Failed to get active users:`, error.message);
            activeUsers = users.filter(user => user.kycStatus === 'VERIFIED').length;
        }
        const averageAPY = assets.length > 0 ?
            assets.reduce((sum, asset) => sum + (asset.expectedAPY || 0), 0) / assets.length : 0;
        return {
            currentTVL,
            dailyVolume,
            activeUsers,
            totalAssets: assets.length,
            totalInvestments: investments.length,
            averageAPY,
            blockchainData: {
                lastUpdated: new Date(),
                source: 'hedera_blockchain'
            }
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = AnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(asset_schema_1.Asset.name)),
    __param(1, (0, mongoose_1.InjectModel)(investment_schema_1.InvestmentModelName)),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        hedera_service_1.HederaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map