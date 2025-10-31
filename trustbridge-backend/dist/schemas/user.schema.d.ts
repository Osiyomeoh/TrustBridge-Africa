import { Document } from 'mongoose';
export type UserDocument = User & Document;
export declare enum UserRole {
    INVESTOR = "INVESTOR",
    ASSET_OWNER = "ASSET_OWNER",
    VERIFIER = "VERIFIER",
    ADMIN = "ADMIN",
    SUPER_ADMIN = "SUPER_ADMIN",
    PLATFORM_ADMIN = "PLATFORM_ADMIN",
    AMC_ADMIN = "AMC_ADMIN"
}
export declare enum KycStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    VERIFIED = "approved",
    REJECTED = "rejected",
    NOT_STARTED = "not_started"
}
export declare enum EmailVerificationStatus {
    PENDING = "PENDING",
    VERIFIED = "VERIFIED",
    NOT_VERIFIED = "NOT_VERIFIED"
}
export declare class User {
    walletAddress: string;
    email?: string;
    name?: string;
    phone?: string;
    country?: string;
    role: UserRole;
    kycStatus: KycStatus;
    kycInquiryId?: string;
    kycProvider?: string;
    emailVerificationStatus: EmailVerificationStatus;
    reputation: number;
    stakingBalance: number;
    stakingRewards: number;
    totalInvested: number;
    investmentCount: number;
    trustTokenBalance: number;
    aiUsage?: {
        daily: Record<string, number>;
        monthly: Record<string, number>;
        totalQueries: number;
    };
    lastInvestmentDate?: Date;
    lastActivity?: Date;
    region?: string;
    password?: string;
    lastLoginAt?: Date;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    emailVerificationToken?: string;
    emailVerificationExpires?: Date;
    profile?: {
        bio?: string;
        avatar?: string;
        website?: string;
        socialLinks?: {
            twitter?: string;
            linkedin?: string;
            github?: string;
        };
    };
    pinHash?: string;
    pinAttempts?: number;
    pinLockedUntil?: Date;
    lastPinSetAt?: Date;
    otpCode?: string;
    otpExpiresAt?: Date;
    otpAttempts?: number;
    hederaAccountId?: string;
    hederaPublicKey?: string;
    hederaPrivateKey?: string;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any, {}> & User & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<User> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
