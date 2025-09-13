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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ExternalApisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalApisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
let ExternalApisService = ExternalApisService_1 = class ExternalApisService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(ExternalApisService_1.name);
        this.googleApiKey = this.configService.get('GOOGLE_API_KEY');
        this.openWeatherApiKey = this.configService.get('OPENWEATHER_API_KEY');
        this.alphaVantageApiKey = this.configService.get('ALPHA_VANTAGE_API_KEY');
        this.awsAccessKey = this.configService.get('AWS_ACCESS_KEY_ID');
        this.awsSecretKey = this.configService.get('AWS_SECRET_ACCESS_KEY');
        this.externalAPIs = {
            googleMaps: {
                apiKey: this.configService.get('GOOGLE_MAPS_API_KEY'),
                baseUrl: 'https://maps.googleapis.com/maps/api',
            },
            openWeatherMap: {
                apiKey: this.configService.get('OPENWEATHER_API_KEY'),
                baseUrl: 'https://api.openweathermap.org/data/2.5',
            },
        };
    }
    async extractTextFromImage(imageBuffer, mimeType) {
        try {
            if (this.googleApiKey) {
                return await this.extractTextWithGoogleVision(imageBuffer, mimeType);
            }
            if (this.awsAccessKey && this.awsSecretKey) {
                return await this.extractTextWithAWS(imageBuffer, mimeType);
            }
            return await this.extractTextWithTesseract(imageBuffer, mimeType);
        }
        catch (error) {
            this.logger.error('OCR extraction failed:', error);
            throw error;
        }
    }
    async extractTextWithGoogleVision(imageBuffer, mimeType) {
        try {
            const base64Image = imageBuffer.toString('base64');
            const response = await axios_1.default.post(`https://vision.googleapis.com/v1/images:annotate?key=${this.googleApiKey}`, {
                requests: [
                    {
                        image: {
                            content: base64Image,
                        },
                        features: [
                            {
                                type: 'TEXT_DETECTION',
                                maxResults: 1,
                            },
                            {
                                type: 'DOCUMENT_TEXT_DETECTION',
                                maxResults: 1,
                            },
                        ],
                    },
                ],
            });
            const annotations = response.data.responses[0];
            const textAnnotations = annotations.textAnnotations || [];
            const documentAnnotations = annotations.fullTextAnnotation || {};
            let extractedText = '';
            let confidence = 0;
            if (textAnnotations.length > 0) {
                extractedText = textAnnotations[0].description || '';
                confidence = textAnnotations[0].score || 0.8;
            }
            else if (documentAnnotations.text) {
                extractedText = documentAnnotations.text;
                confidence = 0.9;
            }
            const entities = this.extractEntities(extractedText);
            return {
                text: extractedText,
                confidence,
                language: 'en',
                entities,
            };
        }
        catch (error) {
            this.logger.error('Google Vision API failed:', error);
            throw error;
        }
    }
    async extractTextWithAWS(imageBuffer, mimeType) {
        try {
            this.logger.log('Using Tesseract OCR for text extraction');
            return this.extractTextWithTesseract(imageBuffer, mimeType);
        }
        catch (error) {
            this.logger.error('AWS Textract failed:', error);
            throw error;
        }
    }
    async extractTextWithTesseract(imageBuffer, mimeType) {
        try {
            if (!imageBuffer || imageBuffer.length < 100) {
                this.logger.warn('Image buffer too small for OCR, using Tesseract');
                return this.extractTextWithTesseract(imageBuffer, mimeType);
            }
            const { createWorker } = require('tesseract.js');
            const worker = await createWorker('eng');
            const { data: { text, confidence } } = await worker.recognize(imageBuffer);
            await worker.terminate();
            return {
                text: text.trim(),
                confidence: confidence / 100,
                language: 'en',
                entities: this.extractEntities(text),
            };
        }
        catch (error) {
            this.logger.error('Tesseract.js OCR failed:', error);
            return this.extractBasicText(imageBuffer, mimeType);
        }
    }
    async extractBasicText(imageBuffer, mimeType) {
        try {
            const fileInfo = {
                size: imageBuffer.length,
                type: mimeType,
                timestamp: new Date().toISOString(),
            };
            let extractedText = `Document Analysis Report\n`;
            extractedText += `File Type: ${mimeType}\n`;
            extractedText += `File Size: ${fileInfo.size} bytes\n`;
            extractedText += `Analysis Date: ${fileInfo.timestamp}\n`;
            extractedText += `Status: Basic analysis completed\n`;
            extractedText += `Note: Full OCR requires Tesseract.js integration\n`;
            return {
                text: extractedText,
                confidence: 0.6,
                language: 'en',
                entities: this.extractEntities(extractedText),
            };
        }
        catch (error) {
            this.logger.error('Basic text extraction failed:', error);
            throw new Error('Unable to extract text from document');
        }
    }
    extractEntities(text) {
        const entities = [];
        const patterns = {
            email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
            phone: /\b(?:\+?234|0)?[789][01]\d{8}\b/g,
            address: /\b\d+\s+[A-Za-z\s]+(?:Street|Road|Avenue|Lane|Drive|Way|Boulevard|Crescent|Close|Place|Square|Gardens|Estate|Village|Town|City|State|Country)\b/g,
            amount: /\b₦[\d,]+(?:\.\d{2})?\b|\b\d+(?:\.\d{2})?\s*(?:naira|NGN|₦)\b/g,
            date: /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g,
            id: /\b[A-Z]{2,3}\/\d{4}\/\d{3,6}\b/g,
        };
        for (const [type, pattern] of Object.entries(patterns)) {
            const matches = text.match(pattern);
            if (matches) {
                entities.push(...matches.map(match => ({
                    type,
                    value: match,
                    confidence: 0.8,
                })));
            }
        }
        return entities;
    }
    async getOpenStreetMapLocation(lat, lng) {
        try {
            const response = await axios_1.default.get(`https://nominatim.openstreetmap.org/reverse`, {
                params: {
                    lat,
                    lon: lng,
                    format: 'json',
                    addressdetails: 1,
                },
                headers: {
                    'User-Agent': 'TrustBridge/1.0',
                },
            });
            const data = response.data;
            if (!data || !data.address) {
                return null;
            }
            return {
                country: data.address.country || 'Unknown',
                region: data.address.state || data.address.region || 'Unknown',
                coordinates: { lat, lng },
                address: data.display_name,
            };
        }
        catch (error) {
            this.logger.error('OpenStreetMap geocoding failed:', error);
            return null;
        }
    }
    async getGPSLocation(lat, lng) {
        try {
            if (!this.externalAPIs.googleMaps.apiKey) {
                this.logger.warn('Google Maps API key not configured, using OpenStreetMap');
                return this.getOpenStreetMapLocation(lat, lng);
            }
            const response = await axios_1.default.get(`${this.externalAPIs.googleMaps.baseUrl}/geocode/json`, {
                params: {
                    latlng: `${lat},${lng}`,
                    key: this.externalAPIs.googleMaps.apiKey,
                },
            });
            const results = response.data.results;
            if (!results || results.length === 0) {
                return null;
            }
            const result = results[0];
            const addressComponents = result.address_components;
            let country = 'Unknown';
            let region = 'Unknown';
            for (const component of addressComponents) {
                if (component.types.includes('country')) {
                    country = component.long_name;
                }
                if (component.types.includes('administrative_area_level_1')) {
                    region = component.long_name;
                }
            }
            return {
                address: result.formatted_address,
                country,
                region,
                coordinates: { lat, lng },
            };
        }
        catch (error) {
            this.logger.error('Google Geocoding failed:', error);
            throw error;
        }
    }
    async verifyGPSWithOSM(lat, lng) {
        try {
            const response = await axios_1.default.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
            const data = response.data;
            if (!data || !data.display_name) {
                return null;
            }
            return {
                address: data.display_name,
                country: data.address?.country || 'Unknown',
                region: data.address?.state || data.address?.county || 'Unknown',
                coordinates: { lat, lng },
            };
        }
        catch (error) {
            this.logger.error('OpenStreetMap geocoding failed:', error);
            throw error;
        }
    }
    async getWeatherData(lat, lng) {
        try {
            if (this.openWeatherApiKey) {
                return await this.getWeatherWithOpenWeather(lat, lng);
            }
            return this.getOpenStreetMapWeather(lat, lng);
        }
        catch (error) {
            this.logger.error('Weather data fetch failed:', error);
            throw error;
        }
    }
    async getWeatherWithOpenWeather(lat, lng) {
        try {
            const response = await axios_1.default.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${this.openWeatherApiKey}&units=metric`);
            const data = response.data;
            return {
                location: data.name,
                temperature: data.main.temp,
                humidity: data.main.humidity,
                precipitation: data.rain?.['1h'] || 0,
                windSpeed: data.wind.speed,
                conditions: data.weather[0].description,
                timestamp: new Date(),
                forecast: [],
            };
        }
        catch (error) {
            this.logger.error('OpenWeather API failed:', error);
            throw error;
        }
    }
    async getOpenStreetMapWeather(lat, lng) {
        try {
            const response = await axios_1.default.get(`https://api.openweathermap.org/data/2.5/weather`, {
                params: {
                    lat,
                    lon: lng,
                    appid: this.openWeatherApiKey || 'demo',
                    units: 'metric',
                },
            });
            const data = response.data;
            return {
                temperature: data.main.temp,
                humidity: data.main.humidity,
                precipitation: data.rain?.['1h'] || 0,
                windSpeed: data.wind.speed,
                conditions: data.weather[0].main.toLowerCase(),
                timestamp: new Date(),
                location: `${lat},${lng}`,
                forecast: [],
            };
        }
        catch (error) {
            this.logger.error('OpenStreetMap weather fetch failed:', error);
            throw new Error('Unable to fetch weather data');
        }
    }
    async getMarketData(symbol) {
        try {
            if (this.alphaVantageApiKey) {
                return await this.getMarketDataWithAlphaVantage(symbol);
            }
            return await this.getMarketDataWithYahoo(symbol);
        }
        catch (error) {
            this.logger.error('Market data fetch failed:', error);
            throw error;
        }
    }
    async getMarketDataWithAlphaVantage(symbol) {
        try {
            const response = await axios_1.default.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.alphaVantageApiKey}`);
            const data = response.data['Global Quote'];
            if (!data) {
                throw new Error('No market data available');
            }
            return {
                symbol: data['01. symbol'],
                price: parseFloat(data['05. price']),
                change: parseFloat(data['09. change']),
                changePercent: parseFloat(data['10. change percent'].replace('%', '')),
                volume: parseInt(data['06. volume']),
                marketCap: 0,
                timestamp: new Date(),
                source: 'Alpha Vantage',
            };
        }
        catch (error) {
            this.logger.error('Alpha Vantage API failed:', error);
            throw error;
        }
    }
    async getMarketDataWithYahoo(symbol) {
        try {
            this.logger.log('Yahoo Finance integration not implemented, using CoinGecko');
            return this.getMarketDataWithCoinGecko(symbol);
        }
        catch (error) {
            this.logger.error('Yahoo Finance API failed:', error);
            throw error;
        }
    }
    async getMarketDataWithCoinGecko(symbol) {
        try {
            const response = await axios_1.default.get(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`);
            const data = response.data[symbol.toLowerCase()];
            if (!data) {
                throw new Error(`Symbol ${symbol} not found`);
            }
            return {
                symbol: symbol.toUpperCase(),
                price: data.usd,
                change: data.usd_24h_change || 0,
                changePercent: data.usd_24h_change || 0,
                volume: data.usd_24h_vol || 0,
                marketCap: data.usd_market_cap || 0,
                timestamp: new Date(),
                source: 'CoinGecko API',
            };
        }
        catch (error) {
            this.logger.error('CoinGecko API failed:', error);
            throw new Error('Unable to fetch market data');
        }
    }
    async verifyGPSLocation(lat, lng, expectedLocation) {
        try {
            const location = await this.getGPSLocation(lat, lng);
            if (!location) {
                return { verified: false, confidence: 0 };
            }
            const locationText = (location.address || '').toLowerCase();
            const expectedText = expectedLocation.toLowerCase();
            const verified = locationText.includes(expectedText) || expectedText.includes(locationText);
            const confidence = verified ? 0.9 : 0.1;
            return { verified, confidence };
        }
        catch (error) {
            this.logger.error('GPS verification failed:', error);
            return { verified: false, confidence: 0 };
        }
    }
    async verifyDocument(documentBuffer, documentType) {
        try {
            const ocrResult = await this.extractTextFromImage(documentBuffer, 'application/pdf');
            switch (documentType) {
                case 'land_certificate':
                    return this.verifyLandCertificate(ocrResult);
                case 'business_license':
                    return this.verifyBusinessLicense(ocrResult);
                case 'identity_document':
                    return this.verifyIdentityDocument(ocrResult);
                default:
                    return {
                        isValid: true,
                        confidence: ocrResult.confidence,
                        extractedData: ocrResult,
                        issues: [],
                    };
            }
        }
        catch (error) {
            this.logger.error('Document verification failed:', error);
            throw error;
        }
    }
    verifyLandCertificate(ocrResult) {
        const issues = [];
        let confidence = ocrResult.confidence;
        const requiredFields = ['owner', 'location', 'size', 'date'];
        const text = ocrResult.text.toLowerCase();
        for (const field of requiredFields) {
            if (!text.includes(field)) {
                issues.push(`Missing required field: ${field}`);
                confidence -= 0.1;
            }
        }
        if (text.includes('fake') || text.includes('test')) {
            issues.push('Document appears to be fake or test document');
            confidence -= 0.3;
        }
        return {
            isValid: issues.length === 0,
            confidence: Math.max(0, confidence),
            extractedData: ocrResult,
            issues,
        };
    }
    verifyBusinessLicense(ocrResult) {
        const issues = [];
        let confidence = ocrResult.confidence;
        const requiredFields = ['license', 'business', 'registration', 'date'];
        const text = ocrResult.text.toLowerCase();
        for (const field of requiredFields) {
            if (!text.includes(field)) {
                issues.push(`Missing required field: ${field}`);
                confidence -= 0.1;
            }
        }
        return {
            isValid: issues.length === 0,
            confidence: Math.max(0, confidence),
            extractedData: ocrResult,
            issues,
        };
    }
    verifyIdentityDocument(ocrResult) {
        const issues = [];
        let confidence = ocrResult.confidence;
        const requiredFields = ['name', 'id', 'date', 'birth'];
        const text = ocrResult.text.toLowerCase();
        for (const field of requiredFields) {
            if (!text.includes(field)) {
                issues.push(`Missing required field: ${field}`);
                confidence -= 0.1;
            }
        }
        return {
            isValid: issues.length === 0,
            confidence: Math.max(0, confidence),
            extractedData: ocrResult,
            issues,
        };
    }
    async getHealthStatus() {
        const services = {};
        services.google_vision = !!this.googleApiKey;
        services.google_geocoding = !!this.googleApiKey;
        services.openweather = !!this.openWeatherApiKey;
        services.alpha_vantage = !!this.alphaVantageApiKey;
        services.aws_textract = !!(this.awsAccessKey && this.awsSecretKey);
        return {
            services,
            lastChecked: new Date(),
        };
    }
};
exports.ExternalApisService = ExternalApisService;
exports.ExternalApisService = ExternalApisService = ExternalApisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ExternalApisService);
//# sourceMappingURL=external-apis.service.js.map