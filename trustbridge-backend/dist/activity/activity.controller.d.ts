import { ActivityService } from './activity.service';
export declare class ActivityController {
    private readonly activityService;
    constructor(activityService: ActivityService);
    getNFTActivity(tokenId: string, serialNumber: string, limit?: string): Promise<{
        success: boolean;
        data: import("./activity.service").ActivityEvent[];
    }>;
    getUserActivity(accountId: string, limit?: string): Promise<{
        success: boolean;
        data: import("./activity.service").ActivityEvent[];
    }>;
    getMarketplaceActivity(accountId: string, limit?: string): Promise<{
        success: boolean;
        data: import("./activity.service").ActivityEvent[];
    }>;
    getCollectionActivity(tokenId: string, limit?: string): Promise<{
        success: boolean;
        data: import("./activity.service").ActivityEvent[];
    }>;
    getNFTPriceHistory(tokenId: string, serialNumber: string): Promise<{
        success: boolean;
        data: {
            timestamp: string;
            price: number;
        }[];
    }>;
}
