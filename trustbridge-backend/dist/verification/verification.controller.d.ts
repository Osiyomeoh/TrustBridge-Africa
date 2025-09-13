import { VerificationService } from './verification.service';
import { SubmitVerificationDto } from './dto/submit-verification.dto';
import { IPFSService } from '../services/ipfs.service';
export declare class AttestationDataDto {
    confidence: number;
    comments: string;
    evidence: any;
}
export declare class SubmitAttestationDto {
    verificationId: string;
    attestorId: string;
    attestation: AttestationDataDto;
}
export declare class IPFSFileDto {
    cid: string;
    ipfsUrl: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    description?: string;
    category?: string;
}
export declare class SubmitVerificationWithFilesDto {
    assetId: string;
    description: string;
    documents: IPFSFileDto[];
    photos: IPFSFileDto[];
    evidence: any;
}
export declare class VerificationController {
    private readonly verificationService;
    private readonly ipfsService;
    constructor(verificationService: VerificationService, ipfsService: IPFSService);
    getAllVerifications(): Promise<{
        success: boolean;
        data: import("../schemas/verification-request.schema").VerificationRequest[];
        message: string;
    }>;
    getVerificationStatus(assetId: string): Promise<{
        success: boolean;
        data: import("../schemas/verification-request.schema").VerificationRequest;
        message: string;
    }>;
    getVerificationById(id: string): Promise<{
        success: boolean;
        data: import("../schemas/verification-request.schema").VerificationRequest;
        message: string;
    }>;
    submitVerification(submitVerificationDto: SubmitVerificationDto): Promise<{
        success: boolean;
        data: import("../schemas/verification-request.schema").VerificationRequest;
        message: string;
    }>;
    submitAttestation(submitAttestationDto: SubmitAttestationDto): Promise<{
        success: boolean;
        message: string;
    }>;
    submitVerificationWithFiles(submitDto: SubmitVerificationWithFilesDto): Promise<{
        success: boolean;
        data: import("../schemas/verification-request.schema").VerificationRequest;
        message: string;
    }>;
    uploadDocument(file: Express.Multer.File, body: {
        category?: string;
        description?: string;
        tags?: string;
    }): Promise<{
        success: boolean;
        data: import("../services/ipfs.service").IPFSUploadResult;
        message: string;
    }>;
    uploadPhoto(file: Express.Multer.File, body: {
        description?: string;
        tags?: string;
    }): Promise<{
        success: boolean;
        data: import("../services/ipfs.service").IPFSUploadResult;
        message: string;
    }>;
}
