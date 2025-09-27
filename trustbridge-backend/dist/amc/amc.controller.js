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
exports.AMCController = void 0;
const common_1 = require("@nestjs/common");
const amc_service_1 = require("./amc.service");
let AMCController = class AMCController {
    constructor(amcService) {
        this.amcService = amcService;
    }
    async registerAMC(registerDto) {
        return this.amcService.registerAMC(registerDto);
    }
    async scheduleInspection(scheduleDto) {
        return this.amcService.scheduleInspection(scheduleDto);
    }
    async completeInspection(completeDto) {
        return this.amcService.completeInspection(completeDto);
    }
    async initiateLegalTransfer(transferDto) {
        return this.amcService.initiateLegalTransfer(transferDto);
    }
    async completeLegalTransfer(assetId, body) {
        return this.amcService.completeLegalTransfer(assetId, body.manager);
    }
    async getInspectionRecord(assetId) {
        return this.amcService.getInspectionRecord(assetId);
    }
    async getLegalTransferRecord(assetId) {
        return this.amcService.getLegalTransferRecord(assetId);
    }
    async getAMCStats() {
        return this.amcService.getAMCStats();
    }
};
exports.AMCController = AMCController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AMCController.prototype, "registerAMC", null);
__decorate([
    (0, common_1.Post)('inspection/schedule'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AMCController.prototype, "scheduleInspection", null);
__decorate([
    (0, common_1.Post)('inspection/complete'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AMCController.prototype, "completeInspection", null);
__decorate([
    (0, common_1.Post)('transfer/initiate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AMCController.prototype, "initiateLegalTransfer", null);
__decorate([
    (0, common_1.Post)('transfer/complete/:assetId'),
    __param(0, (0, common_1.Param)('assetId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AMCController.prototype, "completeLegalTransfer", null);
__decorate([
    (0, common_1.Get)('inspection/:assetId'),
    __param(0, (0, common_1.Param)('assetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AMCController.prototype, "getInspectionRecord", null);
__decorate([
    (0, common_1.Get)('transfer/:assetId'),
    __param(0, (0, common_1.Param)('assetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AMCController.prototype, "getLegalTransferRecord", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AMCController.prototype, "getAMCStats", null);
exports.AMCController = AMCController = __decorate([
    (0, common_1.Controller)('amc'),
    __metadata("design:paramtypes", [amc_service_1.AMCService])
], AMCController);
//# sourceMappingURL=amc.controller.js.map