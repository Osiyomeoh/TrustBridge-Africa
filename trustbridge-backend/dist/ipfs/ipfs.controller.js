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
exports.IPFSController = exports.PinFileRequestDto = exports.PresignedUrlRequestDto = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const ipfs_service_1 = require("./ipfs.service");
class PresignedUrlRequestDto {
}
exports.PresignedUrlRequestDto = PresignedUrlRequestDto;
class PinFileRequestDto {
}
exports.PinFileRequestDto = PinFileRequestDto;
let IPFSController = class IPFSController {
    constructor(ipfsService) {
        this.ipfsService = ipfsService;
    }
    async generatePresignedUrl(request) {
        try {
            const { url, fields } = await this.ipfsService.generatePresignedUrl(request.fileName, request.fileSize, request.fileType, request.metadata);
            return {
                success: true,
                data: { url, fields },
                message: 'Presigned URL generated successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to generate presigned URL',
                error: error.message
            };
        }
    }
    async uploadFile(file, fileName, fileType, metadata) {
        try {
            if (!file) {
                return {
                    success: false,
                    message: 'No file provided'
                };
            }
            let parsedMetadata;
            if (metadata) {
                try {
                    parsedMetadata = JSON.parse(metadata);
                }
                catch (e) {
                    console.warn('Failed to parse metadata:', e);
                }
            }
            const result = await this.ipfsService.uploadFile(file.buffer, fileName || file.originalname, fileType || file.mimetype, parsedMetadata);
            return {
                success: true,
                data: result,
                message: 'File uploaded successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Upload failed',
                error: error.message
            };
        }
    }
    async pinFile(request) {
        try {
            const success = await this.ipfsService.pinFile(request.cid, request.metadata);
            return {
                success,
                message: success ? 'File pinned successfully' : 'Failed to pin file'
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Pin failed',
                error: error.message
            };
        }
    }
    async unpinFile(cid) {
        try {
            const success = await this.ipfsService.unpinFile(cid);
            return {
                success,
                message: success ? 'File unpinned successfully' : 'Failed to unpin file'
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Unpin failed',
                error: error.message
            };
        }
    }
    async getFile(cid, res) {
        try {
            const fileUrl = this.ipfsService.getFileUrl(cid);
            res.redirect(fileUrl);
        }
        catch (error) {
            throw new common_1.BadRequestException('File not found');
        }
    }
    async getFileMetadata(cid) {
        try {
            const metadata = await this.ipfsService.getFileMetadata(cid);
            if (!metadata) {
                return {
                    success: false,
                    message: 'File not found'
                };
            }
            return {
                success: true,
                data: metadata,
                message: 'Metadata retrieved successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to get metadata',
                error: error.message
            };
        }
    }
    async listPinnedFiles() {
        try {
            const files = await this.ipfsService.listPinnedFiles();
            return {
                success: true,
                data: files,
                message: 'Files listed successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to list files',
                error: error.message
            };
        }
    }
    async getFileUrl(cid) {
        try {
            const url = this.ipfsService.getFileUrl(cid);
            return {
                success: true,
                data: { url },
                message: 'URL retrieved successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to get URL',
                error: error.message
            };
        }
    }
};
exports.IPFSController = IPFSController;
__decorate([
    (0, common_1.Post)('presigned-url'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate presigned URL for file upload' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Presigned URL generated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PresignedUrlRequestDto]),
    __metadata("design:returntype", Promise)
], IPFSController.prototype, "generatePresignedUrl", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload file to IPFS' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File uploaded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Upload failed' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('fileName')),
    __param(2, (0, common_1.Body)('fileType')),
    __param(3, (0, common_1.Body)('metadata')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], IPFSController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('pin'),
    (0, swagger_1.ApiOperation)({ summary: 'Pin file to IPFS' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File pinned successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Pin failed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PinFileRequestDto]),
    __metadata("design:returntype", Promise)
], IPFSController.prototype, "pinFile", null);
__decorate([
    (0, common_1.Delete)('unpin/:cid'),
    (0, swagger_1.ApiOperation)({ summary: 'Unpin file from IPFS' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File unpinned successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Unpin failed' }),
    __param(0, (0, common_1.Param)('cid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IPFSController.prototype, "unpinFile", null);
__decorate([
    (0, common_1.Get)('file/:cid'),
    (0, swagger_1.ApiOperation)({ summary: 'Get file from IPFS' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    __param(0, (0, common_1.Param)('cid')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IPFSController.prototype, "getFile", null);
__decorate([
    (0, common_1.Get)('metadata/:cid'),
    (0, swagger_1.ApiOperation)({ summary: 'Get file metadata from IPFS' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Metadata retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    __param(0, (0, common_1.Param)('cid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IPFSController.prototype, "getFileMetadata", null);
__decorate([
    (0, common_1.Get)('list'),
    (0, swagger_1.ApiOperation)({ summary: 'List all pinned files' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Files listed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Failed to list files' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IPFSController.prototype, "listPinnedFiles", null);
__decorate([
    (0, common_1.Get)('url/:cid'),
    (0, swagger_1.ApiOperation)({ summary: 'Get file URL from IPFS' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'URL retrieved successfully' }),
    __param(0, (0, common_1.Param)('cid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IPFSController.prototype, "getFileUrl", null);
exports.IPFSController = IPFSController = __decorate([
    (0, swagger_1.ApiTags)('IPFS'),
    (0, common_1.Controller)('api/ipfs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [ipfs_service_1.IPFSService])
], IPFSController);
//# sourceMappingURL=ipfs.controller.js.map