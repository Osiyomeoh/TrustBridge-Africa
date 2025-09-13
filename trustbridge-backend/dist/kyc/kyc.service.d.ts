import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
export declare class KycService {
    private userModel;
    private readonly logger;
    private readonly personaApiKey;
    private readonly personaEnvironment;
    private readonly personaBaseUrl;
    constructor(userModel: Model<User>);
    startKYC(userId: string): Promise<{
        inquiryId: any;
        inquiryUrl: any;
        status: string;
    }>;
    checkKYCStatus(inquiryId: string): Promise<{
        status: "approved" | "rejected" | "pending" | "in_progress";
        personaStatus: any;
        inquiryId: any;
        completedAt: any;
    }>;
    getKYCInquiry(inquiryId: string): Promise<any>;
    handleWebhook(webhookData: any): Promise<{
        processed: boolean;
    }>;
    private getCountryCode;
}
