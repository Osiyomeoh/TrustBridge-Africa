import { Document } from 'mongoose';
export type UserDocument = User & Document;
export declare enum UserRole {
    INVESTOR = "INVESTOR",
    ASSET_OWNER = "ASSET_OWNER",
    VERIFIER = "VERIFIER",
    ADMIN = "ADMIN"
}
export declare enum KycStatus {
    PENDING = "PENDING",
    VERIFIED = "VERIFIED",
    REJECTED = "REJECTED"
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
    emailVerificationStatus: EmailVerificationStatus;
    reputation: number;
    stakingBalance: number;
    stakingRewards: number;
    totalInvested: number;
    investmentCount: number;
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
