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
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let TradingController = class TradingController {
    constructor(tradingService) {
        this.tradingService = tradingService;
    }
    async createOrder(createOrderDto, req) {
        const traderAddress = req.user.walletAddress;
        return await this.tradingService.createOrder(createOrderDto, traderAddress);
    }
    async cancelOrder(orderId, req) {
        const traderAddress = req.user.walletAddress;
        return await this.tradingService.cancelOrder(orderId, traderAddress);
    }
    async getOrderBook(poolId, depth) {
        return await this.tradingService.getOrderBook(poolId, depth || 20);
    }
    async getUserOrders(req, poolId) {
        const traderAddress = req.user.walletAddress;
        return await this.tradingService.getUserOrders(traderAddress, poolId);
    }
    async getUserTradeHistory(req, poolId) {
        const traderAddress = req.user.walletAddress;
        return await this.tradingService.getUserTradeHistory(traderAddress, poolId);
    }
    async getRecentTrades(poolId, limit) {
        return await this.tradingService.getRecentTrades(poolId, limit || 50);
    }
    async getPoolTradingStats(poolId) {
        return await this.tradingService.getPoolTradingStats(poolId);
    }
    async getMarketData() {
        return { message: 'Market data endpoint not implemented yet' };
    }
    async getTradingPairs() {
        return { message: 'Trading pairs endpoint not implemented yet' };
    }
    async getPriceHistory(poolId, timeframe, limit) {
        return { message: 'Price history endpoint not implemented yet' };
    }
    async getTradingFees() {
        return {
            makerFee: 0.001,
            takerFee: 0.001,
            withdrawalFee: 0.0001,
            depositFee: 0
        };
    }
    async getTradingLimits() {
        return {
            minOrderSize: 1,
            maxOrderSize: 1000000,
            minPrice: 0.01,
            maxPrice: 1000000,
            dailyVolumeLimit: 1000000
        };
    }
};
exports.TradingController = TradingController;
__decorate([
    (0, common_1.Post)('orders'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TradingController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Put)('orders/:orderId/cancel'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TradingController.prototype, "cancelOrder", null);
__decorate([
    (0, common_1.Get)('orderbook/:poolId'),
    __param(0, (0, common_1.Param)('poolId')),
    __param(1, (0, common_1.Query)('depth')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], TradingController.prototype, "getOrderBook", null);
__decorate([
    (0, common_1.Get)('orders'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('poolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TradingController.prototype, "getUserOrders", null);
__decorate([
    (0, common_1.Get)('trades/history'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('poolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TradingController.prototype, "getUserTradeHistory", null);
__decorate([
    (0, common_1.Get)('trades/recent/:poolId'),
    __param(0, (0, common_1.Param)('poolId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], TradingController.prototype, "getRecentTrades", null);
__decorate([
    (0, common_1.Get)('stats/:poolId'),
    __param(0, (0, common_1.Param)('poolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TradingController.prototype, "getPoolTradingStats", null);
__decorate([
    (0, common_1.Get)('markets'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TradingController.prototype, "getMarketData", null);
__decorate([
    (0, common_1.Get)('pairs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TradingController.prototype, "getTradingPairs", null);
__decorate([
    (0, common_1.Get)('price-history/:poolId'),
    __param(0, (0, common_1.Param)('poolId')),
    __param(1, (0, common_1.Query)('timeframe')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], TradingController.prototype, "getPriceHistory", null);
__decorate([
    (0, common_1.Get)('fees'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TradingController.prototype, "getTradingFees", null);
__decorate([
    (0, common_1.Get)('limits'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TradingController.prototype, "getTradingLimits", null);
exports.TradingController = TradingController = __decorate([
    (0, common_1.Controller)('trading'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [trading_service_1.TradingService])
], TradingController);
//# sourceMappingURL=trading.controller.js.map