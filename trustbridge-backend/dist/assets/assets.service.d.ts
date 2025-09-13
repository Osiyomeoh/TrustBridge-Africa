import { Model } from 'mongoose';
import { Asset, AssetDocument } from '../schemas/asset.schema';
import { CreateAssetDto } from './dto/create-asset.dto';
import { HederaService } from '../hedera/hedera.service';
export declare class AssetsService {
    private assetModel;
    private readonly hederaService;
    private readonly logger;
    constructor(assetModel: Model<AssetDocument>, hederaService: HederaService);
    createAsset(createAssetDto: CreateAssetDto): Promise<Asset>;
    createAssetWithTokenization(createAssetDto: CreateAssetDto): Promise<{
        asset: Asset;
        tokenId?: string;
        transactionId?: string;
    }>;
    private generateTokenSymbol;
    getAssets(filter?: {
        type?: string;
        status?: string;
        country?: string;
        minValue?: number;
        maxValue?: number;
    }, limit?: number, offset?: number): Promise<Asset[]>;
    getAssetById(id: string): Promise<Asset>;
    getAssetByAssetId(assetId: string): Promise<Asset>;
    getFeaturedAssets(limit?: number): Promise<Asset[]>;
    getAssetsByOwner(owner: string): Promise<Asset[]>;
    getDetailedStats(): Promise<{
        overview: {
            totalValueLocked: any;
            totalAssets: any;
            averageAPY: any;
            averageVerificationScore: any;
            totalTokenized: any;
        };
        byType: any[];
        byStatus: any[];
        timestamp: Date;
    }>;
}
