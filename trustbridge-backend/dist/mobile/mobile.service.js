"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MobileService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobileService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const asset_schema_1 = require("../schemas/asset.schema");
const user_schema_1 = require("../schemas/user.schema");
const verification_request_schema_1 = require("../schemas/verification-request.schema");
const attestor_schema_1 = require("../schemas/attestor.schema");
const settlement_schema_1 = require("../schemas/settlement.schema");
const operation_schema_1 = require("../schemas/operation.schema");
const hedera_service_1 = require("../hedera/hedera.service");
const chainlink_service_1 = require("../chainlink/chainlink.service");
const websocket_service_1 = require("../websocket/websocket.service");
const notifications_service_1 = require("../notifications/notifications.service");
let MobileService = MobileService_1 = class MobileService {
    constructor(assetModel, userModel, verificationModel, attestorModel, settlementModel, operationModel, hederaService, chainlinkService, webSocketService, notificationsService) {
        this.assetModel = assetModel;
        this.userModel = userModel;
        this.verificationModel = verificationModel;
        this.attestorModel = attestorModel;
        this.settlementModel = settlementModel;
        this.operationModel = operationModel;
        this.hederaService = hederaService;
        this.chainlinkService = chainlinkService;
        this.webSocketService = webSocketService;
        this.notificationsService = notificationsService;
        this.logger = new common_1.Logger(MobileService_1.name);
    }
    async getMobileDashboard(userId) {
        try {
            let user;
            if (userId.match(/^[0-9a-fA-F]{24}$/)) {
                user = await this.userModel.findById(userId).select('-password');
            }
            else {
                user = await this.userModel.findOne({ walletAddress: userId }).select('-password');
            }
            if (!user) {
                throw new Error('User not found');
            }
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
        }
        catch (error) {
            this.logger.error('Failed to get mobile dashboard:', error);
            throw error;
        }
    }
    async trackOperation(operationId) {
        try {
            const operation = await this.operationModel.findById(operationId);
            if (!operation) {
                throw new Error('Operation not found');
            }
            const tracking = {
                operationId: operation._id.toString(),
                type: operation.type,
                status: operation.status,
                progress: this.calculateProgress(operation),
                estimatedCompletion: this.estimateCompletion(operation),
                currentStep: this.getCurrentStep(operation),
                steps: this.getOperationSteps(operation),
                blockchainTxId: operation.blockchainTxId,
                lastUpdated: operation.updatedAt || operation.createdAt,
            };
            return tracking;
        }
        catch (error) {
            this.logger.error('Failed to track operation:', error);
            throw error;
        }
    }
    async getUserOperations(userId) {
        try {
            const operations = await this.operationModel.find({ userId })
                .sort({ createdAt: -1 })
                .limit(20);
            return operations.map(operation => ({
                operationId: operation._id.toString(),
                type: operation.type,
                status: operation.status,
                progress: this.calculateProgress(operation),
                estimatedCompletion: this.estimateCompletion(operation),
                currentStep: this.getCurrentStep(operation),
                steps: this.getOperationSteps(operation),
                blockchainTxId: operation.blockchainTxId,
                lastUpdated: operation.updatedAt || operation.createdAt,
            }));
        }
        catch (error) {
            this.logger.error('Failed to get user operations:', error);
            throw error;
        }
    }
    async getUserNotifications(userId) {
        try {
            const notifications = [
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
        }
        catch (error) {
            this.logger.error('Failed to get user notifications:', error);
            throw error;
        }
    }
    async markNotificationAsRead(userId, notificationId) {
        try {
            this.logger.log(`Notification ${notificationId} marked as read for user ${userId}`);
        }
        catch (error) {
            this.logger.error('Failed to mark notification as read:', error);
            throw error;
        }
    }
    async getAssetDetails(assetId, userId) {
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
        }
        catch (error) {
            this.logger.error('Failed to get asset details:', error);
            throw error;
        }
    }
    async getInvestmentDetails(investmentId, userId) {
        try {
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
        }
        catch (error) {
            this.logger.error('Failed to get investment details:', error);
            throw error;
        }
    }
    async getMarketData(assetType, country) {
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
        }
        catch (error) {
            this.logger.error('Failed to get market data:', error);
            throw error;
        }
    }
    async getBlockchainStatus(assetId) {
        try {
            const hederaStatus = await this.hederaService.getNetworkStatus();
            return {
                network: hederaStatus.network,
                status: hederaStatus.status,
                lastBlock: Date.now(),
                gasPrice: '0.0001 HBAR',
                confirmations: 3,
            };
        }
        catch (error) {
            this.logger.error('Failed to get blockchain status:', error);
            throw error;
        }
    }
    async submitAssetForVerification(assetId, userId, evidence) {
        try {
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
            await this.webSocketService.notifyUserVerificationUpdate(userId, assetId, 'submitted', 0);
            return this.trackOperation(operation._id.toString());
        }
        catch (error) {
            this.logger.error('Failed to submit asset for verification:', error);
            throw error;
        }
    }
    async createInvestment(assetId, userId, amount) {
        try {
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
            await this.webSocketService.notifyUserInvestmentUpdate(userId, operation._id.toString(), 'created');
            return this.trackOperation(operation._id.toString());
        }
        catch (error) {
            this.logger.error('Failed to create investment:', error);
            throw error;
        }
    }
    async getAttestorOperations(attestorId) {
        try {
            const operations = await this.operationModel.find({
                type: 'verification',
                'data.attestorId': attestorId,
            })
                .sort({ createdAt: -1 })
                .limit(20);
            return operations.map(operation => ({
                operationId: operation._id.toString(),
                type: operation.type,
                status: operation.status,
                progress: this.calculateProgress(operation),
                estimatedCompletion: this.estimateCompletion(operation),
                currentStep: this.getCurrentStep(operation),
                steps: this.getOperationSteps(operation),
                blockchainTxId: operation.blockchainTxId,
                lastUpdated: operation.updatedAt || operation.createdAt,
            }));
        }
        catch (error) {
            this.logger.error('Failed to get attestor operations:', error);
            throw error;
        }
    }
    async updateOperationStatus(operationId, status, data) {
        try {
            const operation = await this.operationModel.findById(operationId);
            if (!operation) {
                throw new Error('Operation not found');
            }
            operation.status = status;
            operation.data = { ...operation.data, ...data };
            operation.updatedAt = new Date();
            await operation.save();
            if (operation.userId) {
                await this.webSocketService.notifyUserAssetUpdate(operation.userId, operation.assetId, status);
            }
            this.logger.log(`Operation ${operationId} status updated to ${status}`);
        }
        catch (error) {
            this.logger.error('Failed to update operation status:', error);
            throw error;
        }
    }
    async getUserInvestments(userId) {
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
    calculateProgress(operation) {
        const completedSteps = operation.steps.filter((step) => step.status === 'completed').length;
        return Math.round((completedSteps / operation.steps.length) * 100);
    }
    estimateCompletion(operation) {
        const now = new Date();
        const remainingSteps = operation.steps.filter((step) => step.status !== 'completed').length;
        const estimatedHours = remainingSteps * 2;
        return new Date(now.getTime() + estimatedHours * 60 * 60 * 1000);
    }
    getCurrentStep(operation) {
        const currentStep = operation.steps.find((step) => step.status === 'in_progress');
        return currentStep ? currentStep.name : 'Completed';
    }
    getOperationSteps(operation) {
        return operation.steps.map((step) => ({
            name: step.name,
            status: step.status,
            timestamp: step.timestamp,
            details: step.details,
        }));
    }
    calculateTrends(historicalData) {
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
};
exports.MobileService = MobileService;
exports.MobileService = MobileService = MobileService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(asset_schema_1.Asset.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(verification_request_schema_1.VerificationRequest.name)),
    __param(3, (0, mongoose_1.InjectModel)(attestor_schema_1.Attestor.name)),
    __param(4, (0, mongoose_1.InjectModel)(settlement_schema_1.Settlement.name)),
    __param(5, (0, mongoose_1.InjectModel)(operation_schema_1.Operation.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        hedera_service_1.HederaService,
        chainlink_service_1.ChainlinkService,
        websocket_service_1.WebSocketService,
        notifications_service_1.NotificationsService])
], MobileService);
//# sourceMappingURL=mobile.service.js.map