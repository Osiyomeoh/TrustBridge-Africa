import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument, EmailVerificationStatus } from '../schemas/user.schema';
import { ethers } from 'ethers';
import * as crypto from 'crypto';
import { GmailService } from '../services/gmail.service';

export interface WalletSignature {
  address: string;
  signature: string;
  message: string;
  timestamp: number;
}

export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  walletAddress: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwtSecret = this.configService.get<string>('JWT_SECRET', 'trustbridge-secret');
  private readonly jwtExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '24h');
  private readonly refreshTokenExpiresIn = this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN', '7d');

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private gmailService: GmailService,
  ) {}

  async authenticateWithWallet(walletSignature: WalletSignature): Promise<AuthResult> {
    try {
      // Verify signature
      const isValidSignature = await this.verifyWalletSignature(walletSignature);
      if (!isValidSignature) {
        throw new UnauthorizedException('Invalid wallet signature');
      }

      // Check if user exists (case-insensitive)
      let user = await this.userModel.findOne({ 
        walletAddress: { $regex: new RegExp(`^${walletSignature.address}$`, 'i') } 
      });
      
      if (!user) {
        // Create new user
        user = await this.createUserFromWallet(walletSignature.address) as any;
      }

      // Update last login
      user.lastLoginAt = new Date();
      await user.save();

      // Generate tokens
      const tokens = await this.generateTokens(user);

      return {
        user,
        ...tokens,
      };
    } catch (error) {
      this.logger.error('Wallet authentication failed:', error);
      throw error;
    }
  }

  async authenticateWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Update last login
      user.lastLoginAt = new Date();
      await user.save();

      // Generate tokens
      const tokens = await this.generateTokens(user);

      return {
        user,
        ...tokens,
      };
    } catch (error) {
      this.logger.error('Email authentication failed:', error);
      throw error;
    }
  }

  async completeProfile(walletSignature: WalletSignature, email: string, name: string, userData: any): Promise<AuthResult> {
    try {
      // Verify wallet signature first
      const isValidSignature = await this.verifyWalletSignature(walletSignature);
      if (!isValidSignature) {
        throw new UnauthorizedException('Invalid wallet signature');
      }

      // Check if user already exists by wallet
      let user = await this.userModel.findOne({ walletAddress: walletSignature.address });
      
      if (!user) {
        // Create new user with wallet
        user = await this.createUserFromWallet(walletSignature.address) as any;
      }

      // Check if email is already taken by another user
      const existingEmailUser = await this.userModel.findOne({ 
        email, 
        _id: { $ne: user._id } 
      });
      if (existingEmailUser) {
        throw new BadRequestException('Email already registered to another account');
      }

      // Update user profile
      user.email = email;
      user.name = name;
      user.phone = userData.phone;
      user.country = userData.country;
      user.emailVerificationStatus = EmailVerificationStatus.PENDING;
      
      // Generate 6-digit verification code
      const verificationCode = this.generateVerificationCode();
      const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      user.emailVerificationToken = verificationCode;
      user.emailVerificationExpires = verificationExpires;

      await user.save();

      // Send verification email
      try {
        const emailSent = await this.gmailService.sendVerificationEmail(email, verificationCode, name);
        if (emailSent) {
          this.logger.log(`Verification email sent successfully to ${email}`);
        } else {
          this.logger.warn(`Failed to send verification email to ${email}`);
        }
      } catch (error) {
        this.logger.error(`Error sending verification email to ${email}:`, error);
        // Don't fail the profile completion if email sending fails
      }

      // Also log the code for development/testing
      this.logger.log(`Email verification code for ${email}: ${verificationCode}`);

      // Generate tokens
      const tokens = await this.generateTokens(user);

      return {
        user,
        ...tokens,
      };
    } catch (error) {
      this.logger.error('Profile completion failed:', error);
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.userModel.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: new Date() },
      });

      if (!user) {
        throw new BadRequestException('Invalid or expired verification code');
      }

      // Update user verification status
      user.emailVerificationStatus = EmailVerificationStatus.VERIFIED;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      this.logger.log(`Email verified for user ${user.email}`);

      return {
        success: true,
        message: 'Email verified successfully',
      };
    } catch (error) {
      this.logger.error('Email verification failed:', error);
      throw error;
    }
  }

  async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.userModel.findOne({ email });
      
      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (user.emailVerificationStatus === EmailVerificationStatus.VERIFIED) {
        throw new BadRequestException('Email is already verified');
      }

      // Generate new 6-digit verification code
      const verificationCode = this.generateVerificationCode();
      const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      user.emailVerificationToken = verificationCode;
      user.emailVerificationExpires = verificationExpires;
      await user.save();

      // Send verification email
      try {
        const emailSent = await this.gmailService.sendVerificationEmail(email, verificationCode, user.name || 'User');
        if (emailSent) {
          this.logger.log(`Verification email resent successfully to ${email}`);
        } else {
          this.logger.warn(`Failed to resend verification email to ${email}`);
        }
      } catch (error) {
        this.logger.error(`Error resending verification email to ${email}:`, error);
        throw new BadRequestException('Failed to send verification email');
      }

      // Also log the code for development/testing
      this.logger.log(`New verification code for ${email}: ${verificationCode}`);

      return {
        success: true,
        message: 'Verification email sent successfully',
      };
    } catch (error) {
      this.logger.error('Resend verification failed:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: this.jwtSecret });
      const user = await this.userModel.findById(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const accessToken = this.jwtService.sign(
        { sub: user._id, email: user.email, role: user.role, walletAddress: user.walletAddress },
        { secret: this.jwtSecret, expiresIn: this.jwtExpiresIn }
      );

      return {
        accessToken,
        expiresIn: this.parseExpiresIn(this.jwtExpiresIn),
      };
    } catch (error) {
      this.logger.error('Token refresh failed:', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    try {
      // In a real implementation, you would blacklist the token
      // For now, we'll just log the logout
      this.logger.log(`User ${userId} logged out`);
    } catch (error) {
      this.logger.error('Logout failed:', error);
      throw error;
    }
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Verify old password
      const isOldPasswordValid = await this.verifyPassword(oldPassword, user.password);
      if (!isOldPasswordValid) {
        throw new BadRequestException('Invalid old password');
      }

      // Hash new password
      const hashedNewPassword = await this.hashPassword(newPassword);
      
      // Update password
      user.password = hashedNewPassword;
      await user.save();

      this.logger.log(`Password changed for user ${userId}`);
    } catch (error) {
      this.logger.error('Password change failed:', error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        // Don't reveal if user exists
        return;
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetTokenExpires;
      await user.save();

      // TODO: Send reset email
      this.logger.log(`Password reset token generated for user ${email}: ${resetToken}`);
    } catch (error) {
      this.logger.error('Password reset failed:', error);
      throw error;
    }
  }

  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    try {
      const user = await this.userModel.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!user) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);
      
      // Update password and clear reset token
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      this.logger.log(`Password reset completed for user ${user.email}`);
    } catch (error) {
      this.logger.error('Password reset confirmation failed:', error);
      throw error;
    }
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const payload = this.jwtService.verify(token, { secret: this.jwtSecret });
      return payload as JwtPayload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getUserFromToken(token: string): Promise<User> {
    try {
      const payload = await this.verifyToken(token);
      const user = await this.userModel.findById(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (error) {
      this.logger.error('Get user from token failed:', error);
      throw error;
    }
  }

  async checkWalletUser(walletAddress: string): Promise<{ success: boolean; data?: User; message: string }> {
    try {
      // Use case-insensitive regex query to handle different address formats
      const user = await this.userModel.findOne({ 
        walletAddress: { $regex: new RegExp(`^${walletAddress}$`, 'i') } 
      }).exec();
      
      if (user) {
        return {
          success: true,
          data: user,
          message: 'User found with wallet address'
        };
      } else {
        return {
          success: false,
          message: 'No user found with this wallet address'
        };
      }
    } catch (error) {
      this.logger.error('Error checking wallet user:', error);
      return {
        success: false,
        message: 'Error checking wallet user'
      };
    }
  }

  // Private helper methods
  private async verifyWalletSignature(walletSignature: WalletSignature): Promise<boolean> {
    try {
      // Use the actual message that was signed (from the request)
      const message = walletSignature.message;
      
      // Verify the signature
      const recoveredAddress = ethers.verifyMessage(message, walletSignature.signature);
      
      return recoveredAddress.toLowerCase() === walletSignature.address.toLowerCase();
    } catch (error) {
      this.logger.error('Wallet signature verification failed:', error);
      return false;
    }
  }

  private async createUserFromWallet(walletAddress: string): Promise<User> {
    const user = new this.userModel({
      walletAddress: walletAddress, // Store in original case
      role: 'INVESTOR',
      isActive: true,
      kycStatus: 'PENDING',
    });

    await user.save();
    return user;
  }

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const payload: JwtPayload = {
      sub: (user as any)._id.toString(),
      email: user.email,
      role: user.role,
      walletAddress: user.walletAddress,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.jwtSecret,
      expiresIn: this.jwtExpiresIn,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.jwtSecret,
      expiresIn: this.refreshTokenExpiresIn,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiresIn(this.jwtExpiresIn),
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return crypto.pbkdf2Sync(password, this.jwtSecret, saltRounds, 64, 'sha512').toString('hex');
  }

  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const hash = crypto.pbkdf2Sync(password, this.jwtSecret, 12, 64, 'sha512').toString('hex');
    return hash === hashedPassword;
  }

  private parseExpiresIn(expiresIn: string): number {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));
    
    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000; // 24 hours default
    }
  }

  // Role-based access control
  async hasRole(userId: string, requiredRole: string): Promise<boolean> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        return false;
      }

      const roleHierarchy = {
        'INVESTOR': 1,
        'ASSET_OWNER': 2,
        'VERIFIER': 3,
        'ADMIN': 4,
      };

      const userRoleLevel = roleHierarchy[user.role] || 0;
      const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

      return userRoleLevel >= requiredRoleLevel;
    } catch (error) {
      this.logger.error('Role check failed:', error);
      return false;
    }
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        return false;
      }

      const permissions = {
        'INVESTOR': ['read:own_assets', 'create:assets', 'read:investments'],
        'ASSET_OWNER': ['read:own_assets', 'create:assets', 'read:investments', 'manage:own_assets'],
        'VERIFIER': ['read:own_assets', 'create:assets', 'read:investments', 'verify:assets'],
        'ADMIN': ['read:all_assets', 'create:assets', 'read:investments', 'verify:assets', 'manage:users'],
      };

      const userPermissions = permissions[user.role] || [];
      return userPermissions.includes('*') || userPermissions.includes(permission);
    } catch (error) {
      this.logger.error('Permission check failed:', error);
      return false;
    }
  }

  private generateVerificationCode(): string {
    // Generate a 6-digit verification code
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Persona KYC Integration
  async processPersonaWebhook(webhookData: any): Promise<void> {
    try {
      this.logger.log('Processing Persona webhook:', webhookData);
      
      // Verify webhook signature if configured
      const webhookSecret = this.configService.get<string>('PERSONA_WEBHOOK_SECRET');
      if (webhookSecret) {
        // TODO: Add webhook signature verification
        this.logger.log('Webhook signature verification not implemented yet');
      }
      
      const { data } = webhookData;
      if (!data || !data.attributes) {
        throw new Error('Invalid webhook data structure');
      }

      const { inquiry_id, status, reference_id } = data.attributes;
      
      if (!inquiry_id || !status) {
        throw new Error('Missing required webhook fields');
      }

      // Find user by reference_id (wallet address) or inquiry_id
      let user;
      if (reference_id) {
        user = await this.userModel.findOne({ 
          walletAddress: { $regex: new RegExp(`^${reference_id}$`, 'i') } 
        });
      } else {
        user = await this.userModel.findOne({ kycInquiryId: inquiry_id });
      }

      if (!user) {
        this.logger.warn(`User not found for Persona webhook: inquiry_id=${inquiry_id}, reference_id=${reference_id}`);
        return;
      }

      // Map Persona status to our KYC status
      let kycStatus: string;
      switch (status.toLowerCase()) {
        case 'completed':
        case 'approved':
          kycStatus = 'approved';
          break;
        case 'failed':
        case 'rejected':
          kycStatus = 'rejected';
          break;
        case 'pending':
        case 'in_progress':
          kycStatus = 'pending';
          break;
        default:
          kycStatus = 'pending';
      }

      // Update user KYC status
      (user as any).kycStatus = kycStatus as any;
      (user as any).kycInquiryId = inquiry_id;
      (user as any).updatedAt = new Date();
      
      await user.save();

      this.logger.log(`KYC status updated for user ${user._id}: ${kycStatus}`);
      
      // Send notification to user
      await this.gmailService.sendEmail(
        user.profile?.email || '',
        'KYC Verification Update',
        `
          <h2>KYC Verification Update</h2>
          <p>Your identity verification status has been updated to: <strong>${kycStatus}</strong></p>
          <p>Inquiry ID: ${inquiry_id}</p>
          <p>Thank you for using TrustBridge!</p>
        `,
        `Your KYC verification status has been updated to: ${kycStatus}`
      );

    } catch (error) {
      this.logger.error('Persona webhook processing failed:', error);
      throw error;
    }
  }

  async updateKYCStatus(userId: string, inquiryId: string, status: string): Promise<void> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Map status to our KYC status
      let kycStatus: string;
      switch (status.toLowerCase()) {
        case 'approved':
        case 'completed':
          kycStatus = 'approved';
          break;
        case 'rejected':
        case 'failed':
          kycStatus = 'rejected';
          break;
        case 'pending':
        case 'in_progress':
          kycStatus = 'pending';
          break;
        default:
          kycStatus = 'pending';
      }

      (user as any).kycStatus = kycStatus as any;
      (user as any).kycInquiryId = inquiryId;
      (user as any).updatedAt = new Date();
      
      await user.save();

      this.logger.log(`KYC status manually updated for user ${userId}: ${kycStatus}`);
    } catch (error) {
      this.logger.error('Failed to update KYC status:', error);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<any> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      this.logger.error('Failed to get user by ID:', error);
      throw error;
    }
  }

  // Didit KYC Integration
  async processDiditWebhook(webhookData: any): Promise<void> {
    try {
      this.logger.log('Processing Didit webhook:', webhookData);
      
      const { session_id, status, vendor_data } = webhookData;
      
      if (!session_id || !status) {
        throw new Error('Missing required webhook fields');
      }

      // Parse vendor data to get wallet address
      let walletAddress: string | null = null;
      if (vendor_data) {
        try {
          const parsedVendorData = JSON.parse(vendor_data);
          walletAddress = parsedVendorData.walletAddress;
        } catch (err) {
          this.logger.warn('Failed to parse vendor data:', err);
        }
      }

      // Find user by wallet address
      let user;
      if (walletAddress) {
        user = await this.userModel.findOne({ 
          walletAddress: { $regex: new RegExp(`^${walletAddress}$`, 'i') } 
        });
      }

      if (!user) {
        this.logger.warn(`User not found for Didit webhook: sessionId=${session_id}, walletAddress=${walletAddress}`);
        return;
      }

      // Map Didit status to our KYC status
      let kycStatus: string;
      switch (status.toLowerCase()) {
        case 'completed':
        case 'verified':
        case 'approved':
          kycStatus = 'approved';
          break;
        case 'failed':
        case 'rejected':
        case 'declined':
          kycStatus = 'rejected';
          break;
        case 'pending':
        case 'in_progress':
        case 'processing':
          kycStatus = 'pending';
          break;
        default:
          kycStatus = 'pending';
      }

      // Update user KYC status
      (user as any).kycStatus = kycStatus as any;
      (user as any).kycInquiryId = session_id; // Using session_id as inquiry ID
      (user as any).updatedAt = new Date();
      
      await user.save();

      this.logger.log(`KYC status updated for user ${user._id}: ${kycStatus}`);
      
      // Send notification to user
      if (user.profile?.email) {
        await this.gmailService.sendEmail(
          user.profile.email,
          'KYC Verification Update',
          `
            <h2>KYC Verification Update</h2>
            <p>Your identity verification status has been updated to: <strong>${kycStatus}</strong></p>
            <p>Session ID: ${session_id}</p>
            <p>Thank you for using TrustBridge!</p>
          `,
          `Your KYC verification status has been updated to: ${kycStatus}`
        );
      }

    } catch (error) {
      this.logger.error('Didit webhook processing failed:', error);
      throw error;
    }
  }

  // Verify Didit webhook signature
  async verifyDiditWebhookSignature(req: any): Promise<boolean> {
    try {
      const webhookSecret = this.configService.get<string>('DIDIT_WEBHOOK_SECRET');
      if (!webhookSecret) {
        this.logger.warn('DIDIT_WEBHOOK_SECRET not configured, skipping signature verification');
        return true; // Allow if not configured
      }

      const signature = req.headers['x-didit-signature'];
      if (!signature) {
        this.logger.warn('Missing Didit webhook signature');
        return false;
      }

      // Get raw body for signature verification
      const rawBody = JSON.stringify(req.body);
      
      // Create HMAC signature
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      // Compare signatures
      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );

      if (!isValid) {
        this.logger.warn('Invalid Didit webhook signature');
      }

      return isValid;
    } catch (error) {
      this.logger.error('Didit webhook signature verification failed:', error);
      return false;
    }
  }

  // Didit API Proxy Methods
  async createDiditSession(vendorData?: string, workflowId?: string): Promise<any> {
    try {
      const apiKey = this.configService.get<string>('DIDIT_API_KEY');
      const defaultWorkflowId = this.configService.get<string>('DIDIT_WORKFLOW_ID');
      
      if (!apiKey) {
        throw new Error('DIDIT_API_KEY not configured');
      }

      // Determine the appropriate workflow ID
      let finalWorkflowId = workflowId || defaultWorkflowId || 'default';
      
      // If it's an attestor verification, use the attestor workflow
      if (vendorData) {
        try {
          const parsedVendorData = JSON.parse(vendorData);
          if (parsedVendorData.verificationType === 'attestor_enhanced') {
            const attestorWorkflowId = this.configService.get<string>('DIDIT_ATTESTOR_WORKFLOW_ID');
            if (attestorWorkflowId) {
              finalWorkflowId = attestorWorkflowId;
              this.logger.log(`Using attestor workflow: ${finalWorkflowId}`);
            } else {
              this.logger.warn('DIDIT_ATTESTOR_WORKFLOW_ID not configured, using default workflow');
            }
          }
        } catch (error) {
          this.logger.warn('Failed to parse vendor data for workflow selection:', error);
        }
      }

      const response = await fetch('https://verification.didit.me/v2/session/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          workflow_id: finalWorkflowId,
          vendor_data: vendorData || '',
          callback: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/api/auth/didit/callback`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Didit API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      this.logger.log(`Didit session created: ${data.session_id}`);
      
      return data;
    } catch (error) {
      this.logger.error('Failed to create Didit session:', error);
      throw error;
    }
  }

  async getDiditSessionStatus(sessionId: string): Promise<any> {
    try {
      const apiKey = this.configService.get<string>('DIDIT_API_KEY');
      
      if (!apiKey) {
        throw new Error('DIDIT_API_KEY not configured');
      }

      const response = await fetch(`https://verification.didit.me/v2/session/${sessionId}`, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Didit API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      this.logger.log(`Didit session status retrieved: ${sessionId} - ${data.status}`);
      
      return data;
    } catch (error) {
      this.logger.error('Failed to get Didit session status:', error);
      throw error;
    }
  }

  // Onfido API Methods for Attestor Verification
  async createOnfidoSession(vendorData?: string, verificationType?: string): Promise<any> {
    try {
      const apiKey = this.configService.get<string>('ONFIDO_API_KEY');
      const workflowId = this.configService.get<string>('ONFIDO_WORKFLOW_ID');
      
      if (!apiKey) {
        throw new Error('ONFIDO_API_KEY not configured');
      }

      // First create an applicant
      const applicantResponse = await fetch('https://api.onfido.com/v3/applicants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token token=${apiKey}`,
        },
        body: JSON.stringify({
          first_name: 'Attestor',
          last_name: 'User',
          email: 'attestor@trustbridge.com',
        }),
      });

      if (!applicantResponse.ok) {
        const errorText = await applicantResponse.text();
        throw new Error(`Onfido applicant creation error: ${applicantResponse.status} - ${errorText}`);
      }

      const applicantData = await applicantResponse.json();
      const applicantId = applicantData.id;

      // Then create SDK token for the applicant
      const tokenResponse = await fetch('https://api.onfido.com/v3/sdk_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token token=${apiKey}`,
        },
        body: JSON.stringify({
          applicant_id: applicantId,
          referrer: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/attestor`,
          workflow_id: workflowId || 'attestor_verification',
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Onfido SDK token error: ${tokenResponse.status} - ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      this.logger.log(`Onfido session created: ${tokenData.token} for applicant ${applicantId}`);

      return {
        session_id: tokenData.token,
        applicant_id: applicantId,
        url: `https://verify.onfido.com/?token=${tokenData.token}`,
        verification_url: `https://verify.onfido.com/?token=${tokenData.token}`,
      };
    } catch (error) {
      this.logger.error('Failed to create Onfido session:', error);
      throw error;
    }
  }

  async getOnfidoSessionStatus(sessionId: string): Promise<any> {
    try {
      const apiKey = this.configService.get<string>('ONFIDO_API_KEY');
      
      if (!apiKey) {
        throw new Error('ONFIDO_API_KEY not configured');
      }

      // For Onfido, we need to check the applicant status
      // In production, you'd store the mapping between sessionId and applicantId
      // For now, we'll simulate a status check
      this.logger.log(`Onfido session status check for: ${sessionId}`);

      // Simulate status check - in production you'd check the actual applicant status
      return {
        session_id: sessionId,
        status: 'completed', // Simulate completed status for testing
        verification_data: {
          identityVerified: true,
          documentVerified: true,
          professionalVerified: true,
          kycLevel: 'professional'
        },
      };
    } catch (error) {
      this.logger.error('Failed to get Onfido session status:', error);
      throw error;
    }
  }

  // Generate token for verified users
  async generateTokenForVerifiedUser(walletAddress: string): Promise<{ user: User; accessToken: string; refreshToken: string; expiresIn: number }> {
    try {
      // Find user by wallet address (case-insensitive)
      const user = await this.userModel.findOne({ 
        walletAddress: { $regex: new RegExp(`^${walletAddress}$`, 'i') } 
      });
      
      if (!user) {
        throw new BadRequestException('User not found with this wallet address');
      }

      // Check if user is verified
      if (user.emailVerificationStatus !== EmailVerificationStatus.VERIFIED) {
        throw new BadRequestException('User email is not verified');
      }

      // Generate tokens
      const tokens = await this.generateTokens(user);

      this.logger.log(`Token generated for verified user: ${user.email}`);

      return {
        user,
        ...tokens,
      };
    } catch (error) {
      this.logger.error('Failed to generate token for verified user:', error);
      throw error;
    }
  }
}