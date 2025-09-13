import { ChainlinkService } from './chainlink.service';
import { ChainlinkHederaService } from './chainlink-hedera.service';
import { ChainlinkExternalService } from './chainlink-external.service';
export declare class ChainlinkController {
    private readonly chainlinkService;
    private readonly chainlinkHederaService;
    private readonly chainlinkExternalService;
    constructor(chainlinkService: ChainlinkService, chainlinkHederaService: ChainlinkHederaService, chainlinkExternalService: ChainlinkExternalService);
    getAssetPrice(assetType: string, country?: string): Promise<{
        success: boolean;
        data: import("./chainlink.service").PriceData;
        message: string;
    }>;
    getCoffeePrice(country?: string): Promise<{
        success: boolean;
        data: import("./chainlink.service").PriceData;
        message: string;
    }>;
    getWeatherData(lat: string, lng: string): Promise<{
        success: boolean;
        error: string;
        data?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        data: import("./chainlink.service").WeatherData;
        message: string;
        error?: undefined;
    }>;
    getMarketData(assetType: string, country?: string): Promise<{
        success: boolean;
        data: import("./chainlink.service").MarketData;
        message: string;
    }>;
    getHistoricalPrices(assetType: string, days?: string): Promise<{
        success: boolean;
        data: import("./chainlink.service").PriceData[];
        message: string;
    }>;
    requestRandomNumber(): Promise<{
        success: boolean;
        data: import("./chainlink.service").VRFResult;
        message: string;
    }>;
    getRandomAttestor(body: {
        attestorCount: number;
    }): Promise<{
        success: boolean;
        data: {
            randomIndex: number;
            attestorCount: number;
        };
        message: string;
    }>;
    verifyLocation(body: {
        lat: number;
        lng: number;
    }): Promise<{
        success: boolean;
        data: {
            lat: number;
            lng: number;
            valid: boolean;
        };
        message: string;
    }>;
    getPriceFeeds(): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getVRFConfig(): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    healthCheck(): Promise<{
        success: boolean;
        data: {
            healthy: boolean;
            configured: boolean;
        };
        message: string;
    }>;
    getAvailableFeeds(): Promise<{
        success: boolean;
        data: {
            feeds: string[];
        };
        message: string;
    }>;
    getFeedPrice(symbol: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: import("./chainlink-external.service").ChainlinkPriceData;
        message: string;
    }>;
    getFeedInfo(symbol: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: any;
        message: string;
    }>;
    getHistoricalPrice(symbol: string, roundId: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: import("./chainlink-external.service").ChainlinkPriceData;
        message: string;
    }>;
}
