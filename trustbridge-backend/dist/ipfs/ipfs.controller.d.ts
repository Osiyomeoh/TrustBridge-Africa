import { IPFSService, IPFSUploadResult, IPFSFileMetadata } from './ipfs.service';
import { Response } from 'express';
export declare class PresignedUrlRequestDto {
    fileName: string;
    fileSize: number;
    fileType: string;
    metadata?: IPFSFileMetadata;
}
export declare class PinFileRequestDto {
    cid: string;
    metadata?: IPFSFileMetadata;
}
export declare class IPFSController {
    private readonly ipfsService;
    constructor(ipfsService: IPFSService);
    generatePresignedUrl(request: PresignedUrlRequestDto): Promise<{
        success: boolean;
        data: import("./ipfs.service").IPFSPresignedUrlResult;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    uploadFile(file: Express.Multer.File, fileName: string, fileType: string, metadata?: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        data: IPFSUploadResult;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    pinFile(request: PinFileRequestDto): Promise<{
        success: boolean;
        data: IPFSUploadResult;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    unpinFile(cid: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
    }>;
    getFile(cid: string, res: Response): Promise<void>;
    getFileMetadata(cid: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        data: any;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    listPinnedFiles(): Promise<{
        success: boolean;
        data: any[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    getFileUrl(cid: string): Promise<{
        success: boolean;
        data: {
            url: string;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
}
