import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { AMCPool, AMCPoolDocument, PoolType } from '../schemas/amc-pool.schema';
import { AssetDocument } from '../schemas/asset.schema';
import { HederaService } from '../hedera/hedera.service';
import { AdminService } from '../admin/admin.service';
export interface CreateAMCPoolDto {
    name: string;
    description: string;
    type: PoolType;
    assets: {
        assetId: string;
        name: string;
        value: number;
        percentage: number;
    }[];
    totalValue: number;
    tokenSupply: number;
    tokenPrice: number;
    minimumInvestment: number;
    expectedAPY: number;
    maturityDate: string;
    imageURI?: string;
    documentURI?: string;
    riskFactors?: string[];
    terms?: string[];
    isTradeable?: boolean;
    metadata?: {
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
        liquidity: 'HIGH' | 'MEDIUM' | 'LOW';
        diversification: number;
        geographicDistribution: string[];
        sectorDistribution: {
            [key: string]: number;
        };
    };
}
export interface InvestInPoolDto {
    poolId: string;
    amount: number;
    investorAddress: string;
    hbarTransactionId?: string;
}
export interface DistributeDividendDto {
    poolId: string;
    amount: number;
    description?: string;
}
export declare class AMCPoolsService {
    private amcPoolModel;
    private assetModel;
    private hederaService;
    private adminService;
    private configService;
    private readonly logger;
    constructor(amcPoolModel: Model<AMCPoolDocument>, assetModel: Model<AssetDocument>, hederaService: HederaService, adminService: AdminService, configService: ConfigService);
    createPool(createPoolDto: CreateAMCPoolDto, adminWallet: string): Promise<AMCPool>;
    launchPool(poolId: string, adminWallet: string): Promise<AMCPool>;
    getAllPools(): Promise<AMCPool[]>;
    getActivePools(): Promise<AMCPool[]>;
    getPoolById(poolId: string): Promise<AMCPool>;
    getPoolsByAdmin(adminWallet: string): Promise<AMCPool[]>;
    investInPool(investDto: InvestInPoolDto): Promise<AMCPool>;
    distributeDividend(dividendDto: DistributeDividendDto, adminWallet: string): Promise<AMCPool>;
    closePool(poolId: string, adminWallet: string): Promise<AMCPool>;
    getPoolStats(poolId: string): Promise<any>;
    private validatePoolAssets;
    private updateAssetOwnersEarnings;
}
