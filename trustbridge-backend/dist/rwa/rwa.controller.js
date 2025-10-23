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
exports.RWAController = void 0;
const common_1 = require("@nestjs/common");
const rwa_service_1 = require("./rwa.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let RWAController = class RWAController {
    constructor(rwaService) {
        this.rwaService = rwaService;
    }
    async createRWAAsset(createAssetDto, req) {
        const userAddress = req.user.walletAddress;
        return await this.rwaService.createRWAAsset(createAssetDto);
    }
    async getRWAAssets(status) {
        return await this.rwaService.getRWAAssets({ status: status });
    }
    async getRWAAsset(id) {
        return await this.rwaService.getRWAAsset(id);
    }
    async updateRWAAsset(id, updateAssetDto) {
        return await this.rwaService.updateRWAAsset(id, updateAssetDto);
    }
    async deleteRWAAsset(id) {
        return await this.rwaService.getRWAAsset(id);
    }
};
exports.RWAController = RWAController;
__decorate([
    (0, common_1.Post)('assets'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RWAController.prototype, "createRWAAsset", null);
__decorate([
    (0, common_1.Get)('assets'),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RWAController.prototype, "getRWAAssets", null);
__decorate([
    (0, common_1.Get)('assets/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RWAController.prototype, "getRWAAsset", null);
__decorate([
    (0, common_1.Put)('assets/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RWAController.prototype, "updateRWAAsset", null);
__decorate([
    (0, common_1.Delete)('assets/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RWAController.prototype, "deleteRWAAsset", null);
exports.RWAController = RWAController = __decorate([
    (0, common_1.Controller)('rwa'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [rwa_service_1.RWAService])
], RWAController);
//# sourceMappingURL=rwa.controller.js.map