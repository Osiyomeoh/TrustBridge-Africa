import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Asset, AssetDocument } from '../schemas/asset.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { VerificationRequest, VerificationRequestDocument } from '../schemas/verification-request.schema';
// import { Attestor, AttestorDocument } from '../schemas/attestor.schema'; // Removed - attestor functionality deprecated
import { Settlement, SettlementDocument } from '../schemas/settlement.schema';
import { Operation, OperationDocument } from '../schemas/operation.schema';
import { HederaService } from '../hedera/hedera.service';
import { ChainlinkService } from '../chainlink/chainlink.service';
import { WebSocketService } from '../websocket/websocket.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PagaService } from '../paga/paga.service';
// PaystackService removed - using direct API calls

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
    // @InjectModel(Attestor.name) private attestorModel: Model<AttestorDocument>, // Removed - attestor functionality deprecated
    @InjectModel(Settlement.name) private settlementModel: Model<SettlementDocument>,
    @InjectModel(Operation.name) private operationModel: Model<OperationDocument>,
    private hederaService: HederaService,
    private chainlinkService: ChainlinkService,
    private webSocketService: WebSocketService,
    private notificationsService: NotificationsService,
    private pagaService: PagaService,
  ) {}

  async getMobileDashboard(userId: string): Promise<MobileDashboard> {
    try {
      // Check if userId is a valid ObjectId, otherwise search by walletAddress
      let user;
      if (userId.match(/^[0-9a-fA-F]{24}$/)) {
        // Valid ObjectId
        user = await this.userModel.findById(userId).select('-password');
      } else {
        // Assume it's a wallet address
        user = await this.userModel.findOne({ walletAddress: userId }).select('-password');
      }
      
      if (!user) {
        throw new Error('User not found');
      }

      // Use the actual user ID for asset queries
      const actualUserId = user._id.toString();
      const assets = await this.assetModel.find({ owner: actualUserId })
        .sort({ createdAt: -1 })
        .limit(10);

      const investments = await this.getUserInvestments(actualUserId);
      const operations = await this.getUserOperations(actualUserId);
      const notifications = await this.getUserNotifications(actualUserId);

      const stats = {
        totalAssets: await this.assetModel.countDocuments({ owner: actualUserId }),
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

  // USSD Session Storage (in production, use Redis or database)
  private ussdSessions: Map<string, any> = new Map();
  
  /**
   * Process USSD requests with Paystack payment integration
   */
  async processUSSDRequest(sessionId: string, phoneNumber: string, text: string): Promise<string> {
    try {
      this.logger.log(`📱 USSD: ${phoneNumber} - Session: ${sessionId} - Input: "${text}"`);
  
      // Get or create session
      let session = this.ussdSessions.get(sessionId) || {
        sessionId,
        phoneNumber,
        step: 'main',
        data: {}
      };
  
      // Parse input
      const input = text.split('*').filter(Boolean);
  
      // Route to appropriate handler
      const response = await this.handleUSSDMenu(session, input);
  
      // Update session
      this.ussdSessions.set(sessionId, session);
  
      return response;
    } catch (error) {
      this.logger.error('USSD processing error:', error);
      return 'END Sorry, an error occurred. Please try again later.';
    }
  }
  
  private async handleUSSDMenu(session: any, input: string[]): Promise<string> {
    const { step } = session;
  
    // Handle current step
    switch (step) {
      case 'main':
        return this.showMainMenu(session, input);
  
      case 'register':
        return this.handleRegistrationFlow(session, input);
  
      case 'tokenize':
        return this.handleTokenizeFlow(session, input);

      case 'payment':
        // Payment step handled in handleTokenizeFlow
        return this.handleTokenizeFlow(session, input);

      default:
        return this.showMainMenu(session, input);
    }
  }
  
  private async showMainMenu(session: any, input: string[]): Promise<string> {
    if (input.length === 0) {
      // Check if user is registered
      const user = await this.userModel.findOne({ phoneNumber: session.phoneNumber });
      
      if (!user) {
        // Show registration menu
        return 'CON Welcome to TrustBridge Africa\n' +
               'Tokenize Your Real-World Assets\n\n' +
               'Farmers: Get investors for your land!\n\n' +
               '1. Register (Free)\n' +
               '2. Learn More\n' +
               '0. Exit';
      }
      
      // User is registered, show main menu
      return 'CON Welcome Back!\n' +
             'Tokenize Your Assets\n\n' +
             '1. Tokenize My Asset\n' +
             '2. My Portfolio\n' +
             '3. Why Tokenize?\n' +
             '0. Exit';
    }
  
    const choice = input[0];
    const user = await this.userModel.findOne({ phoneNumber: session.phoneNumber });
    
    // If not registered, handle registration
    if (!user) {
      if (choice === '1') {
        session.step = 'register';
        return await this.handleRegistrationFlow(session, input.slice(1));
      } else if (choice === '2') {
        return 'END BENEFITS FOR FARMERS:\n\n' +
               '✅ Get investors for your farmland\n' +
               '✅ Sell shares, not your land\n' +
               '✅ Keep ownership & earn returns\n' +
               '✅ No banks needed\n\n' +
               'FEE: ₦500 tokenization fee\n' +
               'AMC REVIEW: Within 48 hours\n\n' +
               'Dial *384# and select 1 to register!';
      } else if (choice === '0') {
        return 'END Thank you for using TrustBridge Africa!';
      } else {
        return 'END Invalid selection. Please try again.';
      }
    }
    
    // Registered user menu
    switch (choice) {
      case '1':
        session.step = 'tokenize';
        return await this.handleTokenizeFlow(session, input.slice(1));
      case '2':
        return await this.handlePortfolio(session.phoneNumber);
      case '3':
        return 'END WHY TOKENIZE?\n\n' +
               '💰 Unlock the value of your land\n' +
               '👥 Find investors worldwide\n' +
               '🏦 No bank loans needed\n' +
               '📈 Earn from asset returns\n' +
               '🔒 Keep your land ownership\n\n' +
               'COST: ₦500 fee\n' +
               'AMC APPROVAL: 48 hours\n\n' +
               'Visit tbafrica.xyz';
      case '0':
        return 'END Thank you for using TrustBridge Africa!';
      default:
        return 'END Invalid selection. Please try again.';
    }
  }
  
  private async handleRegistrationFlow(session: any, input: string[]): Promise<string> {
    const { data, phoneNumber } = session;
  
    if (input.length === 0) {
      return 'CON Registration - Step 1\n\nEnter your full name:\nExample: Ibrahim Musa';
    }
  
    if (input.length === 1) {
      data.fullName = input[0];
      return 'CON Registration - Step 2\n\nEnter your state:\nExample: Lagos';
    }
  
    if (input.length === 2) {
      data.state = input[1];
      return 'CON Registration - Step 3\n\nEnter your town/village:\nExample: Ikeja';
    }
  
    if (input.length === 3) {
      data.town = input[2];
      
      // Create user account
      try {
        const existingUser = await this.userModel.findOne({ phoneNumber });
        
        if (existingUser) {
          return 'END You are already registered!\nUse other menu options.';
      }
  
        // Create new user
        const newUser = new this.userModel({
          phoneNumber,
          fullName: data.fullName,
          state: data.state,
          town: data.town,
          role: 'asset_owner',
          isVerified: false,
          createdAt: new Date()
        });
  
        await newUser.save();
  
        // Clean up session
        this.ussdSessions.delete(session.sessionId);
  
        return 'END ✅ Registration Complete!\n\n' +
               `Welcome ${data.fullName}!\n\n` +
               'You can now tokenize your assets.\n' +
               'Dial *384# and select 1 to start!';
      } catch (error) {
        this.logger.error('Registration error:', error);
        return 'END Registration failed. Please try again.';
      }
    }
  
    return 'END Invalid input.';
  }
  
  private async handleTokenizeFlow(session: any, input: string[]): Promise<string> {
    const { data } = session;
  
    if (input.length === 0) {
      session.step = 'tokenize';
      return 'CON Choose Asset Type:\n\n' +
             '1. Farmland\n' +
             '2. Real Estate\n' +
             '3. Business\n' +
             '4. Commodities\n' +
             '99. Back';
    }
  
    if (input.length === 1) {
      data.assetType = input[0];
      return 'CON Enter Land Size (acres):\n\n' +
             'Reply with number only\n' +
             'Example: 5';
    }
  
    if (input.length === 2) {
      data.size = input[1];
      return 'CON Enter Location (State):\n\n' +
             'Example: Lagos';
    }
  
    if (input.length === 3) {
      data.location = input[2];
      return 'CON Enter Current Value (NGN):\n\n' +
             'Example: 1000000';
    }
  
    if (input.length === 4) {
      data.value = input[3];
      session.step = 'payment';
      
      // Show payment prompt with Paga option for bankless users
      return 'CON Tokenization Fee: ₦500\n\n' +
             `Asset: ${data.assetType === '1' ? 'Farmland' : data.assetType === '2' ? 'Real Estate' : data.assetType === '3' ? 'Business' : 'Commodities'}\n` +
             `Size: ${data.size} acres\n` +
             `Value: ₦${data.value}\n\n` +
             'Pay via:\n' +
             '1. Paga Agent (No Bank Needed)\n' +
             '2. Guaranty Trust Bank (*737#)\n' +
             '3. Access Bank (*901#)\n' +
             '99. Cancel';
    }
    
    if (input.length === 5 && input[4] === '1') {
      // User selected Paga Agent payment
      try {
        // Create Paga payment request
        const userId = session.phoneNumber;
        const paymentRequest = await this.pagaService.createAgentPaymentRequest(
          session.phoneNumber,
          500,
          this.pagaService.generatePaymentCode(userId, 500),
          'RWA Tokenization Fee'
        );
        
        // Store payment code in session
        data.paymentCode = paymentRequest.paymentCode;
        data.paymentMethod = 'paga';
        
        // Send SMS with instructions
        await this.pagaService.sendPaymentInstructions(
          session.phoneNumber,
          paymentRequest.paymentCode,
          500
        );
        
        return `CON Paga Agent Payment\n\n` +
               `Visit any Paga agent\n\n` +
               `Payment Code: ${paymentRequest.paymentCode}\n` +
               `Amount: ₦500\n\n` +
               `Instructions:\n` +
               `1. Go to nearest Paga agent\n` +
               `2. Provide code: ${paymentRequest.paymentCode}\n` +
               `3. Pay ₦500\n\n` +
               `Find agent: paga.com/agents\n\n` +
               `1. I have paid\n` +
               `2. Cancel`;
      } catch (error) {
        this.logger.error('Paga payment creation error:', error);
        return 'END Error creating payment. Please try again.';
      }
    }
    
    if (input.length === 5 && input[4] === '2') {
      // User selected Guaranty Trust Bank
      data.paymentBank = '737';
      data.paymentMethod = 'gtb';
      
      return 'CON Payment via Guaranty Trust Bank\n\n' +
             'Dial *737# to pay ₦500\n\n' +
             'Instructions:\n' +
             '1. Dial *737# on your phone\n' +
             '2. Enter amount: 500\n' +
             '3. Enter PIN to confirm\n\n' +
             'After payment:\n' +
             'You\'ll receive SMS with payment confirmation\n\n' +
             '1. I have paid\n' +
             '2. Cancel';
    }
    
    if (input.length === 6 && input[5] === '1') {
      // User claims to have paid
      try {
        const user = await this.userModel.findOne({ phoneNumber: session.phoneNumber });
        if (!user) {
          return 'END User not found. Please register first.';
        }
        
        // Verify payment based on method
        let paymentVerified = false;
        
        if (data.paymentMethod === 'paga') {
          // For Paga, accept user confirmation for now
          // NOTE: In production, this would be handled via webhook
          // For testing, we'll accept user confirmation
          paymentVerified = true;
        } else if (data.paymentMethod === 'gtb' || data.paymentBank) {
          // For bank payments, accept user confirmation
          // NOTE: In production, verify via bank webhook
          paymentVerified = true;
        }
        
        if (!paymentVerified) {
          return 'END Payment not confirmed. Please try again.';
        }
        
        // Create asset on Hedera
        const assetData = {
          category: data.assetType === '1' ? 0 : data.assetType === '2' ? 1 : data.assetType === '3' ? 2 : 3,
          assetType: data.assetType === '1' ? 'Farmland' : data.assetType === '2' ? 'Real Estate' : data.assetType === '3' ? 'Business' : 'Commodities',
          name: `${data.assetType === '1' ? 'Farmland' : data.assetType === '2' ? 'Real Estate' : data.assetType === '3' ? 'Business' : 'Commodities'} in ${data.location}`,
          location: data.location,
          totalValue: data.value,
          maturityDate: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 year from now
          evidenceHashes: [],
          documentTypes: [],
          imageURI: '',
          documentURI: '',
          description: `${data.assetType === '1' ? 'Farmland' : data.assetType === '2' ? 'Real Estate' : data.assetType === '3' ? 'Business' : 'Commodities'} in ${data.location}, ${data.size} acres`
        };
        
        const asset = await this.hederaService.createRWAAsset(assetData);
        
        this.ussdSessions.delete(session.sessionId);
        
        const paymentMethod = data.paymentMethod === 'paga' ? 'Paga Agent' : 'Bank Transfer';
        
        return `END ✅ Asset Submitted!\n\n` +
               `Asset ID: ${asset.assetId}\n` +
               `Fee Paid: ₦500 (${paymentMethod})\n` +
               `Status: Pending AMC Review\n\n` +
               `AMC will review within 48h\n` +
               `You'll receive SMS: "Asset approved!"\n\n` +
               `Visit tbafrica.xyz for updates`;
      } catch (error) {
        this.logger.error('Asset creation error:', error);
        return 'END Error creating asset. Please try again.';
      }
    }
  
    return 'END Invalid input.';
  }
  
  private async handlePortfolio(phoneNumber: string): Promise<string> {
    try {
      const user = await this.userModel.findOne({ phoneNumber });
      if (!user) {
        return 'END User not found.';
      }
      
      const assets = await this.assetModel.find({ owner: user._id });
      
      return 'END My RWA Portfolio\n\n' +
             `Owned Assets: ${assets.length}\n` +
             `Total Value: ${assets.reduce((sum, a) => sum + (parseFloat((a as any).totalValue || '0') || 0), 0)} NGN\n` +
             `Earned Returns: 0 NGN`;
    } catch (error) {
      return 'END Error loading portfolio. Please try again.';
    }
  }
}
