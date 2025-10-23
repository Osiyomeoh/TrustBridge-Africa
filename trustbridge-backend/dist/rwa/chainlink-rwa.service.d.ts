import { ChainlinkService } from '../chainlink/chainlink.service';
import { ConfigService } from '@nestjs/config';
export interface RWAPriceData {
    assetId: string;
    assetType: string;
    category: string;
    location: string;
    currentValue: number;
    priceChange24h: number;
    priceChangePercent: number;
    confidence: number;
    source: string;
    timestamp: Date;
    marketConditions: {
        volatility: number;
        liquidity: number;
        demand: number;
    };
}
export interface RWARiskData {
    assetId: string;
    riskScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    factors: {
        marketVolatility: number;
        locationRisk: number;
        assetLiquidity: number;
        regulatoryRisk: number;
        weatherRisk?: number;
        economicRisk: number;
    };
    recommendations: string[];
    timestamp: Date;
}
export interface RWAMarketData {
    category: string;
    region: string;
    averagePrice: number;
    priceTrend: 'UP' | 'DOWN' | 'STABLE';
    volume24h: number;
    marketCap: number;
    confidence: number;
    timestamp: Date;
}
export interface AMCAssignmentData {
    assetId: string;
    availableAMCs: string[];
    selectedAMC: string;
    assignmentReason: string;
    confidence: number;
    timestamp: Date;
}
export declare class ChainlinkRWAService {
    private readonly chainlinkService;
    private readonly configService;
    private readonly logger;
    constructor(chainlinkService: ChainlinkService, configService: ConfigService);
    getRWAAssetPrice(assetId: string, assetType: string, category: string, location: string): Promise<RWAPriceData | null>;
    private getBasePriceForCategory;
    private getLocationMultiplier;
    private getAssetTypeMultiplier;
    private getMarketConditions;
    getRWARiskAssessment(assetId: string, category: string, location: string, expectedAPY: number): Promise<RWARiskData>;
    private getMarketVolatility;
    private getLocationRisk;
    private getAssetLiquidity;
    private getRegulatoryRisk;
    private getWeatherRisk;
    private getEconomicRisk;
    private calculateRiskScore;
    private determineRiskLevel;
    private generateRiskRecommendations;
    assignAMCWithVRF(assetId: string, availableAMCs: string[]): Promise<AMCAssignmentData>;
    private generateAssignmentReason;
    getRWAMarketData(category: string, region: string): Promise<RWAMarketData>;
    private calculatePriceTrend;
    private calculateVolume24h;
    private calculateMarketCap;
}
