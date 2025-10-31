import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { AMCPool, AMCPoolDocument, PoolStatus, PoolType } from '../schemas/amc-pool.schema';
import { Asset, AssetDocument } from '../schemas/asset.schema';
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
    sectorDistribution: { [key: string]: number };
  };
}

export interface InvestInPoolDto {
  poolId: string;
  amount: number; // Amount in HBAR
  investorAddress: string;
  hbarTransactionId?: string; // Optional: if HBAR already sent on-chain
}

export interface DistributeDividendDto {
  poolId: string;
  amount: number;
  description?: string;
}

@Injectable()
export class AMCPoolsService {
  private readonly logger = new Logger(AMCPoolsService.name);

  constructor(
    @InjectModel(AMCPool.name) private amcPoolModel: Model<AMCPoolDocument>,
    @InjectModel(Asset.name) private assetModel: Model<AssetDocument>,
    private hederaService: HederaService,
    private adminService: AdminService,
    private configService: ConfigService,
  ) {}

  /**
   * Create a new AMC pool
   */
  async createPool(createPoolDto: CreateAMCPoolDto, adminWallet: string): Promise<AMCPool> {
    try {
      this.logger.log('Creating pool with data:', JSON.stringify(createPoolDto, null, 2));
      
      // Verify admin has permission to create pools
      const adminRole = await this.adminService.checkAdminStatus(adminWallet);
      if (!adminRole.isAmcAdmin && !adminRole.isSuperAdmin && !adminRole.isPlatformAdmin) {
        throw new BadRequestException('Only AMC Admins can create pools');
      }

      // Generate unique pool ID
      const poolId = `POOL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Validate assets exist and are approved
      await this.validatePoolAssets(createPoolDto.assets);

      // Calculate total value from assets
      const calculatedTotalValue = createPoolDto.assets.reduce((sum, asset) => sum + asset.value, 0);
      if (Math.abs(calculatedTotalValue - createPoolDto.totalValue) > 0.01) {
        throw new BadRequestException('Total value must match sum of asset values');
      }

      // Create pool in database
      const pool = new this.amcPoolModel({
        poolId,
        name: createPoolDto.name,
        description: createPoolDto.description,
        createdBy: adminWallet,
        createdByName: 'AMC Admin', // TODO: Get from user profile
        type: createPoolDto.type,
        status: PoolStatus.DRAFT,
        assets: createPoolDto.assets,
        totalValue: createPoolDto.totalValue,
        tokenSupply: createPoolDto.tokenSupply,
        tokenPrice: createPoolDto.tokenPrice,
        minimumInvestment: createPoolDto.minimumInvestment,
        expectedAPY: createPoolDto.expectedAPY,
        maturityDate: new Date(createPoolDto.maturityDate),
        imageURI: createPoolDto.imageURI || '',
        documentURI: createPoolDto.documentURI || '',
        riskFactors: createPoolDto.riskFactors || [],
        terms: createPoolDto.terms || [],
        isTradeable: createPoolDto.isTradeable || true,
        metadata: createPoolDto.metadata || {
          riskLevel: 'MEDIUM',
          liquidity: 'MEDIUM',
          diversification: createPoolDto.assets.length,
          geographicDistribution: [],
          sectorDistribution: {}
        },
        operations: [`Pool created by ${adminWallet}`]
      });

      const savedPool = await pool.save();
      this.logger.log(`Created AMC pool: ${savedPool.poolId}`);

      return savedPool;
    } catch (error) {
      this.logger.error('Failed to create AMC pool:', error);
      throw error;
    }
  }

  /**
   * Launch pool (create Hedera token and make it active)
   */
  async launchPool(poolId: string, adminWallet: string): Promise<AMCPool> {
    try {
      // Verify admin has permission
      const adminRole = await this.adminService.checkAdminStatus(adminWallet);
      if (!adminRole.isAmcAdmin && !adminRole.isSuperAdmin && !adminRole.isPlatformAdmin) {
        throw new BadRequestException('Only AMC Admins can launch pools');
      }

      const pool = await this.amcPoolModel.findOne({ poolId });
      if (!pool) {
        throw new NotFoundException('Pool not found');
      }

      if (pool.status !== PoolStatus.DRAFT) {
        throw new BadRequestException('Pool can only be launched from DRAFT status');
      }

      // Create Hedera token for the pool
      // Use the configured Hedera operator credentials for token creation
      const operatorAccountId = this.hederaService.getOperatorId();
      this.logger.log(`Creating Hedera token for pool: ${pool.name} (${pool.poolId})`);
      this.logger.log(`Treasury account: ${operatorAccountId}`);
      this.logger.log(`Token supply: ${pool.tokenSupply}`);
      
      const hederaTokenId = await this.hederaService.createPoolToken({
        name: pool.name,
        symbol: `POOL_${pool.poolId.substring(5, 10)}`,
        decimals: 0,
        initialSupply: pool.tokenSupply,
        maxSupply: pool.tokenSupply,
        treasury: operatorAccountId, // Use operator account as treasury for backend control
        adminKey: this.configService.get<string>('HEDERA_PRIVATE_KEY'), // Use operator key
        supplyKey: this.configService.get<string>('HEDERA_PRIVATE_KEY'), // Use operator key
        freezeKey: this.configService.get<string>('HEDERA_PRIVATE_KEY'), // Use operator key
        wipeKey: this.configService.get<string>('HEDERA_PRIVATE_KEY') // Use operator key
      });
      
      this.logger.log(`Successfully created Hedera token: ${hederaTokenId}`);

      // Update pool status and Hedera token ID
      pool.status = PoolStatus.ACTIVE;
      pool.hederaTokenId = hederaTokenId;
      pool.launchedAt = new Date();
      pool.operations.push(`Pool launched with Hedera token: ${hederaTokenId}`);

      const updatedPool = await pool.save();
      this.logger.log(`Launched AMC pool: ${poolId} with token: ${hederaTokenId}`);

      return updatedPool;
    } catch (error) {
      this.logger.error('Failed to launch AMC pool:', error);
      throw error;
    }
  }

  /**
   * Get all pools
   */
  async getAllPools(): Promise<AMCPool[]> {
    try {
      return await this.amcPoolModel.find().sort({ createdAt: -1 });
    } catch (error) {
      this.logger.error('Failed to get all pools:', error);
      throw error;
    }
  }

  /**
   * Get active pools (for investment)
   */
  async getActivePools(): Promise<AMCPool[]> {
    try {
      return await this.amcPoolModel.find({ 
        status: PoolStatus.ACTIVE 
      }).sort({ expectedAPY: -1 });
    } catch (error) {
      this.logger.error('Failed to get active pools:', error);
      throw error;
    }
  }

  /**
   * Get pool by ID
   */
  async getPoolById(poolId: string): Promise<AMCPool> {
    try {
      const pool = await this.amcPoolModel.findOne({ poolId });
      if (!pool) {
        throw new NotFoundException('Pool not found');
      }
      return pool;
    } catch (error) {
      this.logger.error('Failed to get pool by ID:', error);
      throw error;
    }
  }

  /**
   * Get pools by admin
   */
  async getPoolsByAdmin(adminWallet: string): Promise<AMCPool[]> {
    try {
      return await this.amcPoolModel.find({ createdBy: adminWallet }).sort({ createdAt: -1 });
    } catch (error) {
      this.logger.error('Failed to get pools by admin:', error);
      throw error;
    }
  }

  /**
   * Invest in pool
   */
  async investInPool(investDto: InvestInPoolDto): Promise<AMCPool> {
    try {
      const pool = await this.amcPoolModel.findOne({ poolId: investDto.poolId });
      if (!pool) {
        throw new NotFoundException('Pool not found');
      }

      if (pool.status !== PoolStatus.ACTIVE) {
        throw new BadRequestException('Pool is not active for investment');
      }

      if (investDto.amount < pool.minimumInvestment) {
        throw new BadRequestException(`Minimum investment is ${pool.minimumInvestment}`);
      }

      // Calculate tokens to receive
      const tokens = Math.floor(investDto.amount / pool.tokenPrice);
      if (tokens === 0) {
        throw new BadRequestException('Investment amount too small');
      }

      // Check if investor already has investment
      const existingInvestment = pool.investments.find(inv => inv.investorAddress === investDto.investorAddress);
      
      if (existingInvestment) {
        // Update existing investment
        existingInvestment.amount += investDto.amount;
        existingInvestment.tokens += tokens;
        existingInvestment.investedAt = new Date();
      } else {
        // Add new investment
        pool.investments.push({
          investorId: investDto.investorAddress, // TODO: Get from user lookup
          investorAddress: investDto.investorAddress,
          amount: investDto.amount,
          tokens: tokens,
          tokenPrice: pool.tokenPrice,
          investedAt: new Date(),
          dividendsReceived: 0,
          isActive: true
        });
      }

      // Update pool totals
      pool.totalInvested += investDto.amount;
      pool.totalInvestors = pool.investments.filter(inv => inv.isActive).length;
      pool.operations.push(`Investment of ${investDto.amount} by ${investDto.investorAddress}`);

      // Transfer pool tokens from treasury to investor ON-CHAIN
      try {
        if (pool.hederaTokenId && pool.hederaTokenId !== '') {
          this.logger.log(`Transferring ${tokens} pool tokens to investor ${investDto.investorAddress}`);
          
          // Transfer tokens from operator treasury to investor
          const treasuryAccount = this.hederaService.getOperatorId();
          const txId = await this.hederaService.transferTokens(
            pool.hederaTokenId,
            treasuryAccount, // Operator account (pool treasury)
            investDto.investorAddress, // Investor
            tokens
          );
          
          this.logger.log(`Successfully transferred ${tokens} tokens: ${txId}`);
          pool.operations.push(`Hedera transfer: ${txId}`);
        }
      } catch (hederaError) {
        this.logger.error('Failed to transfer pool tokens on Hedera:', hederaError);
        // Don't throw - DB update succeeded, Hedera transfer is secondary
      }

      const updatedPool = await pool.save();
      this.logger.log(`Investment in pool ${investDto.poolId}: ${investDto.amount}`);

      // Update earnings for asset owners
      await this.updateAssetOwnersEarnings(pool, investDto.amount);

      return updatedPool;
    } catch (error) {
      this.logger.error('Failed to invest in pool:', error);
      throw error;
    }
  }

  /**
   * Distribute dividends to pool investors
   */
  async distributeDividend(dividendDto: DistributeDividendDto, adminWallet: string): Promise<AMCPool> {
    try {
      // Verify admin has permission
      const adminRole = await this.adminService.checkAdminStatus(adminWallet);
      if (!adminRole.isAmcAdmin && !adminRole.isSuperAdmin && !adminRole.isPlatformAdmin) {
        throw new BadRequestException('Only AMC Admins can distribute dividends');
      }

      const pool = await this.amcPoolModel.findOne({ poolId: dividendDto.poolId });
      if (!pool) {
        throw new NotFoundException('Pool not found');
      }

      if (pool.status !== PoolStatus.ACTIVE) {
        throw new BadRequestException('Pool is not active for dividend distribution');
      }

      // Calculate dividend per token
      const totalActiveTokens = pool.investments
        .filter(inv => inv.isActive)
        .reduce((sum, inv) => sum + inv.tokens, 0);

      if (totalActiveTokens === 0) {
        throw new BadRequestException('No active token holders to distribute dividends to');
      }

      const dividendPerToken = dividendDto.amount / totalActiveTokens;

      // Update investor dividends
      pool.investments.forEach(investment => {
        if (investment.isActive) {
          const investorDividend = investment.tokens * dividendPerToken;
          investment.dividendsReceived += investorDividend;
        }
      });

      // Add dividend record
      pool.dividends.push({
        amount: dividendDto.amount,
        perToken: dividendPerToken,
        distributedAt: new Date(),
        description: dividendDto.description || 'Dividend distribution',
        transactionHash: '' // TODO: Add Hedera transaction hash
      });

      // Update pool totals
      pool.totalDividendsDistributed += dividendDto.amount;
      pool.operations.push(`Dividend distributed: ${dividendDto.amount} by ${adminWallet}`);

      // Distribute HBAR dividends ON-CHAIN
      try {
        let txIds: string[] = [];
        for (const investment of pool.investments) {
          if (investment.isActive) {
            const investorDividend = investment.tokens * dividendPerToken;
            
            // Transfer HBAR from pool treasury to investor
            const txId = await this.hederaService.transferHbar(
              investment.investorAddress,
              investorDividend
            );
            txIds.push(txId);
            
            this.logger.log(`Distributed ${investorDividend} HBAR to ${investment.investorAddress}: ${txId}`);
          }
        }
        
        // Update transaction hashes
        pool.dividends[pool.dividends.length - 1].transactionHash = txIds.join(',');
        this.logger.log(`Distributed ${txIds.length} dividends on-chain`);
      } catch (hederaError) {
        this.logger.error('Failed to distribute dividends on Hedera:', hederaError);
        // Don't throw - DB update succeeded, Hedera transfer is secondary
      }

      const updatedPool = await pool.save();
      this.logger.log(`Dividend distributed for pool ${dividendDto.poolId}: ${dividendDto.amount}`);

      return updatedPool;
    } catch (error) {
      this.logger.error('Failed to distribute dividend:', error);
      throw error;
    }
  }

  /**
   * Close pool (stop new investments)
   */
  async closePool(poolId: string, adminWallet: string): Promise<AMCPool> {
    try {
      // Verify admin has permission
      const adminRole = await this.adminService.checkAdminStatus(adminWallet);
      if (!adminRole.isAmcAdmin && !adminRole.isSuperAdmin && !adminRole.isPlatformAdmin) {
        throw new BadRequestException('Only AMC Admins can close pools');
      }

      const pool = await this.amcPoolModel.findOne({ poolId });
      if (!pool) {
        throw new NotFoundException('Pool not found');
      }

      if (pool.status !== PoolStatus.ACTIVE) {
        throw new BadRequestException('Pool is not active');
      }

      pool.status = PoolStatus.CLOSED;
      pool.closedAt = new Date();
      pool.operations.push(`Pool closed by ${adminWallet}`);

      const updatedPool = await pool.save();
      this.logger.log(`Closed AMC pool: ${poolId}`);

      return updatedPool;
    } catch (error) {
      this.logger.error('Failed to close pool:', error);
      throw error;
    }
  }

  /**
   * Get pool performance statistics
   */
  async getPoolStats(poolId: string): Promise<any> {
    try {
      const pool = await this.amcPoolModel.findOne({ poolId });
      if (!pool) {
        throw new NotFoundException('Pool not found');
      }

      const totalInvestments = pool.investments.length;
      const totalInvested = pool.totalInvested;
      const totalDividends = pool.totalDividendsDistributed;
      const averageInvestment = totalInvestments > 0 ? totalInvested / totalInvestments : 0;
      const roi = totalInvested > 0 ? (totalDividends / totalInvested) * 100 : 0;

      return {
        poolId: pool.poolId,
        name: pool.name,
        status: pool.status,
        totalInvestments,
        totalInvested,
        totalDividends,
        averageInvestment,
        roi,
        totalInvestors: pool.totalInvestors,
        currentPrice: pool.currentPrice,
        priceChange24h: pool.priceChange24h,
        tradingVolume: pool.tradingVolume,
        assets: pool.assets.length,
        diversification: pool.metadata.diversification,
        riskLevel: pool.metadata.riskLevel
      };
    } catch (error) {
      this.logger.error('Failed to get pool stats:', error);
      throw error;
    }
  }

  /**
   * Validate pool assets exist and are approved
   */
  private async validatePoolAssets(assets: any[]): Promise<void> {
    this.logger.log('Validating pool assets...');
    
    if (!assets || assets.length === 0) {
      throw new BadRequestException('Pool must contain at least one asset');
    }

    // Get all RWA assets from HCS topic (using same logic as RWA endpoint)
    const hcsMessages = await this.hederaService.getTrustBridgeTopicMessages();
    
    // Filter for asset creation messages
    const assetMessages = hcsMessages.filter(msg => msg.type === 'TRUSTBRIDGE_ASSET_CREATED');
    this.logger.log(`Found ${assetMessages.length} asset creation messages`);
    
    // Get status update messages
    const statusMessages = hcsMessages.filter(msg => msg.type === 'TRUSTBRIDGE_ASSET_STATUS_UPDATE');
    this.logger.log(`Found ${statusMessages.length} status update messages`);
    
    // Create a map of current statuses
    const currentStatuses = new Map();
    statusMessages.forEach(statusMsg => {
      currentStatuses.set(statusMsg.rwaTokenId, statusMsg.status);
    });
    
    // Update asset statuses with current status from HCS
    const assetsWithStatus = assetMessages.map(asset => ({
      ...asset,
      status: currentStatuses.get(asset.rwaTokenId) || asset.status
    }));
    
    // Filter for approved assets
    const approvedAssets = assetsWithStatus.filter(asset => asset.status === 'APPROVED');
    
    this.logger.log(`Found ${approvedAssets.length} approved assets in HCS topic`);
    this.logger.log('Approved asset IDs:', approvedAssets.map(a => a.rwaTokenId));

    // Check each asset in the pool
    for (const poolAsset of assets) {
      this.logger.log(`Validating asset: ${poolAsset.assetId}`);
      const rwaAsset = approvedAssets.find(asset => asset.rwaTokenId === poolAsset.assetId);
      
      if (!rwaAsset) {
        this.logger.error(`Asset ${poolAsset.assetId} not found in approved assets`);
        this.logger.error('Available approved assets:', approvedAssets.map(a => a.rwaTokenId));
        throw new BadRequestException(`Asset ${poolAsset.assetId} not found or not approved`);
      }

      // Check if asset is already in another active pool
      const existingPool = await this.amcPoolModel.findOne({
        'assets.assetId': poolAsset.assetId,
        status: { $in: ['ACTIVE', 'DRAFT'] }
      });

      if (existingPool) {
        throw new BadRequestException(`Asset ${poolAsset.assetId} is already in pool ${existingPool.poolId}`);
      }

      // Validate asset value is reasonable
      if (poolAsset.value <= 0) {
        throw new BadRequestException(`Asset ${poolAsset.assetId} must have a positive value`);
      }
    }

    this.logger.log(`Validated ${assets.length} assets for pool creation`);
  }

  /**
   * Update earnings for asset owners when investment is made
   */
  private async updateAssetOwnersEarnings(pool: AMCPool, investmentAmount: number): Promise<void> {
    try {
      // Distribute earnings proportionally to each asset in the pool
      for (const poolAsset of pool.assets) {
        // Calculate this asset's share of the earnings
        const assetPercentage = poolAsset.percentage / 100;
        const earningsForAsset = investmentAmount * assetPercentage;

        // Find the asset and update owner's earnings
        const asset = await this.assetModel.findOne({ assetId: poolAsset.assetId });
        if (asset) {
          asset.earnings = (asset.earnings || 0) + earningsForAsset;
          await asset.save();
          this.logger.log(`Updated earnings for asset ${poolAsset.assetId}: +${earningsForAsset}`);
        }
      }
    } catch (error) {
      this.logger.error('Failed to update asset owner earnings:', error);
      // Don't throw - investment should still succeed even if earnings update fails
    }
  }
}
