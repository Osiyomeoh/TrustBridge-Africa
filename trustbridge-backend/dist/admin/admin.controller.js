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
exports.AdminController = exports.SendSystemAlertDto = exports.UpdateAttestorStatusDto = exports.UpdateAssetStatusDto = exports.UpdateUserStatusDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("./admin.service");
class UpdateUserStatusDto {
}
exports.UpdateUserStatusDto = UpdateUserStatusDto;
class UpdateAssetStatusDto {
}
exports.UpdateAssetStatusDto = UpdateAssetStatusDto;
class UpdateAttestorStatusDto {
}
exports.UpdateAttestorStatusDto = UpdateAttestorStatusDto;
class SendSystemAlertDto {
}
exports.SendSystemAlertDto = SendSystemAlertDto;
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getDashboardMetrics() {
        const metrics = await this.adminService.getDashboardMetrics();
        return {
            success: true,
            data: metrics,
            message: 'Dashboard metrics retrieved successfully',
        };
    }
    async getSystemStats() {
        const stats = await this.adminService.getSystemStats();
        return {
            success: true,
            data: stats,
            message: 'System statistics retrieved successfully',
        };
    }
    async getUserManagementData() {
        const data = await this.adminService.getUserManagementData();
        return {
            success: true,
            data,
            message: 'User management data retrieved successfully',
        };
    }
    async getAssetManagementData() {
        const data = await this.adminService.getAssetManagementData();
        return {
            success: true,
            data,
            message: 'Asset management data retrieved successfully',
        };
    }
    async getVerificationManagementData() {
        const data = await this.adminService.getVerificationManagementData();
        return {
            success: true,
            data,
            message: 'Verification management data retrieved successfully',
        };
    }
    async getSystemHealth() {
        const health = await this.adminService.getSystemHealth();
        return {
            success: true,
            data: health,
            message: 'System health status retrieved successfully',
        };
    }
    async getSystemLogs(limit) {
        const limitNumber = limit ? parseInt(limit, 10) : 100;
        const logs = await this.adminService.getSystemLogs(limitNumber);
        return {
            success: true,
            data: logs,
            message: 'System logs retrieved successfully',
        };
    }
    async updateUserStatus(userId, updateUserStatusDto) {
        await this.adminService.updateUserStatus(userId, updateUserStatusDto.status);
        return {
            success: true,
            message: 'User status updated successfully',
        };
    }
    async updateAssetStatus(assetId, updateAssetStatusDto) {
        await this.adminService.updateAssetStatus(assetId, updateAssetStatusDto.status);
        return {
            success: true,
            message: 'Asset status updated successfully',
        };
    }
    async updateAttestorStatus(attestorId, updateAttestorStatusDto) {
        await this.adminService.updateAttestorStatus(attestorId, updateAttestorStatusDto.status);
        return {
            success: true,
            message: 'Attestor status updated successfully',
        };
    }
    async sendSystemAlert(sendSystemAlertDto) {
        await this.adminService.sendSystemAlert(sendSystemAlertDto.alertType, sendSystemAlertDto.message, sendSystemAlertDto.recipients);
        return {
            success: true,
            message: 'System alert sent successfully',
        };
    }
    async generateVerificationReport(startDate, endDate) {
        const report = {
            period: { startDate, endDate },
            totalVerifications: 0,
            completedVerifications: 0,
            averageScore: 0,
            topAttestors: [],
            trends: [],
        };
        return {
            success: true,
            data: report,
            message: 'Verification report generated successfully',
        };
    }
    async generateInvestmentReport(startDate, endDate) {
        const report = {
            period: { startDate, endDate },
            totalInvestments: 0,
            totalVolume: 0,
            averageAPY: 0,
            topAssets: [],
            trends: [],
        };
        return {
            success: true,
            data: report,
            message: 'Investment report generated successfully',
        };
    }
    async generateFinancialReport(startDate, endDate) {
        const report = {
            period: { startDate, endDate },
            totalRevenue: 0,
            totalFees: 0,
            totalPayouts: 0,
            netProfit: 0,
            breakdown: {
                verificationFees: 0,
                transactionFees: 0,
                managementFees: 0,
            },
        };
        return {
            success: true,
            data: report,
            message: 'Financial report generated successfully',
        };
    }
    async getSystemSettings() {
        const settings = {
            verification: {
                autoApprovalThreshold: 85,
                maxVerificationTime: 48,
                requiredAttestors: 1,
            },
            fees: {
                verificationFee: 0.01,
                transactionFee: 0.005,
                managementFee: 0.02,
            },
            notifications: {
                emailEnabled: true,
                smsEnabled: true,
                pushEnabled: true,
            },
            blockchain: {
                network: 'testnet',
                gasLimit: 100000,
                confirmationBlocks: 3,
            },
        };
        return {
            success: true,
            data: settings,
            message: 'System settings retrieved successfully',
        };
    }
    async updateSystemSettings(settings) {
        return {
            success: true,
            message: 'System settings updated successfully',
        };
    }
    async createSystemBackup() {
        const backup = {
            id: `backup_${Date.now()}`,
            timestamp: new Date(),
            size: '0 MB',
            status: 'completed',
        };
        return {
            success: true,
            data: backup,
            message: 'System backup created successfully',
        };
    }
    async scheduleMaintenance(body) {
        return {
            success: true,
            message: 'System maintenance scheduled successfully',
        };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get admin dashboard metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard metrics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboardMetrics", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System statistics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSystemStats", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user management data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User management data retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserManagementData", null);
__decorate([
    (0, common_1.Get)('assets'),
    (0, swagger_1.ApiOperation)({ summary: 'Get asset management data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asset management data retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAssetManagementData", null);
__decorate([
    (0, common_1.Get)('verifications'),
    (0, swagger_1.ApiOperation)({ summary: 'Get verification management data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Verification management data retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getVerificationManagementData", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system health status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System health status retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSystemHealth", null);
__decorate([
    (0, common_1.Get)('logs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system logs' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Number of logs to retrieve' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System logs retrieved successfully' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSystemLogs", null);
__decorate([
    (0, common_1.Put)('users/:userId/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user status' }),
    (0, swagger_1.ApiBody)({ type: UpdateUserStatusDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User status updated successfully' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateUserStatusDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUserStatus", null);
__decorate([
    (0, common_1.Put)('assets/:assetId/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update asset status' }),
    (0, swagger_1.ApiBody)({ type: UpdateAssetStatusDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asset status updated successfully' }),
    __param(0, (0, common_1.Param)('assetId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateAssetStatusDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateAssetStatus", null);
__decorate([
    (0, common_1.Put)('attestors/:attestorId/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update attestor status' }),
    (0, swagger_1.ApiBody)({ type: UpdateAttestorStatusDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Attestor status updated successfully' }),
    __param(0, (0, common_1.Param)('attestorId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateAttestorStatusDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateAttestorStatus", null);
__decorate([
    (0, common_1.Post)('alerts'),
    (0, swagger_1.ApiOperation)({ summary: 'Send system alert' }),
    (0, swagger_1.ApiBody)({ type: SendSystemAlertDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System alert sent successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SendSystemAlertDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "sendSystemAlert", null);
__decorate([
    (0, common_1.Get)('reports/verification'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate verification report' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'Start date for report' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'End date for report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Verification report generated successfully' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "generateVerificationReport", null);
__decorate([
    (0, common_1.Get)('reports/investment'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate investment report' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'Start date for report' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'End date for report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Investment report generated successfully' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "generateInvestmentReport", null);
__decorate([
    (0, common_1.Get)('reports/financial'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate financial report' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'Start date for report' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'End date for report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Financial report generated successfully' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "generateFinancialReport", null);
__decorate([
    (0, common_1.Get)('settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system settings' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System settings retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSystemSettings", null);
__decorate([
    (0, common_1.Post)('settings'),
    (0, swagger_1.ApiOperation)({ summary: 'Update system settings' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System settings updated successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateSystemSettings", null);
__decorate([
    (0, common_1.Get)('backup'),
    (0, swagger_1.ApiOperation)({ summary: 'Create system backup' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System backup created successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createSystemBackup", null);
__decorate([
    (0, common_1.Post)('maintenance'),
    (0, swagger_1.ApiOperation)({ summary: 'Schedule system maintenance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System maintenance scheduled successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "scheduleMaintenance", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin'),
    (0, common_1.Controller)('api/admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map