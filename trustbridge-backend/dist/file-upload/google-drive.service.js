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
var GoogleDriveService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleDriveService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const googleapis_1 = require("googleapis");
const fs = __importStar(require("fs"));
let GoogleDriveService = GoogleDriveService_1 = class GoogleDriveService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(GoogleDriveService_1.name);
        this.initializeDrive();
    }
    async initializeDrive() {
        try {
            const clientId = this.configService.get('GOOGLE_DRIVE_CLIENT_ID');
            const clientSecret = this.configService.get('GOOGLE_DRIVE_CLIENT_SECRET');
            const refreshToken = this.configService.get('GOOGLE_DRIVE_REFRESH_TOKEN');
            this.folderId = this.configService.get('GOOGLE_DRIVE_FOLDER_ID');
            if (!clientId || !clientSecret || !refreshToken) {
                this.logger.warn('Google Drive credentials not configured, using local storage');
                return;
            }
            const oauth2Client = new googleapis_1.google.auth.OAuth2(clientId, clientSecret);
            oauth2Client.setCredentials({ refresh_token: refreshToken });
            this.drive = googleapis_1.google.drive({ version: 'v3', auth: oauth2Client });
            this.logger.log('Google Drive service initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize Google Drive service:', error);
        }
    }
    async uploadFile(filePath, fileName, mimeType, metadata) {
        try {
            if (!this.drive) {
                throw new Error('Google Drive service not initialized');
            }
            const fileMetadata = {
                name: fileName,
                parents: this.folderId ? [this.folderId] : undefined,
                ...metadata,
            };
            const media = {
                mimeType,
                body: fs.createReadStream(filePath),
            };
            const response = await this.drive.files.create({
                resource: fileMetadata,
                media,
                fields: 'id,name,mimeType,size,webViewLink,webContentLink,createdTime,modifiedTime',
            });
            const file = response.data;
            this.logger.log(`File uploaded to Google Drive: ${file.name} (ID: ${file.id})`);
            return {
                id: file.id,
                name: file.name,
                mimeType: file.mimeType,
                size: parseInt(file.size) || 0,
                webViewLink: file.webViewLink,
                webContentLink: file.webContentLink,
                createdTime: file.createdTime,
                modifiedTime: file.modifiedTime,
            };
        }
        catch (error) {
            this.logger.error('Failed to upload file to Google Drive:', error);
            throw new Error(`Google Drive upload failed: ${error.message}`);
        }
    }
    async downloadFile(fileId, outputPath) {
        try {
            if (!this.drive) {
                throw new Error('Google Drive service not initialized');
            }
            const response = await this.drive.files.get({
                fileId,
                alt: 'media',
            }, { responseType: 'stream' });
            const writeStream = fs.createWriteStream(outputPath);
            response.data.pipe(writeStream);
            return new Promise((resolve, reject) => {
                writeStream.on('finish', () => {
                    this.logger.log(`File downloaded from Google Drive: ${outputPath}`);
                    resolve();
                });
                writeStream.on('error', reject);
            });
        }
        catch (error) {
            this.logger.error('Failed to download file from Google Drive:', error);
            throw new Error(`Google Drive download failed: ${error.message}`);
        }
    }
    async deleteFile(fileId) {
        try {
            if (!this.drive) {
                throw new Error('Google Drive service not initialized');
            }
            await this.drive.files.delete({ fileId });
            this.logger.log(`File deleted from Google Drive: ${fileId}`);
        }
        catch (error) {
            this.logger.error('Failed to delete file from Google Drive:', error);
            throw new Error(`Google Drive delete failed: ${error.message}`);
        }
    }
    async getFileInfo(fileId) {
        try {
            if (!this.drive) {
                throw new Error('Google Drive service not initialized');
            }
            const response = await this.drive.files.get({
                fileId,
                fields: 'id,name,mimeType,size,webViewLink,webContentLink,createdTime,modifiedTime',
            });
            const file = response.data;
            return {
                id: file.id,
                name: file.name,
                mimeType: file.mimeType,
                size: parseInt(file.size) || 0,
                webViewLink: file.webViewLink,
                webContentLink: file.webContentLink,
                createdTime: file.createdTime,
                modifiedTime: file.modifiedTime,
            };
        }
        catch (error) {
            this.logger.error('Failed to get file info from Google Drive:', error);
            throw new Error(`Google Drive get file info failed: ${error.message}`);
        }
    }
    async listFiles(query) {
        try {
            if (!this.drive) {
                throw new Error('Google Drive service not initialized');
            }
            const q = query || `'${this.folderId}' in parents`;
            const response = await this.drive.files.list({
                q,
                fields: 'files(id,name,mimeType,size,webViewLink,webContentLink,createdTime,modifiedTime)',
            });
            return response.data.files.map(file => ({
                id: file.id,
                name: file.name,
                mimeType: file.mimeType,
                size: parseInt(file.size) || 0,
                webViewLink: file.webViewLink,
                webContentLink: file.webContentLink,
                createdTime: file.createdTime,
                modifiedTime: file.modifiedTime,
            }));
        }
        catch (error) {
            this.logger.error('Failed to list files from Google Drive:', error);
            throw new Error(`Google Drive list files failed: ${error.message}`);
        }
    }
    async createFolder(folderName, parentFolderId) {
        try {
            if (!this.drive) {
                throw new Error('Google Drive service not initialized');
            }
            const fileMetadata = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: parentFolderId ? [parentFolderId] : this.folderId ? [this.folderId] : undefined,
            };
            const response = await this.drive.files.create({
                resource: fileMetadata,
                fields: 'id',
            });
            this.logger.log(`Folder created in Google Drive: ${folderName} (ID: ${response.data.id})`);
            return response.data.id;
        }
        catch (error) {
            this.logger.error('Failed to create folder in Google Drive:', error);
            throw new Error(`Google Drive create folder failed: ${error.message}`);
        }
    }
    isAvailable() {
        return !!this.drive;
    }
};
exports.GoogleDriveService = GoogleDriveService;
exports.GoogleDriveService = GoogleDriveService = GoogleDriveService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GoogleDriveService);
//# sourceMappingURL=google-drive.service.js.map