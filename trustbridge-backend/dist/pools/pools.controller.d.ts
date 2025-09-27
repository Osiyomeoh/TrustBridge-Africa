import { PoolsService } from './pools.service';
export declare class PoolsController {
    private readonly poolsService;
    constructor(poolsService: PoolsService);
    createPool(poolData: {
        name: string;
        description: string;
        managementFee: number;
        performanceFee: number;
    }, req: any): Promise<{
        success: boolean;
        poolId: string;
        pool: import("mongoose").Document<unknown, {}, import("../schemas/pool.schema").PoolDocument, {}, {}> & import("../schemas/pool.schema").Pool & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        };
        transactionId: string;
    }>;
    getAllPools(filters: {
        status?: string;
        riskLevel?: string;
        manager?: string;
        minAPY?: number;
        maxAPY?: number;
        limit?: number;
        offset?: number;
    }): Promise<{
        pools: (import("mongoose").Document<unknown, {}, import("../schemas/pool.schema").PoolDocument, {}, {}> & import("../schemas/pool.schema").Pool & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        total: number;
        limit: number;
        offset: number;
    }>;
    getPool(poolId: string): Promise<import("mongoose").Document<unknown, {}, import("../schemas/pool.schema").PoolDocument, {}, {}> & import("../schemas/pool.schema").Pool & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    addInvestor(poolId: string, investorData: {
        address: string;
        amount: number;
    }): Promise<{
        success: boolean;
        poolTokens: number;
        transactionId: string;
    }>;
    distributeRewards(poolId: string, data: {
        amount: number;
    }, req: any): Promise<{
        success: boolean;
        dropAmount: number;
        tinAmount: number;
        transactionId: string;
    }>;
    updatePoolStatus(poolId: string, data: {
        status: string;
    }, req: any): Promise<{
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
}
