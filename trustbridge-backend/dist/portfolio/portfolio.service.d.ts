import { Model } from 'mongoose';
import { InvestmentDocument } from '../schemas/investment.schema';
import { HederaService } from '../hedera/hedera.service';
export declare class PortfolioService {
    private investmentModel;
    private readonly hederaService;
    private readonly logger;
    constructor(investmentModel: Model<InvestmentDocument>, hederaService: HederaService);
    getUserPortfolio(userId: string): Promise<any>;
    getPortfolioSummary(): Promise<any>;
}
