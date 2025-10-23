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
exports.DividendsController = void 0;
const common_1 = require("@nestjs/common");
const dividends_service_1 = require("./dividends.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const admin_guard_1 = require("../auth/admin.guard");
let DividendsController = class DividendsController {
    constructor(dividendsService) {
        this.dividendsService = dividendsService;
    }
    async createDividendDistribution(createDividendDto, req) {
        const adminAddress = req.user.walletAddress;
        return await this.dividendsService.createDividendDistribution(createDividendDto, adminAddress);
    }
    async executeDividendDistribution(distributionId, req) {
        const adminAddress = req.user.walletAddress;
        return await this.dividendsService.executeDividendDistribution(distributionId, adminAddress);
    }
    async cancelDividendDistribution(distributionId, req) {
        const adminAddress = req.user.walletAddress;
        return await this.dividendsService.cancelDividendDistribution(distributionId, adminAddress);
    }
    async claimDividend(claimDividendDto, req) {
        claimDividendDto.holderAddress = req.user.walletAddress;
        return await this.dividendsService.claimDividend(claimDividendDto);
    }
    async getPoolDividendDistributions(poolId) {
        return await this.dividendsService.getPoolDividendDistributions(poolId);
    }
    async getUserDividendDistributions(req) {
        const holderAddress = req.user.walletAddress;
        return await this.dividendsService.getUserDividendDistributions(holderAddress);
    }
    async getDividendDistribution(distributionId) {
        return await this.dividendsService.getDividendDistribution(distributionId);
    }
    async getDividendStats(poolId) {
        return await this.dividendsService.getDividendStats(poolId);
    }
    async getUpcomingDividendDistributions() {
        return await this.dividendsService.getUpcomingDividendDistributions();
    }
    async getAllDividendDistributions(status) {
        return { message: 'Get all dividend distributions endpoint not fully implemented yet' };
    }
    async getDividendRecipients(distributionId) {
        const distribution = await this.dividendsService.getDividendDistribution(distributionId);
        return {
            distributionId: distribution.distributionId,
            poolName: distribution.poolName,
            totalRecipients: distribution.totalRecipients,
            totalClaimed: distribution.totalClaimed,
            totalUnclaimed: distribution.totalUnclaimed,
            claimCount: distribution.claimCount,
            recipients: distribution.recipients
        };
    }
    async getDividendAnalytics(poolId) {
        return { message: 'Dividend analytics endpoint not implemented yet' };
    }
    async getDividendCalendar(year) {
        return { message: 'Dividend calendar endpoint not implemented yet' };
    }
    async getDividendHistory(holderAddress) {
        return { message: 'Dividend history endpoint not implemented yet' };
    }
    async bulkClaimDividends(claimDto, req) {
        const holderAddress = req.user.walletAddress;
        try {
            const results = [];
            for (const distributionId of claimDto.distributionIds) {
                try {
                    const result = await this.dividendsService.claimDividend({
                        distributionId,
                        holderAddress
                    });
                    results.push({ distributionId, success: true, result });
                }
                catch (error) {
                    results.push({ distributionId, success: false, error: error.message });
                }
            }
            return results;
        }
        catch (error) {
            throw error;
        }
    }
};
exports.DividendsController = DividendsController;
__decorate([
    (0, common_1.Post)('distributions'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DividendsController.prototype, "createDividendDistribution", null);
__decorate([
    (0, common_1.Post)('distributions/:distributionId/execute'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('distributionId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DividendsController.prototype, "executeDividendDistribution", null);
__decorate([
    (0, common_1.Put)('distributions/:distributionId/cancel'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('distributionId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DividendsController.prototype, "cancelDividendDistribution", null);
__decorate([
    (0, common_1.Post)('claim'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DividendsController.prototype, "claimDividend", null);
__decorate([
    (0, common_1.Get)('distributions/pool/:poolId'),
    __param(0, (0, common_1.Param)('poolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DividendsController.prototype, "getPoolDividendDistributions", null);
__decorate([
    (0, common_1.Get)('distributions/user'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DividendsController.prototype, "getUserDividendDistributions", null);
__decorate([
    (0, common_1.Get)('distributions/:distributionId'),
    __param(0, (0, common_1.Param)('distributionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DividendsController.prototype, "getDividendDistribution", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Query)('poolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DividendsController.prototype, "getDividendStats", null);
__decorate([
    (0, common_1.Get)('upcoming'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DividendsController.prototype, "getUpcomingDividendDistributions", null);
__decorate([
    (0, common_1.Get)('distributions'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DividendsController.prototype, "getAllDividendDistributions", null);
__decorate([
    (0, common_1.Get)('distributions/:distributionId/recipients'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('distributionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DividendsController.prototype, "getDividendRecipients", null);
__decorate([
    (0, common_1.Get)('analytics'),
    __param(0, (0, common_1.Query)('poolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DividendsController.prototype, "getDividendAnalytics", null);
__decorate([
    (0, common_1.Get)('calendar'),
    __param(0, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DividendsController.prototype, "getDividendCalendar", null);
__decorate([
    (0, common_1.Get)('history/:holderAddress'),
    __param(0, (0, common_1.Param)('holderAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DividendsController.prototype, "getDividendHistory", null);
__decorate([
    (0, common_1.Post)('bulk-claim'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DividendsController.prototype, "bulkClaimDividends", null);
exports.DividendsController = DividendsController = __decorate([
    (0, common_1.Controller)('dividends'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [dividends_service_1.DividendsService])
], DividendsController);
//# sourceMappingURL=dividends.controller.js.map