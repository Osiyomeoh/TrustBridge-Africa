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
const asset_v2_schema_1 = require("../schemas/asset-v2.schema");
const api_service_1 = require("../api/api.service");
let AssetsService = AssetsService_1 = class AssetsService {
    constructor(assetModel, assetV2Model, apiService) {
        this.assetModel = assetModel;
        this.assetV2Model = assetV2Model;
        this.apiService = apiService;
        this.logger = new common_1.Logger(AssetsService_1.name);
    }
    async createDigitalAsset(createDigitalAssetDto) {
        try {
            const apiResult = await this.apiService.createDigitalAsset({
                category: createDigitalAssetDto.category,
                assetType: createDigitalAssetDto.assetType,
                name: createDigitalAssetDto.name,
                location: createDigitalAssetDto.location,
                totalValue: createDigitalAssetDto.totalValue,
                imageURI: createDigitalAssetDto.imageURI,
                description: createDigitalAssetDto.description,
                owner: createDigitalAssetDto.owner,
                assetId: createDigitalAssetDto.assetId,
                transactionId: createDigitalAssetDto.transactionId,
            });
            const asset = new this.assetV2Model({
                assetId: apiResult.assetId,
                type: asset_v2_schema_1.AssetTypeV2.DIGITAL,
                category: this.getCategoryName(createDigitalAssetDto.category),
                assetType: createDigitalAssetDto.assetType,
                name: createDigitalAssetDto.name,
                location: createDigitalAssetDto.location,
                totalValue: parseFloat(createDigitalAssetDto.totalValue),
                owner: createDigitalAssetDto.owner,
                status: asset_v2_schema_1.AssetStatusV2.DIGITAL_ACTIVE,
                tokenizedAmount: parseFloat(createDigitalAssetDto.totalValue),
                verificationScore: 100,
                verificationLevel: asset_v2_schema_1.VerificationLevel.MASTER,
                imageURI: createDigitalAssetDto.imageURI,
                description: createDigitalAssetDto.description,
                isTradeable: true,
                operations: [`Digital asset created: ${apiResult.transactionId}`],
                createdAt: new Date(),
                verifiedAt: new Date(),
            });
            const savedAsset = await asset.save();
            this.logger.log(`Created digital asset: ${savedAsset.assetId}`);
            return {
                asset: savedAsset,
                assetId: apiResult.assetId,
                transactionId: apiResult.transactionId
            };
        }
        catch (error) {
            this.logger.error(`Failed to create digital asset: ${error.message}`);
            throw new Error(`Digital asset creation failed: ${error.message}`);
        }
    }
    async createRWAAsset(createRWAAssetDto) {
        try {
            const apiResult = await this.apiService.createRWAAsset({
                category: createRWAAssetDto.category,
                assetType: createRWAAssetDto.assetType,
                name: createRWAAssetDto.name,
                location: createRWAAssetDto.location,
                totalValue: createRWAAssetDto.totalValue,
                maturityDate: createRWAAssetDto.maturityDate,
                evidenceHashes: createRWAAssetDto.evidenceHashes,
                documentTypes: createRWAAssetDto.documentTypes,
                imageURI: createRWAAssetDto.imageURI,
                documentURI: createRWAAssetDto.documentURI,
                description: createRWAAssetDto.description,
                owner: createRWAAssetDto.owner,
                assetId: createRWAAssetDto.assetId,
                transactionId: createRWAAssetDto.transactionId,
            });
            const asset = new this.assetV2Model({
                assetId: apiResult.assetId,
                type: asset_v2_schema_1.AssetTypeV2.RWA,
                category: this.getCategoryName(createRWAAssetDto.category),
                assetType: createRWAAssetDto.assetType,
                name: createRWAAssetDto.name,
                location: createRWAAssetDto.location,
                totalValue: parseFloat(createRWAAssetDto.totalValue),
                owner: createRWAAssetDto.owner,
                status: asset_v2_schema_1.AssetStatusV2.PENDING,
                tokenizedAmount: 0,
                verificationScore: 0,
                verificationLevel: asset_v2_schema_1.VerificationLevel.BASIC,
                maturityDate: new Date(createRWAAssetDto.maturityDate * 1000),
                evidenceHashes: createRWAAssetDto.evidenceHashes,
                documentTypes: createRWAAssetDto.documentTypes,
                imageURI: createRWAAssetDto.imageURI,
                documentURI: createRWAAssetDto.documentURI,
                description: createRWAAssetDto.description,
                isTradeable: false,
                operations: [`RWA asset created: ${apiResult.transactionId}`],
                createdAt: new Date(),
            });
            const savedAsset = await asset.save();
            this.logger.log(`Created RWA asset: ${savedAsset.assetId}`);
            return {
                asset: savedAsset,
                assetId: apiResult.assetId,
                transactionId: apiResult.transactionId
            };
        }
        catch (error) {
            this.logger.error(`Failed to create RWA asset: ${error.message}`);
            throw new Error(`RWA asset creation failed: ${error.message}`);
        }
    }
    async verifyAsset(assetId, verificationLevel) {
        try {
            const apiResult = await this.apiService.verifyAsset(assetId, verificationLevel);
            const verificationLevels = [asset_v2_schema_1.VerificationLevel.BASIC, asset_v2_schema_1.VerificationLevel.PROFESSIONAL, asset_v2_schema_1.VerificationLevel.EXPERT, asset_v2_schema_1.VerificationLevel.MASTER];
            const updatedAsset = await this.assetV2Model.findOneAndUpdate({ assetId }, {
                $set: {
                    status: verificationLevel >= 1 ? asset_v2_schema_1.AssetStatusV2.VERIFIED : asset_v2_schema_1.AssetStatusV2.PENDING,
                    verificationScore: verificationLevel * 25,
                    verificationLevel: verificationLevels[verificationLevel],
                    verifiedAt: new Date(),
                    operations: [...(await this.getAssetOperations(assetId)), `Asset verified to ${verificationLevels[verificationLevel]} level: ${apiResult.transactionId}`]
                }
            }, { new: true });
            if (!updatedAsset) {
                throw new common_1.NotFoundException('Asset not found');
            }
            this.logger.log(`Verified asset ${assetId} to level ${verificationLevel}`);
            return { transactionId: apiResult.transactionId };
        }
        catch (error) {
            this.logger.error(`Failed to verify asset: ${error.message}`);
            throw new Error(`Asset verification failed: ${error.message}`);
        }
    }
    getCategoryName(category) {
        const categories = {
            0: 'REAL_ESTATE',
            1: 'COMMODITY',
            2: 'AGRICULTURE',
            3: 'MINING',
            4: 'ENERGY',
            5: 'INFRASTRUCTURE',
            6: 'DIGITAL_ART',
            7: 'NFT',
            8: 'DIGITAL_COLLECTIBLE'
        };
        return categories[category] || 'UNKNOWN';
    }
    async getAssetOperations(assetId) {
        const asset = await this.assetModel.findOne({ assetId });
        return asset?.operations || [];
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
    __param(1, (0, mongoose_1.InjectModel)(asset_v2_schema_1.AssetV2.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        api_service_1.ApiService])
], AssetsService);
//# sourceMappingURL=assets.service.js.map