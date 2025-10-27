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
exports.AIController = exports.MarketInsightsDto = exports.PortfolioOptimizationDto = exports.AssetAnalysisDto = exports.AIQueryDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const ai_service_1 = require("./ai.service");
class AIQueryDto {
}
exports.AIQueryDto = AIQueryDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AIQueryDto.prototype, "query", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], AIQueryDto.prototype, "context", void 0);
class AssetAnalysisDto {
}
exports.AssetAnalysisDto = AssetAnalysisDto;
class PortfolioOptimizationDto {
}
exports.PortfolioOptimizationDto = PortfolioOptimizationDto;
class MarketInsightsDto {
}
exports.MarketInsightsDto = MarketInsightsDto;
let AIController = class AIController {
    constructor(aiService) {
        this.aiService = aiService;
    }
    async processQuery(queryDto, req) {
        try {
            const request = {
                query: queryDto.query,
                userId: 'test-user',
                context: {
                    ...queryDto.context,
                    userProfile: { id: 'test-user', email: 'test@example.com' }
                }
            };
            return await this.aiService.processInvestmentQuery(request);
        }
        catch (error) {
            throw new common_1.HttpException('Failed to process AI query', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async analyzeAsset(analysisDto) {
        try {
            return await this.aiService.analyzeAsset(analysisDto.assetData);
        }
        catch (error) {
            throw new common_1.HttpException('Failed to analyze asset', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async optimizePortfolio(portfolioDto) {
        try {
            return await this.aiService.optimizePortfolio(portfolioDto.portfolioData);
        }
        catch (error) {
            throw new common_1.HttpException('Failed to optimize portfolio', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async generateMarketInsights(insightsDto) {
        try {
            return await this.aiService.generateMarketInsights(insightsDto.marketType);
        }
        catch (error) {
            throw new common_1.HttpException('Failed to generate market insights', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async healthCheck() {
        return await this.aiService.healthCheck();
    }
    async testTraining(queryDto) {
        try {
            const request = {
                query: queryDto.query,
                userId: 'test-user',
                context: {
                    ...queryDto.context,
                    userProfile: { id: 'test-user', email: 'test@example.com' }
                }
            };
            return await this.aiService.processInvestmentQuery(request);
        }
        catch (error) {
            throw new common_1.HttpException('Failed to test AI training', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getQuickAdvice(body, req) {
        try {
            const request = {
                query: body.question,
                userId: req.user?.id,
                context: {
                    userProfile: req.user
                }
            };
            return await this.aiService.processInvestmentQuery(request);
        }
        catch (error) {
            throw new common_1.HttpException('Failed to get quick advice', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getUserAIUsage(req) {
        try {
            return await this.aiService.getUserAIUsage(req.user?.id || 'test-user');
        }
        catch (error) {
            throw new common_1.HttpException('Failed to get AI usage statistics', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAILimits() {
        try {
            return {
                dailyLimit: 50,
                monthlyLimit: 1000,
                message: 'AI usage limits (free within limits)'
            };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to get AI limits information', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async generateImage(body, req) {
        try {
            return await this.aiService.generateImage(body.prompt, req.user?.id);
        }
        catch (error) {
            throw new common_1.HttpException('Failed to generate image', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async analyzeImage(body, req) {
        try {
            const result = await this.aiService.analyzeImage(body.imageBase64, body.prompt, req.user?.id);
            return { analysis: result };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to analyze image', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async transcribeAudio(body, req) {
        try {
            const result = await this.aiService.transcribeAudio(body.audioBase64, body.mimeType, req.user?.id);
            return { transcription: result };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to transcribe audio', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async generateVideo(body, req) {
        try {
            return await this.aiService.generateVideo(body.prompt, req.user?.id);
        }
        catch (error) {
            throw new common_1.HttpException('Failed to generate video', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getSearchResults(body, req) {
        try {
            const results = await this.aiService.getSearchResults(body.query, req.user?.id);
            return { searchResults: results };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to get search results', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getMapsData(body, req) {
        try {
            const results = await this.aiService.getMapsData(body.query, req.user?.id);
            return { mapsData: results };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to get maps data', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async analyzeRWAAsset(body, req) {
        try {
            const analysis = await this.aiService.analyzeAsset(body.assetData);
            return { analysis };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to analyze RWA asset', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async analyzeDigitalAsset(body, req) {
        try {
            const analysis = await this.aiService.analyzeAsset(body.assetData);
            return { analysis };
        }
        catch (error) {
            throw new common_1.HttpException('Failed to analyze digital asset', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.AIController = AIController;
__decorate([
    (0, common_1.Post)('query'),
    (0, swagger_1.ApiOperation)({ summary: 'Process user investment query with AI' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'AI response generated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiBody)({ type: AIQueryDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AIQueryDto, Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "processQuery", null);
__decorate([
    (0, common_1.Post)('analyze-asset'),
    (0, swagger_1.ApiOperation)({ summary: 'Analyze asset data with AI' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asset analysis completed' }),
    (0, swagger_1.ApiBody)({ type: AssetAnalysisDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AssetAnalysisDto]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "analyzeAsset", null);
__decorate([
    (0, common_1.Post)('optimize-portfolio'),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI-powered portfolio optimization suggestions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Portfolio optimization completed' }),
    (0, swagger_1.ApiBody)({ type: PortfolioOptimizationDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PortfolioOptimizationDto]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "optimizePortfolio", null);
__decorate([
    (0, common_1.Post)('market-insights'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate AI-powered market insights' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Market insights generated' }),
    (0, swagger_1.ApiBody)({ type: MarketInsightsDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [MarketInsightsDto]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "generateMarketInsights", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Check AI service health' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'AI service health status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AIController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Post)('test-training'),
    (0, swagger_1.ApiOperation)({ summary: 'Test AI with TrustBridge training context' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'AI response with TrustBridge context' }),
    (0, swagger_1.ApiBody)({ type: AIQueryDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AIQueryDto]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "testTraining", null);
__decorate([
    (0, common_1.Post)('quick-advice'),
    (0, swagger_1.ApiOperation)({ summary: 'Get quick investment advice' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Quick advice generated' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "getQuickAdvice", null);
__decorate([
    (0, common_1.Get)('usage'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user AI usage statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'AI usage statistics retrieved' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "getUserAIUsage", null);
__decorate([
    (0, common_1.Get)('pricing'),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI service limits information' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'AI limits information retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AIController.prototype, "getAILimits", null);
__decorate([
    (0, common_1.Post)('generate-image'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate image with text prompt using Google AI Studio' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Image generated successfully' }),
    (0, swagger_1.ApiBody)({ schema: { properties: { prompt: { type: 'string' } } } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "generateImage", null);
__decorate([
    (0, common_1.Post)('analyze-image'),
    (0, swagger_1.ApiOperation)({ summary: 'Analyze and extract data from images' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Image analyzed successfully' }),
    (0, swagger_1.ApiBody)({ schema: { properties: { imageBase64: { type: 'string' }, prompt: { type: 'string' } } } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "analyzeImage", null);
__decorate([
    (0, common_1.Post)('transcribe-audio'),
    (0, swagger_1.ApiOperation)({ summary: 'Transcribe audio to text' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Audio transcribed successfully' }),
    (0, swagger_1.ApiBody)({ schema: { properties: { audioBase64: { type: 'string' }, mimeType: { type: 'string' } } } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "transcribeAudio", null);
__decorate([
    (0, common_1.Post)('generate-video'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate video from text prompt' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Video generated successfully' }),
    (0, swagger_1.ApiBody)({ schema: { properties: { prompt: { type: 'string' } } } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "generateVideo", null);
__decorate([
    (0, common_1.Post)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Get real-time Google Search results' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Search results retrieved successfully' }),
    (0, swagger_1.ApiBody)({ schema: { properties: { query: { type: 'string' } } } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "getSearchResults", null);
__decorate([
    (0, common_1.Post)('maps'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Google Maps data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Maps data retrieved successfully' }),
    (0, swagger_1.ApiBody)({ schema: { properties: { query: { type: 'string' } } } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "getMapsData", null);
__decorate([
    (0, common_1.Post)('analyze-rwa-asset'),
    (0, swagger_1.ApiOperation)({ summary: 'Analyze RWA asset with AI validation, pricing, and risk assessment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'RWA asset analysis completed successfully' }),
    (0, swagger_1.ApiBody)({ schema: {
            properties: {
                assetData: { type: 'object' },
                documents: { type: 'array' }
            }
        } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "analyzeRWAAsset", null);
__decorate([
    (0, common_1.Post)('analyze-digital-asset'),
    (0, swagger_1.ApiOperation)({ summary: 'Analyze digital asset with AI content validation and pricing' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Digital asset analysis completed successfully' }),
    (0, swagger_1.ApiBody)({ schema: {
            properties: {
                assetData: { type: 'object' },
                contentFiles: { type: 'array' }
            }
        } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "analyzeDigitalAsset", null);
exports.AIController = AIController = __decorate([
    (0, swagger_1.ApiTags)('AI'),
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AIService])
], AIController);
//# sourceMappingURL=ai.controller.js.map