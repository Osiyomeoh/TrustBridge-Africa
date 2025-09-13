import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { Asset } from '../schemas/asset.schema';
export declare class AssetsController {
    private readonly assetsService;
    constructor(assetsService: AssetsService);
    getAssets(type?: string, status?: string, country?: string, minValue?: number, maxValue?: number, limit?: number, offset?: number): Promise<{
        success: boolean;
        data: Asset[];
    }>;
    getAssetById(id: string): Promise<{
        success: boolean;
        data: Asset;
    }>;
    createAsset(createAssetDto: CreateAssetDto): Promise<{
        success: boolean;
        data: Asset;
    }>;
    createAssetWithTokenization(createAssetDto: CreateAssetDto): Promise<{
        success: boolean;
        data: Asset;
        tokenId?: string;
        transactionId?: string;
        message?: string;
    }>;
    getFeaturedAssets(limit?: number): Promise<{
        success: boolean;
        data: Asset[];
    }>;
    getAssetsByOwner(owner: string): Promise<{
        success: boolean;
        data: Asset[];
    }>;
}
