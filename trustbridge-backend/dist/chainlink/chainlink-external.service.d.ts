import { ConfigService } from '@nestjs/config';
export interface ChainlinkPriceData {
    price: number;
    timestamp: Date;
    roundId: number;
    decimals: number;
}
export declare class ChainlinkExternalService {
    private configService;
    private readonly logger;
    private readonly priceFeeds;
    private readonly externalAPIs;
    constructor(configService: ConfigService);
    getLatestPrice(feedSymbol: string): Promise<ChainlinkPriceData | null>;
    private getRealChainlinkData;
    private getCoinGeckoData;
    private getCoinCapData;
    private mapSymbolToCoinGeckoId;
    private mapSymbolToCoinCapId;
    private getFallbackPrice;
    getHistoricalPrice(feedSymbol: string, roundId: number): Promise<ChainlinkPriceData | null>;
    getPriceFeedInfo(feedSymbol: string): Promise<any>;
    getAvailableFeeds(): string[];
    getFeedAddress(feedSymbol: string): string | null;
}
