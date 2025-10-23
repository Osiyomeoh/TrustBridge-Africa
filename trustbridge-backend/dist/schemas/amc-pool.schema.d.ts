import { Document } from 'mongoose';
export type AMCPoolDocument = AMCPool & Document;
export declare enum PoolStatus {
    DRAFT = "DRAFT",
    ACTIVE = "ACTIVE",
    CLOSED = "CLOSED",
    MATURED = "MATURED",
    SUSPENDED = "SUSPENDED"
}
export declare enum PoolType {
    REAL_ESTATE = "REAL_ESTATE",
    AGRICULTURAL = "AGRICULTURAL",
    COMMODITIES = "COMMODITIES",
    MIXED = "MIXED"
}
export declare class PoolAsset {
    assetId: string;
    name: string;
    value: number;
    percentage: number;
    isActive: boolean;
}
export declare class PoolInvestment {
    investorId: string;
    investorAddress: string;
    amount: number;
    tokens: number;
    tokenPrice: number;
    investedAt: Date;
    dividendsReceived: number;
    isActive: boolean;
}
export declare class DividendDistribution {
    amount: number;
    perToken: number;
    distributedAt: Date;
    description: string;
    transactionHash: string;
}
export declare class AMCPool {
    poolId: string;
    name: string;
    description: string;
    createdBy: string;
    createdByName: string;
    type: PoolType;
    status: PoolStatus;
    assets: PoolAsset[];
    totalValue: number;
    tokenSupply: number;
    tokenPrice: number;
    minimumInvestment: number;
    expectedAPY: number;
    maturityDate: Date;
    totalInvested: number;
    totalInvestors: number;
    investments: PoolInvestment[];
    dividends: DividendDistribution[];
    totalDividendsDistributed: number;
    hederaTokenId: string;
    hederaContractId: string;
    imageURI: string;
    documentURI: string;
    riskFactors: string[];
    terms: string[];
    isTradeable: boolean;
    tradingVolume: number;
    currentPrice: number;
    priceChange24h: number;
    operations: string[];
    metadata: {
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
        liquidity: 'HIGH' | 'MEDIUM' | 'LOW';
        diversification: number;
        geographicDistribution: string[];
        sectorDistribution: {
            [key: string]: number;
        };
    };
    launchedAt: Date;
    closedAt: Date;
    maturedAt: Date;
}
export declare const AMCPoolSchema: import("mongoose").Schema<AMCPool, import("mongoose").Model<AMCPool, any, any, any, Document<unknown, any, AMCPool, any, {}> & AMCPool & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AMCPool, Document<unknown, {}, import("mongoose").FlatRecord<AMCPool>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<AMCPool> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
