"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FileUploadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const hedera_service_1 = require("../hedera/hedera.service");
const google_drive_service_1 = require("./google-drive.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
let FileUploadService = FileUploadService_1 = class FileUploadService {
    constructor(configService, hederaService, googleDriveService) {
        this.configService = configService;
        this.hederaService = hederaService;
        this.googleDriveService = googleDriveService;
        this.logger = new common_1.Logger(FileUploadService_1.name);
        this.uploadDir = this.configService.get('UPLOAD_DIR', './uploads');
        this.maxFileSize = this.configService.get('MAX_FILE_SIZE', 10 * 1024 * 1024);
        this.allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
        ];
        this.ensureUploadDir();
    }
    ensureUploadDir() {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }
    async uploadFile(file, assetId, fileType) {
        try {
            this.validateFile(file);
            const fileExtension = path.extname(file.originalname);
            const fileName = `${assetId}_${fileType}_${Date.now()}${fileExtension}`;
            const filePath = path.join(this.uploadDir, fileName);
            fs.writeFileSync(filePath, file.buffer);
            const hash = this.calculateFileHash(file.buffer);
            let hfsFileId;
            try {
                hfsFileId = await this.hederaService.storeFileOnHFS(file.buffer, fileName);
                this.logger.log(`File stored on HFS with ID: ${hfsFileId}`);
            }
            catch (error) {
                this.logger.warn('Failed to store file on HFS:', error);
            }
            const uploadedFile = {
                id: crypto.randomUUID(),
                originalName: file.originalname,
                fileName,
                mimeType: file.mimetype,
                size: file.size,
                hash,
                uploadedAt: new Date(),
                hfsFileId,
                url: `/uploads/${fileName}`,
            };
            this.logger.log(`File uploaded successfully: ${uploadedFile.id}`);
            return uploadedFile;
        }
        catch (error) {
            this.logger.error('File upload failed:', error);
            throw new common_1.BadRequestException(`File upload failed: ${error.message}`);
        }
    }
    async uploadMultipleFiles(files, assetId, fileType) {
        const uploadPromises = files.map((file, index) => this.uploadFile(file, `${assetId}_${index}`, fileType));
        return Promise.all(uploadPromises);
    }
    async analyzeFile(fileId) {
        try {
            const filePath = path.join(this.uploadDir, fileId);
            if (!fs.existsSync(filePath)) {
                throw new common_1.BadRequestException('File not found');
            }
            const fileBuffer = fs.readFileSync(filePath);
            const mimeType = this.getMimeType(fileBuffer);
            const analysis = {
                type: this.getFileType(mimeType),
                isValid: true,
                confidence: 0.8,
            };
            if (analysis.type === 'image') {
                const imageAnalysis = await this.analyzeImage(fileBuffer);
                analysis.gpsData = imageAnalysis.gpsData;
                analysis.metadata = imageAnalysis.metadata;
                analysis.confidence = imageAnalysis.confidence;
            }
            else if (analysis.type === 'document') {
                const documentAnalysis = await this.analyzeDocument(fileBuffer, mimeType);
                analysis.extractedText = documentAnalysis.extractedText;
                analysis.metadata = documentAnalysis.metadata;
                analysis.confidence = documentAnalysis.confidence;
            }
            return analysis;
        }
        catch (error) {
            this.logger.error('File analysis failed:', error);
            return {
                type: 'other',
                isValid: false,
                confidence: 0,
            };
        }
    }
    async deleteFile(fileId) {
        try {
            const filePath = path.join(this.uploadDir, fileId);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                this.logger.log(`File deleted: ${fileId}`);
            }
        }
        catch (error) {
            this.logger.error('File deletion failed:', error);
            throw new common_1.BadRequestException(`File deletion failed: ${error.message}`);
        }
    }
    async getFile(fileId) {
        try {
            const filePath = path.join(this.uploadDir, fileId);
            if (!fs.existsSync(filePath)) {
                throw new common_1.BadRequestException('File not found');
            }
            return fs.readFileSync(filePath);
        }
        catch (error) {
            this.logger.error('File retrieval failed:', error);
            throw new common_1.BadRequestException(`File retrieval failed: ${error.message}`);
        }
    }
    validateFile(file) {
        if (file.size > this.maxFileSize) {
            throw new common_1.BadRequestException(`File size exceeds maximum allowed size of ${this.maxFileSize} bytes`);
        }
        if (!this.allowedMimeTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`File type ${file.mimetype} is not allowed`);
        }
        if (this.isMaliciousFile(file)) {
            throw new common_1.BadRequestException('File appears to be malicious');
        }
    }
    isMaliciousFile(file) {
        const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.vbs', '.js'];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        if (dangerousExtensions.includes(fileExtension)) {
            return true;
        }
        const suspiciousSignatures = [
            Buffer.from('MZ'),
            Buffer.from('PK\x03\x04'),
        ];
        for (const signature of suspiciousSignatures) {
            if (file.buffer.subarray(0, signature.length).equals(signature)) {
                if (signature.equals(Buffer.from('PK\x03\x04'))) {
                    continue;
                }
                return true;
            }
        }
        return false;
    }
    calculateFileHash(buffer) {
        return crypto.createHash('sha256').update(buffer).digest('hex');
    }
    getMimeType(buffer) {
        if (buffer.subarray(0, 4).equals(Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]))) {
            return 'image/jpeg';
        }
        if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) {
            return 'image/png';
        }
        if (buffer.subarray(0, 4).equals(Buffer.from([0x25, 0x50, 0x44, 0x46]))) {
            return 'application/pdf';
        }
        return 'application/octet-stream';
    }
    getFileType(mimeType) {
        if (mimeType.startsWith('image/')) {
            return 'image';
        }
        if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
            return 'document';
        }
        return 'other';
    }
    async analyzeImage(buffer) {
        try {
            const hasGPS = Math.random() > 0.5;
            if (hasGPS) {
                return {
                    gpsData: {
                        lat: -1.2921 + (Math.random() - 0.5) * 0.1,
                        lng: 36.8219 + (Math.random() - 0.5) * 0.1,
                        timestamp: new Date(),
                    },
                    metadata: {
                        width: 1920,
                        height: 1080,
                        camera: 'iPhone 12',
                        timestamp: new Date(),
                    },
                    confidence: 0.85,
                };
            }
            return {
                metadata: {
                    width: 1920,
                    height: 1080,
                    timestamp: new Date(),
                },
                confidence: 0.7,
            };
        }
        catch (error) {
            this.logger.error('Image analysis failed:', error);
            return { confidence: 0 };
        }
    }
    async analyzeDocument(buffer, mimeType) {
        try {
            let extractedText = '';
            if (mimeType === 'application/pdf') {
                extractedText = 'Mock extracted text from PDF document. This would contain the actual text content extracted using pdf-parse library.';
            }
            else if (mimeType.includes('word') || mimeType.includes('document')) {
                extractedText = 'Mock extracted text from Word document. This would contain the actual text content extracted using mammoth library.';
            }
            else if (mimeType === 'text/plain') {
                extractedText = buffer.toString('utf-8');
            }
            return {
                extractedText,
                metadata: {
                    pageCount: Math.floor(Math.random() * 10) + 1,
                    wordCount: extractedText.split(' ').length,
                    language: 'en',
                    timestamp: new Date(),
                },
                confidence: extractedText ? 0.9 : 0.3,
            };
        }
        catch (error) {
            this.logger.error('Document analysis failed:', error);
            return { confidence: 0 };
        }
    }
    getUploadStats() {
        try {
            const files = fs.readdirSync(this.uploadDir);
            let totalSize = 0;
            for (const file of files) {
                const filePath = path.join(this.uploadDir, file);
                const stats = fs.statSync(filePath);
                totalSize += stats.size;
            }
            return {
                totalFiles: files.length,
                totalSize,
                averageSize: files.length > 0 ? totalSize / files.length : 0,
            };
        }
        catch (error) {
            this.logger.error('Failed to get upload stats:', error);
            return { totalFiles: 0, totalSize: 0, averageSize: 0 };
        }
    }
    cleanupOldFiles(maxAge = 30 * 24 * 60 * 60 * 1000) {
        try {
            const files = fs.readdirSync(this.uploadDir);
            const now = Date.now();
            for (const file of files) {
                const filePath = path.join(this.uploadDir, file);
                const stats = fs.statSync(filePath);
                if (now - stats.mtime.getTime() > maxAge) {
                    fs.unlinkSync(filePath);
                    this.logger.log(`Cleaned up old file: ${file}`);
                }
            }
        }
        catch (error) {
            this.logger.error('File cleanup failed:', error);
        }
    }
};
exports.FileUploadService = FileUploadService;
exports.FileUploadService = FileUploadService = FileUploadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        hedera_service_1.HederaService,
        google_drive_service_1.GoogleDriveService])
], FileUploadService);
//# sourceMappingURL=file-upload.service.js.map