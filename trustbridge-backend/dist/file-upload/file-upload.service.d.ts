import { ConfigService } from '@nestjs/config';
import { HederaService } from '../hedera/hedera.service';
import { GoogleDriveService } from './google-drive.service';
export interface UploadedFile {
    id: string;
    originalName: string;
    fileName: string;
    mimeType: string;
    size: number;
    hash: string;
    uploadedAt: Date;
    hfsFileId?: string;
    url?: string;
}
export interface FileAnalysis {
    type: 'document' | 'image' | 'other';
    extractedText?: string;
    gpsData?: {
        lat: number;
        lng: number;
        timestamp?: Date;
    };
    metadata?: any;
    isValid: boolean;
    confidence: number;
}
export declare class FileUploadService {
    private configService;
    private hederaService;
    private googleDriveService;
    private readonly logger;
    private readonly uploadDir;
    private readonly maxFileSize;
    private readonly allowedMimeTypes;
    constructor(configService: ConfigService, hederaService: HederaService, googleDriveService: GoogleDriveService);
    private ensureUploadDir;
    uploadFile(file: Express.Multer.File, assetId: string, fileType: 'document' | 'photo' | 'evidence'): Promise<UploadedFile>;
    uploadMultipleFiles(files: Express.Multer.File[], assetId: string, fileType: 'documents' | 'photos' | 'evidence'): Promise<UploadedFile[]>;
    analyzeFile(fileId: string): Promise<FileAnalysis>;
    deleteFile(fileId: string): Promise<void>;
    getFile(fileId: string): Promise<Buffer>;
    private validateFile;
    private isMaliciousFile;
    private calculateFileHash;
    private getMimeType;
    private getFileType;
    private analyzeImage;
    private analyzeDocument;
    getUploadStats(): {
        totalFiles: number;
        totalSize: number;
        averageSize: number;
    };
    cleanupOldFiles(maxAge?: number): void;
}
