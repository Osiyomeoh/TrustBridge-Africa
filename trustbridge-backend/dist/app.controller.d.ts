export declare class AppController {
    getRoot(): {
        success: boolean;
        message: string;
        version: string;
        timestamp: string;
        endpoints: {
            api: string;
            docs: string;
            health: string;
            graphql: string;
        };
    };
    getHealth(): {
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
    };
}
