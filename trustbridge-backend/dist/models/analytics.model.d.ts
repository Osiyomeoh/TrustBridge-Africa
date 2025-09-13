import mongoose, { Document } from 'mongoose';
export interface AnalyticsDocument extends Document {
    date: Date;
    metrics: {
        totalValueLocked: number;
        totalAssets: number;
        totalUsers: number;
        totalOperations: number;
        averageAPY: number;
        successRate: number;
        monthlyVolume: number;
        newAssets: number;
        newUsers: number;
        settledTransactions: number;
        verificationAccuracy: number;
    };
    countryBreakdown: Array<{
        country: string;
        assetCount: number;
        totalValue: number;
        userCount: number;
    }>;
    assetTypeBreakdown: Array<{
        type: string;
        count: number;
        totalValue: number;
        averageAPY: number;
    }>;
    tokenomics: {
        totalSupply: string;
        circulatingSupply: string;
        totalStaked: string;
        totalBurned: string;
        stakingAPY: number;
    };
    createdAt: Date;
}
export declare const AnalyticsModel: mongoose.Model<AnalyticsDocument, {}, {}, {}, mongoose.Document<unknown, {}, AnalyticsDocument, {}, {}> & AnalyticsDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export * from './asset.model';
export * from './settlement.model';
export * from './user.model';
export * from './operation.model';
