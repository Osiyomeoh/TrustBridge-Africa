import { KycService } from './kyc.service';
export declare class KycController {
    private readonly kycService;
    constructor(kycService: KycService);
    startKYC(req: any): Promise<{
        success: boolean;
        data: {
            inquiryId: any;
            inquiryUrl: any;
            status: string;
            provider: string;
            sessionToken: any;
        };
        message: string;
    }>;
    checkKYCStatus(inquiryId: string): Promise<{
        success: boolean;
        data: {
            status: "pending" | "in_progress" | "approved" | "rejected" | "not_started";
            diditStatus: any;
            inquiryId: any;
            completedAt: any;
        };
        message: string;
    }>;
    getKYCInquiry(inquiryId: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    handleWebhook(req: any): Promise<{
        success: boolean;
        data: {
            processed: boolean;
        };
        message: string;
    }>;
}
