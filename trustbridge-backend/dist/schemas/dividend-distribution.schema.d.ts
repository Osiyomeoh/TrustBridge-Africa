import { Document } from 'mongoose';
export type DividendDistributionDocument = DividendDistribution & Document;
export declare enum DividendStatus {
    PENDING = "PENDING",
    DISTRIBUTING = "DISTRIBUTING",
    DISTRIBUTED = "DISTRIBUTED",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED"
}
export declare enum DividendType {
    REGULAR = "REGULAR",
    SPECIAL = "SPECIAL",
    BONUS = "BONUS",
    FINAL = "FINAL",
    INTERIM = "INTERIM"
}
export declare class DividendRecipient {
    holderAddress: string;
    tokenAmount: number;
    dividendAmount: number;
    perTokenRate: number;
    isClaimed: boolean;
    claimedAt: Date;
    claimTransactionHash: string;
    hederaTransactionId: string;
}
export declare class DividendDistribution {
    distributionId: string;
    poolId: string;
    poolName: string;
    createdBy: string;
    dividendType: DividendType;
    status: DividendStatus;
    totalDividendAmount: number;
    perTokenRate: number;
    totalTokensEligible: number;
    totalRecipients: number;
    distributionDate: Date;
    recordDate: Date;
    description: string;
    sourceOfFunds: string;
    transactionHash: string;
    hederaTransactionId: string;
    recipients: DividendRecipient[];
    totalClaimed: number;
    totalUnclaimed: number;
    claimCount: number;
    distributedAt: Date;
    completedAt: Date;
    cancelledAt: Date;
    failureReason: string;
    distributionFees: number;
    gasFees: number;
    metadata: {
        previousDividendId: string;
        dividendYield: number;
        payoutRatio: number;
        frequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY' | 'SPECIAL';
        taxWithholding: number;
        currency: string;
        exchangeRate: number;
    };
    auditTrail: {
        action: string;
        timestamp: Date;
        performedBy: string;
        details: string;
    }[];
}
export declare const DividendDistributionSchema: import("mongoose").Schema<DividendDistribution, import("mongoose").Model<DividendDistribution, any, any, any, Document<unknown, any, DividendDistribution, any, {}> & DividendDistribution & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, DividendDistribution, Document<unknown, {}, import("mongoose").FlatRecord<DividendDistribution>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<DividendDistribution> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
