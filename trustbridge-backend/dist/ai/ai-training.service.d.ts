import { ConfigService } from '@nestjs/config';
export declare class AITrainingService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    getTrustBridgeContext(): string;
    getTrainingPrompts(): Record<string, string>;
    getPlatformKnowledge(): string;
    getPlatformStatus(): string;
}
