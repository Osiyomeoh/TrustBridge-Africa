import { AssetsService, CreateDigitalAssetDto, CreateRWAAssetDto } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { Asset } from '../schemas/asset.schema';
import { AssetV2 } from '../schemas/asset-v2.schema';
export declare class AssetsController {
    private readonly assetsService;
    constructor(assetsService: AssetsService);
    getAssets(): Promise<{
        success: boolean;
        message: string;
    }>;
    getAssetsByOwner(owner: string): Promise<{
        success: boolean;
        data: any[];
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
    createDigitalAsset(createDigitalAssetDto: CreateDigitalAssetDto): Promise<{
        success: boolean;
        data: AssetV2;
        assetId: string;
        transactionId: string;
        message?: string;
    }>;
    createRWAAsset(createRWAAssetDto: CreateRWAAssetDto): Promise<{
        success: boolean;
        data: AssetV2;
        assetId: string;
        transactionId: string;
        message?: string;
    }>;
    verifyAsset(assetId: string, body: {
        verificationLevel: number;
    }): Promise<{
        success: boolean;
        transactionId: string;
        message?: string;
    }>;
    getNFTBlockchainState(tokenId: string, serialNumber: string): Promise<{
        success: boolean;
        data: {
            owner: string;
            isListed: boolean;
            isInEscrow: boolean;
            marketplaceAccount: string;
            seller?: string;
        };
    }>;
}
