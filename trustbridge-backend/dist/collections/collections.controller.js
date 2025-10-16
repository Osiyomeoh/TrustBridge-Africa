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
exports.CollectionsController = void 0;
const common_1 = require("@nestjs/common");
const collections_service_1 = require("./collections.service");
let CollectionsController = class CollectionsController {
    constructor(collectionsService) {
        this.collectionsService = collectionsService;
    }
    async createCollection(body, req) {
        try {
            const collection = await this.collectionsService.createCollection({
                name: body.name,
                description: body.description,
                symbol: body.symbol,
                creator: body.creator || req.user?.accountId,
                bannerImage: body.bannerImage,
                profileImage: body.profileImage,
                category: body.category,
                royaltyPercentage: body.royaltyPercentage,
                socialLinks: body.socialLinks,
            });
            return {
                success: true,
                data: collection,
                message: 'Collection created successfully',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to create collection',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCollection(id) {
        try {
            const collection = await this.collectionsService.getCollection(id);
            if (!collection) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Collection not found',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            return {
                success: true,
                data: collection,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to fetch collection',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCollections(creator, verified, category, sortBy, sortOrder, limit, skip) {
        try {
            const filters = {};
            if (creator)
                filters.creator = creator;
            if (verified !== undefined)
                filters.verified = verified === 'true';
            if (category)
                filters.category = category;
            if (sortBy)
                filters.sortBy = sortBy;
            if (sortOrder)
                filters.sortOrder = sortOrder;
            if (limit)
                filters.limit = parseInt(limit);
            if (skip)
                filters.skip = parseInt(skip);
            const result = await this.collectionsService.getCollections(filters);
            return {
                success: true,
                data: result.collections,
                total: result.total,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to fetch collections',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async addNFTToCollection(collectionId, body) {
        try {
            const collection = await this.collectionsService.addNFTToCollection(collectionId, body.tokenId);
            if (!collection) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Collection not found',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            return {
                success: true,
                data: collection,
                message: 'NFT added to collection',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to add NFT to collection',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateCollectionStats(collectionId, stats) {
        try {
            const collection = await this.collectionsService.updateCollectionStats(collectionId, stats);
            if (!collection) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Collection not found',
                }, common_1.HttpStatus.NOT_FOUND);
            }
            return {
                success: true,
                data: collection,
                message: 'Collection stats updated',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to update collection stats',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async searchCollections(query, limit) {
        try {
            const collections = await this.collectionsService.searchCollections(query, limit ? parseInt(limit) : 20);
            return {
                success: true,
                data: collections,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to search collections',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getTrendingCollections(limit) {
        try {
            const collections = await this.collectionsService.getTrendingCollections(limit ? parseInt(limit) : 10);
            return {
                success: true,
                data: collections,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to fetch trending collections',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCollectionsByCreator(address) {
        try {
            const collections = await this.collectionsService.getCollectionsByCreator(address);
            return {
                success: true,
                data: collections,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to fetch collections by creator',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.CollectionsController = CollectionsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "createCollection", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "getCollection", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('creator')),
    __param(1, (0, common_1.Query)('verified')),
    __param(2, (0, common_1.Query)('category')),
    __param(3, (0, common_1.Query)('sortBy')),
    __param(4, (0, common_1.Query)('sortOrder')),
    __param(5, (0, common_1.Query)('limit')),
    __param(6, (0, common_1.Query)('skip')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "getCollections", null);
__decorate([
    (0, common_1.Post)(':id/nfts'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "addNFTToCollection", null);
__decorate([
    (0, common_1.Put)(':id/stats'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "updateCollectionStats", null);
__decorate([
    (0, common_1.Get)('search/query'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "searchCollections", null);
__decorate([
    (0, common_1.Get)('trending/list'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "getTrendingCollections", null);
__decorate([
    (0, common_1.Get)('creator/:address'),
    __param(0, (0, common_1.Param)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "getCollectionsByCreator", null);
exports.CollectionsController = CollectionsController = __decorate([
    (0, common_1.Controller)('collections'),
    __metadata("design:paramtypes", [collections_service_1.CollectionsService])
], CollectionsController);
//# sourceMappingURL=collections.controller.js.map