import { RoyaltiesService } from './royalties.service';
export declare class RoyaltiesController {
    private readonly royaltiesService;
    constructor(royaltiesService: RoyaltiesService);
    recordPayment(body: any): Promise<{
        success: boolean;
        data: import("../schemas/royalty.schema").RoyaltyPayment;
        message: string;
    }>;
    getCreatorPayments(address: string, limit?: string, skip?: string, startDate?: string, endDate?: string): Promise<{
        success: boolean;
        data: import("../schemas/royalty.schema").RoyaltyPayment[];
        total: number;
    }>;
    getCreatorStats(address: string): Promise<{
        success: boolean;
        data: import("../schemas/royalty.schema").CreatorRoyaltyStats;
    }>;
    getMonthlyEarnings(address: string, months?: string): Promise<{
        success: boolean;
        data: any;
    }>;
    getNFTRoyaltyHistory(contract: string, tokenId: string): Promise<{
        success: boolean;
        data: import("../schemas/royalty.schema").RoyaltyPayment[];
    }>;
    getTopCreators(limit?: string): Promise<{
        success: boolean;
        data: import("../schemas/royalty.schema").CreatorRoyaltyStats[];
    }>;
}
