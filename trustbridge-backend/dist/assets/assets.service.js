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
var AssetsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const asset_schema_1 = require("../schemas/asset.schema");
const hedera_service_1 = require("../hedera/hedera.service");
let AssetsService = AssetsService_1 = class AssetsService {
    constructor(assetModel, hederaService) {
        this.assetModel = assetModel;
        this.hederaService = hederaService;
        this.logger = new common_1.Logger(AssetsService_1.name);
    }
    async createAsset(createAssetDto) {
        const assetId = `${createAssetDto.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const asset = new this.assetModel({
            ...createAssetDto,
            assetId,
            status: asset_schema_1.AssetStatus.PENDING,
            tokenizedAmount: 0,
            verificationScore: 0,
            investments: [],
            operations: [],
        });
        return asset.save();
    }
    async createAssetWithTokenization(createAssetDto) {
        try {
            const asset = await this.createAsset(createAssetDto);
            this.logger.log(`Created asset ${asset.assetId} in database`);
            const tokenizationRequest = {
                assetId: asset.assetId,
                owner: createAssetDto.owner,
                tokenName: `${createAssetDto.name} Token`,
                tokenSymbol: this.generateTokenSymbol(createAssetDto.name, createAssetDto.type),
                totalSupply: createAssetDto.tokenSupply,
                enableKyc: true,
                enableFreeze: true,
                metadata: {
                    assetType: createAssetDto.type,
                    location: createAssetDto.location,
                    totalValue: createAssetDto.totalValue,
                    expectedAPY: createAssetDto.expectedAPY,
                    maturityDate: createAssetDto.maturityDate,
                }
            };
            const tokenizationResult = await this.hederaService.createAssetToken(tokenizationRequest);
            this.logger.log(`Created Hedera token ${tokenizationResult.tokenId} for asset ${asset.assetId}`);
            const updatedAsset = await this.assetModel.findByIdAndUpdate(asset._id, {
                $set: {
                    tokenId: tokenizationResult.tokenId,
                    status: asset_schema_1.AssetStatus.ACTIVE,
                    tokenizedAmount: createAssetDto.tokenSupply,
                    operations: [`Token created on Hedera: ${tokenizationResult.transactionId}`]
                }
            }, { new: true });
            return {
                asset: updatedAsset,
                tokenId: tokenizationResult.tokenId,
                transactionId: tokenizationResult.transactionId
            };
        }
        catch (error) {
            this.logger.error(`Failed to create asset with tokenization: ${error.message}`);
            const asset = await this.assetModel.findById(asset._id);
            if (asset) {
                await this.assetModel.findByIdAndUpdate(asset._id, {
                    $set: {
                        status: asset_schema_1.AssetStatus.PENDING,
                        operations: [`Tokenization failed: ${error.message}`]
                    }
                });
            }
            throw new Error(`Asset created but tokenization failed: ${error.message}`);
        }
    }
    generateTokenSymbol(name, type) {
        const typePrefix = type.substring(0, 2).toUpperCase();
        const nameWords = name.split(' ').map(word => word.charAt(0).toUpperCase()).join('');
        return `${typePrefix}${nameWords}`.substring(0, 5);
    }
    async getAssets(filter, limit = 20, offset = 0) {
        const query = {};
        if (filter?.type)
            query.type = filter.type;
        if (filter?.status)
            query.status = filter.status;
        if (filter?.country)
            query['location.country'] = new RegExp(filter.country, 'i');
        if (filter?.minValue)
            query.totalValue = { $gte: filter.minValue };
        if (filter?.maxValue)
            query.totalValue = { ...query.totalValue, $lte: filter.maxValue };
        return this.assetModel
            .find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(offset)
            .exec();
    }
    async getAssetById(id) {
        const asset = await this.assetModel.findById(id).exec();
        if (!asset) {
            throw new common_1.NotFoundException('Asset not found');
        }
        return asset;
    }
    async getAssetByAssetId(assetId) {
        const asset = await this.assetModel.findOne({ assetId }).exec();
        if (!asset) {
            throw new common_1.NotFoundException('Asset not found');
        }
        return asset;
    }
    async getFeaturedAssets(limit = 10) {
        return this.assetModel
            .find({
            status: asset_schema_1.AssetStatus.ACTIVE,
            verificationScore: { $gte: 80 }
        })
            .sort({ expectedAPY: -1, verificationScore: -1 })
            .limit(limit)
            .exec();
    }
    async getAssetsByOwner(owner) {
        return this.assetModel
            .find({ owner })
            .sort({ createdAt: -1 })
            .exec();
    }
    async getDetailedStats() {
        const [assetStats, typeStats, statusStats] = await Promise.all([
            this.assetModel.aggregate([
                {
                    $group: {
                        _id: null,
                        totalValueLocked: { $sum: '$totalValue' },
                        totalAssets: { $sum: 1 },
                        averageAPY: { $avg: '$expectedAPY' },
                        averageVerificationScore: { $avg: '$verificationScore' },
                        totalTokenized: { $sum: '$tokenizedAmount' }
                    }
                }
            ]),
            this.assetModel.aggregate([
                {
                    $group: {
                        _id: '$type',
                        count: { $sum: 1 },
                        totalValue: { $sum: '$totalValue' },
                        averageAPY: { $avg: '$expectedAPY' }
                    }
                }
            ]),
            this.assetModel.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);
        const stats = assetStats[0] || {};
        return {
            overview: {
                totalValueLocked: stats.totalValueLocked || 0,
                totalAssets: stats.totalAssets || 0,
                averageAPY: stats.averageAPY || 0,
                averageVerificationScore: stats.averageVerificationScore || 0,
                totalTokenized: stats.totalTokenized || 0
            },
            byType: typeStats,
            byStatus: statusStats,
            timestamp: new Date()
        };
    }
};
exports.AssetsService = AssetsService;
exports.AssetsService = AssetsService = AssetsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(asset_schema_1.Asset.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        hedera_service_1.HederaService])
], AssetsService);
//# sourceMappingURL=assets.service.js.map