import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GmailService } from '../services/gmail.service';
export interface NotificationTemplate {
    id: string;
    name: string;
    type: 'email' | 'sms' | 'push';
    subject?: string;
    body: string;
    variables: string[];
}
export interface NotificationRequest {
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
export interface NotificationResult {
    id: string;
    success: boolean;
    recipients: string[];
    status: 'sent' | 'failed' | 'pending' | 'scheduled';
    provider: string;
    timestamp: Date;
    error?: string;
    cost?: number;
}
export declare class NotificationsService {
    private configService;
    private eventEmitter;
    private gmailService;
    private readonly logger;
    private readonly templates;
    private readonly notificationQueue;
    private readonly smsConfig;
    private readonly emailConfig;
    constructor(configService: ConfigService, eventEmitter: EventEmitter2, gmailService: GmailService);
    private initializeTemplates;
    sendNotification(request: NotificationRequest): Promise<NotificationResult>;
    private sendEmail;
    private sendEmailViaSendGrid;
    private sendEmailViaGmail;
    private sendEmailViaSES;
    private sendEmailConsole;
    private sendSMS;
    private sendSMSViaTwilio;
    private sendSMSViaAfricaTalking;
    private sendSMSConsole;
    private sendPushNotification;
    private processTemplate;
    private scheduleNotification;
    private startNotificationProcessor;
    private processNotificationQueue;
    private generateNotificationId;
    sendAssetSubmissionNotification(ownerEmail: string, assetData: any): Promise<void>;
    sendVerificationAssignmentNotification(attestorEmail: string, verificationData: any): Promise<void>;
    sendInvestmentConfirmationNotification(investorEmail: string, investmentData: any): Promise<void>;
    sendSystemAlert(alertType: string, message: string, recipients: string[]): Promise<void>;
    getTemplates(): NotificationTemplate[];
    getTemplate(templateId: string): NotificationTemplate | undefined;
    addTemplate(template: NotificationTemplate): void;
    updateTemplate(templateId: string, updates: Partial<NotificationTemplate>): void;
    deleteTemplate(templateId: string): void;
}
