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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalApisController = exports.DocumentVerificationDto = exports.GPSVerificationDto = exports.OCRRequestDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const external_apis_service_1 = require("./external-apis.service");
class OCRRequestDto {
}
exports.OCRRequestDto = OCRRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OCRRequestDto.prototype, "imageBuffer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'image/png' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OCRRequestDto.prototype, "mimeType", void 0);
class GPSVerificationDto {
}
exports.GPSVerificationDto = GPSVerificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 6.5244 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GPSVerificationDto.prototype, "lat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3.3792 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GPSVerificationDto.prototype, "lng", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Lagos, Nigeria', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GPSVerificationDto.prototype, "expectedLocation", void 0);
class DocumentVerificationDto {
}
exports.DocumentVerificationDto = DocumentVerificationDto;
let ExternalApisController = class ExternalApisController {
    constructor(externalApisService) {
        this.externalApisService = externalApisService;
    }
    async getExternalApisOverview() {
        return {
            success: true,
            data: {
                status: 'External APIs service is running',
                availableEndpoints: [
                    'GET /api/external/health - Health status',
                    'GET /api/external/services - Available services',
                    'GET /api/external/weather - Weather data',
                    'GET /api/external/market/:symbol - Market data',
                    'POST /api/external/ocr/extract - OCR text extraction',
                    'POST /api/external/gps/verify - GPS verification',
                    'POST /api/external/document/verify - Document verification'
                ]
            },
            message: 'External APIs service is operational'
        };
    }
    async extractTextFromImage(ocrRequestDto) {
        const imageBuffer = Buffer.from(ocrRequestDto.imageBuffer, 'base64');
        const result = await this.externalApisService.extractTextFromImage(imageBuffer, ocrRequestDto.mimeType);
        return {
            success: true,
            data: result,
            message: 'Text extracted successfully',
        };
    }
    async verifyGPSLocation(gpsVerificationDto) {
        const result = await this.externalApisService.verifyGPSLocation(gpsVerificationDto.lat, gpsVerificationDto.lng, gpsVerificationDto.expectedLocation || '');
        return {
            success: true,
            data: result,
            message: 'GPS location verified successfully',
        };
    }
    async getWeatherData(lat, lng) {
        const result = await this.externalApisService.getWeatherData(parseFloat(lat), parseFloat(lng));
        return {
            success: true,
            data: result,
            message: 'Weather data retrieved successfully',
        };
    }
    async getMarketData(symbol) {
        const result = await this.externalApisService.getMarketData(symbol);
        return {
            success: true,
            data: result,
            message: 'Market data retrieved successfully',
        };
    }
    async verifyDocument(documentVerificationDto) {
        const result = await this.externalApisService.verifyDocument(documentVerificationDto.documentBuffer, documentVerificationDto.documentType);
        return {
            success: true,
            data: result,
            message: 'Document verified successfully',
        };
    }
    async getHealthStatus() {
        const result = await this.externalApisService.getHealthStatus();
        return {
            success: true,
            data: result,
            message: 'Health status retrieved successfully',
        };
    }
    async getAvailableServices() {
        const services = [
            {
                id: 'google_vision',
                name: 'Google Vision API',
                description: 'OCR and image analysis',
                status: 'available',
                features: ['Text extraction', 'Document analysis', 'Image classification'],
            },
            {
                id: 'google_geocoding',
                name: 'Google Geocoding API',
                description: 'GPS location verification',
                status: 'available',
                features: ['Reverse geocoding', 'Address validation', 'Location details'],
            },
            {
                id: 'openweather',
                name: 'OpenWeather API',
                description: 'Weather data and forecasts',
                status: 'available',
                features: ['Current weather', 'Forecasts', 'Historical data'],
            },
            {
                id: 'alpha_vantage',
                name: 'Alpha Vantage API',
                description: 'Financial market data',
                status: 'available',
                features: ['Stock prices', 'Commodity prices', 'Market indicators'],
            },
            {
                id: 'aws_textract',
                name: 'AWS Textract',
                description: 'Document text extraction',
                status: 'available',
                features: ['PDF processing', 'Form extraction', 'Table extraction'],
            },
        ];
        return {
            success: true,
            data: services,
            message: 'Services list retrieved successfully',
        };
    }
};
exports.ExternalApisController = ExternalApisController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get external APIs overview' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'External APIs overview' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ExternalApisController.prototype, "getExternalApisOverview", null);
__decorate([
    (0, common_1.Post)('ocr/extract'),
    (0, swagger_1.ApiOperation)({ summary: 'Extract text from image using OCR' }),
    (0, swagger_1.ApiBody)({ type: OCRRequestDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Text extracted successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [OCRRequestDto]),
    __metadata("design:returntype", Promise)
], ExternalApisController.prototype, "extractTextFromImage", null);
__decorate([
    (0, common_1.Post)('gps/verify'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify GPS location' }),
    (0, swagger_1.ApiBody)({ type: GPSVerificationDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'GPS location verified successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GPSVerificationDto]),
    __metadata("design:returntype", Promise)
], ExternalApisController.prototype, "verifyGPSLocation", null);
__decorate([
    (0, common_1.Get)('weather'),
    (0, swagger_1.ApiOperation)({ summary: 'Get weather data for location' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Weather data retrieved successfully' }),
    __param(0, (0, common_1.Query)('lat')),
    __param(1, (0, common_1.Query)('lng')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ExternalApisController.prototype, "getWeatherData", null);
__decorate([
    (0, common_1.Get)('market/:symbol'),
    (0, swagger_1.ApiOperation)({ summary: 'Get market data for symbol' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Market data retrieved successfully' }),
    __param(0, (0, common_1.Param)('symbol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExternalApisController.prototype, "getMarketData", null);
__decorate([
    (0, common_1.Post)('document/verify'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify document authenticity' }),
    (0, swagger_1.ApiBody)({ type: DocumentVerificationDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Document verified successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DocumentVerificationDto]),
    __metadata("design:returntype", Promise)
], ExternalApisController.prototype, "verifyDocument", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Get external APIs health status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Health status retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ExternalApisController.prototype, "getHealthStatus", null);
__decorate([
    (0, common_1.Get)('services'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available external services' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Services list retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ExternalApisController.prototype, "getAvailableServices", null);
exports.ExternalApisController = ExternalApisController = __decorate([
    (0, swagger_1.ApiTags)('External APIs'),
    (0, common_1.Controller)('api/external'),
    __metadata("design:paramtypes", [external_apis_service_1.ExternalApisService])
], ExternalApisController);
//# sourceMappingURL=external-apis.controller.js.map