export declare class AnalyticsService {
    getOverview(): Promise<{
        success: boolean;
        data: {
            totalAssets: number;
            totalValue: number;
            totalUsers: number;
            totalAttestors: number;
            totalPools: number;
            totalVolume: number;
            activeVerifications: number;
            completedVerifications: number;
            averageAssetValue: number;
            topCountries: string[];
            assetCategories: {
                agricultural: number;
                realEstate: number;
                vehicles: number;
            };
            monthlyGrowth: number;
            successRate: number;
        };
        message: string;
    }>;
    getStats(): Promise<{
        success: boolean;
        data: {
            system: {
                uptime: string;
                responseTime: string;
                totalRequests: number;
                errorRate: string;
            };
            blockchain: {
                totalTransactions: number;
                gasUsed: string;
                averageBlockTime: string;
                networkStatus: string;
            };
            database: {
                totalRecords: number;
                storageUsed: string;
                queryPerformance: string;
                connectionPool: string;
            };
            mobile: {
                activeUsers: number;
                appVersion: string;
                crashRate: string;
                averageSessionTime: string;
            };
        };
        message: string;
    }>;
}
