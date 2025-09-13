import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Asset, AssetDocument } from '../schemas/asset.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { VerificationRequest, VerificationRequestDocument } from '../schemas/verification-request.schema';
import { Attestor, AttestorDocument } from '../schemas/attestor.schema';
import { Settlement, SettlementDocument } from '../schemas/settlement.schema';
import { Operation, OperationDocument } from '../schemas/operation.schema';
import { Analytics, AnalyticsDocument } from '../schemas/analytics.schema';
import { HederaService } from '../hedera/hedera.service';
import { ChainlinkService } from '../chainlink/chainlink.service';
import { WebSocketService } from '../websocket/websocket.service';
import { NotificationsService } from '../notifications/notifications.service';

export interface SystemStats {
  totalAssets: number;
  totalUsers: number;
  totalAttestors: number;
  totalInvestments: number;
  totalVolume: number;
  activeVerifications: number;
  completedVerifications: number;
  pendingSettlements: number;
  systemHealth: {
    database: boolean;
    hedera: boolean;
    chainlink: boolean;
    websocket: boolean;
    notifications: boolean;
  };
}

export interface DashboardMetrics {
  overview: SystemStats;
  recentActivity: any[];
  topAssets: any[];
  topAttestors: any[];
  marketTrends: any[];
  alerts: any[];
}

export interface UserManagementData {
  users: any[];
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  userRoles: { [role: string]: number };
}

export interface AssetManagementData {
  assets: any[];
  totalAssets: number;
  verifiedAssets: number;
  pendingAssets: number;
  rejectedAssets: number;
  assetTypes: { [type: string]: number };
}

