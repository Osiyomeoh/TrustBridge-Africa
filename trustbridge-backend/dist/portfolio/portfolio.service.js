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
var PortfolioService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfolioService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const investment_schema_1 = require("../schemas/investment.schema");
const hedera_service_1 = require("../hedera/hedera.service");
let PortfolioService = PortfolioService_1 = class PortfolioService {
    constructor(investmentModel, hederaService) {
        this.investmentModel = investmentModel;
        this.hederaService = hederaService;
        this.logger = new common_1.Logger(PortfolioService_1.name);
    }
    async getUserPortfolio(userId) {
        const investments = await this.investmentModel.find({ userId });
        let totalInvested = 0;
        let totalValue = 0;
        let blockchainData = {};
        for (const investment of investments) {
            try {
                const tokenBalance = investment.tokens;
                const currentAssetValue = investment.amount * 1.2;
                const investmentValue = (tokenBalance / investment.tokens) * currentAssetValue;
                totalInvested += investment.amount;
                totalValue += investmentValue;
                blockchainData[investment.assetId] = {
                    tokenBalance,
                    currentValue: investmentValue,
                    lastUpdated: new Date()
                };
            }
            catch (error) {
                this.logger.warn(`Failed to get blockchain data for asset ${investment.assetId}:`, error.message);
                totalInvested += investment.amount;
                totalValue += investment.amount;
            }
        }
        const totalReturns = totalValue - totalInvested;
        return {
            totalInvested,
            totalValue,
            totalReturns,
            returnPercentage: totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0,
            activeInvestments: investments.filter(inv => inv.status === 'ACTIVE').length,
            investments: investments.length,
            assets: [...new Set(investments.map(inv => inv.assetId))],
            blockchainData,
            lastUpdated: new Date()
        };
    }
    async getPortfolioSummary() {
        const investments = await this.investmentModel.find();
        let totalInvested = 0;
        let totalValue = 0;
        const userPortfolios = {};
        for (const investment of investments) {
            try {
                const tokenBalance = await this.hederaService.getTokenBalance(investment.userId, investment.assetId);
                const currentAssetValue = await this.hederaService.getAssetValue(investment.assetId);
                const investmentValue = (tokenBalance / investment.tokens) * currentAssetValue;
                if (!userPortfolios[investment.userId]) {
                    userPortfolios[investment.userId] = { invested: 0, value: 0 };
                }
                userPortfolios[investment.userId].invested += investment.amount;
                userPortfolios[investment.userId].value += investmentValue;
                totalInvested += investment.amount;
                totalValue += investmentValue;
            }
            catch (error) {
                this.logger.warn(`Failed to get blockchain data for portfolio summary:`, error.message);
                totalInvested += investment.amount;
                totalValue += investment.amount;
            }
        }
        const totalReturns = totalValue - totalInvested;
        return {
            totalInvested,
            totalValue,
            totalReturns,
            returnPercentage: totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0,
            totalInvestments: investments.length,
            totalUsers: Object.keys(userPortfolios).length,
            totalAssets: [...new Set(investments.map(inv => inv.assetId))].length,
            userPortfolios,
            lastUpdated: new Date()
        };
    }
};
exports.PortfolioService = PortfolioService;
exports.PortfolioService = PortfolioService = PortfolioService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(investment_schema_1.InvestmentModelName)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        hedera_service_1.HederaService])
], PortfolioService);
//# sourceMappingURL=portfolio.service.js.map