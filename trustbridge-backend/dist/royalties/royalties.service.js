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
var RoyaltiesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoyaltiesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const royalty_schema_1 = require("../schemas/royalty.schema");
let RoyaltiesService = RoyaltiesService_1 = class RoyaltiesService {
    constructor(royaltyPaymentModel, creatorStatsModel) {
        this.royaltyPaymentModel = royaltyPaymentModel;
        this.creatorStatsModel = creatorStatsModel;
        this.logger = new common_1.Logger(RoyaltiesService_1.name);
    }
    async recordRoyaltyPayment(data) {
        try {
            const payment = new this.royaltyPaymentModel({
                ...data,
                timestamp: new Date(),
                status: 'paid',
            });
            const saved = await payment.save();
            this.logger.log(`Recorded royalty payment: ${saved.transactionId}`);
            await this.updateCreatorStats(data.creator, data.royaltyAmount, data.nftContract);
            return saved;
        }
        catch (error) {
            if (error.code === 11000) {
                this.logger.warn(`Royalty payment already recorded: ${data.transactionId}`);
                return null;
            }
            this.logger.error('Error recording royalty payment:', error);
            throw error;
        }
    }
    async updateCreatorStats(creator, royaltyAmount, nftContract) {
        try {
            const currentMonth = new Date().toISOString().slice(0, 7);
            await this.creatorStatsModel.findOneAndUpdate({ creator }, {
                $inc: {
                    totalEarned: royaltyAmount,
                    salesCount: 1,
                    [`monthlyEarnings.${currentMonth}`]: royaltyAmount,
                },
                $addToSet: { nftContracts: nftContract },
            }, { upsert: true, new: true });
            const stats = await this.creatorStatsModel.findOne({ creator });
            if (stats) {
                stats.averageRoyalty = stats.totalEarned / stats.salesCount;
                await stats.save();
            }
        }
        catch (error) {
            this.logger.error('Error updating creator stats:', error);
        }
    }
    async getCreatorRoyaltyPayments(creator, options) {
        try {
            const query = { creator };
            if (options?.startDate || options?.endDate) {
                query.timestamp = {};
                if (options.startDate)
                    query.timestamp.$gte = options.startDate;
                if (options.endDate)
                    query.timestamp.$lte = options.endDate;
            }
            const limit = options?.limit || 50;
            const skip = options?.skip || 0;
            const [payments, total] = await Promise.all([
                this.royaltyPaymentModel
                    .find(query)
                    .sort({ timestamp: -1 })
                    .limit(limit)
                    .skip(skip)
                    .exec(),
                this.royaltyPaymentModel.countDocuments(query).exec(),
            ]);
            return { payments, total };
        }
        catch (error) {
            this.logger.error('Error fetching creator royalty payments:', error);
            throw error;
        }
    }
    async getCreatorStats(creator) {
        try {
            return this.creatorStatsModel.findOne({ creator }).exec();
        }
        catch (error) {
            this.logger.error('Error fetching creator stats:', error);
            throw error;
        }
    }
    async getNFTRoyaltyHistory(nftContract, tokenId) {
        try {
            return this.royaltyPaymentModel
                .find({ nftContract, tokenId })
                .sort({ timestamp: -1 })
                .exec();
        }
        catch (error) {
            this.logger.error('Error fetching NFT royalty history:', error);
            throw error;
        }
    }
    async getTopCreators(limit = 10) {
        try {
            return this.creatorStatsModel
                .find()
                .sort({ totalEarned: -1 })
                .limit(limit)
                .exec();
        }
        catch (error) {
            this.logger.error('Error fetching top creators:', error);
            throw error;
        }
    }
    async getMonthlyEarnings(creator, months = 12) {
        try {
            const stats = await this.creatorStatsModel.findOne({ creator }).exec();
            if (!stats) {
                return {};
            }
            const result = {};
            const now = new Date();
            for (let i = 0; i < months; i++) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthKey = date.toISOString().slice(0, 7);
                result[monthKey] = stats.monthlyEarnings[monthKey] || 0;
            }
            return result;
        }
        catch (error) {
            this.logger.error('Error fetching monthly earnings:', error);
            throw error;
        }
    }
};
exports.RoyaltiesService = RoyaltiesService;
exports.RoyaltiesService = RoyaltiesService = RoyaltiesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(royalty_schema_1.RoyaltyPayment.name)),
    __param(1, (0, mongoose_1.InjectModel)(royalty_schema_1.CreatorRoyaltyStats.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], RoyaltiesService);
//# sourceMappingURL=royalties.service.js.map