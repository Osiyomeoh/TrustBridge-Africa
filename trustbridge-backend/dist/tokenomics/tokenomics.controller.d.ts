import { TokenomicsService } from './tokenomics.service';
import { GovernanceService, CreateProposalDto, VoteDto } from './governance.service';
import { StakingService, StakingType } from './staking.service';
import { RevenueService } from './revenue.service';
export declare class TokenomicsController {
    private readonly tokenomicsService;
    private readonly governanceService;
    private readonly stakingService;
    private readonly revenueService;
    constructor(tokenomicsService: TokenomicsService, governanceService: GovernanceService, stakingService: StakingService, revenueService: RevenueService);
    getTokenomicsOverview(): Promise<{
        config: import("./tokenomics.service").TokenomicsConfig;
        distribution: import("./tokenomics.service").TokenDistribution;
        metrics: {
            totalSupply: number;
            circulatingSupply: number;
            burnedTokens: number;
            stakedTokens: number;
            treasuryBalance: number;
            marketCap: number;
            stakingAPY: number;
            inflationRate: number;
            deflationRate: number;
        };
    }>;
    getTokenomicsMetrics(): Promise<{
        totalSupply: number;
        circulatingSupply: number;
        burnedTokens: number;
        stakedTokens: number;
        treasuryBalance: number;
        marketCap: number;
        stakingAPY: number;
        inflationRate: number;
        deflationRate: number;
    }>;
    getTokenDistributionAnalytics(): Promise<{
        distribution: import("./tokenomics.service").TokenDistribution;
        stakingStats: {
            totalStakers: number;
            totalStaked: number;
            averageStake: number;
            topStaker: string;
            topStakeAmount: number;
        };
        revenueStats: {
            daily: number;
            weekly: number;
            monthly: number;
            yearly: number;
        };
    }>;
    executeBuybackAndBurn(): Promise<import("./tokenomics.service").BuybackData>;
    getProposals(page?: number, limit?: number, status?: string, proposer?: string): Promise<{
        proposals: import("../models/governance.model").ProposalDocument[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getProposal(id: string): Promise<import("../models/governance.model").ProposalDocument>;
    createProposal(createProposalDto: CreateProposalDto): Promise<import("../models/governance.model").ProposalDocument>;
    castVote(voteDto: VoteDto): Promise<void>;
    executeProposal(id: string, executor: string): Promise<string>;
    getGovernanceStats(): Promise<{
        totalProposals: number;
        activeProposals: number;
        passedProposals: number;
        rejectedProposals: number;
        totalVotes: number;
        averageParticipation: number;
        quorumThreshold: number;
    }>;
    getUserVotingPower(address: string): Promise<{
        tokenBalance: number;
        stakedBalance: number;
        totalVotingPower: number;
        delegatedVotes: number;
    }>;
    getStakingStats(): Promise<import("./staking.service").StakingStats>;
    getStakingLeaderboard(limit?: number): Promise<{
        walletAddress: string;
        stakedAmount: number;
        stakingType: StakingType;
        apy: number;
        rewards: number;
        rank: number;
    }[]>;
    getUserStakingPositions(userId: string): Promise<import("./staking.service").StakingPosition[]>;
    stakeTokens(userId: string, stakingType: StakingType, amount: number, lockPeriod: number): Promise<import("./staking.service").StakingPosition>;
    unstakeTokens(userId: string, stakingType: StakingType): Promise<{
        unstakedAmount: number;
        rewards: number;
        totalReceived: number;
    }>;
    calculateStakingRewards(userId: string, stakingType: StakingType): Promise<number>;
    getStakingConfig(): Promise<{
        minStakeAmount: {
            ATTESTOR: number;
            VALIDATOR: number;
            LIQUIDITY: number;
            GOVERNANCE: number;
        };
        maxLockPeriod: number;
        minLockPeriod: number;
        apyRates: {
            ATTESTOR: {
                min: number;
                max: number;
            };
            VALIDATOR: {
                min: number;
                max: number;
            };
            LIQUIDITY: {
                min: number;
                max: number;
            };
            GOVERNANCE: {
                min: number;
                max: number;
            };
        };
    }>;
    getRevenueMetrics(): Promise<import("./revenue.service").RevenueMetrics>;
    getRevenueStreams(timeframe?: string): Promise<import("./revenue.service").RevenueStream[]>;
    getRevenueAnalytics(days?: number): Promise<{
        dailyRevenue: Array<{
            date: string;
            revenue: number;
        }>;
        revenueByType: Array<{
            type: string;
            revenue: number;
            percentage: number;
        }>;
        growthTrend: Array<{
            period: string;
            growth: number;
        }>;
    }>;
    getTreasuryBalance(): Promise<import("./revenue.service").TreasuryBalance>;
    distributeFees(totalFees: number): Promise<{
        treasury: number;
        stakers: number;
        insurance: number;
        validators: number;
        burn: number;
    }>;
    getFeeConfiguration(): Promise<{
        tokenizationFee: number;
        verificationFee: number;
        platformFee: number;
        escrowFee: number;
        feeAllocation: any;
    }>;
    updateFeeConfiguration(updates: any): Promise<void>;
    updateTokenomicsParameters(updates: any): Promise<void>;
    getLeaderboard(limit?: number): Promise<{
        walletAddress: string;
        stakedAmount: number;
        stakingRewards: number;
        apy: number;
        rank: number;
    }[]>;
    calculateRevenue(timeframe: string): Promise<number>;
}
