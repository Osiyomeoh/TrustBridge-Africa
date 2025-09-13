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
exports.NotificationsController = exports.CreateTemplateDto = exports.SendNotificationDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notifications_service_1 = require("./notifications.service");
class SendNotificationDto {
}
exports.SendNotificationDto = SendNotificationDto;
class CreateTemplateDto {
}
exports.CreateTemplateDto = CreateTemplateDto;
let NotificationsController = class NotificationsController {
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    async sendNotification(sendNotificationDto) {
        const result = await this.notificationsService.sendNotification(sendNotificationDto);
        return {
            success: true,
            data: result,
            message: 'Notification sent successfully',
        };
    }
    async sendAssetSubmissionNotification(body) {
        await this.notificationsService.sendAssetSubmissionNotification(body.ownerEmail, body.assetData);
        return {
            success: true,
            message: 'Asset submission notification sent',
        };
    }
    async sendVerificationAssignmentNotification(body) {
        await this.notificationsService.sendVerificationAssignmentNotification(body.attestorEmail, body.verificationData);
        return {
            success: true,
            message: 'Verification assignment notification sent',
        };
    }
    async sendInvestmentConfirmationNotification(body) {
        await this.notificationsService.sendInvestmentConfirmationNotification(body.investorEmail, body.investmentData);
        return {
            success: true,
            message: 'Investment confirmation notification sent',
        };
    }
    async sendSystemAlert(body) {
        await this.notificationsService.sendSystemAlert(body.alertType, body.message, body.recipients);
        return {
            success: true,
            message: 'System alert notification sent',
        };
    }
    async getTemplates() {
        const templates = this.notificationsService.getTemplates();
        return {
            success: true,
            data: templates,
            message: 'Templates retrieved successfully',
        };
    }
    async getTemplate(templateId) {
        const template = this.notificationsService.getTemplate(templateId);
        if (!template) {
            return {
                success: false,
                message: 'Template not found',
            };
        }
        return {
            success: true,
            data: template,
            message: 'Template retrieved successfully',
        };
    }
    async createTemplate(createTemplateDto) {
        this.notificationsService.addTemplate(createTemplateDto);
        return {
            success: true,
            message: 'Template created successfully',
        };
    }
    async updateTemplate(templateId, updates) {
        this.notificationsService.updateTemplate(templateId, updates);
        return {
            success: true,
            message: 'Template updated successfully',
        };
    }
    async deleteTemplate(templateId) {
        this.notificationsService.deleteTemplate(templateId);
        return {
            success: true,
            message: 'Template deleted successfully',
        };
    }
    async testNotification(type, to) {
        const testMessage = `Test ${type} notification from TrustBridge - ${new Date().toISOString()}`;
        const result = await this.notificationsService.sendNotification({
            to,
            type,
            message: testMessage,
            subject: type === 'email' ? 'Test Email from TrustBridge' : undefined,
        });
        return {
            success: true,
            data: result,
            message: `Test ${type} notification sent`,
        };
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Post)('send'),
    (0, swagger_1.ApiOperation)({ summary: 'Send notification' }),
    (0, swagger_1.ApiBody)({ type: SendNotificationDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification sent successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid notification request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SendNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendNotification", null);
__decorate([
    (0, common_1.Post)('send-asset-submission'),
    (0, swagger_1.ApiOperation)({ summary: 'Send asset submission notification' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asset submission notification sent' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendAssetSubmissionNotification", null);
__decorate([
    (0, common_1.Post)('send-verification-assignment'),
    (0, swagger_1.ApiOperation)({ summary: 'Send verification assignment notification' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Verification assignment notification sent' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendVerificationAssignmentNotification", null);
__decorate([
    (0, common_1.Post)('send-investment-confirmation'),
    (0, swagger_1.ApiOperation)({ summary: 'Send investment confirmation notification' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Investment confirmation notification sent' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendInvestmentConfirmationNotification", null);
__decorate([
    (0, common_1.Post)('send-system-alert'),
    (0, swagger_1.ApiOperation)({ summary: 'Send system alert notification' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System alert notification sent' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendSystemAlert", null);
__decorate([
    (0, common_1.Get)('templates'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all notification templates' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Templates retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Get)('templates/:templateId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get notification template by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Template retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Template not found' }),
    __param(0, (0, common_1.Param)('templateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getTemplate", null);
__decorate([
    (0, common_1.Post)('templates'),
    (0, swagger_1.ApiOperation)({ summary: 'Create notification template' }),
    (0, swagger_1.ApiBody)({ type: CreateTemplateDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Template created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateTemplateDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "createTemplate", null);
__decorate([
    (0, common_1.Post)('templates/:templateId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update notification template' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Template updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Template not found' }),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "updateTemplate", null);
__decorate([
    (0, common_1.Delete)('templates/:templateId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete notification template' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Template deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Template not found' }),
    __param(0, (0, common_1.Param)('templateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "deleteTemplate", null);
__decorate([
    (0, common_1.Get)('test/:type'),
    (0, swagger_1.ApiOperation)({ summary: 'Test notification service' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Test notification sent' }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "testNotification", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('Notifications'),
    (0, common_1.Controller)('api/notifications'),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map