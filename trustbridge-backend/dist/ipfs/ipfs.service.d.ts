import { ConfigService } from '@nestjs/config';
export interface IPFSFileMetadata {
    name?: string;
    description?: string;
    location?: string;
    [key: string]: any;
}
export interface IPFSUploadResult {
    cid: string;
    ipfsUrl: string;
    pinSize: number;
    timestamp: string;
}
export interface IPFSPresignedUrlResult {
    presignedUrl: string;
    fields: Record<string, string>;
    cid?: string;
    ipfsUrl?: string;
}
export declare class IPFSService {
    private configService;
    private readonly logger;
    private readonly pinataApiKey;
    private readonly pinataSecretKey;
    private readonly pinataJwt;
    private readonly pinataGatewayUrl;
    constructor(configService: ConfigService);
    generatePresignedUrl(fileName: string, fileType: string, metadata?: IPFSFileMetadata): Promise<IPFSPresignedUrlResult>;
    uploadFile(file: Buffer, fileName: string, fileType: string, metadata?: IPFSFileMetadata): Promise<IPFSUploadResult>;
    pinFile(cid: string, name?: string): Promise<IPFSUploadResult>;
    unpinFile(cid: string): Promise<boolean>;
    getFile(cid: string): Promise<Buffer>;
    getFileMetadata(cid: string): Promise<any>;
    listFiles(): Promise<any[]>;
    getIPFSUrl(cid: string): string;
}
