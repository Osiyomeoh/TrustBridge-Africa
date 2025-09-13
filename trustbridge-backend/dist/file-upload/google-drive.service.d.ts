import { ConfigService } from '@nestjs/config';
export interface GoogleDriveFile {
    id: string;
    name: string;
    mimeType: string;
    size: number;
    webViewLink: string;
    webContentLink: string;
    createdTime: string;
    modifiedTime: string;
}
export declare class GoogleDriveService {
    private configService;
    private readonly logger;
    private drive;
    private folderId;
    constructor(configService: ConfigService);
    private initializeDrive;
    uploadFile(filePath: string, fileName: string, mimeType: string, metadata?: any): Promise<GoogleDriveFile>;
    downloadFile(fileId: string, outputPath: string): Promise<void>;
    deleteFile(fileId: string): Promise<void>;
    getFileInfo(fileId: string): Promise<GoogleDriveFile>;
    listFiles(query?: string): Promise<GoogleDriveFile[]>;
    createFolder(folderName: string, parentFolderId?: string): Promise<string>;
    isAvailable(): boolean;
}
