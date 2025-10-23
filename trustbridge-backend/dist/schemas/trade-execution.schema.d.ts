import { Document } from 'mongoose';
export type TradeExecutionDocument = TradeExecution & Document;
export declare enum TradeStatus {
    PENDING = "PENDING",
    EXECUTED = "EXECUTED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED"
}
export declare class TradeExecution {
    tradeId: string;
    poolId: string;
    poolTokenId: string;
    buyOrderId: string;
    sellOrderId: string;
    buyerAddress: string;
    sellerAddress: string;
    tokenAmount: number;
    pricePerToken: number;
    totalValue: number;
    status: TradeStatus;
    paymentToken: string;
    tradingFees: number;
    gasFees: number;
    totalFees: number;
    hederaTransactionHash: string;
    executedAt: Date;
    failedAt: Date;
    failureReason: string;
    executionDetails: {
        blockNumber: number;
        gasUsed: number;
        gasPrice: number;
        nonce: number;
        fromAddress: string;
        toAddress: string;
    };
    tokenTransfers: {
        from: string;
        to: string;
        amount: number;
        tokenId: string;
        transactionHash: string;
    }[];
    priceImpact: {
        beforePrice: number;
        afterPrice: number;
        impactPercentage: number;
        volumeWeightedPrice: number;
    };
    orderBookSnapshot: string;
    isSettled: boolean;
    settledAt: Date;
    settlementTransactionHash: string;
    metadata: {
        marketMaker: boolean;
        liquidityProvider: boolean;
        arbitrageTrade: boolean;
        largeTrade: boolean;
        tradeSize: 'SMALL' | 'MEDIUM' | 'LARGE' | 'WHALE';
    };
}
export declare const TradeExecutionSchema: import("mongoose").Schema<TradeExecution, import("mongoose").Model<TradeExecution, any, any, any, Document<unknown, any, TradeExecution, any, {}> & TradeExecution & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, TradeExecution, Document<unknown, {}, import("mongoose").FlatRecord<TradeExecution>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<TradeExecution> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
