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
exports.AMCPoolsController = void 0;
const common_1 = require("@nestjs/common");
const amc_pools_service_1 = require("./amc-pools.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const admin_guard_1 = require("../auth/admin.guard");
let AMCPoolsController = class AMCPoolsController {
    constructor(amcPoolsService) {
        this.amcPoolsService = amcPoolsService;
    }
    async createPool(createPoolDto, req) {
        const adminWallet = req.user.walletAddress;
        return await this.amcPoolsService.createPool(createPoolDto, adminWallet);
    }
    async launchPool(poolId, req) {
        const adminWallet = req.user.walletAddress;
        return await this.amcPoolsService.launchPool(poolId, adminWallet);
    }
    async getAllPools(status, type) {
        if (status && type) {
            return await this.amcPoolsService.getAllPools().then(pools => pools.filter(pool => pool.status === status && pool.type === type));
        }
        else if (status) {
            return await this.amcPoolsService.getAllPools().then(pools => pools.filter(pool => pool.status === status));
        }
        else if (type) {
            return await this.amcPoolsService.getAllPools().then(pools => pools.filter(pool => pool.type === type));
        }
        return await this.amcPoolsService.getAllPools();
    }
    async getActivePools() {
        return await this.amcPoolsService.getActivePools();
    }
    async getPoolById(poolId) {
        return await this.amcPoolsService.getPoolById(poolId);
    }
    async getPoolsByAdmin(adminWallet) {
        return await this.amcPoolsService.getPoolsByAdmin(adminWallet);
    }
    async investInPool(poolId, investDto, req) {
        investDto.poolId = poolId;
        investDto.investorAddress = req.user.walletAddress;
        return await this.amcPoolsService.investInPool(investDto);
    }
    async distributeDividend(poolId, dividendDto, req) {
        dividendDto.poolId = poolId;
        const adminWallet = req.user.walletAddress;
        return await this.amcPoolsService.distributeDividend(dividendDto, adminWallet);
    }
    async closePool(poolId, req) {
        const adminWallet = req.user.walletAddress;
        return await this.amcPoolsService.closePool(poolId, adminWallet);
    }
    async getPoolStats(poolId) {
        return await this.amcPoolsService.getPoolStats(poolId);
    }
    async getInvestorInvestments(poolId, investorAddress) {
        const pool = await this.amcPoolsService.getPoolById(poolId);
        const investments = pool.investments.filter(inv => inv.investorAddress === investorAddress);
        return {
            poolId: pool.poolId,
            poolName: pool.name,
            investorAddress,
            investments,
            totalInvested: investments.reduce((sum, inv) => sum + inv.amount, 0),
            totalTokens: investments.reduce((sum, inv) => sum + inv.tokens, 0),
            totalDividends: investments.reduce((sum, inv) => sum + inv.dividendsReceived, 0)
        };
    }
    async getPoolInvestments(poolId) {
        const pool = await this.amcPoolsService.getPoolById(poolId);
        return {
            poolId: pool.poolId,
            poolName: pool.name,
            totalInvestments: pool.totalInvested,
            totalInvested: pool.totalInvested,
            totalInvestors: pool.totalInvestors,
            investments: pool.investments
        };
    }
    async updatePoolMetadata(poolId, metadata, req) {
        return { message: 'Metadata update not implemented yet' };
    }
    async getPoolTradingData(poolId) {
        const pool = await this.amcPoolsService.getPoolById(poolId);
        return {
            poolId: pool.poolId,
            isTradeable: pool.isTradeable,
            currentPrice: pool.currentPrice,
            priceChange24h: pool.priceChange24h,
            tradingVolume: pool.tradingVolume,
            hederaTokenId: pool.hederaTokenId
        };
    }
};
exports.AMCPoolsController = AMCPoolsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AMCPoolsController.prototype, "createPool", null);
__decorate([
    (0, common_1.Post)(':poolId/launch'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('poolId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AMCPoolsController.prototype, "launchPool", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AMCPoolsController.prototype, "getAllPools", null);
__decorate([
    (0, common_1.Get)('active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AMCPoolsController.prototype, "getActivePools", null);
__decorate([
    (0, common_1.Get)(':poolId'),
    __param(0, (0, common_1.Param)('poolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AMCPoolsController.prototype, "getPoolById", null);
__decorate([
    (0, common_1.Get)('admin/:adminWallet'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('adminWallet')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AMCPoolsController.prototype, "getPoolsByAdmin", null);
__decorate([
    (0, common_1.Post)(':poolId/invest'),
    __param(0, (0, common_1.Param)('poolId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AMCPoolsController.prototype, "investInPool", null);
__decorate([
    (0, common_1.Post)(':poolId/dividends'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('poolId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AMCPoolsController.prototype, "distributeDividend", null);
__decorate([
    (0, common_1.Put)(':poolId/close'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('poolId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AMCPoolsController.prototype, "closePool", null);
__decorate([
    (0, common_1.Get)(':poolId/stats'),
    __param(0, (0, common_1.Param)('poolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AMCPoolsController.prototype, "getPoolStats", null);
__decorate([
    (0, common_1.Get)(':poolId/investments/:investorAddress'),
    __param(0, (0, common_1.Param)('poolId')),
    __param(1, (0, common_1.Param)('investorAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AMCPoolsController.prototype, "getInvestorInvestments", null);
__decorate([
    (0, common_1.Get)(':poolId/investments'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('poolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AMCPoolsController.prototype, "getPoolInvestments", null);
__decorate([
    (0, common_1.Put)(':poolId/metadata'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('poolId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AMCPoolsController.prototype, "updatePoolMetadata", null);
__decorate([
    (0, common_1.Get)(':poolId/trading'),
    __param(0, (0, common_1.Param)('poolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AMCPoolsController.prototype, "getPoolTradingData", null);
exports.AMCPoolsController = AMCPoolsController = __decorate([
    (0, common_1.Controller)('amc-pools'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [amc_pools_service_1.AMCPoolsService])
], AMCPoolsController);
//# sourceMappingURL=amc-pools.controller.js.map