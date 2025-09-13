import { PortfolioService } from './portfolio.service';
export declare class PortfolioController {
    private readonly portfolioService;
    constructor(portfolioService: PortfolioService);
    getPortfolio(userId?: string): Promise<{
        success: boolean;
        data: any;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
}
