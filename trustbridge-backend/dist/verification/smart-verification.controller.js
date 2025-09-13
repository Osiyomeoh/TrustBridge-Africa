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
exports.SmartVerificationController = exports.SmartVerificationRequestDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const smart_verification_service_1 = require("./smart-verification.service");
class SmartVerificationRequestDto {
}
exports.SmartVerificationRequestDto = SmartVerificationRequestDto;
let SmartVerificationController = class SmartVerificationController {
    constructor(smartVerificationService) {
        this.smartVerificationService = smartVerificationService;
    }
    async processSmartVerification(request) {
        try {
            const result = await this.smartVerificationService.processSmartVerification(request.assetId, request.evidence);
            return {
                success: true,
                data: result,
                message: `Asset assigned to ${result.tier.name} verification tier`
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Smart verification failed',
                error: error.message
            };
        }
    }
    async getVerificationStatus(assetId) {
        try {
            const status = await this.smartVerificationService.getVerificationStatus(assetId);
            if (!status) {
                return {
                    success: false,
                    message: 'Verification status not found'
                };
            }
            return {
                success: true,
                data: status,
                message: 'Verification status retrieved successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to get verification status',
                error: error.message
            };
        }
    }
    async getVerificationTiers() {
        const tiers = [
            {
                name: 'INSTANT',
                maxAssetValue: 10000,
                maxProcessingTime: 5,
                requiresManualReview: false,
                confidenceThreshold: 0.85,
                description: 'Instant verification for low-value, high-confidence assets',
                benefits: [
                    'Approved in under 5 minutes',
                    'No manual review required',
                    'Immediate tokenization',
                    'Available for investment instantly'
                ]
            },
            {
                name: 'FAST',
                maxAssetValue: 100000,
                maxProcessingTime: 30,
                requiresManualReview: false,
                confidenceThreshold: 0.75,
                description: 'Fast verification for medium-value assets with good documentation',
                benefits: [
                    'Approved in under 30 minutes',
                    'Automated verification',
                    'Quick tokenization',
                    'Available for investment within hours'
                ]
            },
            {
                name: 'STANDARD',
                maxAssetValue: Infinity,
                maxProcessingTime: 1440,
                requiresManualReview: true,
                confidenceThreshold: 0.6,
                description: 'Standard verification with manual review for high-value or complex assets',
                benefits: [
                    'Thorough verification process',
                    'Expert manual review',
                    'Highest security standards',
                    'Suitable for high-value assets'
                ]
            }
        ];
        return {
            success: true,
            data: tiers,
            message: 'Verification tiers retrieved successfully'
        };
    }
};
exports.SmartVerificationController = SmartVerificationController;
__decorate([
    (0, common_1.Post)('process'),
    (0, swagger_1.ApiOperation)({ summary: 'Process smart verification for an asset' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Verification processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SmartVerificationRequestDto]),
    __metadata("design:returntype", Promise)
], SmartVerificationController.prototype, "processSmartVerification", null);
__decorate([
    (0, common_1.Get)('status/:assetId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get verification status for an asset' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Verification status retrieved successfully' }),
    __param(0, (0, common_1.Param)('assetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SmartVerificationController.prototype, "getVerificationStatus", null);
__decorate([
    (0, common_1.Get)('tiers'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available verification tiers' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Verification tiers retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SmartVerificationController.prototype, "getVerificationTiers", null);
exports.SmartVerificationController = SmartVerificationController = __decorate([
    (0, swagger_1.ApiTags)('Smart Verification'),
    (0, common_1.Controller)('api/verification/smart'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [smart_verification_service_1.SmartVerificationService])
], SmartVerificationController);
//# sourceMappingURL=smart-verification.controller.js.map