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
exports.PoolsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const pools_service_1 = require("./pools.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let PoolsController = class PoolsController {
    constructor(poolsService) {
        this.poolsService = poolsService;
    }
    async createPool(poolData, req) {
        return this.poolsService.createPool({
            name: poolData.name,
            description: poolData.description,
            managementFee: poolData.managementFee,
            performanceFee: poolData.performanceFee,
            manager: req.user.walletAddress
        });
    }
    async getAllPools(filters) {
        return this.poolsService.getAllPools(filters);
    }
    async getPool(poolId) {
        return this.poolsService.getPool(poolId);
    }
    async addInvestor(poolId, investorData) {
        return this.poolsService.addInvestor(poolId, investorData);
    }
    async distributeRewards(poolId, data, req) {
        const pool = await this.poolsService.getPool(poolId);
        if (pool.manager !== req.user.walletAddress) {
            throw new Error('Not pool manager');
        }
        return this.poolsService.distributeRewards(poolId, data.amount);
    }
    async updatePoolStatus(poolId, data, req) {
        const pool = await this.poolsService.getPool(poolId);
        if (pool.manager !== req.user.walletAddress && !req.user.isAdmin) {
            throw new Error('Not authorized');
        }
        return this.poolsService.updatePoolStatus(poolId, data.status);
    }
    async getPoolPerformance(poolId) {
        return this.poolsService.getPoolPerformance(poolId);
    }
};
exports.PoolsController = PoolsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new investment pool' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Pool created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid pool data' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PoolsController.prototype, "createPool", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all pools with optional filters' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pools retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PoolsController.prototype, "getAllPools", null);
__decorate([
    (0, common_1.Get)(':poolId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific pool by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pool retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Pool not found' }),
    __param(0, (0, common_1.Param)('poolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PoolsController.prototype, "getPool", null);
__decorate([
    (0, common_1.Post)(':poolId/investors'),
    (0, swagger_1.ApiOperation)({ summary: 'Add investor to pool' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Investor added successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid investment data' }),
    __param(0, (0, common_1.Param)('poolId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PoolsController.prototype, "addInvestor", null);
__decorate([
    (0, common_1.Post)(':poolId/distribute'),
    (0, swagger_1.ApiOperation)({ summary: 'Distribute rewards to pool investors' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Rewards distributed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not pool manager' }),
    __param(0, (0, common_1.Param)('poolId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PoolsController.prototype, "distributeRewards", null);
__decorate([
    (0, common_1.Put)(':poolId/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update pool status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pool status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not authorized' }),
    __param(0, (0, common_1.Param)('poolId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PoolsController.prototype, "updatePoolStatus", null);
__decorate([
    (0, common_1.Get)(':poolId/performance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pool performance metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Performance metrics retrieved successfully' }),
    __param(0, (0, common_1.Param)('poolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PoolsController.prototype, "getPoolPerformance", null);
exports.PoolsController = PoolsController = __decorate([
    (0, swagger_1.ApiTags)('Pools'),
    (0, common_1.Controller)('pools'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [pools_service_1.PoolsService])
], PoolsController);
//# sourceMappingURL=pools.controller.js.map