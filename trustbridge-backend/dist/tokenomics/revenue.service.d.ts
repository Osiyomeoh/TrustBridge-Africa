import { Model } from 'mongoose';
import { HederaService } from '../hedera/hedera.service';
import { PaymentDocument } from '../schemas/payment.schema';
import { UserDocument } from '../schemas/user.schema';
export interface RevenueStream {
    source: string;
    amount: number;
    percentage: number;
    timestamp: Date;
}
export interface FeeAllocation {
    treasury: number;
    stakers: number;
    insurance: number;
    validators: number;
    burn: number;
}
export interface RevenueMetrics {
    totalRevenue: number;
    dailyRevenue: number;
    weeklyRevenue: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    revenueStreams: RevenueStream[];
    feeAllocation: FeeAllocation;
    growthRate: number;
    averageTransactionValue: number;
}
export interface TreasuryBalance {
    totalBalance: number;
    hbarBalance: number;
    trbBalance: number;
    usdValue: number;
    allocation: {
        development: number;
        marketing: number;
        operations: number;
        emergency: number;
        staking: number;
    };
}
export declare class RevenueService {
    private paymentModel;
    private userModel;
    private readonly hederaService;
    private readonly logger;
    private readonly feeAllocationConfig;
    private readonly revenueStreams;
    constructor(paymentModel: Model<PaymentDocument>, userModel: Model<UserDocument>, hederaService: HederaService);
    calculateRevenue(timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<number>;
    getRevenueMetrics(): Promise<RevenueMetrics>;
    getRevenueStreams(timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<RevenueStream[]>;
    calculateFeeAllocation(totalRevenue: number): FeeAllocation;
    getTreasuryBalance(): Promise<TreasuryBalance>;
    distributeFees(totalFees: number): Promise<{
        treasury: number;
        stakers: number;
        insurance: number;
        validators: number;
        burn: number;
    }>;
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
    getFeeConfiguration(): {
        tokenizationFee: number;
        verificationFee: number;
        platformFee: number;
        escrowFee: number;
        feeAllocation: typeof this.feeAllocationConfig;
    };
    updateFeeConfiguration(updates: {
        tokenizationFee?: number;
        verificationFee?: number;
        platformFee?: number;
        escrowFee?: number;
        feeAllocation?: Partial<typeof this.feeAllocationConfig>;
    }): Promise<void>;
    private calculatePreviousMonthRevenue;
    private calculateRevenueForPeriod;
    private distributeToStakers;
    private distributeToValidators;
}
