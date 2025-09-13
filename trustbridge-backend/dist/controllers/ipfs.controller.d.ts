import { IPFSService, IPFSFileMetadata, IPFSUploadResult, PresignedUrlResponse } from '../services/ipfs.service';
export declare class IPFSController {
    private readonly ipfsService;
    private readonly logger;
    constructor(ipfsService: IPFSService);
    generatePresignedUrl(body: {
        fileName: string;
        fileSize: number;
        fileType: string;
        metadata?: IPFSFileMetadata;
    }): Promise<PresignedUrlResponse>;
    uploadFile(file: Express.Multer.File, body: {
        category?: string;
        description?: string;
        tags?: string;
    }): Promise<IPFSUploadResult>;
    getFile(cid: string): Promise<Buffer>;
    pinFile(body: {
        cid: string;
        metadata?: IPFSFileMetadata;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    unpinFile(cid: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getFileMetadata(cid: string): Promise<IPFSFileMetadata | null>;
    listPinnedFiles(): Promise<IPFSUploadResult[]>;
    getFileUrl(cid: string): Promise<{
        url: string;
    }>;
}
