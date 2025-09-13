import { Model } from 'mongoose';
import { HederaService } from '../hedera/hedera.service';
import { UserDocument } from '../schemas/user.schema';
export declare enum StakingType {
    ATTESTOR = "ATTESTOR",
    VALIDATOR = "VALIDATOR",
    LIQUIDITY = "LIQUIDITY",
    GOVERNANCE = "GOVERNANCE"
}
export interface StakingPosition {
    userId: string;
    stakingType: StakingType;
    amount: number;
    lockPeriod: number;
    startDate: Date;
    endDate: Date;
    apy: number;
    rewards: number;
    isActive: boolean;
}
export interface StakingReward {
    userId: string;
    stakingType: StakingType;
    rewardAmount: number;
    apy: number;
    timestamp: Date;
}
export interface StakingStats {
    totalStaked: number;
    totalStakers: number;
    averageStake: number;
    totalRewards: number;
    averageAPY: number;
    stakingBreakdown: {
        [key in StakingType]: {
            amount: number;
            stakers: number;
            apy: number;
        };
    };
}
export declare class StakingService {
    private userModel;
    private readonly hederaService;
    private readonly logger;
    private readonly stakingConfig;
    constructor(userModel: Model<UserDocument>, hederaService: HederaService);
    stakeTokens(userId: string, stakingType: StakingType, amount: number, lockPeriod: number): Promise<StakingPosition>;
    unstakeTokens(userId: string, stakingType: StakingType): Promise<{
        unstakedAmount: number;
        rewards: number;
        totalReceived: number;
    }>;
    calculateStakingRewards(userId: string, stakingType: StakingType): Promise<number>;
    getUserStakingPositions(userId: string): Promise<StakingPosition[]>;
    getStakingStats(): Promise<StakingStats>;
    getStakingLeaderboard(limit?: number): Promise<Array<{
        walletAddress: string;
        stakedAmount: number;
        stakingType: StakingType;
        apy: number;
        rewards: number;
        rank: number;
    }>>;
    distributeStakingRewards(totalRewards: number): Promise<void>;
    getStakingConfig(): typeof this.stakingConfig;
    private validateStakingParameters;
    private calculateAPY;
}
