import { Model } from 'mongoose';
import { AssetDocument } from '../schemas/asset.schema';
import { UserDocument } from '../schemas/user.schema';
import { VerificationRequestDocument } from '../schemas/verification-request.schema';
import { AttestorDocument } from '../schemas/attestor.schema';
import { SettlementDocument } from '../schemas/settlement.schema';
import { OperationDocument } from '../schemas/operation.schema';
import { AnalyticsDocument } from '../schemas/analytics.schema';
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
    userRoles: {
        [role: string]: number;
    };
}
export interface AssetManagementData {
    assets: any[];
    totalAssets: number;
    verifiedAssets: number;
    pendingAssets: number;
    rejectedAssets: number;
    assetTypes: {
        [type: string]: number;
    };
}
export interface VerificationManagementData {
    verifications: any[];
    totalVerifications: number;
    pendingVerifications: number;
    completedVerifications: number;
    averageScore: number;
    verificationTrends: any[];
}
export declare class AdminService {
    private assetModel;
    private userModel;
    private verificationModel;
    private attestorModel;
    private settlementModel;
    private operationModel;
    private analyticsModel;
    private hederaService;
    private chainlinkService;
    private webSocketService;
    private notificationsService;
    private readonly logger;
    constructor(assetModel: Model<AssetDocument>, userModel: Model<UserDocument>, verificationModel: Model<VerificationRequestDocument>, attestorModel: Model<AttestorDocument>, settlementModel: Model<SettlementDocument>, operationModel: Model<OperationDocument>, analyticsModel: Model<AnalyticsDocument>, hederaService: HederaService, chainlinkService: ChainlinkService, webSocketService: WebSocketService, notificationsService: NotificationsService);
    getSystemStats(): Promise<SystemStats>;
    getDashboardMetrics(): Promise<DashboardMetrics>;
    getUserManagementData(): Promise<UserManagementData>;
    getAssetManagementData(): Promise<AssetManagementData>;
    getVerificationManagementData(): Promise<VerificationManagementData>;
    updateUserStatus(userId: string, status: 'active' | 'inactive' | 'suspended'): Promise<void>;
    updateAssetStatus(assetId: string, status: string): Promise<void>;
    updateAttestorStatus(attestorId: string, status: 'active' | 'inactive' | 'suspended'): Promise<void>;
    sendSystemAlert(alertType: string, message: string, recipients: string[]): Promise<void>;
    getSystemLogs(limit?: number): Promise<any[]>;
    getSystemHealth(): Promise<any>;
    private getRecentActivity;
    private getTopAssets;
    private getTopAttestors;
    private getMarketTrends;
    private getSystemAlerts;
    private getVerificationTrends;
}
