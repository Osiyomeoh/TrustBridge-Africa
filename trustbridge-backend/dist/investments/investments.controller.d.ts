import { InvestmentsService } from './investments.service';
export declare class InvestmentsController {
    private readonly investmentsService;
    constructor(investmentsService: InvestmentsService);
    getInvestments(): Promise<{
        success: boolean;
        data: any[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    createInvestment(createInvestmentDto: any): Promise<{
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
