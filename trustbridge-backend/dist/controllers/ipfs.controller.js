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
var IPFSController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPFSController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const ipfs_service_1 = require("../services/ipfs.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let IPFSController = IPFSController_1 = class IPFSController {
    constructor(ipfsService) {
        this.ipfsService = ipfsService;
        this.logger = new common_1.Logger(IPFSController_1.name);
    }
    async generatePresignedUrl(body) {
        try {
            this.logger.log(`Generating presigned URL for file: ${body.fileName}`);
            const result = await this.ipfsService.generatePresignedUrl(body.fileName, body.fileSize, body.fileType, body.metadata);
            return result;
        }
        catch (error) {
            this.logger.error('Error generating presigned URL:', error);
            throw new common_1.InternalServerErrorException('Failed to generate presigned URL');
        }
    }
    async uploadFile(file, body) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        try {
            this.logger.log(`Uploading file: ${file.originalname}`);
            const validation = this.ipfsService.validateFile(file);
            if (!validation.valid) {
                throw new common_1.BadRequestException(validation.error);
            }
            const metadata = {
                name: file.originalname,
                type: file.mimetype,
                size: file.size,
                category: body.category || 'general',
                description: body.description || '',
                tags: body.tags ? body.tags.split(',').map(tag => tag.trim()) : []
            };
            const result = await this.ipfsService.uploadFile(file, metadata);
            this.logger.log(`File uploaded successfully: ${result.cid}`);
            return result;
        }
        catch (error) {
            this.logger.error('Error uploading file:', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to upload file');
        }
    }
    async getFile(cid) {
        try {
            this.logger.log(`Getting file from IPFS: ${cid}`);
            const fileUrl = this.ipfsService.getFileUrl(cid);
            throw new common_1.BadRequestException(`File available at: ${fileUrl}`);
        }
        catch (error) {
            this.logger.error('Error getting file:', error);
            throw new common_1.InternalServerErrorException('Failed to get file');
        }
    }
    async pinFile(body) {
        try {
            this.logger.log(`Pinning file to IPFS: ${body.cid}`);
            const success = await this.ipfsService.pinFile(body.cid, body.metadata);
            if (success) {
                return {
                    success: true,
                    message: 'File pinned successfully'
                };
            }
            else {
                return {
                    success: false,
                    message: 'Failed to pin file'
                };
            }
        }
        catch (error) {
            this.logger.error('Error pinning file:', error);
            throw new common_1.InternalServerErrorException('Failed to pin file');
        }
    }
    async unpinFile(cid) {
        try {
            this.logger.log(`Unpinning file from IPFS: ${cid}`);
            const success = await this.ipfsService.unpinFile(cid);
            if (success) {
                return {
                    success: true,
                    message: 'File unpinned successfully'
                };
            }
            else {
                return {
                    success: false,
                    message: 'Failed to unpin file'
                };
            }
        }
        catch (error) {
            this.logger.error('Error unpinning file:', error);
            throw new common_1.InternalServerErrorException('Failed to unpin file');
        }
    }
    async getFileMetadata(cid) {
        try {
            this.logger.log(`Getting file metadata: ${cid}`);
            const metadata = await this.ipfsService.getFileMetadata(cid);
            return metadata;
        }
        catch (error) {
            this.logger.error('Error getting file metadata:', error);
            throw new common_1.InternalServerErrorException('Failed to get file metadata');
        }
    }
    async listPinnedFiles() {
        try {
            this.logger.log('Listing pinned files');
            const files = await this.ipfsService.listPinnedFiles();
            return files;
        }
        catch (error) {
            this.logger.error('Error listing pinned files:', error);
            throw new common_1.InternalServerErrorException('Failed to list pinned files');
        }
    }
    async getFileUrl(cid) {
        try {
            this.logger.log(`Getting file URL: ${cid}`);
            const url = this.ipfsService.getFileUrl(cid);
            return { url };
        }
        catch (error) {
            this.logger.error('Error getting file URL:', error);
            throw new common_1.InternalServerErrorException('Failed to get file URL');
        }
    }
};
exports.IPFSController = IPFSController;
__decorate([
    (0, common_1.Post)('presigned-url'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate presigned URL for file upload' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Presigned URL generated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IPFSController.prototype, "generatePresignedUrl", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({ summary: 'Upload file directly to IPFS' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'File uploaded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IPFSController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)('file/:cid'),
    (0, swagger_1.ApiOperation)({ summary: 'Get file from IPFS by CID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('cid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IPFSController.prototype, "getFile", null);
__decorate([
    (0, common_1.Post)('pin'),
    (0, swagger_1.ApiOperation)({ summary: 'Pin file to IPFS by CID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File pinned successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IPFSController.prototype, "pinFile", null);
__decorate([
    (0, common_1.Delete)('unpin/:cid'),
    (0, swagger_1.ApiOperation)({ summary: 'Unpin file from IPFS by CID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File unpinned successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('cid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IPFSController.prototype, "unpinFile", null);
__decorate([
    (0, common_1.Get)('metadata/:cid'),
    (0, swagger_1.ApiOperation)({ summary: 'Get file metadata by CID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File metadata retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('cid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IPFSController.prototype, "getFileMetadata", null);
__decorate([
    (0, common_1.Get)('list'),
    (0, swagger_1.ApiOperation)({ summary: 'List all pinned files' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pinned files retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IPFSController.prototype, "listPinnedFiles", null);
__decorate([
    (0, common_1.Get)('url/:cid'),
    (0, swagger_1.ApiOperation)({ summary: 'Get file URL by CID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File URL retrieved successfully' }),
    __param(0, (0, common_1.Param)('cid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IPFSController.prototype, "getFileUrl", null);
exports.IPFSController = IPFSController = IPFSController_1 = __decorate([
    (0, swagger_1.ApiTags)('IPFS'),
    (0, common_1.Controller)('ipfs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [ipfs_service_1.IPFSService])
], IPFSController);
//# sourceMappingURL=ipfs.controller.js.map