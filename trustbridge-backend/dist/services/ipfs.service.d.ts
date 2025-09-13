import { ConfigService } from '@nestjs/config';
export interface IPFSFileMetadata {
    name: string;
    type: string;
    size: number;
    description?: string;
    category?: string;
    tags?: string[];
}
export interface IPFSUploadResult {
    cid: string;
    ipfsUrl: string;
    pinSize: number;
    timestamp: string;
}
export interface PresignedUrlResponse {
    url: string;
    fields: Record<string, string>;
}
export declare class IPFSService {
    private configService;
    private readonly logger;
    private readonly pinataApiKey;
    private readonly pinataSecretKey;
    private readonly pinataGateway;
    constructor(configService: ConfigService);
    generatePresignedUrl(fileName: string, fileSize: number, fileType: string, metadata?: IPFSFileMetadata): Promise<PresignedUrlResponse>;
    uploadFile(file: Express.Multer.File, metadata?: IPFSFileMetadata): Promise<IPFSUploadResult>;
    uploadFileFromBuffer(buffer: Buffer, fileName: string, mimeType: string, metadata?: IPFSFileMetadata): Promise<IPFSUploadResult>;
    pinFile(cid: string, metadata?: IPFSFileMetadata): Promise<boolean>;
    unpinFile(cid: string): Promise<boolean>;
    getFileMetadata(cid: string): Promise<IPFSFileMetadata | null>;
    listPinnedFiles(): Promise<IPFSUploadResult[]>;
    getFileUrl(cid: string): string;
    validateFile(file: Express.Multer.File, maxSize?: number): {
        valid: boolean;
        error?: string;
    };
}
