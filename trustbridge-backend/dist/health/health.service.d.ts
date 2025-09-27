export declare class HealthService {
    getHealth(): Promise<{
        success: boolean;
        data: {
            status: string;
            timestamp: string;
            version: string;
            services: {
                database: boolean;
                blockchain: boolean;
                api: boolean;
                mobile: boolean;
            };
        };
        message: string;
    }>;
}
