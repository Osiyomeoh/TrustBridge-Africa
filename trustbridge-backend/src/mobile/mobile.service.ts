import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Asset, AssetDocument } from '../schemas/asset.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { VerificationRequest, VerificationRequestDocument } from '../schemas/verification-request.schema';
import { Attestor, AttestorDocument } from '../schemas/attestor.schema';
import { Settlement, SettlementDocument } from '../schemas/settlement.schema';
import { Operation, OperationDocument } from '../schemas/operation.schema';
import { HederaService } from '../hedera/hedera.service';
import { ChainlinkService } from '../chainlink/chainlink.service';
import { WebSocketService } from '../websocket/websocket.service';
import { NotificationsService } from '../notifications/notifications.service';

export interface MobileDashboard {
  user: any;
  assets: any[];
  investments: any[];
  operations: any[];
  notifications: any[];
  stats: {
    totalAssets: number;
    totalInvestments: number;
    totalValue: number;
    pendingOperations: number;
  };
}

export interface OperationTracking {
  operationId: string;
  type: 'verification' | 'investment' | 'settlement' | 'transfer';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  estimatedCompletion: Date;
  currentStep: string;
  steps: Array<{
    name: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    timestamp?: Date;
    details?: any;
  }>;
  blockchainTxId?: string;
  lastUpdated: Date;
}

export interface MobileNotification {
  id: string;
  type: 'asset' | 'investment' | 'verification' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  timestamp: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

@Injectable()
export class MobileService {
  private readonly logger = new Logger(MobileService.name);

  constructor(
    @InjectModel(Asset.name) private assetModel: Model<AssetDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(VerificationRequest.name) private verificationModel: Model<VerificationRequestDocument>,
    @InjectModel(Attestor.name) private attestorModel: Model<AttestorDocument>,
    @InjectModel(Settlement.name) private settlementModel: Model<SettlementDocument>,
    @InjectModel(Operation.name) private operationModel: Model<OperationDocument>,
    private hederaService: HederaService,
    private chainlinkService: ChainlinkService,
    private webSocketService: WebSocketService,
    private notificationsService: NotificationsService,
  ) {}

  async getMobileDashboard(userId: string): Promise<MobileDashboard> {
    try {
      const user = await this.userModel.findById(userId).select('-password');
      if (!user) {
        throw new Error('User not found');
      }

      const assets = await this.assetModel.find({ owner: userId })
        .sort({ createdAt: -1 })
        .limit(10);

      const investments = await this.getUserInvestments(userId);
      const operations = await this.getUserOperations(userId);
      const notifications = await this.getUserNotifications(userId);

      const stats = {
        totalAssets: await this.assetModel.countDocuments({ owner: userId }),
        totalInvestments: investments.length,
        totalValue: assets.reduce((sum, asset) => sum + asset.totalValue, 0),
        pendingOperations: operations.filter(op => op.status === 'pending' || op.status === 'in_progress').length,
      };

      return {
        user,
        assets,
        investments,
        operations,
        notifications,
        stats,
      };
    } catch (error) {
      this.logger.error('Failed to get mobile dashboard:', error);
      throw error;
    }
  }

  async trackOperation(operationId: string): Promise<OperationTracking> {
    try {
      const operation = await this.operationModel.findById(operationId);
      if (!operation) {
        throw new Error('Operation not found');
      }

      const tracking: OperationTracking = {
        operationId: operation._id.toString(),
        type: operation.type as any,
        status: operation.status as any,
        progress: this.calculateProgress(operation),
        estimatedCompletion: this.estimateCompletion(operation),
        currentStep: this.getCurrentStep(operation),
        steps: this.getOperationSteps(operation),
        blockchainTxId: (operation as any).blockchainTxId,
        lastUpdated: (operation as any).updatedAt || (operation as any).createdAt,
      };

      return tracking;
    } catch (error) {
      this.logger.error('Failed to track operation:', error);
      throw error;
    }
  }

  async getUserOperations(userId: string): Promise<OperationTracking[]> {
    try {
      const operations = await this.operationModel.find({ userId })
        .sort({ createdAt: -1 })
        .limit(20);

      return operations.map(operation => ({
        operationId: operation._id.toString(),
        type: operation.type as any,
        status: operation.status as any,
        progress: this.calculateProgress(operation),
        estimatedCompletion: this.estimateCompletion(operation),
        currentStep: this.getCurrentStep(operation),
        steps: this.getOperationSteps(operation),
        blockchainTxId: (operation as any).blockchainTxId,
        lastUpdated: (operation as any).updatedAt || (operation as any).createdAt,
      }));
    } catch (error) {
      this.logger.error('Failed to get user operations:', error);
      throw error;
    }
  }

