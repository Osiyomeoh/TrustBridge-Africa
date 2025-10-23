import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
export declare class KycService {
    private userModel;
    private readonly logger;
    private readonly diditApiKey;
    private readonly diditWorkflowId;
    private readonly diditBaseUrl;
    constructor(userModel: Model<User>);
    startKYC(userId: string): Promise<{
        inquiryId: any;
        inquiryUrl: any;
        status: string;
        provider: string;
        sessionToken: any;
    }>;
    checkKYCStatus(inquiryId: string): Promise<{
        status: "pending" | "in_progress" | "approved" | "rejected" | "not_started";
        diditStatus: any;
        inquiryId: any;
        completedAt: any;
    }>;
    getKYCInquiry(inquiryId: string): Promise<any>;
    private getCountryCode;
    handleWebhook(webhookData: any): Promise<{
        processed: boolean;
    }>;
}
