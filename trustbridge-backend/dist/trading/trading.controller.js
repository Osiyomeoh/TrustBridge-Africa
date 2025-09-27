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
exports.TradingController = void 0;
const common_1 = require("@nestjs/common");
const trading_service_1 = require("./trading.service");
let TradingController = class TradingController {
    constructor(tradingService) {
        this.tradingService = tradingService;
    }
    async listDigitalAssetForSale(listingDto) {
        return this.tradingService.listDigitalAssetForSale(listingDto);
    }
    async makeOfferOnDigitalAsset(offerDto) {
        return this.tradingService.makeOfferOnDigitalAsset(offerDto);
    }
    async getDigitalAssetOffers(assetId) {
        return this.tradingService.getDigitalAssetOffers(assetId);
    }
    async acceptOfferOnDigitalAsset(acceptDto) {
        return this.tradingService.acceptOfferOnDigitalAsset(acceptDto);
    }
    async getTradingStats() {
        return this.tradingService.getTradingStats();
    }
    async getAssetTradingHistory(assetId) {
        return this.tradingService.getAssetTradingHistory(assetId);
    }
};
exports.TradingController = TradingController;
__decorate([
    (0, common_1.Post)('digital/list'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TradingController.prototype, "listDigitalAssetForSale", null);
__decorate([
    (0, common_1.Post)('digital/offer'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TradingController.prototype, "makeOfferOnDigitalAsset", null);
__decorate([
    (0, common_1.Get)('digital/offers/:assetId'),
    __param(0, (0, common_1.Param)('assetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TradingController.prototype, "getDigitalAssetOffers", null);
__decorate([
    (0, common_1.Post)('digital/accept-offer'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TradingController.prototype, "acceptOfferOnDigitalAsset", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TradingController.prototype, "getTradingStats", null);
__decorate([
    (0, common_1.Get)('history/:assetId'),
    __param(0, (0, common_1.Param)('assetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TradingController.prototype, "getAssetTradingHistory", null);
exports.TradingController = TradingController = __decorate([
    (0, common_1.Controller)('trading'),
    __metadata("design:paramtypes", [trading_service_1.TradingService])
], TradingController);
//# sourceMappingURL=trading.controller.js.map