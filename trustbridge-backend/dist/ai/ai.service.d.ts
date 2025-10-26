import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
export interface AIQueryRequest {
    query: string;
    userId?: string;
    context?: {
        userProfile?: any;
        currentAsset?: any;
        portfolio?: any;
        marketData?: any;
    };
}
export interface AIQueryResponse {
    response: string;
    suggestions?: string[];
    confidence?: number;
    metadata?: {
        queryType: string;
        processingTime: number;
        sources?: string[];
    };
}
export declare class AIService {
    private configService;
    private userModel;
    private readonly logger;
    private readonly googleAIUrl;
    private readonly apiKey;
    private readonly AI_CREDIT_COST_PER_QUERY;
    private readonly AI_DAILY_LIMIT;
    private readonly AI_MONTHLY_LIMIT;
    constructor(configService: ConfigService, userModel: Model<User>);
    private checkUserCredits;
    private deductCreditsAndUpdateUsage;
    processInvestmentQuery(request: AIQueryRequest): Promise<AIQueryResponse>;
    analyzeAsset(assetData: any): Promise<AIQueryResponse>;
    optimizePortfolio(portfolioData: any): Promise<AIQueryResponse>;
    generateMarketInsights(marketType: string): Promise<AIQueryResponse>;
    private buildSystemPrompt;
    private buildUserMessage;
    private classifyQueryType;
    private generateSuggestions;
    private getFallbackResponse;
    getUserAIUsage(userId: string): Promise<{
        dailyUsage: number;
        monthlyUsage: number;
        totalQueries: number;
        dailyLimit: number;
        monthlyLimit: number;
        trustTokenBalance: number;
        costPerQuery: number;
    }>;
    getAIPricing(): {
        costPerQuery: number;
        dailyLimit: number;
        monthlyLimit: number;
        currency: string;
    };
    generateImage(prompt: string, userId: string): Promise<{
        imageUrl: string;
        prompt: string;
    }>;
    analyzeImage(imageBase64: string, prompt: string, userId: string): Promise<string>;
    transcribeAudio(audioBase64: string, mimeType: string, userId: string): Promise<string>;
    generateVideo(prompt: string, userId: string): Promise<{
        videoUrl: string;
        prompt: string;
    }>;
    getSearchResults(query: string, userId: string): Promise<any[]>;
    getMapsData(query: string, userId: string): Promise<any[]>;
    healthCheck(): Promise<{
        status: string;
        apiKeyConfigured: boolean;
        timestamp: string;
    }>;
}
