import { NotificationsService, NotificationTemplate } from './notifications.service';
export declare class SendNotificationDto {
    to: string | string[];
    type: 'email' | 'sms' | 'push';
    templateId?: string;
    subject?: string;
    message: string;
    variables?: {
        [key: string]: any;
    };
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    scheduledAt?: Date;
}
export declare class CreateTemplateDto {
    id: string;
    name: string;
    type: 'email' | 'sms' | 'push';
    subject?: string;
    body: string;
    variables: string[];
}
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    sendNotification(sendNotificationDto: SendNotificationDto): Promise<{
        success: boolean;
        data: import("./notifications.service").NotificationResult;
        message: string;
    }>;
    sendAssetSubmissionNotification(body: {
        ownerEmail: string;
        assetData: any;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    sendVerificationAssignmentNotification(body: {
        attestorEmail: string;
        verificationData: any;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    sendInvestmentConfirmationNotification(body: {
        investorEmail: string;
        investmentData: any;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    sendSystemAlert(body: {
        alertType: string;
        message: string;
        recipients: string[];
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getTemplates(): Promise<{
        success: boolean;
        data: NotificationTemplate[];
        message: string;
    }>;
    getTemplate(templateId: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: NotificationTemplate;
        message: string;
    }>;
    createTemplate(createTemplateDto: CreateTemplateDto): Promise<{
        success: boolean;
        message: string;
    }>;
    updateTemplate(templateId: string, updates: Partial<CreateTemplateDto>): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteTemplate(templateId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    testNotification(type: 'email' | 'sms' | 'push', to: string): Promise<{
        success: boolean;
        data: import("./notifications.service").NotificationResult;
        message: string;
    }>;
}
