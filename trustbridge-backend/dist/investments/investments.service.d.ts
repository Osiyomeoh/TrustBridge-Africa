import { Model } from 'mongoose';
import { InvestmentDocument } from '../schemas/investment.schema';
import { HederaService } from '../hedera/hedera.service';
export declare class InvestmentsService {
    private investmentModel;
    private readonly hederaService;
    private readonly logger;
    constructor(investmentModel: Model<InvestmentDocument>, hederaService: HederaService);
    getAllInvestments(): Promise<any[]>;
    getInvestmentById(investmentId: string): Promise<any>;
    getInvestmentsByUser(userId: string): Promise<any[]>;
    createInvestment(investmentData: any): Promise<any>;
}
