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
var AdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const asset_schema_1 = require("../schemas/asset.schema");
const user_schema_1 = require("../schemas/user.schema");
const verification_request_schema_1 = require("../schemas/verification-request.schema");
const attestor_schema_1 = require("../schemas/attestor.schema");
const settlement_schema_1 = require("../schemas/settlement.schema");
const operation_schema_1 = require("../schemas/operation.schema");
const analytics_schema_1 = require("../schemas/analytics.schema");
const hedera_service_1 = require("../hedera/hedera.service");
const chainlink_service_1 = require("../chainlink/chainlink.service");
const websocket_service_1 = require("../websocket/websocket.service");
const notifications_service_1 = require("../notifications/notifications.service");
let AdminService = AdminService_1 = class AdminService {
    constructor(assetModel, userModel, verificationModel, attestorModel, settlementModel, operationModel, analyticsModel, hederaService, chainlinkService, webSocketService, notificationsService) {
        this.assetModel = assetModel;
        this.userModel = userModel;
        this.verificationModel = verificationModel;
        this.attestorModel = attestorModel;
        this.settlementModel = settlementModel;
        this.operationModel = operationModel;
        this.analyticsModel = analyticsModel;
        this.hederaService = hederaService;
        this.chainlinkService = chainlinkService;
        this.webSocketService = webSocketService;
        this.notificationsService = notificationsService;
        this.logger = new common_1.Logger(AdminService_1.name);
    }
    async getSystemStats() {
        try {
            const [totalAssets, totalUsers, totalAttestors, activeVerifications, completedVerifications, pendingSettlements, totalVolume,] = await Promise.all([
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
                database: true,
                hedera: await this.hederaService.healthCheck(),
                chainlink: await this.chainlinkService.healthCheck(),
                websocket: (await this.webSocketService.getHealthStatus()).connected,
                notifications: true,
            };
            return {
                totalAssets,
                totalUsers,
                totalAttestors,
                totalInvestments: 0,
                totalVolume,
                activeVerifications,
                completedVerifications,
                pendingSettlements,
                systemHealth,
            };
        }
        catch (error) {
            this.logger.error('Failed to get system stats:', error);
            throw error;
        }
    }
    async getDashboardMetrics() {
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
        }
        catch (error) {
            this.logger.error('Failed to get dashboard metrics:', error);
            throw error;
        }
    }
    async getUserManagementData() {
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
            const roleMap = {};
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
        }
        catch (error) {
            this.logger.error('Failed to get user management data:', error);
            throw error;
        }
    }
    async getAssetManagementData() {
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
            const typeMap = {};
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
        }
        catch (error) {
            this.logger.error('Failed to get asset management data:', error);
            throw error;
        }
    }
    async getVerificationManagementData() {
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
        }
        catch (error) {
            this.logger.error('Failed to get verification management data:', error);
            throw error;
        }
    }
    async updateUserStatus(userId, status) {
        try {
            await this.userModel.updateOne({ _id: userId }, {
                isActive: status === 'active',
                status,
                updatedAt: new Date(),
            });
            this.logger.log(`User ${userId} status updated to ${status}`);
        }
        catch (error) {
            this.logger.error('Failed to update user status:', error);
            throw error;
        }
    }
    async updateAssetStatus(assetId, status) {
        try {
            await this.assetModel.updateOne({ assetId }, {
                status,
                updatedAt: new Date(),
            });
            this.logger.log(`Asset ${assetId} status updated to ${status}`);
        }
        catch (error) {
            this.logger.error('Failed to update asset status:', error);
            throw error;
        }
    }
    async updateAttestorStatus(attestorId, status) {
        try {
            await this.attestorModel.updateOne({ _id: attestorId }, {
                isActive: status === 'active',
                status,
                updatedAt: new Date(),
            });
            this.logger.log(`Attestor ${attestorId} status updated to ${status}`);
        }
        catch (error) {
            this.logger.error('Failed to update attestor status:', error);
            throw error;
        }
    }
    async sendSystemAlert(alertType, message, recipients) {
        try {
            await this.notificationsService.sendSystemAlert(alertType, message, recipients);
            await this.webSocketService.broadcastSystemAlert(alertType, message, 'high');
            this.logger.log(`System alert sent: ${alertType}`);
        }
        catch (error) {
            this.logger.error('Failed to send system alert:', error);
            throw error;
        }
    }
    async getSystemLogs(limit = 100) {
        try {
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
        }
        catch (error) {
            this.logger.error('Failed to get system logs:', error);
            throw error;
        }
    }
    async getSystemHealth() {
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
        }
        catch (error) {
            this.logger.error('Failed to get system health:', error);
            throw error;
        }
    }
    async getRecentActivity() {
        try {
            const activities = await this.operationModel.find()
                .sort({ timestamp: -1 })
                .limit(20);
            return activities;
        }
        catch (error) {
            this.logger.error('Failed to get recent activity:', error);
            return [];
        }
    }
    async getTopAssets() {
        try {
            const topAssets = await this.assetModel.find()
                .sort({ totalValue: -1 })
                .limit(10)
                .select('name type totalValue status verificationScore');
            return topAssets;
        }
        catch (error) {
            this.logger.error('Failed to get top assets:', error);
            return [];
        }
    }
    async getTopAttestors() {
        try {
            const topAttestors = await this.attestorModel.find()
                .sort({ reputation: -1 })
                .limit(10)
                .select('organizationName type reputation verificationCount successRate');
            return topAttestors;
        }
        catch (error) {
            this.logger.error('Failed to get top attestors:', error);
            return [];
        }
    }
    async getMarketTrends() {
        try {
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
            ];
        }
        catch (error) {
            this.logger.error('Failed to get market trends:', error);
            return [];
        }
    }
    async getSystemAlerts() {
        try {
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
        }
        catch (error) {
            this.logger.error('Failed to get system alerts:', error);
            return [];
        }
    }
    async getVerificationTrends() {
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
        }
        catch (error) {
            this.logger.error('Failed to get verification trends:', error);
            return [];
        }
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = AdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(asset_schema_1.Asset.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(verification_request_schema_1.VerificationRequest.name)),
    __param(3, (0, mongoose_1.InjectModel)(attestor_schema_1.Attestor.name)),
    __param(4, (0, mongoose_1.InjectModel)(settlement_schema_1.Settlement.name)),
    __param(5, (0, mongoose_1.InjectModel)(operation_schema_1.Operation.name)),
    __param(6, (0, mongoose_1.InjectModel)(analytics_schema_1.Analytics.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        hedera_service_1.HederaService,
        chainlink_service_1.ChainlinkService,
        websocket_service_1.WebSocketService,
        notifications_service_1.NotificationsService])
], AdminService);
//# sourceMappingURL=admin.service.js.map