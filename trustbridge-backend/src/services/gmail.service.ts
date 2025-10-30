import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class GmailService {
  private readonly logger = new Logger(GmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const gmailUser = this.configService.get<string>('GMAIL_USER');
    const gmailPassword = this.configService.get<string>('GMAIL_APP_PASSWORD');
    
    // Debug: Log what credentials are being loaded
    this.logger.log('Gmail credentials loaded:', {
      user: gmailUser ? `${gmailUser.substring(0, 3)}***@gmail.com` : 'NOT_SET',
      passwordLength: gmailPassword ? gmailPassword.length : 0,
      hasUser: !!gmailUser,
      hasPassword: !!gmailPassword
    });
    
    // Check if Gmail credentials are configured
    if (!gmailUser || !gmailPassword || gmailUser === 'your-gmail@gmail.com' || gmailPassword === 'your-16-character-app-password') {
      this.logger.warn('Gmail credentials not configured, using console logging for email verification');
      this.transporter = null;
      return;
    }

    const gmailConfig = {
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPassword, // Use App Password, not regular password
      },
      // Add timeout settings to prevent hanging (works locally but may timeout on cloud platforms)
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
    };

    this.transporter = nodemailer.createTransport(gmailConfig);

    // Skip blocking verification on startup - it causes timeouts on cloud platforms like Render
    // Verification happens automatically on first email send
    this.logger.log('Gmail transporter initialized (connection will be verified on first send)');
  }

  async sendVerificationEmail(to: string, verificationCode: string, userName: string): Promise<boolean> {
    const verificationUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001')}/auth/verify-email?code=${verificationCode}`;
    
    try {
      // If Gmail transporter is not available, log to console
      if (!this.transporter) {
        this.logger.warn('Gmail transporter not available, logging verification code to console:');
        this.logger.warn('='.repeat(80));
        this.logger.warn(`VERIFICATION EMAIL FOR: ${to}`);
        this.logger.warn(`USER: ${userName}`);
        this.logger.warn(`VERIFICATION CODE: ${verificationCode}`);
        this.logger.warn(`VERIFICATION URL: ${verificationUrl}`);
        this.logger.warn('='.repeat(80));
        return true; // Return true so the flow continues
      }
      
      const mailOptions = {
        from: {
          name: 'TrustBridge',
          address: this.configService.get<string>('GMAIL_USER', 'noreply@trustbridge.africa'),
        },
        to: to,
        subject: 'Verify Your TrustBridge Account - 6-Digit Code',
        html: this.getVerificationEmailTemplate(userName, verificationUrl, verificationCode),
        text: this.getVerificationEmailText(userName, verificationUrl, verificationCode),
      };

      // Add timeout wrapper to prevent hanging (especially on cloud platforms)
      const sendMailPromise = this.transporter.sendMail(mailOptions);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email sending timeout after 15 seconds - likely network/firewall issue on hosting platform')), 15000)
      );

      const result = await Promise.race([sendMailPromise, timeoutPromise]);
      this.logger.log(`Verification email sent to ${to}: ${(result as any).messageId}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorCode = (error as any)?.code || 'UNKNOWN';
      
      this.logger.error(`Failed to send verification email to ${to}:`, errorMessage);
      
      // Provide helpful context for common issues
      if (errorMessage.includes('timeout') || errorCode === 'ETIMEDOUT') {
        this.logger.warn('⚠️  Gmail SMTP timeout detected - this is common on cloud platforms (Render, Heroku, etc.)');
        this.logger.warn('   The connection works locally but may be blocked by platform firewalls.');
        this.logger.warn('   The verification code will be logged below and the user flow will continue.');
      } else if (errorCode === 'ECONNREFUSED' || errorCode === 'ENOTFOUND') {
        this.logger.warn('⚠️  Gmail SMTP connection refused - check network/firewall settings');
      }
      
      // Fallback: Log to console if email fails
      this.logger.warn('FALLBACK: Logging verification code to console due to email failure:');
      this.logger.warn('='.repeat(80));
      this.logger.warn(`VERIFICATION EMAIL FOR: ${to}`);
      this.logger.warn(`USER: ${userName}`);
      this.logger.warn(`VERIFICATION CODE: ${verificationCode}`);
      this.logger.warn(`VERIFICATION URL: ${verificationUrl}`);
      this.logger.warn('='.repeat(80));
      
      return true; // Return true so the flow continues
    }
  }

  async sendEmail(to: string | string[], subject: string, htmlContent: string, textContent?: string): Promise<boolean> {
    try {
      const recipients = Array.isArray(to) ? to : [to];
      
      const mailOptions = {
        from: {
          name: 'TrustBridge',
          address: this.configService.get<string>('GMAIL_USER', 'noreply@trustbridge.africa'),
        },
        to: recipients,
        subject: subject,
        html: htmlContent,
        text: textContent || this.stripHtml(htmlContent),
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${recipients.join(', ')}: ${result.messageId}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      return false;
    }
  }

  private getVerificationEmailTemplate(userName: string, verificationUrl: string, code: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Verify Your TrustBridge Account</title>
        <style>
          /* Reset styles */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
          }
          
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
            opacity: 0.3;
          }
          
          .logo-container {
            position: relative;
            z-index: 1;
          }
          
          .logo {
            width: 80px;
            height: 80px;
            background: #ffffff;
            border-radius: 20px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          }
          
          .logo-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #059669, #047857);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: white;
            font-weight: bold;
          }
          
          .brand-name {
            color: #ffffff;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
          }
          
          .tagline {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
            font-weight: 400;
            letter-spacing: 0.5px;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 20px;
            line-height: 1.3;
          }
          
          .message {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 30px;
            line-height: 1.6;
          }
          
          .verification-section {
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            border: 2px solid #e2e8f0;
            border-radius: 16px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
          }
          
          .verification-label {
            font-size: 18px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 20px;
          }
          
          .code {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: #ffffff;
            padding: 24px 32px;
            border-radius: 12px;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
            font-size: 36px;
            font-weight: 700;
            letter-spacing: 8px;
            margin: 20px 0;
            text-align: center;
            box-shadow: 0 8px 32px rgba(5, 150, 105, 0.3);
            display: inline-block;
            min-width: 200px;
          }
          
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: #ffffff;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            box-shadow: 0 4px 16px rgba(5, 150, 105, 0.3);
            transition: all 0.3s ease;
          }
          
          .button:hover {
            background: linear-gradient(135deg, #047857 0%, #065f46 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(5, 150, 105, 0.4);
          }
          
          .warning {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 2px solid #f59e0b;
            color: #92400e;
            padding: 20px;
            border-radius: 12px;
            margin: 30px 0;
            font-size: 14px;
            line-height: 1.5;
          }
          
          .warning-icon {
            font-size: 18px;
            margin-right: 8px;
          }
          
          .features {
            margin: 30px 0;
          }
          
          .features-title {
            font-size: 18px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 16px;
          }
          
          .features-list {
            list-style: none;
            padding: 0;
          }
          
          .features-list li {
            padding: 8px 0;
            color: #4a5568;
            font-size: 15px;
            display: flex;
            align-items: center;
          }
          
          .features-list li::before {
            content: '✓';
            background: #059669;
            color: white;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            margin-right: 12px;
            flex-shrink: 0;
          }
          
          .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          
          .footer-text {
            color: #6b7280;
            font-size: 14px;
            line-height: 1.5;
            margin-bottom: 8px;
          }
          
          .footer-link {
            color: #059669;
            text-decoration: none;
            font-weight: 500;
          }
          
          .footer-link:hover {
            text-decoration: underline;
          }
          
          .copyright {
            color: #9ca3af;
            font-size: 12px;
            margin-top: 16px;
          }
          
          /* Responsive styles */
          @media (max-width: 600px) {
            body {
              padding: 10px;
            }
            
            .email-container {
              border-radius: 12px;
            }
            
            .header {
              padding: 30px 20px;
            }
            
            .brand-name {
              font-size: 28px;
            }
            
            .content {
              padding: 30px 20px;
            }
            
            .greeting {
              font-size: 22px;
            }
            
            .code {
              font-size: 28px;
              letter-spacing: 6px;
              padding: 20px 24px;
            }
            
            .verification-section {
              padding: 20px;
            }
          }
          
          @media (max-width: 480px) {
            .code {
              font-size: 24px;
              letter-spacing: 4px;
              padding: 16px 20px;
            }
            
            .button {
              padding: 14px 24px;
              font-size: 15px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo-container">
              <div class="logo">
                <div class="logo-icon">🌍</div>
              </div>
              <div class="brand-name">TrustBridge</div>
              <div class="tagline">Universal Asset Protocol for Africa</div>
            </div>
          </div>
          
          <div class="content">
            <div class="greeting">Welcome to TrustBridge, ${userName}!</div>
            
            <div class="message">
              Thank you for joining TrustBridge, the revolutionary platform that's transforming how African assets are tokenized and traded. We're excited to have you on this journey toward financial inclusion and prosperity.
            </div>
            
            <div class="verification-section">
              <div class="verification-label">Your 6-Digit Verification Code</div>
              <div class="code">${code}</div>
              <div style="margin-top: 20px;">
                <a href="${verificationUrl}" class="button">Verify My Account</a>
              </div>
            </div>
            
            <div class="warning">
              <span class="warning-icon">⏰</span>
              <strong>Security Notice:</strong> This verification code expires in 10 minutes for your security. If you didn't request this code, please ignore this email.
            </div>
            
            <div class="features">
              <div class="features-title">What you can do with TrustBridge:</div>
              <ul class="features-list">
                <li>Browse and invest in verified African assets</li>
                <li>Track your portfolio performance in real-time</li>
                <li>Participate in asset tokenization opportunities</li>
                <li>Access advanced analytics and market insights</li>
                <li>Connect with a community of African investors</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-text">
              This email was sent by <a href="https://trustbridge.africa" class="footer-link">TrustBridge</a>
            </div>
            <div class="footer-text">
              If you have any questions, please contact our support team.
            </div>
            <div class="copyright">
              © 2024 TrustBridge. All rights reserved. | Building Africa's Financial Future
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getVerificationEmailText(userName: string, verificationUrl: string, code: string): string {
    return `
Welcome to TrustBridge, ${userName}!

Thank you for joining TrustBridge, the revolutionary platform that's transforming how African assets are tokenized and traded.

To complete your account setup, please use this 6-digit verification code:

${code}

Or visit this link: ${verificationUrl}

What happens next?
- Access your personalized dashboard
- Complete KYC verification for full platform access  
- Start tokenizing African assets
- Connect with investors and asset owners

This verification code will expire in 10 minutes for security reasons.

If you didn't create a TrustBridge account, please ignore this email.

TrustBridge Team
Building the future of African finance
    `;
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
}
