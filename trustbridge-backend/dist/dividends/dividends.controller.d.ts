import { DividendsService, CreateDividendDto, ClaimDividendDto } from './dividends.service';
export declare class DividendsController {
    private readonly dividendsService;
    constructor(dividendsService: DividendsService);
    createDividendDistribution(createDividendDto: CreateDividendDto, req: any): Promise<import("../schemas/dividend-distribution.schema").DividendDistribution>;
    executeDividendDistribution(distributionId: string, req: any): Promise<import("../schemas/dividend-distribution.schema").DividendDistribution>;
    cancelDividendDistribution(distributionId: string, req: any): Promise<import("../schemas/dividend-distribution.schema").DividendDistribution>;
    claimDividend(claimDividendDto: ClaimDividendDto, req: any): Promise<import("../schemas/dividend-distribution.schema").DividendDistribution>;
    getPoolDividendDistributions(poolId: string): Promise<import("../schemas/dividend-distribution.schema").DividendDistribution[]>;
    getUserDividendDistributions(req: any): Promise<import("../schemas/dividend-distribution.schema").DividendDistribution[]>;
    getDividendDistribution(distributionId: string): Promise<import("../schemas/dividend-distribution.schema").DividendDistribution>;
    getDividendStats(poolId?: string): Promise<import("./dividends.service").DividendStats>;
    getUpcomingDividendDistributions(): Promise<import("../schemas/dividend-distribution.schema").DividendDistribution[]>;
    getAllDividendDistributions(status?: string): Promise<{
        message: string;
    }>;
    getDividendRecipients(distributionId: string): Promise<{
        distributionId: string;
        poolName: string;
        totalRecipients: number;
        totalClaimed: number;
        totalUnclaimed: number;
        claimCount: number;
        recipients: import("../schemas/dividend-distribution.schema").DividendRecipient[];
    }>;
    getDividendAnalytics(poolId?: string): Promise<{
        message: string;
    }>;
    getDividendCalendar(year?: number): Promise<{
        message: string;
    }>;
    getDividendHistory(holderAddress: string): Promise<{
        message: string;
    }>;
    bulkClaimDividends(claimDto: {
        distributionIds: string[];
    }, req: any): Promise<any[]>;
}
