import { HealthService } from './health.service';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
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
