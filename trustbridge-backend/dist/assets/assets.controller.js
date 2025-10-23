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
    async getAssets() {
        return {
            success: true,
            message: 'Assets are fetched from Hedera network'
        };
    }
    async getAssetsByOwner(owner) {
        if (!owner || owner.trim() === '') {
            throw new common_1.BadRequestException('Owner parameter is required');
        }
        return {
            success: true,
            message: `Assets for owner ${owner} are fetched from Hedera network`
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
            const result = await this.assetsService.createAsset(createAssetDto);
            return {
                success: true,
                data: result,
                tokenId: undefined,
                transactionId: `legacy_${Date.now()}`,
                message: 'Asset created successfully (legacy method - use /digital or /rwa endpoints)'
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
    async createDigitalAsset(createDigitalAssetDto) {
        try {
            const result = await this.assetsService.createDigitalAsset(createDigitalAssetDto);
            return {
                success: true,
                data: result.asset,
                assetId: result.assetId,
                transactionId: result.transactionId,
                message: 'Digital asset created successfully on blockchain'
            };
        }
        catch (error) {
            return {
                success: false,
                data: null,
                assetId: '',
                transactionId: '',
                message: error.message
            };
        }
    }
    async createRWAAsset(createRWAAssetDto) {
        try {
            const result = await this.assetsService.createRWAAsset(createRWAAssetDto);
            return {
                success: true,
                data: result.asset,
                assetId: result.assetId,
                transactionId: result.transactionId,
                message: 'RWA asset created successfully on blockchain'
            };
        }
        catch (error) {
            return {
                success: false,
                data: null,
                assetId: '',
                transactionId: '',
                message: error.message
            };
        }
    }
    async verifyAsset(assetId, body) {
        try {
            const result = await this.assetsService.verifyAsset(assetId, body.verificationLevel);
            return {
                success: true,
                transactionId: result.transactionId,
                message: `Asset verified to level ${body.verificationLevel}`
            };
        }
        catch (error) {
            return {
                success: false,
                transactionId: '',
                message: error.message
            };
        }
    }
    async getNFTBlockchainState(tokenId, serialNumber) {
        try {
            const state = await this.assetsService.getNFTBlockchainState(tokenId, serialNumber);
            return {
                success: true,
                data: state
            };
        }
        catch (error) {
            return {
                success: false,
                data: {
                    owner: '',
                    isListed: false,
                    isInEscrow: false,
                    marketplaceAccount: ''
                }
            };
        }
    }
};
exports.AssetsController = AssetsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all assets from blockchain' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of assets from Hedera network' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "getAssets", null);
__decorate([
    (0, common_1.Get)('owner/:owner'),
    (0, swagger_1.ApiOperation)({ summary: 'Get assets by owner from blockchain' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of assets owned by user from Hedera network' }),
    __param(0, (0, common_1.Param)('owner')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "getAssetsByOwner", null);
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
    (0, swagger_1.ApiOperation)({ summary: 'Create new asset with Hedera tokenization (DEPRECATED)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Asset created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Creation failed' }),
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
    (0, common_1.Post)('digital'),
    (0, swagger_1.ApiOperation)({ summary: 'Create digital asset' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Digital asset created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "createDigitalAsset", null);
__decorate([
    (0, common_1.Post)('rwa'),
    (0, swagger_1.ApiOperation)({ summary: 'Create RWA asset' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'RWA asset created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "createRWAAsset", null);
__decorate([
    (0, common_1.Post)('verify/:assetId'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify asset' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asset verified successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Verification failed' }),
    __param(0, (0, common_1.Param)('assetId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "verifyAsset", null);
__decorate([
    (0, common_1.Get)('blockchain-state/:tokenId/:serialNumber'),
    (0, swagger_1.ApiOperation)({ summary: 'Get NFT blockchain state (ownership, listing status, seller)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'NFT blockchain state retrieved' }),
    __param(0, (0, common_1.Param)('tokenId')),
    __param(1, (0, common_1.Param)('serialNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "getNFTBlockchainState", null);
exports.AssetsController = AssetsController = __decorate([
    (0, swagger_1.ApiTags)('Assets'),
    (0, common_1.Controller)('assets'),
    __metadata("design:paramtypes", [assets_service_1.AssetsService])
], AssetsController);
//# sourceMappingURL=assets.controller.js.map