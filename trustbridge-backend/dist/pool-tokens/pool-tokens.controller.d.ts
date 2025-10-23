import { PoolTokensService, TransferTokensDto, ClaimDividendDto, StakeTokensDto } from './pool-tokens.service';
export declare class PoolTokensController {
    private readonly poolTokensService;
    constructor(poolTokensService: PoolTokensService);
    getUserHoldings(req: any): Promise<import("../schemas/pool-token-holdings.schema").PoolTokenHoldings[]>;
    getPoolHolding(poolId: string, req: any): Promise<import("../schemas/pool-token-holdings.schema").PoolTokenHoldings>;
    getPortfolioSummary(req: any): Promise<any>;
    transferTokens(transferDto: TransferTokensDto, req: any): Promise<import("../schemas/pool-token-holdings.schema").PoolTokenHoldings>;
    claimDividends(claimDto: ClaimDividendDto, req: any): Promise<import("../schemas/pool-token-holdings.schema").PoolTokenHoldings>;
    stakeTokens(stakeDto: StakeTokensDto, req: any): Promise<import("../schemas/pool-token-holdings.schema").PoolTokenHoldings>;
    unstakeTokens(poolId: string, stakingId: string, req: any): Promise<import("../schemas/pool-token-holdings.schema").PoolTokenHoldings>;
    distributeDividends(dividendDto: {
        poolId: string;
        dividendAmount: number;
        perToken: number;
        description: string;
    }): Promise<void>;
    getTransferHistory(poolId: string, req: any): Promise<import("../schemas/pool-token-holdings.schema").TokenTransfer[]>;
    getDividendHistory(poolId: string, req: any): Promise<import("../schemas/pool-token-holdings.schema").DividendRecord[]>;
    getStakingRecords(poolId: string, req: any): Promise<{
        stakingId: string;
        amount: number;
        stakedAt: Date;
        unstakedAt?: Date;
        rewards: number;
        status: "ACTIVE" | "UNSTAKED" | "REWARDS_CLAIMED";
    }[]>;
    getUnclaimedDividends(req: any): Promise<{
        poolId: string;
        poolName: string;
        holderAddress: string;
        dividendId: string;
        amount: number;
        perToken: number;
        distributedAt: Date;
        transactionHash: string;
        description: string;
        isClaimed: boolean;
        claimedAt: Date;
    }[]>;
    getPortfolioAnalytics(req: any): Promise<{
        totalHoldings: number;
        totalValue: number;
        totalInvested: number;
        totalPnL: number;
        totalDividends: number;
        bestPerformer: import("../schemas/pool-token-holdings.schema").PoolTokenHoldings;
        worstPerformer: import("../schemas/pool-token-holdings.schema").PoolTokenHoldings;
        riskDistribution: Record<string, number>;
        poolTypeDistribution: Record<string, number>;
    }>;
    getTokenBalance(poolId: string, req: any): Promise<{
        poolId: string;
        poolName: string;
        totalTokens: number;
        availableTokens: number;
        lockedTokens: number;
        currentValue: number;
        totalPnL: number;
        roi: number;
    }>;
}
