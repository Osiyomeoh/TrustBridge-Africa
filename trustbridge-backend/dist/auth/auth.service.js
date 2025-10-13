"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const user_schema_1 = require("../schemas/user.schema");
const ethers_1 = require("ethers");
const crypto = __importStar(require("crypto"));
const gmail_service_1 = require("../services/gmail.service");
let AuthService = AuthService_1 = class AuthService {
    constructor(userModel, jwtService, configService, gmailService) {
        this.userModel = userModel;
        this.jwtService = jwtService;
        this.configService = configService;
        this.gmailService = gmailService;
        this.logger = new common_1.Logger(AuthService_1.name);
        this.jwtSecret = this.configService.get('JWT_SECRET', 'trustbridge-secret');
        this.jwtExpiresIn = this.configService.get('JWT_EXPIRES_IN', '24h');
        this.refreshTokenExpiresIn = this.configService.get('REFRESH_TOKEN_EXPIRES_IN', '7d');
    }
    async authenticateWithWallet(walletSignature) {
        try {
            const isValidSignature = await this.verifyWalletSignature(walletSignature);
            if (!isValidSignature) {
                throw new common_1.UnauthorizedException('Invalid wallet signature');
            }
            let user = await this.userModel.findOne({
                walletAddress: { $regex: new RegExp(`^${walletSignature.address}$`, 'i') }
            });
            if (!user) {
                user = await this.createUserFromWallet(walletSignature.address);
            }
            user.lastLoginAt = new Date();
            await user.save();
            const tokens = await this.generateTokens(user);
            return {
                user,
                ...tokens,
            };
        }
        catch (error) {
            this.logger.error('Wallet authentication failed:', error);
            throw error;
        }
    }
    async authenticateWithEmail(email, password) {
        try {
            const user = await this.userModel.findOne({ email });
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            const isPasswordValid = await this.verifyPassword(password, user.password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            user.lastLoginAt = new Date();
            await user.save();
            const tokens = await this.generateTokens(user);
            return {
                user,
                ...tokens,
            };
        }
        catch (error) {
            this.logger.error('Email authentication failed:', error);
            throw error;
        }
    }
    async completeProfile(walletSignature, email, name, userData) {
        try {
            const isValidSignature = await this.verifyWalletSignature(walletSignature);
            if (!isValidSignature) {
                throw new common_1.UnauthorizedException('Invalid wallet signature');
            }
            let user = await this.userModel.findOne({ walletAddress: walletSignature.address });
            if (!user) {
                user = await this.createUserFromWallet(walletSignature.address);
            }
            const existingEmailUser = await this.userModel.findOne({
                email,
                _id: { $ne: user._id }
            });
            if (existingEmailUser) {
                throw new common_1.BadRequestException('Email already registered to another account');
            }
            user.email = email;
            user.name = name;
            user.phone = userData.phone;
            user.country = userData.country;
            user.emailVerificationStatus = user_schema_1.EmailVerificationStatus.PENDING;
            const verificationCode = this.generateVerificationCode();
            const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);
            user.emailVerificationToken = verificationCode;
            user.emailVerificationExpires = verificationExpires;
            await user.save();
            try {
                const emailSent = await this.gmailService.sendVerificationEmail(email, verificationCode, name);
                if (emailSent) {
                    this.logger.log(`Verification email sent successfully to ${email}`);
                }
                else {
                    this.logger.warn(`Failed to send verification email to ${email}`);
                }
            }
            catch (error) {
                this.logger.error(`Error sending verification email to ${email}:`, error);
            }
            this.logger.log(`Email verification code for ${email}: ${verificationCode}`);
            const tokens = await this.generateTokens(user);
            return {
                user,
                ...tokens,
            };
        }
        catch (error) {
            this.logger.error('Profile completion failed:', error);
            throw error;
        }
    }
    async verifyEmail(token) {
        try {
            const user = await this.userModel.findOne({
                emailVerificationToken: token,
                emailVerificationExpires: { $gt: new Date() },
            });
            if (!user) {
                throw new common_1.BadRequestException('Invalid or expired verification code');
            }
            user.emailVerificationStatus = user_schema_1.EmailVerificationStatus.VERIFIED;
            user.emailVerificationToken = undefined;
            user.emailVerificationExpires = undefined;
            await user.save();
            this.logger.log(`Email verified for user ${user.email}`);
            return {
                success: true,
                message: 'Email verified successfully',
            };
        }
        catch (error) {
            this.logger.error('Email verification failed:', error);
            throw error;
        }
    }
    async resendVerificationEmail(email) {
        try {
            const user = await this.userModel.findOne({ email });
            if (!user) {
                throw new common_1.BadRequestException('User not found');
            }
            if (user.emailVerificationStatus === user_schema_1.EmailVerificationStatus.VERIFIED) {
                throw new common_1.BadRequestException('Email is already verified');
            }
            const verificationCode = this.generateVerificationCode();
            const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);
            user.emailVerificationToken = verificationCode;
            user.emailVerificationExpires = verificationExpires;
            await user.save();
            try {
                const emailSent = await this.gmailService.sendVerificationEmail(email, verificationCode, user.name || 'User');
                if (emailSent) {
                    this.logger.log(`Verification email resent successfully to ${email}`);
                }
                else {
                    this.logger.warn(`Failed to resend verification email to ${email} - using console fallback`);
                }
            }
            catch (error) {
                this.logger.error(`Error resending verification email to ${email}:`, error);
                this.logger.warn('Continuing with console fallback due to email service failure');
            }
            this.logger.log(`New verification code for ${email}: ${verificationCode}`);
            return {
                success: true,
                message: 'Verification email sent successfully',
            };
        }
        catch (error) {
            this.logger.error('Resend verification failed:', error);
            throw error;
        }
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, { secret: this.jwtSecret });
            const user = await this.userModel.findById(payload.sub);
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            const accessToken = this.jwtService.sign({ sub: user._id, email: user.email, role: user.role, walletAddress: user.walletAddress }, { secret: this.jwtSecret, expiresIn: this.jwtExpiresIn });
            return {
                accessToken,
                expiresIn: this.parseExpiresIn(this.jwtExpiresIn),
            };
        }
        catch (error) {
            this.logger.error('Token refresh failed:', error);
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async logout(userId) {
        try {
            this.logger.log(`User ${userId} logged out`);
        }
        catch (error) {
            this.logger.error('Logout failed:', error);
            throw error;
        }
    }
    async changePassword(userId, oldPassword, newPassword) {
        try {
            const user = await this.userModel.findById(userId);
            if (!user) {
                throw new common_1.BadRequestException('User not found');
            }
            const isOldPasswordValid = await this.verifyPassword(oldPassword, user.password);
            if (!isOldPasswordValid) {
                throw new common_1.BadRequestException('Invalid old password');
            }
            const hashedNewPassword = await this.hashPassword(newPassword);
            user.password = hashedNewPassword;
            await user.save();
            this.logger.log(`Password changed for user ${userId}`);
        }
        catch (error) {
            this.logger.error('Password change failed:', error);
            throw error;
        }
    }
    async resetPassword(email) {
        try {
            const user = await this.userModel.findOne({ email });
            if (!user) {
                return;
            }
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenExpires = new Date(Date.now() + 3600000);
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = resetTokenExpires;
            await user.save();
            this.logger.log(`Password reset token generated for user ${email}: ${resetToken}`);
        }
        catch (error) {
            this.logger.error('Password reset failed:', error);
            throw error;
        }
    }
    async confirmPasswordReset(token, newPassword) {
        try {
            const user = await this.userModel.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: new Date() },
            });
            if (!user) {
                throw new common_1.BadRequestException('Invalid or expired reset token');
            }
            const hashedPassword = await this.hashPassword(newPassword);
            user.password = hashedPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            this.logger.log(`Password reset completed for user ${user.email}`);
        }
        catch (error) {
            this.logger.error('Password reset confirmation failed:', error);
            throw error;
        }
    }
    async verifyToken(token) {
        try {
            const payload = this.jwtService.verify(token, { secret: this.jwtSecret });
            return payload;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    async getUserFromToken(token) {
        try {
            const payload = await this.verifyToken(token);
            const user = await this.userModel.findById(payload.sub);
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            return user;
        }
        catch (error) {
            this.logger.error('Get user from token failed:', error);
            throw error;
        }
    }
    async checkWalletUser(walletAddress) {
        try {
            const user = await this.userModel.findOne({
                walletAddress: { $regex: new RegExp(`^${walletAddress}$`, 'i') }
            }).exec();
            if (user) {
                return {
                    success: true,
                    data: user,
                    message: 'User found with wallet address'
                };
            }
            else {
                return {
                    success: false,
                    message: 'No user found with this wallet address'
                };
            }
        }
        catch (error) {
            this.logger.error('Error checking wallet user:', error);
            return {
                success: false,
                message: 'Error checking wallet user'
            };
        }
    }
    async checkEmailUser(email) {
        try {
            const user = await this.userModel.findOne({
                email: { $regex: new RegExp(`^${email}$`, 'i') }
            }).exec();
            if (user) {
                return {
                    success: true,
                    data: user,
                    message: 'Email already registered to another account'
                };
            }
            else {
                return {
                    success: false,
                    message: 'Email is available'
                };
            }
        }
        catch (error) {
            this.logger.error('Error checking email user:', error);
            return {
                success: false,
                message: 'Error checking email availability'
            };
        }
    }
    async verifyWalletSignature(walletSignature) {
        try {
            if (walletSignature.signature.includes(':') && walletSignature.address.startsWith('0.0.')) {
                return this.verifyHashPackSignature(walletSignature);
            }
            const message = walletSignature.message;
            const recoveredAddress = ethers_1.ethers.verifyMessage(message, walletSignature.signature);
            return recoveredAddress.toLowerCase() === walletSignature.address.toLowerCase();
        }
        catch (error) {
            this.logger.error('Wallet signature verification failed:', error);
            return false;
        }
    }
    async verifyHashPackSignature(walletSignature) {
        try {
            const [accountId, hash, timestamp] = walletSignature.signature.split(':');
            if (accountId !== walletSignature.address) {
                this.logger.warn('HashPack account ID mismatch:', { accountId, address: walletSignature.address });
                return false;
            }
            const messageHash = crypto.createHash('sha256').update(walletSignature.message).digest('hex');
            if (hash !== messageHash) {
                this.logger.warn('HashPack message hash mismatch:', { provided: hash, expected: messageHash });
                return false;
            }
            const now = Date.now();
            const signatureTime = parseInt(timestamp, 16);
            const timeDiff = now - signatureTime;
            if (timeDiff > 5 * 60 * 1000) {
                this.logger.warn('HashPack signature too old:', { timeDiff, signatureTime, now });
                return false;
            }
            this.logger.log('HashPack signature verified successfully:', { accountId, timeDiff });
            return true;
        }
        catch (error) {
            this.logger.error('HashPack signature verification failed:', error);
            return false;
        }
    }
    async createUserFromWallet(walletAddress) {
        const user = new this.userModel({
            walletAddress: walletAddress,
            role: 'INVESTOR',
            isActive: true,
            kycStatus: 'PENDING',
        });
        await user.save();
        return user;
    }
    async generateTokens(user) {
        const payload = {
            sub: user._id.toString(),
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
    async hashPassword(password) {
        const saltRounds = 12;
        return crypto.pbkdf2Sync(password, this.jwtSecret, saltRounds, 64, 'sha512').toString('hex');
    }
    async verifyPassword(password, hashedPassword) {
        const hash = crypto.pbkdf2Sync(password, this.jwtSecret, 12, 64, 'sha512').toString('hex');
        return hash === hashedPassword;
    }
    parseExpiresIn(expiresIn) {
        const unit = expiresIn.slice(-1);
        const value = parseInt(expiresIn.slice(0, -1));
        switch (unit) {
            case 's': return value * 1000;
            case 'm': return value * 60 * 1000;
            case 'h': return value * 60 * 60 * 1000;
            case 'd': return value * 24 * 60 * 60 * 1000;
            default: return 24 * 60 * 60 * 1000;
        }
    }
    async hasRole(userId, requiredRole) {
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
        }
        catch (error) {
            this.logger.error('Role check failed:', error);
            return false;
        }
    }
    async hasPermission(userId, permission) {
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
        }
        catch (error) {
            this.logger.error('Permission check failed:', error);
            return false;
        }
    }
    generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async processPersonaWebhook(webhookData) {
        try {
            this.logger.log('Processing Persona webhook:', webhookData);
            const webhookSecret = this.configService.get('PERSONA_WEBHOOK_SECRET');
            if (webhookSecret) {
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
            let user;
            if (reference_id) {
                user = await this.userModel.findOne({
                    walletAddress: { $regex: new RegExp(`^${reference_id}$`, 'i') }
                });
            }
            else {
                user = await this.userModel.findOne({ kycInquiryId: inquiry_id });
            }
            if (!user) {
                this.logger.warn(`User not found for Persona webhook: inquiry_id=${inquiry_id}, reference_id=${reference_id}`);
                return;
            }
            let kycStatus;
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
            user.kycStatus = kycStatus;
            user.kycInquiryId = inquiry_id;
            user.updatedAt = new Date();
            await user.save();
            this.logger.log(`KYC status updated for user ${user._id}: ${kycStatus}`);
            await this.gmailService.sendEmail(user.profile?.email || '', 'KYC Verification Update', `
          <h2>KYC Verification Update</h2>
          <p>Your identity verification status has been updated to: <strong>${kycStatus}</strong></p>
          <p>Inquiry ID: ${inquiry_id}</p>
          <p>Thank you for using TrustBridge!</p>
        `, `Your KYC verification status has been updated to: ${kycStatus}`);
        }
        catch (error) {
            this.logger.error('Persona webhook processing failed:', error);
            throw error;
        }
    }
    async updateKYCStatus(userId, inquiryId, status) {
        try {
            const user = await this.userModel.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            let kycStatus;
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
            user.kycStatus = kycStatus;
            user.kycInquiryId = inquiryId;
            user.updatedAt = new Date();
            await user.save();
            this.logger.log(`KYC status manually updated for user ${userId}: ${kycStatus}`);
        }
        catch (error) {
            this.logger.error('Failed to update KYC status:', error);
            throw error;
        }
    }
    async getUserById(userId) {
        try {
            const user = await this.userModel.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        }
        catch (error) {
            this.logger.error('Failed to get user by ID:', error);
            throw error;
        }
    }
    async processDiditWebhook(webhookData) {
        try {
            this.logger.log('Processing Didit webhook:', webhookData);
            const { session_id, status, vendor_data } = webhookData;
            if (!session_id || !status) {
                throw new Error('Missing required webhook fields');
            }
            let walletAddress = null;
            if (vendor_data) {
                try {
                    const parsedVendorData = JSON.parse(vendor_data);
                    walletAddress = parsedVendorData.walletAddress;
                }
                catch (err) {
                    this.logger.warn('Failed to parse vendor data:', err);
                }
            }
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
            let kycStatus;
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
            user.kycStatus = kycStatus;
            user.kycInquiryId = session_id;
            user.updatedAt = new Date();
            await user.save();
            this.logger.log(`KYC status updated for user ${user._id}: ${kycStatus}`);
            if (user.profile?.email) {
                await this.gmailService.sendEmail(user.profile.email, 'KYC Verification Update', `
            <h2>KYC Verification Update</h2>
            <p>Your identity verification status has been updated to: <strong>${kycStatus}</strong></p>
            <p>Session ID: ${session_id}</p>
            <p>Thank you for using TrustBridge!</p>
          `, `Your KYC verification status has been updated to: ${kycStatus}`);
            }
        }
        catch (error) {
            this.logger.error('Didit webhook processing failed:', error);
            throw error;
        }
    }
    async verifyDiditWebhookSignature(req) {
        try {
            const webhookSecret = this.configService.get('DIDIT_WEBHOOK_SECRET');
            if (!webhookSecret) {
                this.logger.warn('DIDIT_WEBHOOK_SECRET not configured, skipping signature verification');
                return true;
            }
            const signature = req.headers['x-didit-signature'];
            if (!signature) {
                this.logger.warn('Missing Didit webhook signature');
                return false;
            }
            const rawBody = JSON.stringify(req.body);
            const crypto = require('crypto');
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(rawBody)
                .digest('hex');
            const isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
            if (!isValid) {
                this.logger.warn('Invalid Didit webhook signature');
            }
            return isValid;
        }
        catch (error) {
            this.logger.error('Didit webhook signature verification failed:', error);
            return false;
        }
    }
    async createDiditSession(vendorData, workflowId) {
        try {
            const apiKey = this.configService.get('DIDIT_API_KEY');
            const defaultWorkflowId = this.configService.get('DIDIT_WORKFLOW_ID');
            if (!apiKey) {
                throw new Error('DIDIT_API_KEY not configured');
            }
            let finalWorkflowId = workflowId || defaultWorkflowId || 'default';
            if (vendorData) {
                try {
                    const parsedVendorData = JSON.parse(vendorData);
                    if (parsedVendorData.verificationType === 'attestor_enhanced') {
                        const attestorWorkflowId = this.configService.get('DIDIT_ATTESTOR_WORKFLOW_ID');
                        if (attestorWorkflowId) {
                            finalWorkflowId = attestorWorkflowId;
                            this.logger.log(`Using attestor workflow: ${finalWorkflowId}`);
                        }
                        else {
                            this.logger.warn('DIDIT_ATTESTOR_WORKFLOW_ID not configured, using default workflow');
                        }
                    }
                }
                catch (error) {
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
        }
        catch (error) {
            this.logger.error('Failed to create Didit session:', error);
            throw error;
        }
    }
    async getDiditSessionStatus(sessionId) {
        try {
            const apiKey = this.configService.get('DIDIT_API_KEY');
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
        }
        catch (error) {
            this.logger.error('Failed to get Didit session status:', error);
            throw error;
        }
    }
    async createOnfidoSession(vendorData, verificationType) {
        try {
            const apiKey = this.configService.get('ONFIDO_API_KEY');
            const workflowId = this.configService.get('ONFIDO_WORKFLOW_ID');
            if (!apiKey) {
                throw new Error('ONFIDO_API_KEY not configured');
            }
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
        }
        catch (error) {
            this.logger.error('Failed to create Onfido session:', error);
            throw error;
        }
    }
    async getOnfidoSessionStatus(sessionId) {
        try {
            const apiKey = this.configService.get('ONFIDO_API_KEY');
            if (!apiKey) {
                throw new Error('ONFIDO_API_KEY not configured');
            }
            this.logger.log(`Onfido session status check for: ${sessionId}`);
            return {
                session_id: sessionId,
                status: 'completed',
                verification_data: {
                    identityVerified: true,
                    documentVerified: true,
                    professionalVerified: true,
                    kycLevel: 'professional'
                },
            };
        }
        catch (error) {
            this.logger.error('Failed to get Onfido session status:', error);
            throw error;
        }
    }
    async generateTokenForVerifiedUser(walletAddress) {
        try {
            const user = await this.userModel.findOne({
                walletAddress: { $regex: new RegExp(`^${walletAddress}$`, 'i') }
            });
            if (!user) {
                throw new common_1.BadRequestException('User not found with this wallet address');
            }
            if (user.emailVerificationStatus !== user_schema_1.EmailVerificationStatus.VERIFIED) {
                throw new common_1.BadRequestException('User email is not verified');
            }
            const tokens = await this.generateTokens(user);
            this.logger.log(`Token generated for verified user: ${user.email}`);
            return {
                user,
                ...tokens,
            };
        }
        catch (error) {
            this.logger.error('Failed to generate token for verified user:', error);
            throw error;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService,
        config_1.ConfigService,
        gmail_service_1.GmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map