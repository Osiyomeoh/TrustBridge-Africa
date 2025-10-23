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
exports.PoolTokensController = void 0;
const common_1 = require("@nestjs/common");
const pool_tokens_service_1 = require("./pool-tokens.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const admin_guard_1 = require("../auth/admin.guard");
let PoolTokensController = class PoolTokensController {
    constructor(poolTokensService) {
        this.poolTokensService = poolTokensService;
    }
    async getUserHoldings(req) {
        const holderAddress = req.user.walletAddress;
        return await this.poolTokensService.getUserHoldings(holderAddress);
    }
    async getPoolHolding(poolId, req) {
        const holderAddress = req.user.walletAddress;
        return await this.poolTokensService.getPoolHolding(holderAddress, poolId);
    }
    async getPortfolioSummary(req) {
        const holderAddress = req.user.walletAddress;
        return await this.poolTokensService.getPortfolioSummary(holderAddress);
    }
    async transferTokens(transferDto, req) {
        if (!transferDto.fromAddress) {
            transferDto.fromAddress = req.user.walletAddress;
        }
        return await this.poolTokensService.transferTokens(transferDto);
    }
    async claimDividends(claimDto, req) {
        claimDto.holderAddress = req.user.walletAddress;
        return await this.poolTokensService.claimDividends(claimDto);
    }
    async stakeTokens(stakeDto, req) {
        stakeDto.holderAddress = req.user.walletAddress;
        return await this.poolTokensService.stakeTokens(stakeDto);
    }
    async unstakeTokens(poolId, stakingId, req) {
        const holderAddress = req.user.walletAddress;
        return await this.poolTokensService.unstakeTokens(holderAddress, poolId, stakingId);
    }
    async distributeDividends(dividendDto) {
        return await this.poolTokensService.updateDividendDistribution(dividendDto.poolId, dividendDto.dividendAmount, dividendDto.perToken, dividendDto.description);
    }
    async getTransferHistory(poolId, req) {
        const holderAddress = req.user.walletAddress;
        const holding = await this.poolTokensService.getPoolHolding(holderAddress, poolId);
        return holding.transfers;
    }
    async getDividendHistory(poolId, req) {
        const holderAddress = req.user.walletAddress;
        const holding = await this.poolTokensService.getPoolHolding(holderAddress, poolId);
        return holding.dividends;
    }
    async getStakingRecords(poolId, req) {
        const holderAddress = req.user.walletAddress;
        const holding = await this.poolTokensService.getPoolHolding(holderAddress, poolId);
        return holding.stakingRecords;
    }
    async getUnclaimedDividends(req) {
        const holderAddress = req.user.walletAddress;
        const holdings = await this.poolTokensService.getUserHoldings(holderAddress);
        const unclaimedDividends = holdings.flatMap(holding => holding.dividends
            .filter(dividend => !dividend.isClaimed)
            .map(dividend => ({
            ...dividend,
            poolId: holding.poolId,
            poolName: holding.poolName,
            holderAddress: holding.holderAddress
        })));
        return unclaimedDividends;
    }
    async getPortfolioAnalytics(req) {
        const holderAddress = req.user.walletAddress;
        const holdings = await this.poolTokensService.getUserHoldings(holderAddress);
        const analytics = {
            totalHoldings: holdings.length,
            totalValue: holdings.reduce((sum, h) => sum + h.currentValue, 0),
            totalInvested: holdings.reduce((sum, h) => sum + h.totalInvested, 0),
            totalPnL: holdings.reduce((sum, h) => sum + h.totalPnL, 0),
            totalDividends: holdings.reduce((sum, h) => sum + h.totalDividendsReceived, 0),
            bestPerformer: holdings.length > 0 ? holdings.reduce((best, current) => current.roi > best.roi ? current : best) : null,
            worstPerformer: holdings.length > 0 ? holdings.reduce((worst, current) => current.roi < worst.roi ? current : worst) : null,
            riskDistribution: holdings.reduce((acc, holding) => {
                const risk = holding.metadata.riskLevel;
                acc[risk] = (acc[risk] || 0) + holding.currentValue;
                return acc;
            }, {}),
            poolTypeDistribution: holdings.reduce((acc, holding) => {
                const type = holding.metadata.poolType;
                acc[type] = (acc[type] || 0) + holding.currentValue;
                return acc;
            }, {})
        };
        return analytics;
    }
    async getTokenBalance(poolId, req) {
        const holderAddress = req.user.walletAddress;
        try {
            const holding = await this.poolTokensService.getPoolHolding(holderAddress, poolId);
            return {
                poolId: holding.poolId,
                poolName: holding.poolName,
                totalTokens: holding.totalTokens,
                availableTokens: holding.availableTokens,
                lockedTokens: holding.lockedTokens,
                currentValue: holding.currentValue,
                totalPnL: holding.totalPnL,
                roi: holding.roi
            };
        }
        catch (error) {
            return {
                poolId,
                poolName: '',
                totalTokens: 0,
                availableTokens: 0,
                lockedTokens: 0,
                currentValue: 0,
                totalPnL: 0,
                roi: 0
            };
        }
    }
};
exports.PoolTokensController = PoolTokensController;
__decorate([
    (0, common_1.Get)('holdings'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PoolTokensController.prototype, "getUserHoldings", null);
__decorate([
    (0, common_1.Get)('holdings/:poolId'),
    __param(0, (0, common_1.Param)('poolId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PoolTokensController.prototype, "getPoolHolding", null);
__decorate([
    (0, common_1.Get)('portfolio/summary'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PoolTokensController.prototype, "getPortfolioSummary", null);
__decorate([
    (0, common_1.Post)('transfer'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PoolTokensController.prototype, "transferTokens", null);
__decorate([
    (0, common_1.Post)('claim-dividends'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PoolTokensController.prototype, "claimDividends", null);
__decorate([
    (0, common_1.Post)('stake'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PoolTokensController.prototype, "stakeTokens", null);
__decorate([
    (0, common_1.Put)('unstake/:poolId/:stakingId'),
    __param(0, (0, common_1.Param)('poolId')),
    __param(1, (0, common_1.Param)('stakingId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PoolTokensController.prototype, "unstakeTokens", null);
__decorate([
    (0, common_1.Post)('distribute-dividends'),
    (0, common_1.UseGuards)(admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PoolTokensController.prototype, "distributeDividends", null);
__decorate([
    (0, common_1.Get)('transfers/:poolId'),
    __param(0, (0, common_1.Param)('poolId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PoolTokensController.prototype, "getTransferHistory", null);
__decorate([
    (0, common_1.Get)('dividends/:poolId'),
    __param(0, (0, common_1.Param)('poolId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PoolTokensController.prototype, "getDividendHistory", null);
__decorate([
    (0, common_1.Get)('staking/:poolId'),
    __param(0, (0, common_1.Param)('poolId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PoolTokensController.prototype, "getStakingRecords", null);
__decorate([
    (0, common_1.Get)('unclaimed-dividends'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PoolTokensController.prototype, "getUnclaimedDividends", null);
__decorate([
    (0, common_1.Get)('portfolio/analytics'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PoolTokensController.prototype, "getPortfolioAnalytics", null);
__decorate([
    (0, common_1.Get)('balance/:poolId'),
    __param(0, (0, common_1.Param)('poolId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PoolTokensController.prototype, "getTokenBalance", null);
exports.PoolTokensController = PoolTokensController = __decorate([
    (0, common_1.Controller)('pool-tokens'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [pool_tokens_service_1.PoolTokensService])
], PoolTokensController);
//# sourceMappingURL=pool-tokens.controller.js.map