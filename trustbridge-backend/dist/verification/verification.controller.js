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
exports.VerificationController = exports.SubmitVerificationWithFilesDto = exports.IPFSFileDto = exports.SubmitAttestationDto = exports.AttestationDataDto = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const verification_service_1 = require("./verification.service");
const submit_verification_dto_1 = require("./dto/submit-verification.dto");
const ipfs_service_1 = require("../services/ipfs.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
class AttestationDataDto {
}
exports.AttestationDataDto = AttestationDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 92 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AttestationDataDto.prototype, "confidence", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'High-quality coffee farm with excellent management' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AttestationDataDto.prototype, "comments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: { siteVisit: { findings: 'Farm is well-maintained' } } }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], AttestationDataDto.prototype, "evidence", void 0);
class SubmitAttestationDto {
}
exports.SubmitAttestationDto = SubmitAttestationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'verification_123' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitAttestationDto.prototype, "verificationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'attestor_456' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitAttestationDto.prototype, "attestorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: AttestationDataDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AttestationDataDto),
    __metadata("design:type", AttestationDataDto)
], SubmitAttestationDto.prototype, "attestation", void 0);
class IPFSFileDto {
}
exports.IPFSFileDto = IPFSFileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'QmYourFileHash' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IPFSFileDto.prototype, "cid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://gateway.pinata.cloud/ipfs/QmYourFileHash' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IPFSFileDto.prototype, "ipfsUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'document.pdf' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IPFSFileDto.prototype, "fileName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'application/pdf' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IPFSFileDto.prototype, "fileType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1024000 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], IPFSFileDto.prototype, "fileSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ownership document', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IPFSFileDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'verification_document', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IPFSFileDto.prototype, "category", void 0);
class SubmitVerificationWithFilesDto {
}
exports.SubmitVerificationWithFilesDto = SubmitVerificationWithFilesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'asset_123' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitVerificationWithFilesDto.prototype, "assetId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Coffee farm verification' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitVerificationWithFilesDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [IPFSFileDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => IPFSFileDto),
    __metadata("design:type", Array)
], SubmitVerificationWithFilesDto.prototype, "documents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [IPFSFileDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => IPFSFileDto),
    __metadata("design:type", Array)
], SubmitVerificationWithFilesDto.prototype, "photos", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: { location: { lat: 6.5244, lng: 3.3792 } } }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SubmitVerificationWithFilesDto.prototype, "evidence", void 0);
let VerificationController = class VerificationController {
    constructor(verificationService, ipfsService) {
        this.verificationService = verificationService;
        this.ipfsService = ipfsService;
    }
    async getAllVerifications() {
        try {
            const verifications = await this.verificationService.getAllVerifications();
            return {
                success: true,
                data: verifications,
                message: `Found ${verifications.length} verification requests`
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getVerificationStatus(assetId) {
        try {
            const verification = await this.verificationService.getVerificationStatus(assetId);
            return {
                success: true,
                data: verification,
                message: 'Verification status retrieved successfully'
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message,
            }, common_1.HttpStatus.NOT_FOUND);
        }
    }
    async getVerificationById(id) {
        try {
            const verification = await this.verificationService.getVerificationById(id);
            return {
                success: true,
                data: verification,
                message: 'Verification request retrieved successfully'
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message,
            }, common_1.HttpStatus.NOT_FOUND);
        }
    }
    async submitVerification(submitVerificationDto) {
        try {
            const verification = await this.verificationService.submitVerificationRequest(submitVerificationDto.assetId, submitVerificationDto.evidence);
            return {
                success: true,
                data: verification,
                message: 'Verification request submitted successfully'
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async submitAttestation(submitAttestationDto) {
        try {
            await this.verificationService.submitAttestation(submitAttestationDto.verificationId, submitAttestationDto.attestorId, submitAttestationDto.attestation);
            return {
                success: true,
                message: 'Attestation submitted successfully'
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async submitVerificationWithFiles(submitDto) {
        try {
            const verification = await this.verificationService.submitVerificationWithFiles(submitDto.assetId, submitDto.description, submitDto.documents, submitDto.photos, submitDto.evidence);
            return {
                success: true,
                data: verification,
                message: 'Verification with files submitted successfully'
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async uploadDocument(file, body) {
        try {
            if (!file) {
                throw new common_1.HttpException({ success: false, message: 'No file provided' }, common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.ipfsService.uploadFile(file, {
                name: file.originalname,
                type: file.mimetype,
                size: file.size,
                category: body.category || 'verification_document',
                description: body.description || '',
                tags: body.tags ? body.tags.split(',').map(tag => tag.trim()) : []
            });
            return {
                success: true,
                data: result,
                message: 'Document uploaded successfully to IPFS'
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async uploadPhoto(file, body) {
        try {
            if (!file) {
                throw new common_1.HttpException({ success: false, message: 'No file provided' }, common_1.HttpStatus.BAD_REQUEST);
            }
            if (!file.mimetype.startsWith('image/')) {
                throw new common_1.HttpException({ success: false, message: 'File must be an image' }, common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.ipfsService.uploadFile(file, {
                name: file.originalname,
                type: file.mimetype,
                size: file.size,
                category: 'verification_photo',
                description: body.description || '',
                tags: body.tags ? body.tags.split(',').map(tag => tag.trim()) : []
            });
            return {
                success: true,
                data: result,
                message: 'Photo uploaded successfully to IPFS'
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                success: false,
                message: error.message,
            }, common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.VerificationController = VerificationController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all verification requests' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Verification requests retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VerificationController.prototype, "getAllVerifications", null);
__decorate([
    (0, common_1.Get)('status/:assetId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get verification status for asset' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Verification status retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Verification request not found' }),
    __param(0, (0, common_1.Param)('assetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VerificationController.prototype, "getVerificationStatus", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get verification request by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Verification request retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Verification request not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VerificationController.prototype, "getVerificationById", null);
__decorate([
    (0, common_1.Post)('submit'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit asset for verification' }),
    (0, swagger_1.ApiBody)({ type: submit_verification_dto_1.SubmitVerificationDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Verification request submitted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid verification request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [submit_verification_dto_1.SubmitVerificationDto]),
    __metadata("design:returntype", Promise)
], VerificationController.prototype, "submitVerification", null);
__decorate([
    (0, common_1.Post)('attestation'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit attestation for verification' }),
    (0, swagger_1.ApiBody)({ type: SubmitAttestationDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Attestation submitted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid attestation' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SubmitAttestationDto]),
    __metadata("design:returntype", Promise)
], VerificationController.prototype, "submitAttestation", null);
__decorate([
    (0, common_1.Post)('submit-with-files'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit verification with IPFS files' }),
    (0, swagger_1.ApiBody)({ type: SubmitVerificationWithFilesDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Verification with files submitted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid verification request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SubmitVerificationWithFilesDto]),
    __metadata("design:returntype", Promise)
], VerificationController.prototype, "submitVerificationWithFiles", null);
__decorate([
    (0, common_1.Post)('upload-document'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({ summary: 'Upload verification document to IPFS' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Document uploaded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid file' }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VerificationController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Post)('upload-photo'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({ summary: 'Upload verification photo to IPFS' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Photo uploaded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid file' }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VerificationController.prototype, "uploadPhoto", null);
exports.VerificationController = VerificationController = __decorate([
    (0, swagger_1.ApiTags)('Verification'),
    (0, common_1.Controller)('api/verification'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [verification_service_1.VerificationService,
        ipfs_service_1.IPFSService])
], VerificationController);
//# sourceMappingURL=verification.controller.js.map