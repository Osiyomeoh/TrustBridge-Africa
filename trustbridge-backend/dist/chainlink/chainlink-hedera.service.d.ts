import { ConfigService } from '@nestjs/config';
export interface ChainlinkPriceData {
    price: number;
    timestamp: Date;
    roundId: number;
    decimals: number;
}
export declare class ChainlinkHederaService {
    private configService;
    private readonly logger;
    private client;
    private readonly priceFeeds;
    private readonly ethereumAddresses;
    constructor(configService: ConfigService);
    private initializeClient;
    getLatestPrice(feedSymbol: string): Promise<ChainlinkPriceData | null>;
    getHistoricalPrice(feedSymbol: string, roundId: number): Promise<ChainlinkPriceData | null>;
    getPriceFeedInfo(feedSymbol: string): Promise<any>;
    private getFallbackPrice;
    getAvailableFeeds(): string[];
    getFeedAddress(feedSymbol: string): string | null;
}
