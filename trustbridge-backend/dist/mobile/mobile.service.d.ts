import { Model } from 'mongoose';
import { AssetDocument } from '../schemas/asset.schema';
import { UserDocument } from '../schemas/user.schema';
import { VerificationRequestDocument } from '../schemas/verification-request.schema';
import { SettlementDocument } from '../schemas/settlement.schema';
import { OperationDocument } from '../schemas/operation.schema';
import { HederaService } from '../hedera/hedera.service';
import { ChainlinkService } from '../chainlink/chainlink.service';
import { WebSocketService } from '../websocket/websocket.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PagaService } from '../paga/paga.service';
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
export declare class MobileService {
    private assetModel;
    private userModel;
    private verificationModel;
    private settlementModel;
    private operationModel;
    private hederaService;
    private chainlinkService;
    private webSocketService;
    private notificationsService;
    private pagaService;
    private readonly logger;
    constructor(assetModel: Model<AssetDocument>, userModel: Model<UserDocument>, verificationModel: Model<VerificationRequestDocument>, settlementModel: Model<SettlementDocument>, operationModel: Model<OperationDocument>, hederaService: HederaService, chainlinkService: ChainlinkService, webSocketService: WebSocketService, notificationsService: NotificationsService, pagaService: PagaService);
    getMobileDashboard(userId: string): Promise<MobileDashboard>;
    trackOperation(operationId: string): Promise<OperationTracking>;
    getUserOperations(userId: string): Promise<OperationTracking[]>;
    getUserNotifications(userId: string): Promise<MobileNotification[]>;
    markNotificationAsRead(userId: string, notificationId: string): Promise<void>;
    getAssetDetails(assetId: string, userId: string): Promise<any>;
    getInvestmentDetails(investmentId: string, userId: string): Promise<any>;
    getMarketData(assetType: string, country: string): Promise<any>;
    getBlockchainStatus(assetId: string): Promise<any>;
    submitAssetForVerification(assetId: string, userId: string, evidence: any): Promise<OperationTracking>;
    createInvestment(assetId: string, userId: string, amount: number): Promise<OperationTracking>;
    getAttestorOperations(attestorId: string): Promise<OperationTracking[]>;
    updateOperationStatus(operationId: string, status: string, data?: any): Promise<void>;
    private getUserInvestments;
    private calculateProgress;
    private estimateCompletion;
    private getCurrentStep;
    private getOperationSteps;
    private calculateTrends;
    private ussdSessions;
    processUSSDRequest(sessionId: string, phoneNumber: string, text: string): Promise<string>;
    private handleUSSDMenu;
    private showMainMenu;
    private handleRegistrationFlow;
    private handleTokenizeFlow;
    private handlePortfolio;
}
