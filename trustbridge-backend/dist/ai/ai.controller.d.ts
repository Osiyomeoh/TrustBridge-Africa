import { AIService, AIQueryResponse } from './ai.service';
export declare class AIQueryDto {
    query: string;
    context?: {
        userProfile?: any;
        currentAsset?: any;
        portfolio?: any;
        marketData?: any;
    };
}
export declare class AssetAnalysisDto {
    assetData: any;
}
export declare class PortfolioOptimizationDto {
    portfolioData: any;
}
export declare class MarketInsightsDto {
    marketType: string;
}
export declare class AIController {
    private readonly aiService;
    constructor(aiService: AIService);
    processQuery(queryDto: AIQueryDto, req: any): Promise<AIQueryResponse>;
    analyzeAsset(analysisDto: AssetAnalysisDto): Promise<AIQueryResponse>;
    optimizePortfolio(portfolioDto: PortfolioOptimizationDto): Promise<AIQueryResponse>;
    generateMarketInsights(insightsDto: MarketInsightsDto): Promise<AIQueryResponse>;
    healthCheck(): Promise<{
        status: string;
        apiKeyConfigured: boolean;
        timestamp: string;
    }>;
    testTraining(queryDto: AIQueryDto): Promise<AIQueryResponse>;
    getQuickAdvice(body: {
        question: string;
    }, req: any): Promise<AIQueryResponse>;
    getUserAIUsage(req: any): Promise<{
        dailyUsage: number;
        monthlyUsage: number;
        totalQueries: number;
        dailyLimit: number;
        monthlyLimit: number;
        trustTokenBalance: number;
        costPerQuery: number;
    }>;
    getAILimits(): Promise<{
        dailyLimit: number;
        monthlyLimit: number;
        message: string;
    }>;
    generateImage(body: {
        prompt: string;
    }, req: any): Promise<{
        imageUrl: string;
        prompt: string;
    }>;
    analyzeImage(body: {
        imageBase64: string;
        prompt: string;
    }, req: any): Promise<{
        analysis: string;
    }>;
    transcribeAudio(body: {
        audioBase64: string;
        mimeType: string;
    }, req: any): Promise<{
        transcription: string;
    }>;
    generateVideo(body: {
        prompt: string;
    }, req: any): Promise<{
        videoUrl: string;
        prompt: string;
    }>;
    getSearchResults(body: {
        query: string;
    }, req: any): Promise<{
        searchResults: any[];
    }>;
    getMapsData(body: {
        query: string;
    }, req: any): Promise<{
        mapsData: any[];
    }>;
    analyzeRWAAsset(body: {
        assetData: any;
        documents: any[];
    }, req: any): Promise<{
        analysis: AIQueryResponse;
    }>;
    analyzeDigitalAsset(body: {
        assetData: any;
        contentFiles: any[];
    }, req: any): Promise<{
        analysis: AIQueryResponse;
    }>;
}
