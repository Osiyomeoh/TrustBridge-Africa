import { Model } from 'mongoose';
import { Asset, AssetDocument } from '../schemas/asset.schema';
import { AssetV2, AssetV2Document } from '../schemas/asset-v2.schema';
import { CreateAssetDto } from './dto/create-asset.dto';
import { ApiService } from '../api/api.service';
export interface CreateDigitalAssetDto {
    category: number;
    assetType: string;
    name: string;
    location: string;
    totalValue: string;
    imageURI: string;
    description: string;
    owner: string;
    assetId?: string;
    transactionId?: string;
}
export interface CreateRWAAssetDto {
    category: number;
    assetType: string;
    name: string;
    location: string;
    totalValue: string;
    maturityDate: number;
    evidenceHashes: string[];
    documentTypes: string[];
    imageURI: string;
    documentURI: string;
    description: string;
    owner: string;
    assetId?: string;
    transactionId?: string;
}
export declare class AssetsService {
    private assetModel;
    private assetV2Model;
    private readonly apiService;
    private readonly logger;
    constructor(assetModel: Model<AssetDocument>, assetV2Model: Model<AssetV2Document>, apiService: ApiService);
    createDigitalAsset(createDigitalAssetDto: CreateDigitalAssetDto): Promise<{
        asset: AssetV2;
        assetId: string;
        transactionId: string;
    }>;
    createRWAAsset(createRWAAssetDto: CreateRWAAssetDto): Promise<{
        asset: AssetV2;
        assetId: string;
        transactionId: string;
    }>;
    verifyAsset(assetId: string, verificationLevel: number): Promise<{
        transactionId: string;
    }>;
    private getCategoryName;
    private getAssetOperations;
    createAsset(createAssetDto: CreateAssetDto): Promise<Asset>;
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
