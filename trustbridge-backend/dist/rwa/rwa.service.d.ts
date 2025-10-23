import { CreateRWAAssetDto, UpdateRWAAssetDto, RWAAssetQueryDto, RWAStatus, RiskLevel, LiquidityLevel } from './dto/rwa.dto';
import { ChainlinkRWAService } from './chainlink-rwa.service';
export interface RWAAsset {
    id: string;
    name: string;
    description: string;
    category: string;
    assetType: string;
    location: string;
    totalValue: number;
    tokenSupply: number;
    tokenPrice: number;
    availableTokens: number;
    expectedAPY: number;
    maturityDate: string;
    status: RWAStatus;
    owner: string;
    amcId?: string;
    amcName?: string;
    amcRating?: number;
    inspectionReport?: string;
    legalTransferStatus?: string;
    riskLevel: RiskLevel;
    liquidity: LiquidityLevel;
    currentValue?: number;
    totalReturn?: number;
    totalReturnPercent?: number;
    evidenceFiles: string[];
    legalDocuments: string[];
    inspectionPhotos?: string[];
    valuationReport?: string;
    ownershipDocuments?: string[];
    insuranceDocuments?: string[];
    maintenanceRecords?: string[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class RWAService {
    private readonly chainlinkRWAService;
    private readonly logger;
    private rwaAssets;
    constructor(chainlinkRWAService: ChainlinkRWAService);
    private initializeMockData;
    createRWAAsset(createDto: CreateRWAAssetDto): Promise<RWAAsset>;
    getRWAAssets(query: RWAAssetQueryDto): Promise<{
        assets: RWAAsset[];
        total: number;
        page: number;
        limit: number;
    }>;
    getRWAAsset(id: string): Promise<RWAAsset>;
    updateRWAAsset(id: string, updateDto: UpdateRWAAssetDto): Promise<RWAAsset>;
    getRWAAssetsByCategory(category: string): Promise<RWAAsset[]>;
    getRWAAssetsByStatus(status: string): Promise<RWAAsset[]>;
    getRWAAssetWithChainlinkData(id: string): Promise<RWAAsset & {
        chainlinkData: any;
    }>;
    updateAssetWithChainlinkData(id: string): Promise<RWAAsset>;
    assignAMCWithChainlinkVRF(assetId: string): Promise<{
        amcId: string;
        assignmentReason: string;
        transactionId: string;
    }>;
    getChainlinkMarketData(category?: string, region?: string): Promise<any>;
    refreshAllAssetsWithChainlinkData(): Promise<void>;
    private calculateRiskLevel;
    private calculateLiquidityLevel;
}
