import { Response } from 'express';
import { FileUploadService, UploadedFile as UploadedFileType } from './file-upload.service';
export declare class FileUploadController {
    private readonly fileUploadService;
    constructor(fileUploadService: FileUploadService);
    uploadFile(assetId: string, fileType: 'document' | 'photo' | 'evidence', file: Express.Multer.File): Promise<{
        success: boolean;
        data: UploadedFileType;
        message: string;
    }>;
    uploadMultipleFiles(assetId: string, fileType: 'documents' | 'photos' | 'evidence', files: Express.Multer.File[]): Promise<{
        success: boolean;
        data: UploadedFileType[];
        message: string;
    }>;
    analyzeFile(fileId: string): Promise<{
        success: boolean;
        data: import("./file-upload.service").FileAnalysis;
        message: string;
    }>;
    downloadFile(fileId: string, res: Response): Promise<void>;
    viewFile(fileId: string, res: Response): Promise<void>;
    deleteFile(fileId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getUploadStats(): Promise<{
        success: boolean;
        data: {
            totalFiles: number;
            totalSize: number;
            averageSize: number;
        };
        message: string;
    }>;
    cleanupOldFiles(): Promise<{
        success: boolean;
        message: string;
    }>;
    private getContentType;
}
