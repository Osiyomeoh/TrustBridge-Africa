import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Asset, AssetDocument, AssetStatus } from '../schemas/asset.schema';
import { CreateAssetDto } from './dto/create-asset.dto';
import { HederaService, TokenizationRequest } from '../hedera/hedera.service';

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);

  constructor(
    @InjectModel(Asset.name) private assetModel: Model<AssetDocument>,
    private readonly hederaService: HederaService,
  ) {}

  async createAsset(createAssetDto: CreateAssetDto): Promise<Asset> {
    // Generate unique asset ID
    const assetId = `${createAssetDto.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const asset = new this.assetModel({
      ...createAssetDto,
      assetId,
      status: AssetStatus.PENDING,
      tokenizedAmount: 0,
      verificationScore: 0,
      investments: [],
      operations: [],
    });

    return asset.save();
  }

  async createAssetWithTokenization(createAssetDto: CreateAssetDto): Promise<{ asset: Asset; tokenId?: string; transactionId?: string }> {
    try {
      // First create the asset in the database
      const asset = await this.createAsset(createAssetDto);
      
      this.logger.log(`Created asset ${asset.assetId} in database`);

      // Prepare tokenization request
      const tokenizationRequest: TokenizationRequest = {
        assetId: asset.assetId,
        owner: createAssetDto.owner,
        tokenName: `${createAssetDto.name} Token`,
        tokenSymbol: this.generateTokenSymbol(createAssetDto.name, createAssetDto.type),
        totalSupply: createAssetDto.tokenSupply,
        enableKyc: true,
        enableFreeze: true,
        metadata: {
          assetType: createAssetDto.type,
          location: createAssetDto.location,
          totalValue: createAssetDto.totalValue,
          expectedAPY: createAssetDto.expectedAPY,
          maturityDate: createAssetDto.maturityDate,
        }
      };

      // Create token on Hedera
      const tokenizationResult = await this.hederaService.createAssetToken(tokenizationRequest);
      
      this.logger.log(`Created Hedera token ${tokenizationResult.tokenId} for asset ${asset.assetId}`);

      // Update asset with token information
      const updatedAsset = await this.assetModel.findByIdAndUpdate(
        asset._id,
        {
          $set: {
            tokenId: tokenizationResult.tokenId,
            status: AssetStatus.ACTIVE,
            tokenizedAmount: createAssetDto.tokenSupply,
            operations: [`Token created on Hedera: ${tokenizationResult.transactionId}`]
          }
        },
        { new: true }
      );

      return {
        asset: updatedAsset,
        tokenId: tokenizationResult.tokenId,
        transactionId: tokenizationResult.transactionId
      };

    } catch (error) {
      this.logger.error(`Failed to create asset with tokenization: ${error.message}`);
      
      // If tokenization fails, still return the asset but mark as pending
      const asset = await this.assetModel.findById(asset._id);
      if (asset) {
        await this.assetModel.findByIdAndUpdate(asset._id, {
          $set: {
            status: AssetStatus.PENDING,
            operations: [`Tokenization failed: ${error.message}`]
          }
        });
      }
      
      throw new Error(`Asset created but tokenization failed: ${error.message}`);
    }
  }

  private generateTokenSymbol(name: string, type: string): string {
    // Generate a 3-5 character symbol from the asset name and type
    const typePrefix = type.substring(0, 2).toUpperCase();
    const nameWords = name.split(' ').map(word => word.charAt(0).toUpperCase()).join('');
    return `${typePrefix}${nameWords}`.substring(0, 5);
  }

  async getAssets(
    filter?: {
      type?: string;
      status?: string;
      country?: string;
      minValue?: number;
      maxValue?: number;
    },
    limit: number = 20,
    offset: number = 0,
  ): Promise<Asset[]> {
    const query: any = {};
    
    if (filter?.type) query.type = filter.type;
    if (filter?.status) query.status = filter.status;
    if (filter?.country) query['location.country'] = new RegExp(filter.country, 'i');
    if (filter?.minValue) query.totalValue = { $gte: filter.minValue };
    if (filter?.maxValue) query.totalValue = { ...query.totalValue, $lte: filter.maxValue };

    return this.assetModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .exec();
  }

  async getAssetById(id: string): Promise<Asset> {
    const asset = await this.assetModel.findById(id).exec();
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    return asset;
  }

  async getAssetByAssetId(assetId: string): Promise<Asset> {
    const asset = await this.assetModel.findOne({ assetId }).exec();
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    return asset;
  }

  async getFeaturedAssets(limit: number = 10): Promise<Asset[]> {
    return this.assetModel
      .find({ 
        status: AssetStatus.ACTIVE,
        verificationScore: { $gte: 80 }
      })
      .sort({ expectedAPY: -1, verificationScore: -1 })
      .limit(limit)
      .exec();
  }

  async getAssetsByOwner(owner: string): Promise<Asset[]> {
    return this.assetModel
      .find({ owner })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getDetailedStats() {
    const [assetStats, typeStats, statusStats] = await Promise.all([
      this.assetModel.aggregate([
        {
          $group: {
            _id: null,
            totalValueLocked: { $sum: '$totalValue' },
            totalAssets: { $sum: 1 },
            averageAPY: { $avg: '$expectedAPY' },
            averageVerificationScore: { $avg: '$verificationScore' },
            totalTokenized: { $sum: '$tokenizedAmount' }
          }
        }
      ]),
      this.assetModel.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            totalValue: { $sum: '$totalValue' },
            averageAPY: { $avg: '$expectedAPY' }
          }
        }
      ]),
      this.assetModel.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const stats = assetStats[0] || {};
    
    return {
      overview: {
        totalValueLocked: stats.totalValueLocked || 0,
        totalAssets: stats.totalAssets || 0,
        averageAPY: stats.averageAPY || 0,
        averageVerificationScore: stats.averageVerificationScore || 0,
        totalTokenized: stats.totalTokenized || 0
      },
      byType: typeStats,
      byStatus: statusStats,
      timestamp: new Date()
    };
  }
}
