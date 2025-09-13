import { ConfigService } from '@nestjs/config';
export interface IPFSUploadResult {
    cid: string;
    ipfsUrl: string;
    pinSize: number;
    timestamp: string;
}
export interface IPFSFileMetadata {
    name: string;
    type: string;
    size: number;
    description?: string;
    category?: string;
    tags?: string[];
}
export declare class IPFSService {
    private configService;
    private readonly logger;
    private readonly pinataApiKey;
    private readonly pinataSecretKey;
    private readonly pinataJwt;
    private readonly pinataGatewayUrl;
    constructor(configService: ConfigService);
    generatePresignedUrl(fileName: string, fileSize: number, fileType: string, metadata?: IPFSFileMetadata): Promise<{
        url: string;
        fields: Record<string, string>;
    }>;
    uploadFile(file: Buffer, fileName: string, fileType: string, metadata?: IPFSFileMetadata): Promise<IPFSUploadResult>;
    pinFile(cid: string, metadata?: IPFSFileMetadata): Promise<boolean>;
    unpinFile(cid: string): Promise<boolean>;
    getFileMetadata(cid: string): Promise<IPFSFileMetadata | null>;
    listPinnedFiles(): Promise<IPFSUploadResult[]>;
    getFileUrl(cid: string): string;
    validateFile(file: Buffer, maxSize?: number): {
        valid: boolean;
        error?: string;
    };
}
