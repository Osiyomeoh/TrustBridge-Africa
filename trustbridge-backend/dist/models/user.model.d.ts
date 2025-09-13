import mongoose, { Document } from 'mongoose';
export declare enum UserRole {
    INVESTOR = "INVESTOR",
    ASSET_OWNER = "ASSET_OWNER",
    OPERATOR = "OPERATOR",
    VERIFIER = "VERIFIER",
    ADMIN = "ADMIN"
}
export declare enum KYCStatus {
    PENDING = "PENDING",
    VERIFIED = "VERIFIED",
    REJECTED = "REJECTED"
}
export interface UserDocument extends Document {
    walletAddress: string;
    role: UserRole;
    kycStatus: KYCStatus;
    kycInquiryId?: string;
    reputation: number;
    stakingBalance: string;
    stakingRewards: number;
    stakingTimestamp?: Date;
    lockPeriod?: number;
    profile: {
        name?: string;
        email?: string;
        country?: string;
        phoneNumber?: string;
    };
    kycData?: {
        documents: Array<{
            type: string;
            hash: string;
            verified: boolean;
        }>;
        verificationDate?: Date;
        verifier?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const UserModel: mongoose.Model<UserDocument, {}, {}, {}, mongoose.Document<unknown, {}, UserDocument, {}, {}> & UserDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
