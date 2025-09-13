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
var InvestmentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvestmentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const investment_schema_1 = require("../schemas/investment.schema");
const hedera_service_1 = require("../hedera/hedera.service");
let InvestmentsService = InvestmentsService_1 = class InvestmentsService {
    constructor(investmentModel, hederaService) {
        this.investmentModel = investmentModel;
        this.hederaService = hederaService;
        this.logger = new common_1.Logger(InvestmentsService_1.name);
    }
    async getAllInvestments() {
        const dbInvestments = await this.investmentModel.find().sort({ createdAt: -1 });
        const enrichedInvestments = await Promise.all(dbInvestments.map(async (investment) => {
            try {
                const tokenBalance = investment.tokens;
                return {
                    ...investment.toObject(),
                    blockchainData: {
                        tokenBalance,
                        contractAddress: investment.assetId,
                        lastUpdated: new Date()
                    }
                };
            }
            catch (error) {
                this.logger.warn(`Failed to get blockchain data for investment ${investment.investmentId}:`, error.message);
                return investment.toObject();
            }
        }));
        return enrichedInvestments;
    }
    async getInvestmentById(investmentId) {
        const investment = await this.investmentModel.findById(investmentId);
        if (!investment)
            return null;
        try {
            const tokenBalance = investment.tokens;
            return {
                ...investment.toObject(),
                blockchainData: {
                    tokenBalance,
                    contractAddress: investment.assetId,
                    lastUpdated: new Date()
                }
            };
        }
        catch (error) {
            this.logger.warn(`Failed to get blockchain data for investment ${investmentId}:`, error.message);
            return investment.toObject();
        }
    }
    async getInvestmentsByUser(userId) {
        const investments = await this.investmentModel.find({ userId }).sort({ createdAt: -1 });
        return Promise.all(investments.map(async (investment) => {
            try {
                const tokenBalance = investment.tokens;
                return {
                    ...investment.toObject(),
                    blockchainData: {
                        tokenBalance,
                        contractAddress: investment.assetId,
                        lastUpdated: new Date()
                    }
                };
            }
            catch (error) {
                this.logger.warn(`Failed to get blockchain data for user ${userId} investment:`, error.message);
                return investment.toObject();
            }
        }));
    }
    async createInvestment(investmentData) {
        const investmentId = `INV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const investment = new this.investmentModel({
            ...investmentData,
            investmentId,
            blockchainData: undefined
        });
        const savedInvestment = await investment.save();
        try {
            const txHash = `0x${Date.now().toString(16)}${Math.random().toString(16).substr(2, 32)}`;
            savedInvestment.transactionHash = txHash;
            await savedInvestment.save();
            return {
                ...savedInvestment.toObject(),
                blockchainData: {
                    transactionHash: txHash,
                    status: 'PENDING_CONFIRMATION'
                }
            };
        }
        catch (error) {
            this.logger.error(`Failed to execute investment on blockchain:`, error);
            throw new Error(`Investment created in database but failed on blockchain: ${error.message}`);
        }
    }
};
exports.InvestmentsService = InvestmentsService;
exports.InvestmentsService = InvestmentsService = InvestmentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(investment_schema_1.InvestmentModelName)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        hedera_service_1.HederaService])
], InvestmentsService);
//# sourceMappingURL=investments.service.js.map