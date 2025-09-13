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
exports.KycController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const kyc_service_1 = require("./kyc.service");
let KycController = class KycController {
    constructor(kycService) {
        this.kycService = kycService;
    }
    async startKYC(req) {
        const userId = req.user.sub;
        const result = await this.kycService.startKYC(userId);
        return {
            success: true,
            data: result,
            message: 'KYC process started successfully',
        };
    }
    async checkKYCStatus(inquiryId) {
        const result = await this.kycService.checkKYCStatus(inquiryId);
        return {
            success: true,
            data: result,
            message: 'KYC status retrieved successfully',
        };
    }
    async getKYCInquiry(inquiryId) {
        const result = await this.kycService.getKYCInquiry(inquiryId);
        return {
            success: true,
            data: result,
            message: 'KYC inquiry details retrieved successfully',
        };
    }
    async handleWebhook(req) {
        const result = await this.kycService.handleWebhook(req.body);
        return {
            success: true,
            data: result,
            message: 'Webhook processed successfully',
        };
    }
};
exports.KycController = KycController;
__decorate([
    (0, common_1.Post)('start'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Start KYC verification process' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KYC process started successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KycController.prototype, "startKYC", null);
__decorate([
    (0, common_1.Get)('status/:inquiryId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check KYC verification status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KYC status retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('inquiryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KycController.prototype, "checkKYCStatus", null);
__decorate([
    (0, common_1.Get)('inquiry/:inquiryId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get KYC inquiry details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KYC inquiry details retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('inquiryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KycController.prototype, "getKYCInquiry", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, swagger_1.ApiOperation)({ summary: 'Handle Persona webhook events' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KycController.prototype, "handleWebhook", null);
exports.KycController = KycController = __decorate([
    (0, swagger_1.ApiTags)('KYC'),
    (0, common_1.Controller)('api/kyc'),
    __metadata("design:paramtypes", [kyc_service_1.KycService])
], KycController);
//# sourceMappingURL=kyc.controller.js.map