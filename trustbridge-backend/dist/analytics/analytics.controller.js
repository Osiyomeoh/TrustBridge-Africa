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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const analytics_service_1 = require("./analytics.service");
let AnalyticsController = class AnalyticsController {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async getMarketAnalytics() {
        try {
            const data = await this.analyticsService.getMarketAnalytics();
            return {
                success: true,
                data,
                message: 'Market analytics retrieved successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to get market analytics'
            };
        }
    }
    async getRealTimeMetrics() {
        try {
            const data = await this.analyticsService.getRealTimeMetrics();
            return {
                success: true,
                data,
                message: 'Real-time metrics retrieved successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to get real-time metrics'
            };
        }
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('market'),
    (0, swagger_1.ApiOperation)({ summary: 'Get market analytics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Market analytics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getMarketAnalytics", null);
__decorate([
    (0, common_1.Get)('real-time'),
    (0, swagger_1.ApiOperation)({ summary: 'Get real-time metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Real-time metrics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getRealTimeMetrics", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, swagger_1.ApiTags)('Analytics'),
    (0, common_1.Controller)('api/analytics'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map