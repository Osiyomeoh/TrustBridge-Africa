import { Document } from 'mongoose';
export type PoolTokenHoldingsDocument = PoolTokenHoldings & Document;
export declare enum TokenTransferType {
    INVESTMENT = "INVESTMENT",
    DIVIDEND = "DIVIDEND",
    TRADE = "TRADE",
    BURN = "BURN",
    MINT = "MINT",
    TRANSFER = "TRANSFER",
    REWARD = "REWARD"
}
export declare class TokenTransfer {
    transferId: string;
    type: TokenTransferType;
    fromAddress: string;
    toAddress: string;
    amount: number;
    pricePerToken: number;
    totalValue: number;
    transactionHash: string;
    hederaTransactionId: string;
    description: string;
    transferDate: Date;
    fees: number;
    referenceId: string;
}
export declare class DividendRecord {
    dividendId: string;
    poolId: string;
    amount: number;
    perToken: number;
    distributedAt: Date;
    transactionHash: string;
    description: string;
    isClaimed: boolean;
    claimedAt: Date;
}
export declare class PoolTokenHoldings {
    holderAddress: string;
    poolId: string;
    poolTokenId: string;
    poolName: string;
    totalTokens: number;
    availableTokens: number;
    lockedTokens: number;
    totalInvested: number;
    totalDividendsReceived: number;
    totalDividendsClaimed: number;
    totalDividendsUnclaimed: number;
    averageBuyPrice: number;
    currentValue: number;
    unrealizedPnL: number;
    realizedPnL: number;
    totalPnL: number;
    roi: number;
    transfers: TokenTransfer[];
    dividends: DividendRecord[];
    firstInvestmentDate: Date;
    lastActivityDate: Date;
    isActive: boolean;
    metadata: {
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
        poolType: string;
        expectedAPY: number;
        maturityDate: Date;
        isTradeable: boolean;
        lastPriceUpdate: Date;
        priceChange24h: number;
    };
    stakingRecords: {
        stakingId: string;
        amount: number;
        stakedAt: Date;
        unstakedAt?: Date;
        rewards: number;
        status: 'ACTIVE' | 'UNSTAKED' | 'REWARDS_CLAIMED';
    }[];
}
export declare const PoolTokenHoldingsSchema: import("mongoose").Schema<PoolTokenHoldings, import("mongoose").Model<PoolTokenHoldings, any, any, any, Document<unknown, any, PoolTokenHoldings, any, {}> & PoolTokenHoldings & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PoolTokenHoldings, Document<unknown, {}, import("mongoose").FlatRecord<PoolTokenHoldings>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<PoolTokenHoldings> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
