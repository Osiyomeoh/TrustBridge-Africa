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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const assets_service_1 = require("./assets.service");
const create_asset_dto_1 = require("./dto/create-asset.dto");
let AssetsController = class AssetsController {
    constructor(assetsService) {
        this.assetsService = assetsService;
    }
    async getAssets(type, status, country, minValue, maxValue, limit, offset) {
        const assets = await this.assetsService.getAssets({
            type,
            status,
            country,
            minValue,
            maxValue,
        }, limit || 20, offset || 0);
        return {
            success: true,
            data: assets,
        };
    }
    async getAssetById(id) {
        const asset = await this.assetsService.getAssetById(id);
        return {
            success: true,
            data: asset,
        };
    }
    async createAsset(createAssetDto) {
        const asset = await this.assetsService.createAsset(createAssetDto);
        return {
            success: true,
            data: asset,
        };
    }
    async createAssetWithTokenization(createAssetDto) {
        try {
            const result = await this.assetsService.createAssetWithTokenization(createAssetDto);
            return {
                success: true,
                data: result.asset,
                tokenId: result.tokenId,
                transactionId: result.transactionId,
                message: 'Asset created and tokenized successfully on Hedera network'
            };
        }
        catch (error) {
            return {
                success: false,
                data: null,
                message: error.message
            };
        }
    }
    async getFeaturedAssets(limit) {
        const assets = await this.assetsService.getFeaturedAssets(limit || 10);
        return {
            success: true,
            data: assets,
        };
    }
    async getAssetsByOwner(owner) {
        const assets = await this.assetsService.getAssetsByOwner(owner);
        return {
            success: true,
            data: assets,
        };
    }
};
exports.AssetsController = AssetsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all assets with filtering' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of assets' }),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('country')),
    __param(3, (0, common_1.Query)('minValue')),
    __param(4, (0, common_1.Query)('maxValue')),
    __param(5, (0, common_1.Query)('limit')),
    __param(6, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "getAssets", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get asset by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asset details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Asset not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "getAssetById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new asset' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Asset created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_asset_dto_1.CreateAssetDto]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "createAsset", null);
__decorate([
    (0, common_1.Post)('create-with-tokenization'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new asset with Hedera tokenization' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Asset created and tokenized successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Tokenization failed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_asset_dto_1.CreateAssetDto]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "createAssetWithTokenization", null);
__decorate([
    (0, common_1.Get)('featured'),
    (0, swagger_1.ApiOperation)({ summary: 'Get featured assets' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of featured assets' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "getFeaturedAssets", null);
__decorate([
    (0, common_1.Get)('owner/:owner'),
    (0, swagger_1.ApiOperation)({ summary: 'Get assets by owner' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of assets owned by user' }),
    __param(0, (0, common_1.Param)('owner')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "getAssetsByOwner", null);
exports.AssetsController = AssetsController = __decorate([
    (0, swagger_1.ApiTags)('Assets'),
    (0, common_1.Controller)('api/assets'),
    __metadata("design:paramtypes", [assets_service_1.AssetsService])
], AssetsController);
//# sourceMappingURL=assets.controller.js.map