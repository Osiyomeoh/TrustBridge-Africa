import { Model } from 'mongoose';
import { RoyaltyPayment, CreatorRoyaltyStats } from '../schemas/royalty.schema';
export declare class RoyaltiesService {
    private royaltyPaymentModel;
    private creatorStatsModel;
    private readonly logger;
    constructor(royaltyPaymentModel: Model<RoyaltyPayment>, creatorStatsModel: Model<CreatorRoyaltyStats>);
    recordRoyaltyPayment(data: {
        transactionId: string;
        nftContract: string;
        tokenId: string;
        salePrice: number;
        royaltyAmount: number;
        royaltyPercentage: number;
        creator: string;
        seller: string;
        buyer: string;
    }): Promise<RoyaltyPayment>;
    private updateCreatorStats;
    getCreatorRoyaltyPayments(creator: string, options?: {
        limit?: number;
        skip?: number;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        payments: RoyaltyPayment[];
        total: number;
    }>;
    getCreatorStats(creator: string): Promise<CreatorRoyaltyStats | null>;
    getNFTRoyaltyHistory(nftContract: string, tokenId: string): Promise<RoyaltyPayment[]>;
    getTopCreators(limit?: number): Promise<CreatorRoyaltyStats[]>;
    getMonthlyEarnings(creator: string, months?: number): Promise<any>;
}
