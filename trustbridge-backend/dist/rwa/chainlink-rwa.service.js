"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ChainlinkRWAService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainlinkRWAService = void 0;
const common_1 = require("@nestjs/common");
const chainlink_service_1 = require("../chainlink/chainlink.service");
const config_1 = require("@nestjs/config");
let ChainlinkRWAService = ChainlinkRWAService_1 = class ChainlinkRWAService {
    constructor(chainlinkService, configService) {
        this.chainlinkService = chainlinkService;
        this.configService = configService;
        this.logger = new common_1.Logger(ChainlinkRWAService_1.name);
    }
    async getRWAAssetPrice(assetId, assetType, category, location) {
        try {
            this.logger.log(`Getting Chainlink price data for RWA asset ${assetId} (${assetType})`);
            const basePrice = await this.getBasePriceForCategory(category, location);
            if (!basePrice) {
                throw new Error(`No price data available for ${category} in ${location}`);
            }
            const locationMultiplier = await this.getLocationMultiplier(location);
            const assetTypeMultiplier = await this.getAssetTypeMultiplier(assetType);
            const currentValue = basePrice.price * locationMultiplier * assetTypeMultiplier;
            const marketConditions = await this.getMarketConditions(category, location);
            const priceChange24h = currentValue * (Math.random() * 0.1 - 0.05);
            const priceChangePercent = (priceChange24h / currentValue) * 100;
            return {
                assetId,
                assetType,
                category,
                location,
                currentValue,
                priceChange24h,
                priceChangePercent,
                confidence: basePrice.confidence * 0.9,
                source: `Chainlink + Location/Asset Multipliers`,
                timestamp: new Date(),
                marketConditions
            };
        }
        catch (error) {
            this.logger.error(`Failed to get RWA price data for ${assetId}:`, error);
            return null;
        }
    }
    async getBasePriceForCategory(category, location) {
        try {
            const feedMapping = {
                'Real Estate': 'REAL_ESTATE_INDEX',
                'Farmland': 'WHEAT',
                'Equipment': 'USD_HBAR',
                'Commodities': 'BTC_USD',
                'Vehicles': 'USD_HBAR',
                'Farm Produce': 'WHEAT'
            };
            const feedSymbol = feedMapping[category] || 'USD_HBAR';
            const priceData = await this.chainlinkService.getAssetPrice(feedSymbol, location);
            if (!priceData) {
                return null;
            }
            return {
                price: priceData.price,
                confidence: priceData.confidence
            };
        }
        catch (error) {
            this.logger.error(`Failed to get base price for ${category}:`, error);
            return null;
        }
    }
    async getLocationMultiplier(location) {
        const locationMultipliers = {
            'Victoria Island, Lagos, Nigeria': 2.5,
            'Lekki, Lagos, Nigeria': 1.8,
            'Port Harcourt, Rivers, Nigeria': 1.2,
            'Abuja, Nigeria': 1.5,
            'Kano, Nigeria': 0.8,
            'Lagos, Nigeria': 2.0,
            'New York, USA': 3.0,
            'London, UK': 2.8,
            'Dubai, UAE': 2.2,
            'Singapore': 2.5
        };
        return locationMultipliers[location] || 1.0;
    }
    async getAssetTypeMultiplier(assetType) {
        const assetTypeMultipliers = {
            'Commercial Building': 1.0,
            'Residential Property': 0.8,
            'Agricultural Land': 0.6,
            'Mining Equipment': 1.2,
            'Construction Equipment': 1.1,
            'Vehicles': 0.9,
            'Gold': 1.5,
            'Oil': 1.3
        };
        return assetTypeMultipliers[assetType] || 1.0;
    }
    async getMarketConditions(category, location) {
        return {
            volatility: Math.random() * 0.3 + 0.1,
            liquidity: Math.random() * 0.8 + 0.2,
            demand: Math.random() * 0.9 + 0.1
        };
    }
    async getRWARiskAssessment(assetId, category, location, expectedAPY) {
        try {
            this.logger.log(`Calculating Chainlink-based risk assessment for RWA asset ${assetId}`);
            const marketVolatility = await this.getMarketVolatility(category, location);
            const locationRisk = await this.getLocationRisk(location);
            const assetLiquidity = this.getAssetLiquidity(category);
            const regulatoryRisk = await this.getRegulatoryRisk(location);
            const weatherRisk = category === 'Farmland' || category === 'Farm Produce'
                ? await this.getWeatherRisk(location)
                : undefined;
            const economicRisk = await this.getEconomicRisk(location);
            const riskFactors = {
                marketVolatility,
                locationRisk,
                assetLiquidity,
                regulatoryRisk,
                weatherRisk: weatherRisk || 0,
                economicRisk
            };
            const riskScore = this.calculateRiskScore(riskFactors, expectedAPY);
            const riskLevel = this.determineRiskLevel(riskScore);
            const recommendations = this.generateRiskRecommendations(riskFactors, riskLevel);
            return {
                assetId,
                riskScore,
                riskLevel,
                factors: riskFactors,
                recommendations,
                timestamp: new Date()
            };
        }
        catch (error) {
            this.logger.error(`Failed to calculate risk assessment for ${assetId}:`, error);
            throw new Error(`Risk assessment failed: ${error.message}`);
        }
    }
    async getMarketVolatility(category, location) {
        try {
            const priceData = await this.chainlinkService.getAssetPrice(category, location);
            if (!priceData) {
                return 0.3;
            }
            return Math.random() * 0.4 + 0.1;
        }
        catch (error) {
            this.logger.warn(`Failed to get market volatility: ${error.message}`);
            return 0.3;
        }
    }
    async getLocationRisk(location) {
        const locationRisks = {
            'Victoria Island, Lagos, Nigeria': 0.2,
            'Lekki, Lagos, Nigeria': 0.3,
            'Port Harcourt, Rivers, Nigeria': 0.4,
            'Abuja, Nigeria': 0.2,
            'Kano, Nigeria': 0.5,
            'New York, USA': 0.1,
            'London, UK': 0.1,
            'Dubai, UAE': 0.2,
            'Singapore': 0.1
        };
        return locationRisks[location] || 0.4;
    }
    getAssetLiquidity(category) {
        const liquidityScores = {
            'Real Estate': 0.8,
            'Farmland': 0.4,
            'Equipment': 0.3,
            'Commodities': 0.9,
            'Vehicles': 0.6,
            'Farm Produce': 0.5
        };
        return liquidityScores[category] || 0.5;
    }
    async getRegulatoryRisk(location) {
        const regulatoryRisks = {
            'Nigeria': 0.4,
            'USA': 0.1,
            'UK': 0.1,
            'UAE': 0.2,
            'Singapore': 0.1
        };
        const country = location.split(',').pop()?.trim() || 'Nigeria';
        return regulatoryRisks[country] || 0.4;
    }
    async getWeatherRisk(location) {
        try {
            const lat = 6.5244;
            const lng = 3.3792;
            const weatherData = await this.chainlinkService.getWeatherData(lat, lng);
            if (!weatherData) {
                return 0.3;
            }
            let weatherRisk = 0.1;
            if (weatherData.temperature > 35)
                weatherRisk += 0.2;
            if (weatherData.temperature < 5)
                weatherRisk += 0.1;
            if (weatherData.precipitation > 50)
                weatherRisk += 0.2;
            if (weatherData.precipitation < 10)
                weatherRisk += 0.1;
            if (weatherData.windSpeed > 20)
                weatherRisk += 0.1;
            return Math.min(weatherRisk, 0.8);
        }
        catch (error) {
            this.logger.warn(`Failed to get weather risk: ${error.message}`);
            return 0.3;
        }
    }
    async getEconomicRisk(location) {
        const economicRisks = {
            'Victoria Island, Lagos, Nigeria': 0.3,
            'Lekki, Lagos, Nigeria': 0.3,
            'Port Harcourt, Rivers, Nigeria': 0.4,
            'Abuja, Nigeria': 0.2,
            'Kano, Nigeria': 0.5,
            'New York, USA': 0.1,
            'London, UK': 0.1,
            'Dubai, UAE': 0.2,
            'Singapore': 0.1
        };
        return economicRisks[location] || 0.4;
    }
    calculateRiskScore(factors, expectedAPY) {
        const weights = {
            marketVolatility: 0.25,
            locationRisk: 0.20,
            assetLiquidity: 0.15,
            regulatoryRisk: 0.15,
            weatherRisk: 0.10,
            economicRisk: 0.15
        };
        let riskScore = 0;
        for (const [factor, value] of Object.entries(factors)) {
            if (value !== undefined && typeof value === 'number') {
                riskScore += value * (weights[factor] || 0);
            }
        }
        const apyRiskAdjustment = Math.min(expectedAPY / 50, 0.3);
        riskScore += apyRiskAdjustment;
        return Math.min(riskScore, 1.0);
    }
    determineRiskLevel(riskScore) {
        if (riskScore <= 0.3)
            return 'LOW';
        if (riskScore <= 0.6)
            return 'MEDIUM';
        return 'HIGH';
    }
    generateRiskRecommendations(factors, riskLevel) {
        const recommendations = [];
        if (factors.marketVolatility > 0.4) {
            recommendations.push('Consider hedging against market volatility');
        }
        if (factors.locationRisk > 0.4) {
            recommendations.push('Location presents higher risk - ensure proper insurance coverage');
        }
        if (factors.assetLiquidity < 0.4) {
            recommendations.push('Asset has low liquidity - consider longer investment horizon');
        }
        if (factors.regulatoryRisk > 0.3) {
            recommendations.push('Monitor regulatory changes in the jurisdiction');
        }
        if (factors.weatherRisk > 0.4) {
            recommendations.push('Implement weather risk mitigation strategies');
        }
        if (factors.economicRisk > 0.4) {
            recommendations.push('Diversify across different economic regions');
        }
        if (riskLevel === 'HIGH') {
            recommendations.push('Consider reducing position size or increasing due diligence');
        }
        return recommendations;
    }
    async assignAMCWithVRF(assetId, availableAMCs) {
        try {
            this.logger.log(`Using Chainlink VRF to assign AMC for asset ${assetId}`);
            const vrfResult = await this.chainlinkService.requestRandomNumber();
            if (!vrfResult) {
                throw new Error('Failed to get random value from Chainlink VRF');
            }
            const randomIndex = parseInt(vrfResult.randomValue, 16) % availableAMCs.length;
            const selectedAMC = availableAMCs[randomIndex];
            const assignmentReason = this.generateAssignmentReason(selectedAMC, vrfResult.randomValue);
            return {
                assetId,
                availableAMCs,
                selectedAMC,
                assignmentReason,
                confidence: 0.95,
                timestamp: new Date()
            };
        }
        catch (error) {
            this.logger.error(`Failed to assign AMC with VRF for ${assetId}:`, error);
            throw new Error(`AMC assignment failed: ${error.message}`);
        }
    }
    generateAssignmentReason(selectedAMC, randomValue) {
        const reasons = [
            `Random selection via Chainlink VRF (${randomValue.slice(0, 8)}...) ensures fair distribution`,
            `Chainlink VRF guarantees unbiased AMC assignment for transparent asset management`,
            `Verifiable random selection provides tamper-proof AMC assignment process`,
            `Decentralized randomness ensures no single party can influence AMC selection`
        ];
        return reasons[Math.floor(Math.random() * reasons.length)];
    }
    async getRWAMarketData(category, region) {
        try {
            this.logger.log(`Getting Chainlink-based market data for ${category} in ${region}`);
            const basePrice = await this.getBasePriceForCategory(category, region);
            if (!basePrice) {
                throw new Error(`No market data available for ${category} in ${region}`);
            }
            const averagePrice = basePrice.price;
            const priceTrend = this.calculatePriceTrend(category, region);
            const volume24h = this.calculateVolume24h(category, region);
            const marketCap = this.calculateMarketCap(category, region, averagePrice);
            return {
                category,
                region,
                averagePrice,
                priceTrend,
                volume24h,
                marketCap,
                confidence: basePrice.confidence,
                timestamp: new Date()
            };
        }
        catch (error) {
            this.logger.error(`Failed to get market data for ${category} in ${region}:`, error);
            throw new Error(`Market data retrieval failed: ${error.message}`);
        }
    }
    calculatePriceTrend(category, region) {
        const trend = Math.random();
        if (trend > 0.6)
            return 'UP';
        if (trend < 0.4)
            return 'DOWN';
        return 'STABLE';
    }
    calculateVolume24h(category, region) {
        const baseVolume = {
            'Real Estate': 1000000,
            'Farmland': 500000,
            'Equipment': 200000,
            'Commodities': 2000000,
            'Vehicles': 300000,
            'Farm Produce': 400000
        };
        return baseVolume[category] || 500000;
    }
    calculateMarketCap(category, region, averagePrice) {
        const assetCount = {
            'Real Estate': 1000,
            'Farmland': 500,
            'Equipment': 200,
            'Commodities': 5000,
            'Vehicles': 300,
            'Farm Produce': 800
        };
        return averagePrice * (assetCount[category] || 1000);
    }
};
exports.ChainlinkRWAService = ChainlinkRWAService;
exports.ChainlinkRWAService = ChainlinkRWAService = ChainlinkRWAService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [chainlink_service_1.ChainlinkService,
        config_1.ConfigService])
], ChainlinkRWAService);
//# sourceMappingURL=chainlink-rwa.service.js.map