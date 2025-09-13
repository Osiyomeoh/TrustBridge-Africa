import { ConfigService } from '@nestjs/config';
import { Location } from '../types';
export interface OCRResult {
    text: string;
    confidence: number;
    language: string;
    entities: Array<{
        type: string;
        value: string;
        confidence: number;
    }>;
}
export interface GPSVerification {
    verified: boolean;
    address: string;
    country: string;
    region: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    confidence: number;
}
export interface WeatherData {
    location: string;
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    conditions: string;
    timestamp: Date;
    forecast: Array<{
        date: Date;
        temperature: number;
        precipitation: number;
        conditions: string;
    }>;
}
export interface MarketData {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    marketCap: number;
    timestamp: Date;
    source: string;
}
export declare class ExternalApisService {
    private configService;
    private readonly logger;
    private readonly googleApiKey;
    private readonly openWeatherApiKey;
    private readonly alphaVantageApiKey;
    private readonly awsAccessKey;
    private readonly awsSecretKey;
    private readonly externalAPIs;
    constructor(configService: ConfigService);
    extractTextFromImage(imageBuffer: Buffer, mimeType: string): Promise<OCRResult>;
    private extractTextWithGoogleVision;
    private extractTextWithAWS;
    private extractTextWithTesseract;
    private extractBasicText;
    private extractEntities;
    private getOpenStreetMapLocation;
    getGPSLocation(lat: number, lng: number): Promise<Location | null>;
    private verifyGPSWithOSM;
    getWeatherData(lat: number, lng: number): Promise<WeatherData>;
    private getWeatherWithOpenWeather;
    private getOpenStreetMapWeather;
    getMarketData(symbol: string): Promise<MarketData | null>;
    private getMarketDataWithAlphaVantage;
    private getMarketDataWithYahoo;
    private getMarketDataWithCoinGecko;
    verifyGPSLocation(lat: number, lng: number, expectedLocation: string): Promise<{
        verified: boolean;
        confidence: number;
    }>;
    verifyDocument(documentBuffer: Buffer, documentType: string): Promise<{
        isValid: boolean;
        confidence: number;
        extractedData: any;
        issues: string[];
    }>;
    private verifyLandCertificate;
    private verifyBusinessLicense;
    private verifyIdentityDocument;
    getHealthStatus(): Promise<{
        services: {
            [service: string]: boolean;
        };
        lastChecked: Date;
    }>;
}
