import { AMCPoolsService, CreateAMCPoolDto, InvestInPoolDto, DistributeDividendDto } from './amc-pools.service';
export declare class AMCPoolsController {
    private readonly amcPoolsService;
    constructor(amcPoolsService: AMCPoolsService);
    createPool(createPoolDto: CreateAMCPoolDto, req: any): Promise<import("../schemas/amc-pool.schema").AMCPool>;
    launchPool(poolId: string, req: any): Promise<import("../schemas/amc-pool.schema").AMCPool>;
    getAllPools(status?: string, type?: string): Promise<import("../schemas/amc-pool.schema").AMCPool[]>;
    getActivePools(): Promise<import("../schemas/amc-pool.schema").AMCPool[]>;
    getPoolById(poolId: string): Promise<import("../schemas/amc-pool.schema").AMCPool>;
    getPoolsByAdmin(adminWallet: string): Promise<import("../schemas/amc-pool.schema").AMCPool[]>;
    investInPool(poolId: string, investDto: InvestInPoolDto, req: any): Promise<import("../schemas/amc-pool.schema").AMCPool>;
    distributeDividend(poolId: string, dividendDto: DistributeDividendDto, req: any): Promise<import("../schemas/amc-pool.schema").AMCPool>;
    closePool(poolId: string, req: any): Promise<import("../schemas/amc-pool.schema").AMCPool>;
    getPoolStats(poolId: string): Promise<any>;
    getInvestorInvestments(poolId: string, investorAddress: string): Promise<{
        poolId: string;
        poolName: string;
        investorAddress: string;
        investments: import("../schemas/amc-pool.schema").PoolInvestment[];
        totalInvested: number;
        totalTokens: number;
        totalDividends: number;
    }>;
    getPoolInvestments(poolId: string): Promise<{
        poolId: string;
        poolName: string;
        totalInvestments: number;
        totalInvested: number;
        totalInvestors: number;
        investments: import("../schemas/amc-pool.schema").PoolInvestment[];
    }>;
    updatePoolMetadata(poolId: string, metadata: any, req: any): Promise<{
        message: string;
    }>;
    getPoolTradingData(poolId: string): Promise<{
        poolId: string;
        isTradeable: boolean;
        currentPrice: number;
        priceChange24h: number;
        tradingVolume: number;
        hederaTokenId: string;
    }>;
}
