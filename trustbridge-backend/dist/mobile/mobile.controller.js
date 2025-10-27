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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobileController = exports.UpdateOperationStatusDto = exports.CreateInvestmentDto = exports.SubmitVerificationDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const mobile_service_1 = require("./mobile.service");
class SubmitVerificationDto {
}
exports.SubmitVerificationDto = SubmitVerificationDto;
class CreateInvestmentDto {
}
exports.CreateInvestmentDto = CreateInvestmentDto;
class UpdateOperationStatusDto {
}
exports.UpdateOperationStatusDto = UpdateOperationStatusDto;
let MobileController = class MobileController {
    constructor(mobileService) {
        this.mobileService = mobileService;
    }
    async handleUSSD(body, res) {
        try {
            console.log('📱 USSD Request received:', body);
            const { sessionId, phoneNumber, text } = body;
            const response = await this.mobileService.processUSSDRequest(sessionId, phoneNumber, text || '');
            return res.status(common_1.HttpStatus.OK).send(response);
        }
        catch (error) {
            console.error('❌ USSD Error:', error);
            return res.status(common_1.HttpStatus.OK).send('END Error processing request. Please try again.');
        }
    }
    async getMobileDashboard(userId) {
        const dashboard = await this.mobileService.getMobileDashboard(userId);
        return {
            success: true,
            data: dashboard,
            message: 'Mobile dashboard retrieved successfully',
        };
    }
    async getUserOperations(userId) {
        const operations = await this.mobileService.getUserOperations(userId);
        return {
            success: true,
            data: operations,
            message: 'User operations retrieved successfully',
        };
    }
    async trackOperation(operationId) {
        const tracking = await this.mobileService.trackOperation(operationId);
        return {
            success: true,
            data: tracking,
            message: 'Operation tracking retrieved successfully',
        };
    }
    async getUserNotifications(userId) {
        const notifications = await this.mobileService.getUserNotifications(userId);
        return {
            success: true,
            data: notifications,
            message: 'User notifications retrieved successfully',
        };
    }
    async markNotificationAsRead(userId, notificationId) {
        await this.mobileService.markNotificationAsRead(userId, notificationId);
        return {
            success: true,
            message: 'Notification marked as read successfully',
        };
    }
    async getAssetDetails(assetId, userId) {
        const details = await this.mobileService.getAssetDetails(assetId, userId);
        return {
            success: true,
            data: details,
            message: 'Asset details retrieved successfully',
        };
    }
    async getInvestmentDetails(investmentId, userId) {
        const details = await this.mobileService.getInvestmentDetails(investmentId, userId);
        return {
            success: true,
            data: details,
            message: 'Investment details retrieved successfully',
        };
    }
    async getMarketData(assetType, country) {
        const marketData = await this.mobileService.getMarketData(assetType, country || 'US');
        return {
            success: true,
            data: marketData,
            message: 'Market data retrieved successfully',
        };
    }
    async getBlockchainStatus(assetId) {
        const status = await this.mobileService.getBlockchainStatus(assetId);
        return {
            success: true,
            data: status,
            message: 'Blockchain status retrieved successfully',
        };
    }
    async submitAssetForVerification(submitVerificationDto) {
        const tracking = await this.mobileService.submitAssetForVerification(submitVerificationDto.assetId, submitVerificationDto.userId, submitVerificationDto.evidence);
        return {
            success: true,
            data: tracking,
            message: 'Asset submitted for verification successfully',
        };
    }
    async createInvestment(createInvestmentDto) {
        const tracking = await this.mobileService.createInvestment(createInvestmentDto.assetId, createInvestmentDto.userId, createInvestmentDto.amount);
        return {
            success: true,
            data: tracking,
            message: 'Investment created successfully',
        };
    }
    async getAttestorOperations(attestorId) {
        const operations = await this.mobileService.getAttestorOperations(attestorId);
        return {
            success: true,
            data: operations,
            message: 'Attestor operations retrieved successfully',
        };
    }
    async updateOperationStatus(operationId, updateOperationStatusDto) {
        await this.mobileService.updateOperationStatus(operationId, updateOperationStatusDto.status, updateOperationStatusDto.data);
        return {
            success: true,
            message: 'Operation status updated successfully',
        };
    }
    async syncOfflineData(userId) {
        const syncData = {
            lastSync: new Date(),
            pendingOperations: [],
            cachedAssets: [],
            cachedInvestments: [],
        };
        return {
            success: true,
            data: syncData,
            message: 'Offline data synced successfully',
        };
    }
    async healthCheck() {
        const health = {
            status: 'healthy',
            timestamp: new Date(),
            version: '1.0.0',
            services: {
                database: true,
                blockchain: true,
                notifications: true,
                websocket: true,
            },
        };
        return {
            success: true,
            data: health,
            message: 'Mobile API is healthy',
        };
    }
};
exports.MobileController = MobileController;
__decorate([
    (0, common_1.Post)('ussd'),
    (0, swagger_1.ApiOperation)({ summary: 'Handle USSD requests from Africa\'s Talking' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'USSD response sent successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MobileController.prototype, "handleUSSD", null);
__decorate([
    (0, common_1.Get)('dashboard/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get mobile dashboard for user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mobile dashboard retrieved successfully' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MobileController.prototype, "getMobileDashboard", null);
__decorate([
    (0, common_1.Get)('operations/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user operations' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User operations retrieved successfully' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MobileController.prototype, "getUserOperations", null);
__decorate([
    (0, common_1.Get)('operations/track/:operationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Track specific operation' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Operation tracking retrieved successfully' }),
    __param(0, (0, common_1.Param)('operationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MobileController.prototype, "trackOperation", null);
__decorate([
    (0, common_1.Get)('notifications/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user notifications' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User notifications retrieved successfully' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MobileController.prototype, "getUserNotifications", null);
__decorate([
    (0, common_1.Put)('notifications/:userId/:notificationId/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark notification as read' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification marked as read successfully' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('notificationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MobileController.prototype, "markNotificationAsRead", null);
__decorate([
    (0, common_1.Get)('assets/:assetId/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get asset details for mobile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asset details retrieved successfully' }),
    __param(0, (0, common_1.Param)('assetId')),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MobileController.prototype, "getAssetDetails", null);
__decorate([
    (0, common_1.Get)('investments/:investmentId/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get investment details for mobile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Investment details retrieved successfully' }),
    __param(0, (0, common_1.Param)('investmentId')),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MobileController.prototype, "getInvestmentDetails", null);
__decorate([
    (0, common_1.Get)('market/:assetType'),
    (0, swagger_1.ApiOperation)({ summary: 'Get market data for asset type' }),
    (0, swagger_1.ApiQuery)({ name: 'country', required: false, description: 'Country code' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Market data retrieved successfully' }),
    __param(0, (0, common_1.Param)('assetType')),
    __param(1, (0, common_1.Query)('country')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MobileController.prototype, "getMarketData", null);
__decorate([
    (0, common_1.Get)('blockchain/status/:assetId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get blockchain status for asset' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Blockchain status retrieved successfully' }),
    __param(0, (0, common_1.Param)('assetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MobileController.prototype, "getBlockchainStatus", null);
__decorate([
    (0, common_1.Post)('verification/submit'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit asset for verification via mobile' }),
    (0, swagger_1.ApiBody)({ type: SubmitVerificationDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Asset submitted for verification successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MobileController.prototype, "submitAssetForVerification", null);
__decorate([
    (0, common_1.Post)('investments/create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create investment via mobile' }),
    (0, swagger_1.ApiBody)({ type: CreateInvestmentDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Investment created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MobileController.prototype, "createInvestment", null);
__decorate([
    (0, common_1.Get)('attestors/:attestorId/operations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get attestor operations' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Attestor operations retrieved successfully' }),
    __param(0, (0, common_1.Param)('attestorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MobileController.prototype, "getAttestorOperations", null);
__decorate([
    (0, common_1.Put)('operations/:operationId/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update operation status' }),
    (0, swagger_1.ApiBody)({ type: UpdateOperationStatusDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Operation status updated successfully' }),
    __param(0, (0, common_1.Param)('operationId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateOperationStatusDto]),
    __metadata("design:returntype", Promise)
], MobileController.prototype, "updateOperationStatus", null);
__decorate([
    (0, common_1.Get)('offline/sync/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Sync offline data for user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Offline data synced successfully' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MobileController.prototype, "syncOfflineData", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Mobile API health check' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mobile API is healthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MobileController.prototype, "healthCheck", null);
exports.MobileController = MobileController = __decorate([
    (0, swagger_1.ApiTags)('Mobile API'),
    (0, common_1.Controller)('mobile'),
    __metadata("design:paramtypes", [mobile_service_1.MobileService])
], MobileController);
//# sourceMappingURL=mobile.controller.js.map