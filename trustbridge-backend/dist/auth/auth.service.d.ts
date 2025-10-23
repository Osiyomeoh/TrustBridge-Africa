import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument, KycStatus } from '../schemas/user.schema';
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
export declare class AuthService {
    private userModel;
    private jwtService;
    private configService;
    private gmailService;
    private readonly logger;
    private readonly jwtSecret;
    private readonly jwtExpiresIn;
    private readonly refreshTokenExpiresIn;
    constructor(userModel: Model<UserDocument>, jwtService: JwtService, configService: ConfigService, gmailService: GmailService);
    authenticateWithWallet(walletSignature: WalletSignature): Promise<AuthResult>;
    authenticateWithEmail(email: string, password: string): Promise<AuthResult>;
    completeProfile(walletSignature: WalletSignature, email: string, name: string, userData: any): Promise<AuthResult>;
    verifyEmail(token: string): Promise<{
        success: boolean;
        message: string;
    }>;
    resendVerificationEmail(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        expiresIn: number;
    }>;
    logout(userId: string): Promise<void>;
    changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>;
    resetPassword(email: string): Promise<void>;
    confirmPasswordReset(token: string, newPassword: string): Promise<void>;
    verifyToken(token: string): Promise<JwtPayload>;
    getUserFromToken(token: string): Promise<User>;
    checkWalletUser(walletAddress: string): Promise<{
        success: boolean;
        data?: User;
        message: string;
    }>;
    checkEmailUser(email: string): Promise<{
        success: boolean;
        data?: User;
        message: string;
    }>;
    private verifyWalletSignature;
    private verifyHashPackSignature;
    private createUserFromWallet;
    private generateTokens;
    private hashPassword;
    private verifyPassword;
    private parseExpiresIn;
    hasRole(userId: string, requiredRole: string): Promise<boolean>;
    hasPermission(userId: string, permission: string): Promise<boolean>;
    private generateVerificationCode;
    processPersonaWebhook(webhookData: any): Promise<void>;
    updateKYCStatus(userId: string, inquiryId: string, status: string): Promise<void>;
    getUserById(userId: string): Promise<any>;
    processDiditWebhook(webhookData: any): Promise<any>;
    verifyDiditWebhookSignature(req: any): Promise<boolean>;
    createDiditSession(vendorData?: string, workflowId?: string): Promise<any>;
    getDiditSessionStatus(sessionId: string): Promise<any>;
    createOnfidoSession(vendorData?: string, verificationType?: string): Promise<any>;
    getOnfidoSessionStatus(sessionId: string): Promise<any>;
    generateTokenForVerifiedUser(walletAddress: string): Promise<{
        user: User;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    processDiditCallback(verificationSessionId: string, status: string): Promise<{
        success: boolean;
        message: string;
        userId?: undefined;
        kycStatus?: undefined;
    } | {
        success: boolean;
        userId: unknown;
        kycStatus: KycStatus;
        message: string;
    }>;
}
