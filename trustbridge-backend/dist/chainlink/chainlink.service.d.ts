import { ConfigService } from '@nestjs/config';
import { ChainlinkHederaService } from './chainlink-hedera.service';
import { ChainlinkExternalService } from './chainlink-external.service';
export interface PriceData {
    price: number;
    timestamp: Date;
    source: string;
    confidence: number;
}
export interface WeatherData {
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    conditions: string;
    timestamp: Date;
    location: {
        lat: number;
        lng: number;
    };
}
export interface MarketData {
    assetType: string;
    country: string;
    price: number;
    volume: number;
    change24h: number;
    timestamp: Date;
}
export interface VRFResult {
    randomValue: string;
    requestId: string;
    timestamp: Date;
}
export declare class ChainlinkService {
    private configService;
    private chainlinkHederaService;
    private chainlinkExternalService;
    private readonly logger;
    private readonly chainlinkConfig;
    constructor(configService: ConfigService, chainlinkHederaService: ChainlinkHederaService, chainlinkExternalService: ChainlinkExternalService);
    private readonly priceFeeds;
    private readonly externalAPIs;
    getAssetPrice(assetType: string, country: string): Promise<PriceData | null>;
    private getChainlinkPrice;
    private mapAssetTypeToFeedSymbol;
    private readChainlinkPriceFeed;
    private getExternalPrice;
    private getCoffeePrice;
    private getAgriculturalPrice;
    private getRealEstatePrice;
    private getCoinGeckoPrice;
    getWeatherData(lat: number, lng: number): Promise<WeatherData | null>;
    getMarketData(assetType: string, country: string): Promise<MarketData>;
    requestRandomNumber(): Promise<VRFResult>;
    getRandomAttestor(attestorCount: number): Promise<number>;
    verifyLocation(lat: number, lng: number): Promise<boolean>;
    getHistoricalPrices(assetType: string, days?: number): Promise<PriceData[]>;
    getPriceFeedAddresses(): any;
    getVRFConfiguration(): any;
    isConfigured(): boolean;
    healthCheck(): Promise<boolean>;
}
