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
exports.ActivityController = void 0;
const common_1 = require("@nestjs/common");
const activity_service_1 = require("./activity.service");
let ActivityController = class ActivityController {
    constructor(activityService) {
        this.activityService = activityService;
    }
    async getNFTActivity(tokenId, serialNumber, limit) {
        try {
            const limitNum = limit ? parseInt(limit) : 50;
            const activities = await this.activityService.getNFTActivity(tokenId, serialNumber, limitNum);
            return {
                success: true,
                data: activities,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to fetch NFT activity',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getUserActivity(accountId, limit) {
        try {
            const limitNum = limit ? parseInt(limit) : 100;
            const activities = await this.activityService.getUserActivity(accountId, limitNum);
            return {
                success: true,
                data: activities,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to fetch user activity',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getMarketplaceActivity(accountId, limit) {
        try {
            const limitNum = limit ? parseInt(limit) : 50;
            const activities = await this.activityService.getMarketplaceActivity(accountId, limitNum);
            return {
                success: true,
                data: activities,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to fetch marketplace activity',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCollectionActivity(tokenId, limit) {
        try {
            const limitNum = limit ? parseInt(limit) : 50;
            const activities = await this.activityService.getCollectionActivity(tokenId, limitNum);
            return {
                success: true,
                data: activities,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to fetch collection activity',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getNFTPriceHistory(tokenId, serialNumber) {
        try {
            const priceHistory = await this.activityService.getNFTPriceHistory(tokenId, serialNumber);
            return {
                success: true,
                data: priceHistory,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to fetch price history',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ActivityController = ActivityController;
__decorate([
    (0, common_1.Get)('nft/:tokenId/:serialNumber'),
    __param(0, (0, common_1.Param)('tokenId')),
    __param(1, (0, common_1.Param)('serialNumber')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "getNFTActivity", null);
__decorate([
    (0, common_1.Get)('user/:accountId'),
    __param(0, (0, common_1.Param)('accountId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "getUserActivity", null);
__decorate([
    (0, common_1.Get)('marketplace/:accountId'),
    __param(0, (0, common_1.Param)('accountId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "getMarketplaceActivity", null);
__decorate([
    (0, common_1.Get)('collection/:tokenId'),
    __param(0, (0, common_1.Param)('tokenId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "getCollectionActivity", null);
__decorate([
    (0, common_1.Get)('nft/:tokenId/:serialNumber/price-history'),
    __param(0, (0, common_1.Param)('tokenId')),
    __param(1, (0, common_1.Param)('serialNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "getNFTPriceHistory", null);
exports.ActivityController = ActivityController = __decorate([
    (0, common_1.Controller)('activity'),
    __metadata("design:paramtypes", [activity_service_1.ActivityService])
], ActivityController);
//# sourceMappingURL=activity.controller.js.map