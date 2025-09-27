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
exports.FileUploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const file_upload_service_1 = require("./file-upload.service");
let FileUploadController = class FileUploadController {
    constructor(fileUploadService) {
        this.fileUploadService = fileUploadService;
    }
    async uploadFile(assetId, fileType, file) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        const uploadedFile = await this.fileUploadService.uploadFile(file, assetId, fileType);
        return {
            success: true,
            data: uploadedFile,
            message: 'File uploaded successfully',
        };
    }
    async uploadMultipleFiles(assetId, fileType, files) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No files provided');
        }
        const uploadedFiles = await this.fileUploadService.uploadMultipleFiles(files, assetId, fileType);
        return {
            success: true,
            data: uploadedFiles,
            message: `${uploadedFiles.length} files uploaded successfully`,
        };
    }
    async analyzeFile(fileId) {
        const analysis = await this.fileUploadService.analyzeFile(fileId);
        return {
            success: true,
            data: analysis,
            message: 'File analysis completed',
        };
    }
    async downloadFile(fileId, res) {
        try {
            const fileBuffer = await this.fileUploadService.getFile(fileId);
            res.set({
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${fileId}"`,
                'Content-Length': fileBuffer.length.toString(),
            });
            res.send(fileBuffer);
        }
        catch (error) {
            throw new common_1.BadRequestException('File not found');
        }
    }
    async viewFile(fileId, res) {
        try {
            const fileBuffer = await this.fileUploadService.getFile(fileId);
            const contentType = this.getContentType(fileId);
            res.set({
                'Content-Type': contentType,
                'Content-Length': fileBuffer.length.toString(),
            });
            res.send(fileBuffer);
        }
        catch (error) {
            throw new common_1.BadRequestException('File not found');
        }
    }
    async deleteFile(fileId) {
        await this.fileUploadService.deleteFile(fileId);
        return {
            success: true,
            message: 'File deleted successfully',
        };
    }
    async getUploadStats() {
        const stats = this.fileUploadService.getUploadStats();
        return {
            success: true,
            data: stats,
            message: 'Upload statistics retrieved',
        };
    }
    async cleanupOldFiles() {
        this.fileUploadService.cleanupOldFiles();
        return {
            success: true,
            message: 'File cleanup completed',
        };
    }
    getContentType(fileId) {
        const extension = fileId.split('.').pop()?.toLowerCase();
        const mimeTypes = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'pdf': 'application/pdf',
            'txt': 'text/plain',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        };
        return mimeTypes[extension || ''] || 'application/octet-stream';
    }
};
exports.FileUploadController = FileUploadController;
__decorate([
    (0, common_1.Post)('upload/:assetId/:fileType'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a single file for an asset' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'File uploaded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid file or upload failed' }),
    __param(0, (0, common_1.Param)('assetId')),
    __param(1, (0, common_1.Param)('fileType')),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('upload-multiple/:assetId/:fileType'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10)),
    (0, swagger_1.ApiOperation)({ summary: 'Upload multiple files for an asset' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Files uploaded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid files or upload failed' }),
    __param(0, (0, common_1.Param)('assetId')),
    __param(1, (0, common_1.Param)('fileType')),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "uploadMultipleFiles", null);
__decorate([
    (0, common_1.Get)('analyze/:fileId'),
    (0, swagger_1.ApiOperation)({ summary: 'Analyze uploaded file' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File analysis completed' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    __param(0, (0, common_1.Param)('fileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "analyzeFile", null);
__decorate([
    (0, common_1.Get)('download/:fileId'),
    (0, swagger_1.ApiOperation)({ summary: 'Download file by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File downloaded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    __param(0, (0, common_1.Param)('fileId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "downloadFile", null);
__decorate([
    (0, common_1.Get)('view/:fileId'),
    (0, swagger_1.ApiOperation)({ summary: 'View file in browser' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File displayed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    __param(0, (0, common_1.Param)('fileId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "viewFile", null);
__decorate([
    (0, common_1.Delete)(':fileId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete uploaded file' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'File not found' }),
    __param(0, (0, common_1.Param)('fileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "deleteFile", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get file upload statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Upload statistics retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "getUploadStats", null);
__decorate([
    (0, common_1.Post)('cleanup'),
    (0, swagger_1.ApiOperation)({ summary: 'Clean up old files' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cleanup completed' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "cleanupOldFiles", null);
exports.FileUploadController = FileUploadController = __decorate([
    (0, swagger_1.ApiTags)('File Upload'),
    (0, common_1.Controller)('files'),
    __metadata("design:paramtypes", [file_upload_service_1.FileUploadService])
], FileUploadController);
//# sourceMappingURL=file-upload.controller.js.map