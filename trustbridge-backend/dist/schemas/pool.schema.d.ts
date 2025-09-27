import { Document } from 'mongoose';
export type PoolDocument = Pool & Document;
export declare enum PoolStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    PAUSED = "paused",
    CLOSED = "closed",
    MATURED = "matured"
}
export declare enum PoolRiskLevel {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high"
}
export declare enum TrancheType {
    SENIOR = "senior",
    JUNIOR = "junior"
}
export declare class Pool {
    poolId: string;
    name: string;
    description: string;
    manager: string;
    managerName: string;
    managerEmail: string;
    strategy: string;
    assetIds: string[];
    totalValue: number;
    dropTokens: number;
    tinTokens: number;
    dropTokenPrice: number;
    tinTokenPrice: number;
    targetAPY: number;
    actualAPY: number;
    riskLevel: PoolRiskLevel;
    status: PoolStatus;
    minimumInvestment: number;
    maximumInvestment: number;
    lockupPeriod: number;
    maturityDate: Date;
    totalInvestors: number;
    totalInvested: number;
    dropTokenContract: string;
    tinTokenContract: string;
    poolContract: string;
    performanceMetrics: {
        totalReturn: number;
        monthlyReturn: number;
        volatility: number;
        sharpeRatio: number;
        maxDrawdown: number;
    };
    feeStructure: {
        managementFee: number;
        performanceFee: number;
        entryFee: number;
        exitFee: number;
    };
    investors: Array<{
        address: string;
        amount: number;
        dropTokens: number;
        tinTokens: number;
        entryDate: Date;
        lastUpdate: Date;
    }>;
    distributions: Array<{
        date: Date;
        amount: number;
        dropAmount: number;
        tinAmount: number;
        type: 'dividend' | 'capital_gain' | 'interest';
    }>;
    compliance: {
        jurisdiction: string;
        regulatoryStatus: string;
        kycRequired: boolean;
        accreditationRequired: boolean;
        minimumInvestment: number;
    };
    tags: string[];
    metadata: {
        website: string;
        whitepaper: string;
        socialMedia: {
            twitter: string;
            linkedin: string;
            telegram: string;
        };
        documents: Array<{
            name: string;
            url: string;
            type: string;
        }>;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const PoolSchema: import("mongoose").Schema<Pool, import("mongoose").Model<Pool, any, any, any, Document<unknown, any, Pool, any, {}> & Pool & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Pool, Document<unknown, {}, import("mongoose").FlatRecord<Pool>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Pool> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
