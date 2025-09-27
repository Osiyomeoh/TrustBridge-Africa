"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
let AnalyticsService = class AnalyticsService {
    async getOverview() {
        return {
            success: true,
            data: {
                totalAssets: 15,
                totalValue: 7500000,
                totalUsers: 25,
                totalAttestors: 15,
                totalPools: 3,
                totalVolume: 2500000,
                activeVerifications: 8,
                completedVerifications: 12,
                averageAssetValue: 500000,
                topCountries: ['Nigeria', 'Kenya', 'Ghana'],
                assetCategories: {
                    agricultural: 12,
                    realEstate: 2,
                    vehicles: 1
                },
                monthlyGrowth: 15.5,
                successRate: 92.3
            },
            message: 'Analytics overview retrieved successfully'
        };
    }
    async getStats() {
        return {
            success: true,
            data: {
                system: {
                    uptime: '99.9%',
                    responseTime: '120ms',
                    totalRequests: 15420,
                    errorRate: '0.1%'
                },
                blockchain: {
                    totalTransactions: 1250,
                    gasUsed: '2.5M',
                    averageBlockTime: '2.1s',
                    networkStatus: 'healthy'
                },
                database: {
                    totalRecords: 2847,
                    storageUsed: '1.2GB',
                    queryPerformance: 'excellent',
                    connectionPool: 'healthy'
                },
                mobile: {
                    activeUsers: 156,
                    appVersion: '1.2.0',
                    crashRate: '0.05%',
                    averageSessionTime: '8.5min'
                }
            },
            message: 'System statistics retrieved successfully'
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)()
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map