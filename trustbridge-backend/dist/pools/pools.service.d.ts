import { Model } from 'mongoose';
import { Pool, PoolDocument } from '../schemas/pool.schema';
import { HederaService } from '../hedera/hedera.service';
import { AssetDocument } from '../schemas/asset.schema';
export declare class PoolsService {
    private poolModel;
    private assetModel;
    private hederaService;
    private readonly logger;
    constructor(poolModel: Model<PoolDocument>, assetModel: Model<AssetDocument>, hederaService: HederaService);
    createPool(poolData: {
        name: string;
        description: string;
        managementFee: number;
        performanceFee: number;
        manager: string;
    }): Promise<{
        success: boolean;
        poolId: string;
        pool: import("mongoose").Document<unknown, {}, PoolDocument, {}, {}> & Pool & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
        transactionId: string;
    }>;
    getPool(poolId: string): Promise<import("mongoose").Document<unknown, {}, PoolDocument, {}, {}> & Pool & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    getAllPools(filters?: {
        status?: string;
        riskLevel?: string;
        manager?: string;
        minAPY?: number;
        maxAPY?: number;
        limit?: number;
        offset?: number;
    }): Promise<{
        pools: (import("mongoose").Document<unknown, {}, PoolDocument, {}, {}> & Pool & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        total: number;
        limit: number;
        offset: number;
    }>;
    investInPool(poolId: string, investorData: {
        address: string;
        amount: string;
    }): Promise<{
        success: boolean;
        poolTokens: number;
        transactionId: string;
    }>;
    addInvestor(poolId: string, investorData: {
        address: string;
        amount: number;
    }): Promise<{
        success: boolean;
        poolTokens: number;
        transactionId: string;
    }>;
    distributeRewards(poolId: string, amount: number): Promise<{
        success: boolean;
        dropAmount: number;
        tinAmount: number;
        transactionId: string;
    }>;
    updatePoolStatus(poolId: string, status: string): Promise<{
        success: boolean;
        transactionId: string;
    }>;
    getPoolPerformance(poolId: string): Promise<{
        totalReturn: number;
        monthlyReturn: number;
        volatility: number;
        sharpeRatio: number;
        maxDrawdown: number;
    }>;
    private mapRiskLevel;
    private mapStatusToNumber;
    private generateTags;
}
