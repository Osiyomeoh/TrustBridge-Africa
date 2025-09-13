import { SmartVerificationService } from './smart-verification.service';
export declare class SmartVerificationRequestDto {
    assetId: string;
    evidence: any;
}
export declare class SmartVerificationController {
    private readonly smartVerificationService;
    constructor(smartVerificationService: SmartVerificationService);
    processSmartVerification(request: SmartVerificationRequestDto): Promise<{
        success: boolean;
        data: import("./smart-verification.service").SmartVerificationResult;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    getVerificationStatus(assetId: string): Promise<{
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
    getVerificationTiers(): Promise<{
        success: boolean;
        data: {
            name: string;
            maxAssetValue: number;
            maxProcessingTime: number;
            requiresManualReview: boolean;
            confidenceThreshold: number;
            description: string;
            benefits: string[];
        }[];
        message: string;
    }>;
}
