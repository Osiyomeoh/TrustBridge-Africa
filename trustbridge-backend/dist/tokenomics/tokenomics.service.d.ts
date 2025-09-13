import { Model } from 'mongoose';
import { HederaService } from '../hedera/hedera.service';
import { PaymentDocument } from '../schemas/payment.schema';
import { UserDocument } from '../schemas/user.schema';
export interface TokenomicsConfig {
    totalSupply: number;
    initialCirculating: number;
    communityAllocation: number;
    teamAllocation: number;
    investorAllocation: number;
    treasuryAllocation: number;
    buybackRate: number;
    burnRate: number;
    stakingRewardRate: number;
}
export interface TokenDistribution {
    community: number;
    team: number;
    investors: number;
    treasury: number;
    staking: number;
    liquidity: number;
}
export interface BuybackData {
    totalRevenue: number;
    buybackAmount: number;
    burnAmount: number;
    stakerRewards: number;
    timestamp: Date;
}
export interface StakingReward {
    userId: string;
    stakedAmount: number;
    rewardAmount: number;
    apy: number;
    lockPeriod: number;
    timestamp: Date;
}
export declare class TokenomicsService {
    private paymentModel;
    private userModel;
    private readonly hederaService;
    private readonly logger;
    private readonly tokenomicsConfig;
    constructor(paymentModel: Model<PaymentDocument>, userModel: Model<UserDocument>, hederaService: HederaService);
    getTokenomicsConfig(): TokenomicsConfig;
    calculateTokenDistribution(): TokenDistribution;
    calculateProtocolRevenue(timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<number>;
    executeBuybackAndBurn(): Promise<BuybackData>;
    distributeStakerRewards(totalRewards: number): Promise<void>;
    calculateStakingRewards(userId: string): Promise<StakingReward>;
    private calculateAPY;
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
    updateTokenomicsParameters(updates: Partial<TokenomicsConfig>): Promise<void>;
    getStakingLeaderboard(limit?: number): Promise<Array<{
        walletAddress: string;
        stakedAmount: number;
        stakingRewards: number;
        apy: number;
        rank: number;
    }>>;
    getTokenDistributionAnalytics(): Promise<{
        distribution: TokenDistribution;
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
}