  async getUserNotifications(userId: string): Promise<MobileNotification[]> {
    try {
      // TODO: Implement real notification system
      // For now, return mock notifications
      const notifications: MobileNotification[] = [
        {
          id: '1',
          type: 'asset',
          title: 'Asset Verification Complete',
          message: 'Your coffee farm asset has been verified with a score of 92%',
          data: { assetId: 'asset_123', score: 92 },
          read: false,
          timestamp: new Date(Date.now() - 3600000),
          priority: 'normal',
        },
        {
          id: '2',
          type: 'investment',
          title: 'Investment Matured',
          message: 'Your investment in wheat farm has matured. Returns: $1,250',
          data: { investmentId: 'inv_456', returns: 1250 },
          read: false,
          timestamp: new Date(Date.now() - 7200000),
          priority: 'high',
        },
        {
          id: '3',
          type: 'system',
          title: 'System Maintenance',
          message: 'Scheduled maintenance will occur tonight from 2-4 AM',
          read: true,
          timestamp: new Date(Date.now() - 86400000),
          priority: 'low',
        },
      ];

      return notifications;
    } catch (error) {
      this.logger.error('Failed to get user notifications:', error);
      throw error;
    }
  }

  async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      // TODO: Implement real notification marking
      this.logger.log(`Notification ${notificationId} marked as read for user ${userId}`);
    } catch (error) {
      this.logger.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  async getAssetDetails(assetId: string, userId: string): Promise<any> {
    try {
      const asset = await this.assetModel.findOne({ assetId, owner: userId });
      if (!asset) {
        throw new Error('Asset not found');
      }

      const verification = await this.verificationModel.findOne({ assetId })
        .sort({ createdAt: -1 });

      const operations = await this.operationModel.find({ assetId })
        .sort({ createdAt: -1 })
        .limit(10);

      return {
        asset,
        verification,
        operations,
        blockchainStatus: await this.getBlockchainStatus(assetId),
        marketData: await this.getMarketData(asset.type, asset.location.country),
      };
    } catch (error) {
      this.logger.error('Failed to get asset details:', error);
      throw error;
    }
  }

  async getInvestmentDetails(investmentId: string, userId: string): Promise<any> {
    try {
      // TODO: Implement real investment details
      const investment = {
        id: investmentId,
        assetId: 'asset_123',
        amount: 5000,
        tokens: 1000,
        expectedAPY: 12.5,
        maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: 'active',
        returns: 0,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      };

      return investment;
    } catch (error) {
      this.logger.error('Failed to get investment details:', error);
      throw error;
    }
  }

  async getMarketData(assetType: string, country: string): Promise<any> {
    try {
      const priceData = await this.chainlinkService.getAssetPrice(assetType, country);
      const marketData = await this.chainlinkService.getMarketData(assetType, country);
      const historicalData = await this.chainlinkService.getHistoricalPrices(assetType, 30);

      return {
        currentPrice: priceData,
        marketData,
        historicalData,
        trends: this.calculateTrends(historicalData),
      };
    } catch (error) {
      this.logger.error('Failed to get market data:', error);
      throw error;
    }
  }

  async getBlockchainStatus(assetId: string): Promise<any> {
    try {
      const hederaStatus = await this.hederaService.getNetworkStatus();
      
      return {
        network: hederaStatus.network,
        status: hederaStatus.status,
        lastBlock: Date.now(),
        gasPrice: '0.0001 HBAR',
        confirmations: 3,
      };
    } catch (error) {
      this.logger.error('Failed to get blockchain status:', error);
      throw error;
    }
  }

  async submitAssetForVerification(assetId: string, userId: string, evidence: any): Promise<OperationTracking> {
    try {
      // Create operation record
      const operation = new this.operationModel({
        type: 'verification',
        status: 'pending',
        userId,
        assetId,
        data: { evidence },
        steps: [
          { name: 'Evidence Submission', status: 'completed' },
          { name: 'Automated Verification', status: 'in_progress' },
          { name: 'Attestor Assignment', status: 'pending' },
          { name: 'Manual Review', status: 'pending' },
          { name: 'Blockchain Submission', status: 'pending' },
        ],
      });

      await operation.save();

      // Notify user via WebSocket
      await this.webSocketService.notifyUserVerificationUpdate(
        userId,
        assetId,
        'submitted',
        0
      );

      return this.trackOperation(operation._id.toString());
    } catch (error) {
      this.logger.error('Failed to submit asset for verification:', error);
      throw error;
    }
  }

  async createInvestment(assetId: string, userId: string, amount: number): Promise<OperationTracking> {
    try {
      // Create operation record
      const operation = new this.operationModel({
        type: 'investment',
        status: 'pending',
        userId,
        assetId,
        data: { amount },
        steps: [
          { name: 'Investment Request', status: 'completed' },
          { name: 'Payment Processing', status: 'in_progress' },
          { name: 'Token Minting', status: 'pending' },
          { name: 'Blockchain Confirmation', status: 'pending' },
          { name: 'Portfolio Update', status: 'pending' },
        ],
      });

      await operation.save();

      // Notify user via WebSocket
      await this.webSocketService.notifyUserInvestmentUpdate(
        userId,
        operation._id.toString(),
        'created'
      );

      return this.trackOperation(operation._id.toString());
    } catch (error) {
      this.logger.error('Failed to create investment:', error);
      throw error;
    }
  }

  async getAttestorOperations(attestorId: string): Promise<OperationTracking[]> {
    try {
      const operations = await this.operationModel.find({
        type: 'verification',
        'data.attestorId': attestorId,
      })
        .sort({ createdAt: -1 })
        .limit(20);

      return operations.map(operation => ({
        operationId: operation._id.toString(),
        type: operation.type as any,
        status: operation.status as any,
        progress: this.calculateProgress(operation),
        estimatedCompletion: this.estimateCompletion(operation),
        currentStep: this.getCurrentStep(operation),
        steps: this.getOperationSteps(operation),
        blockchainTxId: (operation as any).blockchainTxId,
        lastUpdated: (operation as any).updatedAt || (operation as any).createdAt,
      }));
    } catch (error) {
      this.logger.error('Failed to get attestor operations:', error);
      throw error;
    }
  }

  async updateOperationStatus(operationId: string, status: string, data?: any): Promise<void> {
    try {
      const operation = await this.operationModel.findById(operationId);
      if (!operation) {
        throw new Error('Operation not found');
      }

      operation.status = status as any;
      (operation as any).data = { ...(operation as any).data, ...data };
      (operation as any).updatedAt = new Date();

      await operation.save();

      // Notify user via WebSocket
      if ((operation as any).userId) {
        await this.webSocketService.notifyUserAssetUpdate(
          (operation as any).userId,
          operation.assetId,
          status
        );
      }

      this.logger.log(`Operation ${operationId} status updated to ${status}`);
    } catch (error) {
      this.logger.error('Failed to update operation status:', error);
      throw error;
    }
  }

  // Private helper methods
  private async getUserInvestments(userId: string): Promise<any[]> {
    // TODO: Implement real investment retrieval
    return [
      {
        id: 'inv_1',
        assetId: 'asset_123',
        amount: 5000,
        tokens: 1000,
        expectedAPY: 12.5,
        maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: 'active',
      },
      {
        id: 'inv_2',
        assetId: 'asset_456',
        amount: 3000,
        tokens: 600,
        expectedAPY: 15.0,
        maturityDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        status: 'active',
      },
    ];
  }

  private calculateProgress(operation: any): number {
    const completedSteps = operation.steps.filter((step: any) => step.status === 'completed').length;
    return Math.round((completedSteps / operation.steps.length) * 100);
  }

  private estimateCompletion(operation: any): Date {
    const now = new Date();
    const remainingSteps = operation.steps.filter((step: any) => step.status !== 'completed').length;
    
    // Estimate 2 hours per remaining step
    const estimatedHours = remainingSteps * 2;
    return new Date(now.getTime() + estimatedHours * 60 * 60 * 1000);
  }

  private getCurrentStep(operation: any): string {
    const currentStep = operation.steps.find((step: any) => step.status === 'in_progress');
    return currentStep ? currentStep.name : 'Completed';
  }

  private getOperationSteps(operation: any): Array<{
    name: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    timestamp?: Date;
    details?: any;
  }> {
    return operation.steps.map((step: any) => ({
      name: step.name,
      status: step.status,
      timestamp: step.timestamp,
      details: step.details,
    }));
  }

  private calculateTrends(historicalData: any[]): any {
    if (historicalData.length < 2) {
      return { direction: 'stable', change: 0 };
    }

    const firstPrice = historicalData[0].price;
    const lastPrice = historicalData[historicalData.length - 1].price;
    const change = ((lastPrice - firstPrice) / firstPrice) * 100;

    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      change: Math.round(change * 100) / 100,
    };
  }
}
