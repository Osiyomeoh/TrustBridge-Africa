import { ConfigService } from '@nestjs/config';
export declare class GmailService {
    private configService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService);
    private initializeTransporter;
    sendVerificationEmail(to: string, verificationCode: string, userName: string): Promise<boolean>;
    sendEmail(to: string | string[], subject: string, htmlContent: string, textContent?: string): Promise<boolean>;
    private getVerificationEmailTemplate;
    private getVerificationEmailText;
    private stripHtml;
}
