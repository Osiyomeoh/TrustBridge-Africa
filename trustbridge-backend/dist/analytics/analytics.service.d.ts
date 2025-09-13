import { Model } from 'mongoose';
import { AssetDocument } from '../schemas/asset.schema';
import { InvestmentDocument } from '../schemas/investment.schema';
import { UserDocument } from '../schemas/user.schema';
import { HederaService } from '../hedera/hedera.service';
export declare class AnalyticsService {
    private assetModel;
    private investmentModel;
    private userModel;
    private readonly hederaService;
    private readonly logger;
    constructor(assetModel: Model<AssetDocument>, investmentModel: Model<InvestmentDocument>, userModel: Model<UserDocument>, hederaService: HederaService);
    getMarketAnalytics(): Promise<any>;
    getRealTimeMetrics(): Promise<any>;
}
