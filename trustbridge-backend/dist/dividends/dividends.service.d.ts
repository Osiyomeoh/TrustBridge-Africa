import { Model } from 'mongoose';
import { DividendDistribution, DividendDistributionDocument, DividendType } from '../schemas/dividend-distribution.schema';
import { PoolTokenHoldingsDocument } from '../schemas/pool-token-holdings.schema';
import { AMCPoolDocument } from '../schemas/amc-pool.schema';
import { HederaService } from '../hedera/hedera.service';
import { AdminService } from '../admin/admin.service';
export interface CreateDividendDto {
    poolId: string;
    dividendType: DividendType;
    totalDividendAmount: number;
    distributionDate: string;
    recordDate: string;
    description: string;
    sourceOfFunds: string;
    metadata?: {
        previousDividendId?: string;
        dividendYield?: number;
        payoutRatio?: number;
        frequency?: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY' | 'SPECIAL';
        taxWithholding?: number;
        currency?: string;
        exchangeRate?: number;
    };
}
export interface ClaimDividendDto {
    distributionId: string;
    holderAddress: string;
}
export interface DividendStats {
    totalDistributions: number;
    totalDistributed: number;
    totalClaimed: number;
    totalUnclaimed: number;
    averageDividendYield: number;
    distributionsThisYear: number;
    distributionsThisMonth: number;
    pendingDistributions: number;
}
export declare class DividendsService {
    private dividendDistributionModel;
    private poolTokenHoldingsModel;
    private amcPoolModel;
    private hederaService;
    private adminService;
    private readonly logger;
    constructor(dividendDistributionModel: Model<DividendDistributionDocument>, poolTokenHoldingsModel: Model<PoolTokenHoldingsDocument>, amcPoolModel: Model<AMCPoolDocument>, hederaService: HederaService, adminService: AdminService);
    createDividendDistribution(createDividendDto: CreateDividendDto, adminAddress: string): Promise<DividendDistribution>;
    executeDividendDistribution(distributionId: string, adminAddress: string): Promise<DividendDistribution>;
    claimDividend(claimDto: ClaimDividendDto): Promise<DividendDistribution>;
    getPoolDividendDistributions(poolId: string): Promise<DividendDistribution[]>;
    getUserDividendDistributions(holderAddress: string): Promise<DividendDistribution[]>;
    getDividendStats(poolId?: string): Promise<DividendStats>;
    cancelDividendDistribution(distributionId: string, adminAddress: string): Promise<DividendDistribution>;
    private updateTokenHoldingsForDividend;
    private updateTokenHoldingsForClaim;
    getUpcomingDividendDistributions(): Promise<DividendDistribution[]>;
    getDividendDistribution(distributionId: string): Promise<DividendDistribution>;
}