export interface VerificationManagementData {
  verifications: any[];
  totalVerifications: number;
  pendingVerifications: number;
  completedVerifications: number;
  averageScore: number;
  verificationTrends: any[];
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectModel(Asset.name) private assetModel: Model<AssetDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(VerificationRequest.name) private verificationModel: Model<VerificationRequestDocument>,
    @InjectModel(Attestor.name) private attestorModel: Model<AttestorDocument>,
    @InjectModel(Settlement.name) private settlementModel: Model<SettlementDocument>,
    @InjectModel(Operation.name) private operationModel: Model<OperationDocument>,
    @InjectModel(Analytics.name) private analyticsModel: Model<AnalyticsDocument>,
    private hederaService: HederaService,
    private chainlinkService: ChainlinkService,
    private webSocketService: WebSocketService,
    private notificationsService: NotificationsService,
  ) {}

  async getSystemStats(): Promise<SystemStats> {
    try {
      const [
        totalAssets,
        totalUsers,
        totalAttestors,
        activeVerifications,
        completedVerifications,
        pendingSettlements,
        totalVolume,
      ] = await Promise.all([
        this.assetModel.countDocuments(),
        this.userModel.countDocuments(),
        this.attestorModel.countDocuments(),
        this.verificationModel.countDocuments({ status: 'SUBMITTED' }),
        this.verificationModel.countDocuments({ status: 'VERIFIED' }),
        this.settlementModel.countDocuments({ status: 'PENDING' }),
        this.assetModel.aggregate([
          { $group: { _id: null, total: { $sum: '$totalValue' } } }
        ]).then(result => result[0]?.total || 0),
      ]);

      const systemHealth = {
        database: true, // If we got here, database is working
        hedera: await this.hederaService.healthCheck(),
        chainlink: await this.chainlinkService.healthCheck(),
        websocket: (await this.webSocketService.getHealthStatus()).connected,
        notifications: true, // Notifications service is always available
      };

      return {
        totalAssets,
        totalUsers,
        totalAttestors,
        totalInvestments: 0, // TODO: Implement investment counting
        totalVolume,
        activeVerifications,
        completedVerifications,
        pendingSettlements,
        systemHealth,
      };
    } catch (error) {
      this.logger.error('Failed to get system stats:', error);
      throw error;
    }
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const overview = await this.getSystemStats();
      
      const recentActivity = await this.getRecentActivity();
      const topAssets = await this.getTopAssets();
      const topAttestors = await this.getTopAttestors();
      const marketTrends = await this.getMarketTrends();
      const alerts = await this.getSystemAlerts();

      return {
        overview,
        recentActivity,
        topAssets,
        topAttestors,
        marketTrends,
        alerts,
      };
    } catch (error) {
      this.logger.error('Failed to get dashboard metrics:', error);
      throw error;
    }
  }

  async getUserManagementData(): Promise<UserManagementData> {
    try {
      const users = await this.userModel.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(100);

      const totalUsers = await this.userModel.countDocuments();
      const activeUsers = await this.userModel.countDocuments({ isActive: true });
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newUsersToday = await this.userModel.countDocuments({ createdAt: { $gte: today } });

      const userRoles = await this.userModel.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]);

      const roleMap: { [key: string]: number } = {};
      userRoles.forEach(role => {
        roleMap[role._id] = role.count;
      });

      return {
        users,
        totalUsers,
        activeUsers,
        newUsersToday,
        userRoles: roleMap,
      };
    } catch (error) {
      this.logger.error('Failed to get user management data:', error);
      throw error;
    }
  }

  async getAssetManagementData(): Promise<AssetManagementData> {
    try {
      const assets = await this.assetModel.find()
        .sort({ createdAt: -1 })
        .limit(100);

      const totalAssets = await this.assetModel.countDocuments();
      const verifiedAssets = await this.assetModel.countDocuments({ status: 'VERIFIED' });
      const pendingAssets = await this.assetModel.countDocuments({ status: 'PENDING' });
      const rejectedAssets = await this.assetModel.countDocuments({ status: 'REJECTED' });

      const assetTypes = await this.assetModel.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]);

      const typeMap: { [key: string]: number } = {};
      assetTypes.forEach(type => {
        typeMap[type._id] = type.count;
      });

      return {
        assets,
        totalAssets,
        verifiedAssets,
        pendingAssets,
        rejectedAssets,
        assetTypes: typeMap,
      };
    } catch (error) {
      this.logger.error('Failed to get asset management data:', error);
      throw error;
    }
  }

  async getVerificationManagementData(): Promise<VerificationManagementData> {
    try {
      const verifications = await this.verificationModel.find()
        .populate('assetId')
        .sort({ createdAt: -1 })
        .limit(100);

      const totalVerifications = await this.verificationModel.countDocuments();
      const pendingVerifications = await this.verificationModel.countDocuments({ status: 'SUBMITTED' });
      const completedVerifications = await this.verificationModel.countDocuments({ status: 'VERIFIED' });

      const averageScoreResult = await this.verificationModel.aggregate([
        { $match: { status: 'VERIFIED' } },
        { $group: { _id: null, avgScore: { $avg: '$scoring.finalScore' } } }
      ]);

      const averageScore = averageScoreResult[0]?.avgScore || 0;
      const verificationTrends = await this.getVerificationTrends();

      return {
        verifications,
        totalVerifications,
        pendingVerifications,
        completedVerifications,
        averageScore,
        verificationTrends,
      };
    } catch (error) {
      this.logger.error('Failed to get verification management data:', error);
      throw error;
    }
  }

  async updateUserStatus(userId: string, status: 'active' | 'inactive' | 'suspended'): Promise<void> {
    try {
      await this.userModel.updateOne(
        { _id: userId },
        { 
          isActive: status === 'active',
          status,
          updatedAt: new Date(),
        }
      );

      this.logger.log(`User ${userId} status updated to ${status}`);
    } catch (error) {
      this.logger.error('Failed to update user status:', error);
      throw error;
    }
  }

  async updateAssetStatus(assetId: string, status: string): Promise<void> {
    try {
      await this.assetModel.updateOne(
        { assetId },
        { 
          status,
          updatedAt: new Date(),
        }
      );

      this.logger.log(`Asset ${assetId} status updated to ${status}`);
    } catch (error) {
      this.logger.error('Failed to update asset status:', error);
      throw error;
    }
  }

  async updateAttestorStatus(attestorId: string, status: 'active' | 'inactive' | 'suspended'): Promise<void> {
    try {
      await this.attestorModel.updateOne(
        { _id: attestorId },
        { 
          isActive: status === 'active',
          status,
          updatedAt: new Date(),
        }
      );

      this.logger.log(`Attestor ${attestorId} status updated to ${status}`);
    } catch (error) {
      this.logger.error('Failed to update attestor status:', error);
      throw error;
    }
  }

  async sendSystemAlert(alertType: string, message: string, recipients: string[]): Promise<void> {
    try {
      await this.notificationsService.sendSystemAlert(alertType, message, recipients);
      
      // Also broadcast via WebSocket
      await this.webSocketService.broadcastSystemAlert(alertType, message, 'high');
      
      this.logger.log(`System alert sent: ${alertType}`);
    } catch (error) {
      this.logger.error('Failed to send system alert:', error);
      throw error;
    }
  }

  async getSystemLogs(limit: number = 100): Promise<any[]> {
    try {
      // TODO: Implement proper logging system
      // For now, return mock logs
      return [
        {
          id: '1',
          level: 'info',
          message: 'System started successfully',
          timestamp: new Date(),
          source: 'system',
        },
        {
          id: '2',
          level: 'warn',
          message: 'High memory usage detected',
          timestamp: new Date(Date.now() - 300000),
          source: 'monitoring',
        },
        {
          id: '3',
          level: 'error',
          message: 'Database connection timeout',
          timestamp: new Date(Date.now() - 600000),
          source: 'database',
        },
      ];
    } catch (error) {
      this.logger.error('Failed to get system logs:', error);
      throw error;
    }
  }

  async getSystemHealth(): Promise<any> {
    try {
      const hederaHealth = await this.hederaService.healthCheck();
      const chainlinkHealth = await this.chainlinkService.healthCheck();
      const websocketHealth = await this.webSocketService.getHealthStatus();

      return {
        overall: hederaHealth && chainlinkHealth && websocketHealth.connected,
        services: {
          database: true,
          hedera: hederaHealth,
          chainlink: chainlinkHealth,
          websocket: websocketHealth.connected,
          notifications: true,
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to get system health:', error);
      throw error;
    }
  }

  // Private helper methods
  private async getRecentActivity(): Promise<any[]> {
    try {
      const activities = await this.operationModel.find()
        .sort({ timestamp: -1 })
        .limit(20);

      return activities;
    } catch (error) {
      this.logger.error('Failed to get recent activity:', error);
      return [];
    }
  }

  private async getTopAssets(): Promise<any[]> {
    try {
      const topAssets = await this.assetModel.find()
        .sort({ totalValue: -1 })
        .limit(10)
        .select('name type totalValue status verificationScore');

      return topAssets;
    } catch (error) {
      this.logger.error('Failed to get top assets:', error);
      return [];
    }
  }

  private async getTopAttestors(): Promise<any[]> {
    try {
      const topAttestors = await this.attestorModel.find()
        .sort({ reputation: -1 })
        .limit(10)
        .select('organizationName type reputation verificationCount successRate');

      return topAttestors;
    } catch (error) {
      this.logger.error('Failed to get top attestors:', error);
      return [];
    }
  }

  private async getMarketTrends(): Promise<any[]> {
    try {
      // TODO: Implement real market trends
      return [
        {
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          coffee: 2.45,
          wheat: 8.75,
          corn: 6.25,
        },
        {
          date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          coffee: 2.50,
          wheat: 8.80,
          corn: 6.30,
        },
        // Add more trend data...
      ];
    } catch (error) {
      this.logger.error('Failed to get market trends:', error);
      return [];
    }
  }

  private async getSystemAlerts(): Promise<any[]> {
    try {
      // TODO: Implement real system alerts
      return [
        {
          id: '1',
          type: 'warning',
          message: 'High verification queue',
          timestamp: new Date(),
          severity: 'medium',
        },
        {
          id: '2',
          type: 'info',
          message: 'System maintenance scheduled',
          timestamp: new Date(Date.now() - 3600000),
          severity: 'low',
        },
      ];
    } catch (error) {
      this.logger.error('Failed to get system alerts:', error);
      return [];
    }
  }

  private async getVerificationTrends(): Promise<any[]> {
    try {
      const trends = await this.verificationModel.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' },
            },
            count: { $sum: 1 },
            avgScore: { $avg: '$scoring.finalScore' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
        { $limit: 30 },
      ]);

      return trends;
    } catch (error) {
      this.logger.error('Failed to get verification trends:', error);
      return [];
    }
  }
}
