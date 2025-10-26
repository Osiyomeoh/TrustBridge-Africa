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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AIService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const axios_1 = __importDefault(require("axios"));
const user_schema_1 = require("../schemas/user.schema");
let AIService = AIService_1 = class AIService {
    constructor(configService, userModel) {
        this.configService = configService;
        this.userModel = userModel;
        this.logger = new common_1.Logger(AIService_1.name);
        this.googleAIUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
        this.AI_CREDIT_COST_PER_QUERY = 2;
        this.AI_DAILY_LIMIT = 50;
        this.AI_MONTHLY_LIMIT = 1000;
        this.apiKey = this.configService.get('GOOGLE_AI_API_KEY') || '';
        if (!this.apiKey) {
            this.logger.warn('GOOGLE_AI_API_KEY not found in environment variables');
        }
    }
    async checkUserCredits(userId) {
        try {
            const user = await this.userModel.findById(userId);
            if (!user) {
                return { canProceed: false, message: 'User not found', requiredTokens: this.AI_CREDIT_COST_PER_QUERY };
            }
            const trustBalance = user.trustTokenBalance || 0;
            if (trustBalance < this.AI_CREDIT_COST_PER_QUERY) {
                return {
                    canProceed: false,
                    message: `Insufficient TRUST tokens. You need ${this.AI_CREDIT_COST_PER_QUERY} TRUST tokens for AI queries. Current balance: ${trustBalance} TRUST.`,
                    requiredTokens: this.AI_CREDIT_COST_PER_QUERY
                };
            }
            const today = new Date().toISOString().split('T')[0];
            const dailyUsage = user.aiUsage?.daily?.[today] || 0;
            if (dailyUsage >= this.AI_DAILY_LIMIT) {
                return {
                    canProceed: false,
                    message: `Daily AI query limit reached (${this.AI_DAILY_LIMIT} queries per day). Try again tomorrow.`,
                    requiredTokens: this.AI_CREDIT_COST_PER_QUERY
                };
            }
            const currentMonth = new Date().toISOString().substring(0, 7);
            const monthlyUsage = user.aiUsage?.monthly?.[currentMonth] || 0;
            if (monthlyUsage >= this.AI_MONTHLY_LIMIT) {
                return {
                    canProceed: false,
                    message: `Monthly AI query limit reached (${this.AI_MONTHLY_LIMIT} queries per month). Upgrade your plan for more queries.`,
                    requiredTokens: this.AI_CREDIT_COST_PER_QUERY
                };
            }
            return { canProceed: true, requiredTokens: this.AI_CREDIT_COST_PER_QUERY };
        }
        catch (error) {
            this.logger.error('Error checking user credits:', error);
            return {
                canProceed: false,
                message: 'Error checking user credits. Please try again.',
                requiredTokens: this.AI_CREDIT_COST_PER_QUERY
            };
        }
    }
    async deductCreditsAndUpdateUsage(userId) {
        try {
            const user = await this.userModel.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            user.trustTokenBalance = Math.max(0, (user.trustTokenBalance || 0) - this.AI_CREDIT_COST_PER_QUERY);
            const today = new Date().toISOString().split('T')[0];
            const currentMonth = new Date().toISOString().substring(0, 7);
            if (!user.aiUsage) {
                user.aiUsage = { daily: {}, monthly: {}, totalQueries: 0 };
            }
            user.aiUsage.daily[today] = (user.aiUsage.daily[today] || 0) + 1;
            user.aiUsage.monthly[currentMonth] = (user.aiUsage.monthly[currentMonth] || 0) + 1;
            user.aiUsage.totalQueries = (user.aiUsage.totalQueries || 0) + 1;
            await user.save();
            this.logger.log(`AI credits deducted for user ${userId}: ${this.AI_CREDIT_COST_PER_QUERY} TRUST tokens`);
        }
        catch (error) {
            this.logger.error('Error deducting credits and updating usage:', error);
            throw new Error('Failed to process AI query payment');
        }
    }
    async processInvestmentQuery(request) {
        const startTime = Date.now();
        try {
            if (request.userId) {
                const creditCheck = await this.checkUserCredits(request.userId);
                if (!creditCheck.canProceed) {
                    return {
                        response: creditCheck.message || 'Insufficient credits for AI query',
                        suggestions: [
                            'Get more TRUST tokens',
                            'Check your daily/monthly limits',
                            'Upgrade your plan for higher limits'
                        ],
                        confidence: 0,
                        metadata: {
                            queryType: 'credit_error',
                            processingTime: Date.now() - startTime,
                            sources: ['TrustBridge Credit System']
                        }
                    };
                }
                await this.deductCreditsAndUpdateUsage(request.userId);
            }
            if (!this.apiKey) {
                return this.getFallbackResponse(request.query);
            }
            const systemPrompt = this.buildSystemPrompt(request.context);
            const userMessage = this.buildUserMessage(request.query, request.context);
            const response = await axios_1.default.post(`${this.googleAIUrl}?key=${this.apiKey}`, {
                contents: [
                    {
                        parts: [
                            {
                                text: `${systemPrompt}\n\n${userMessage}`
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000,
                    topP: 0.8,
                    topK: 10
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000,
            });
            const aiResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I could not generate a response at this time.';
            const processingTime = Date.now() - startTime;
            return {
                response: aiResponse,
                suggestions: this.generateSuggestions(request.query),
                confidence: 0.9,
                metadata: {
                    queryType: this.classifyQueryType(request.query),
                    processingTime,
                    sources: ['TrustBridge AI Analysis', 'Market Data', 'Investment Models']
                }
            };
        }
        catch (error) {
            this.logger.error('Error processing AI query:', error);
            return this.getFallbackResponse(request.query);
        }
    }
    async analyzeAsset(assetData) {
        const query = `Analyze this asset data and provide investment insights: ${JSON.stringify(assetData)}`;
        return this.processInvestmentQuery({
            query,
            context: { currentAsset: assetData }
        });
    }
    async optimizePortfolio(portfolioData) {
        const query = `Analyze this portfolio and provide optimization recommendations: ${JSON.stringify(portfolioData)}`;
        return this.processInvestmentQuery({
            query,
            context: { portfolio: portfolioData }
        });
    }
    async generateMarketInsights(marketType) {
        const query = `Provide current market insights and trends for ${marketType} investments`;
        return this.processInvestmentQuery({
            query,
            context: { marketData: { type: marketType } }
        });
    }
    buildSystemPrompt(context) {
        return `You are an expert investment advisor for TrustBridge, a real-world asset (RWA) and digital asset tokenization platform. 

Your role is to provide intelligent, data-driven investment advice to users. You have access to:

- Real-world asset data (real estate, commodities, infrastructure)
- Digital asset information (NFTs, digital collectibles)
- Market trends and analysis
- User portfolio data
- Risk assessment models

Guidelines:
1. Always provide balanced, objective advice
2. Consider risk factors and diversification
3. Explain your reasoning clearly
4. Suggest specific actions when appropriate
5. Include relevant market context
6. Be cautious about making predictions
7. Encourage users to do their own research

Current context: ${context ? JSON.stringify(context) : 'No specific context'}

Provide helpful, actionable investment advice based on the user's query.`;
    }
    buildUserMessage(query, context) {
        let message = `User Query: ${query}`;
        if (context?.userProfile) {
            message += `\n\nUser Profile: ${JSON.stringify(context.userProfile)}`;
        }
        if (context?.currentAsset) {
            message += `\n\nCurrent Asset: ${JSON.stringify(context.currentAsset)}`;
        }
        if (context?.portfolio) {
            message += `\n\nPortfolio Data: ${JSON.stringify(context.portfolio)}`;
        }
        return message;
    }
    classifyQueryType(query) {
        const lowerQuery = query.toLowerCase();
        if (lowerQuery.includes('invest') || lowerQuery.includes('buy')) {
            return 'investment_advice';
        }
        else if (lowerQuery.includes('risk') || lowerQuery.includes('safe')) {
            return 'risk_assessment';
        }
        else if (lowerQuery.includes('portfolio') || lowerQuery.includes('diversify')) {
            return 'portfolio_optimization';
        }
        else if (lowerQuery.includes('market') || lowerQuery.includes('trend')) {
            return 'market_analysis';
        }
        else if (lowerQuery.includes('sell') || lowerQuery.includes('exit')) {
            return 'exit_strategy';
        }
        else {
            return 'general_inquiry';
        }
    }
    generateSuggestions(query) {
        const suggestions = [
            'View similar assets in the marketplace',
            'Check your current portfolio allocation',
            'Review risk assessment for this asset type',
            'Consider market trends and timing'
        ];
        const queryType = this.classifyQueryType(query);
        switch (queryType) {
            case 'investment_advice':
                return ['Compare with similar investments', 'Check historical performance', 'Review risk factors', 'Consider portfolio diversification'];
            case 'risk_assessment':
                return ['Review asset risk profile', 'Check market volatility', 'Consider your risk tolerance', 'Look at similar asset risks'];
            case 'portfolio_optimization':
                return ['Analyze current allocation', 'Check diversification metrics', 'Review performance vs benchmarks', 'Consider rebalancing'];
            default:
                return suggestions;
        }
    }
    getFallbackResponse(query) {
        return {
            response: `I'm here to help with your investment questions! While I'm currently setting up advanced AI capabilities, I can provide general guidance on TrustBridge's platform features and investment opportunities. 

For "${query}", I'd recommend:
1. Exploring our marketplace for available assets
2. Checking your portfolio dashboard for current holdings
3. Reviewing our risk assessment tools
4. Consulting with our support team for personalized advice

Would you like me to help you navigate any specific part of the platform?`,
            suggestions: [
                'Browse available assets',
                'Check your portfolio',
                'Review investment guides',
                'Contact support'
            ],
            confidence: 0.7,
            metadata: {
                queryType: 'general_inquiry',
                processingTime: 0,
                sources: ['TrustBridge Platform']
            }
        };
    }
    async getUserAIUsage(userId) {
        try {
            const user = await this.userModel.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            const today = new Date().toISOString().split('T')[0];
            const currentMonth = new Date().toISOString().substring(0, 7);
            const dailyUsage = user.aiUsage?.daily?.[today] || 0;
            const monthlyUsage = user.aiUsage?.monthly?.[currentMonth] || 0;
            const totalQueries = user.aiUsage?.totalQueries || 0;
            const trustTokenBalance = user.trustTokenBalance || 0;
            return {
                dailyUsage,
                monthlyUsage,
                totalQueries,
                dailyLimit: this.AI_DAILY_LIMIT,
                monthlyLimit: this.AI_MONTHLY_LIMIT,
                trustTokenBalance,
                costPerQuery: this.AI_CREDIT_COST_PER_QUERY
            };
        }
        catch (error) {
            this.logger.error('Error getting user AI usage:', error);
            throw new Error('Failed to get AI usage statistics');
        }
    }
    getAIPricing() {
        return {
            costPerQuery: this.AI_CREDIT_COST_PER_QUERY,
            dailyLimit: this.AI_DAILY_LIMIT,
            monthlyLimit: this.AI_MONTHLY_LIMIT,
            currency: 'TRUST'
        };
    }
    async generateImage(prompt, userId) {
        try {
            const creditCheck = await this.checkUserCredits(userId);
            if (!creditCheck.canProceed) {
                throw new Error(creditCheck.message || 'Insufficient credits for image generation');
            }
            await this.deductCreditsAndUpdateUsage(userId);
            const response = await axios_1.default.post(`https://generativelanguage.googleapis.com/v1beta/models/imagegeneration-001:generateImages?key=${this.apiKey}`, {
                prompt: prompt,
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 60000,
            });
            return {
                imageUrl: response.data.generatedImages?.[0]?.imageUrl || '',
                prompt: prompt
            };
        }
        catch (error) {
            this.logger.error('Error generating image:', error);
            throw new Error('Failed to generate image');
        }
    }
    async analyzeImage(imageBase64, prompt, userId) {
        try {
            const creditCheck = await this.checkUserCredits(userId);
            if (!creditCheck.canProceed) {
                throw new Error(creditCheck.message || 'Insufficient credits for image analysis');
            }
            await this.deductCreditsAndUpdateUsage(userId);
            const response = await axios_1.default.post(`${this.googleAIUrl}?key=${this.apiKey}`, {
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            },
                            {
                                inlineData: {
                                    mimeType: "image/jpeg",
                                    data: imageBase64
                                }
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000,
                    topP: 0.8,
                    topK: 10
                }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000,
            });
            return response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to analyze image';
        }
        catch (error) {
            this.logger.error('Error analyzing image:', error);
            throw new Error('Failed to analyze image');
        }
    }
    async transcribeAudio(audioBase64, mimeType, userId) {
        try {
            const creditCheck = await this.checkUserCredits(userId);
            if (!creditCheck.canProceed) {
                throw new Error(creditCheck.message || 'Insufficient credits for audio transcription');
            }
            await this.deductCreditsAndUpdateUsage(userId);
            const response = await axios_1.default.post(`${this.googleAIUrl}?key=${this.apiKey}`, {
                contents: [
                    {
                        parts: [
                            {
                                text: "Please transcribe the following audio to text:"
                            },
                            {
                                inlineData: {
                                    mimeType: mimeType,
                                    data: audioBase64
                                }
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 2000,
                    topP: 0.8,
                    topK: 10
                }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 60000,
            });
            return response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to transcribe audio';
        }
        catch (error) {
            this.logger.error('Error transcribing audio:', error);
            throw new Error('Failed to transcribe audio');
        }
    }
    async generateVideo(prompt, userId) {
        try {
            const creditCheck = await this.checkUserCredits(userId);
            if (!creditCheck.canProceed) {
                throw new Error(creditCheck.message || 'Insufficient credits for video generation');
            }
            await this.deductCreditsAndUpdateUsage(userId);
            await this.deductCreditsAndUpdateUsage(userId);
            const response = await axios_1.default.post(`https://generativelanguage.googleapis.com/v1beta/models/videogeneration-001:generateVideos?key=${this.apiKey}`, {
                prompt: prompt,
                duration: "5s",
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 120000,
            });
            return {
                videoUrl: response.data.generatedVideos?.[0]?.videoUrl || '',
                prompt: prompt
            };
        }
        catch (error) {
            this.logger.error('Error generating video:', error);
            throw new Error('Failed to generate video');
        }
    }
    async getSearchResults(query, userId) {
        try {
            const creditCheck = await this.checkUserCredits(userId);
            if (!creditCheck.canProceed) {
                throw new Error(creditCheck.message || 'Insufficient credits for search');
            }
            await this.deductCreditsAndUpdateUsage(userId);
            const response = await axios_1.default.post(`https://generativelanguage.googleapis.com/v1beta/models/search-001:search?key=${this.apiKey}`, {
                query: query,
                maxResults: 10,
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000,
            });
            return response.data.searchResults || [];
        }
        catch (error) {
            this.logger.error('Error getting search results:', error);
            throw new Error('Failed to get search results');
        }
    }
    async getMapsData(query, userId) {
        try {
            const creditCheck = await this.checkUserCredits(userId);
            if (!creditCheck.canProceed) {
                throw new Error(creditCheck.message || 'Insufficient credits for maps data');
            }
            await this.deductCreditsAndUpdateUsage(userId);
            const response = await axios_1.default.post(`https://generativelanguage.googleapis.com/v1beta/models/maps-001:searchPlaces?key=${this.apiKey}`, {
                query: query,
                maxResults: 10,
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000,
            });
            return response.data.places || [];
        }
        catch (error) {
            this.logger.error('Error getting maps data:', error);
            throw new Error('Failed to get maps data');
        }
    }
    async healthCheck() {
        return {
            status: 'healthy',
            apiKeyConfigured: !!this.apiKey,
            timestamp: new Date().toISOString()
        };
    }
};
exports.AIService = AIService;
exports.AIService = AIService = AIService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        mongoose_2.Model])
], AIService);
//# sourceMappingURL=ai.service.js.map