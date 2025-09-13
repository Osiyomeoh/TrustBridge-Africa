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
