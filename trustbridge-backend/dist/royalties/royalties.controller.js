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
exports.RoyaltiesController = void 0;
const common_1 = require("@nestjs/common");
const royalties_service_1 = require("./royalties.service");
let RoyaltiesController = class RoyaltiesController {
    constructor(royaltiesService) {
        this.royaltiesService = royaltiesService;
    }
    async recordPayment(body) {
        try {
            const payment = await this.royaltiesService.recordRoyaltyPayment({
                transactionId: body.transactionId,
                nftContract: body.nftContract,
                tokenId: body.tokenId,
                salePrice: body.salePrice,
                royaltyAmount: body.royaltyAmount,
                royaltyPercentage: body.royaltyPercentage,
                creator: body.creator,
                seller: body.seller,
                buyer: body.buyer,
            });
            return {
                success: true,
                data: payment,
                message: 'Royalty payment recorded',
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to record royalty payment',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCreatorPayments(address, limit, skip, startDate, endDate) {
        try {
            const options = {};
            if (limit)
                options.limit = parseInt(limit);
            if (skip)
                options.skip = parseInt(skip);
            if (startDate)
                options.startDate = new Date(startDate);
            if (endDate)
                options.endDate = new Date(endDate);
            const result = await this.royaltiesService.getCreatorRoyaltyPayments(address, options);
            return {
                success: true,
                data: result.payments,
                total: result.total,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to fetch royalty payments',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCreatorStats(address) {
        try {
            const stats = await this.royaltiesService.getCreatorStats(address);
            return {
                success: true,
                data: stats,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to fetch creator stats',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getMonthlyEarnings(address, months) {
        try {
            const monthCount = months ? parseInt(months) : 12;
            const earnings = await this.royaltiesService.getMonthlyEarnings(address, monthCount);
            return {
                success: true,
                data: earnings,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to fetch monthly earnings',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getNFTRoyaltyHistory(contract, tokenId) {
        try {
            const history = await this.royaltiesService.getNFTRoyaltyHistory(contract, tokenId);
            return {
                success: true,
                data: history,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to fetch NFT royalty history',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getTopCreators(limit) {
        try {
            const limitNum = limit ? parseInt(limit) : 10;
            const creators = await this.royaltiesService.getTopCreators(limitNum);
            return {
                success: true,
                data: creators,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: 'Failed to fetch top creators',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.RoyaltiesController = RoyaltiesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoyaltiesController.prototype, "recordPayment", null);
__decorate([
    (0, common_1.Get)('creator/:address'),
    __param(0, (0, common_1.Param)('address')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('skip')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], RoyaltiesController.prototype, "getCreatorPayments", null);
__decorate([
    (0, common_1.Get)('creator/:address/stats'),
    __param(0, (0, common_1.Param)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoyaltiesController.prototype, "getCreatorStats", null);
__decorate([
    (0, common_1.Get)('creator/:address/monthly'),
    __param(0, (0, common_1.Param)('address')),
    __param(1, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RoyaltiesController.prototype, "getMonthlyEarnings", null);
__decorate([
    (0, common_1.Get)('nft/:contract/:tokenId'),
    __param(0, (0, common_1.Param)('contract')),
    __param(1, (0, common_1.Param)('tokenId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RoyaltiesController.prototype, "getNFTRoyaltyHistory", null);
__decorate([
    (0, common_1.Get)('top'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoyaltiesController.prototype, "getTopCreators", null);
exports.RoyaltiesController = RoyaltiesController = __decorate([
    (0, common_1.Controller)('royalties'),
    __metadata("design:paramtypes", [royalties_service_1.RoyaltiesService])
], RoyaltiesController);
//# sourceMappingURL=royalties.controller.js.map