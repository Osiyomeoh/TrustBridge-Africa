import mongoose, { Document } from 'mongoose';
export declare enum ClaimStatus {
    SUBMITTED = "SUBMITTED",
    UNDER_REVIEW = "UNDER_REVIEW",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    PAID = "PAID"
}
export declare enum ClaimType {
    ASSET_LOSS = "ASSET_LOSS",
    QUALITY_DEFECT = "QUALITY_DEFECT",
    DELIVERY_FAILURE = "DELIVERY_FAILURE",
    FRAUD = "FRAUD",
    NATURAL_DISASTER = "NATURAL_DISASTER"
}
export interface InsuranceClaimDocument extends Document {
    id: string;
    assetId: string;
    claimant: string;
    type: ClaimType;
    status: ClaimStatus;
    description: string;
    claimAmount: number;
    evidence: Array<{
        type: string;
        hash: string;
        description: string;
    }>;
    investigation: {
        investigator?: string;
        findings?: string;
        recommendedAction?: string;
        completedAt?: Date;
    };
    resolution: {
        approved: boolean;
        payoutAmount?: number;
        reason?: string;
        resolvedBy?: string;
        resolvedAt?: Date;
        transactionHash?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const InsuranceClaimModel: mongoose.Model<InsuranceClaimDocument, {}, {}, {}, mongoose.Document<unknown, {}, InsuranceClaimDocument, {}, {}> & InsuranceClaimDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
