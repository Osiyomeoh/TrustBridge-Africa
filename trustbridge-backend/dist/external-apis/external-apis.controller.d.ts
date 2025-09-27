import { ExternalApisService } from './external-apis.service';
export declare class OCRRequestDto {
    imageBuffer: string;
    mimeType: string;
}
export declare class GPSVerificationDto {
    lat: number;
    lng: number;
    expectedLocation?: string;
}
export declare class DocumentVerificationDto {
    documentBuffer: Buffer;
    documentType: 'land_certificate' | 'business_license' | 'identity_document';
}
export declare class ExternalApisController {
    private readonly externalApisService;
    constructor(externalApisService: ExternalApisService);
    getExternalApisOverview(): Promise<{
        success: boolean;
        data: {
            status: string;
            availableEndpoints: string[];
        };
        message: string;
    }>;
    extractTextFromImage(ocrRequestDto: OCRRequestDto): Promise<{
        success: boolean;
        data: import("./external-apis.service").OCRResult;
        message: string;
    }>;
    verifyGPSLocation(gpsVerificationDto: GPSVerificationDto): Promise<{
        success: boolean;
        data: {
            verified: boolean;
            confidence: number;
        };
        message: string;
    }>;
    getWeatherData(lat: string, lng: string): Promise<{
        success: boolean;
        data: import("./external-apis.service").WeatherData;
        message: string;
    }>;
    getMarketData(symbol: string): Promise<{
        success: boolean;
        data: import("./external-apis.service").MarketData;
        message: string;
    }>;
    verifyDocument(documentVerificationDto: DocumentVerificationDto): Promise<{
        success: boolean;
        data: {
            isValid: boolean;
            confidence: number;
            extractedData: any;
            issues: string[];
        };
        message: string;
    }>;
    getHealthStatus(): Promise<{
        success: boolean;
        data: {
            services: {
                [service: string]: boolean;
            };
            lastChecked: Date;
        };
        message: string;
    }>;
    getAnalyticsOverview(): Promise<{
        success: boolean;
        data: {
            totalAssets: number;
            totalValue: number;
            totalUsers: number;
            totalAttestors: number;
            totalPools: number;
            totalVolume: number;
            activeVerifications: number;
            completedVerifications: number;
            averageAssetValue: number;
            topCountries: string[];
            assetCategories: {
                agricultural: number;
                realEstate: number;
                vehicles: number;
            };
            monthlyGrowth: number;
            successRate: number;
        };
        message: string;
    }>;
    getAnalyticsStats(): Promise<{
        success: boolean;
        data: {
            system: {
                uptime: string;
                responseTime: string;
                totalRequests: number;
                errorRate: string;
            };
            blockchain: {
                totalTransactions: number;
                gasUsed: string;
                averageBlockTime: string;
                networkStatus: string;
            };
            database: {
                totalRecords: number;
                storageUsed: string;
                queryPerformance: string;
                connectionPool: string;
            };
            mobile: {
                activeUsers: number;
                appVersion: string;
                crashRate: string;
                averageSessionTime: string;
            };
        };
        message: string;
    }>;
    getAvailableServices(): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            description: string;
            status: string;
            features: string[];
        }[];
        message: string;
    }>;
}
