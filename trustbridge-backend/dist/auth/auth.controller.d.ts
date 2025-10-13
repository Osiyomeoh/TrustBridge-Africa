import { AuthService } from './auth.service';
export declare class WalletAuthDto {
    address: string;
    signature: string;
    message: string;
    timestamp: number;
}
export declare class EmailAuthDto {
    email: string;
    password: string;
}
export declare class CompleteProfileDto {
    walletAddress: string;
    signature: string;
    message: string;
    timestamp: number;
    email: string;
    name: string;
    phone?: string;
    country?: string;
}
export declare class VerifyEmailDto {
    token: string;
}
export declare class ResendVerificationDto {
    email: string;
}
export declare class ChangePasswordDto {
    oldPassword: string;
    newPassword: string;
}
export declare class ResetPasswordDto {
    email: string;
}
export declare class ConfirmResetDto {
    token: string;
    newPassword: string;
}
export declare class PersonaWebhookDto {
    data: {
        id: string;
        type: string;
        attributes: {
            status: string;
            inquiry_id: string;
            reference_id?: string;
            created_at: string;
            updated_at: string;
        };
    };
}
export declare class DiditWebhookDto {
    session_id: string;
    status: string;
    vendor_data?: string;
    verification_data?: any;
    workflow_id?: string;
    created_at?: string;
    updated_at?: string;
}
export declare class UpdateKYCStatusDto {
    inquiryId: string;
    status: string;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    checkWalletUser(address: string): Promise<{
        success: boolean;
        data?: import("../schemas/user.schema").User;
        message: string;
    }>;
    checkEmailUser(email: string): Promise<{
        success: boolean;
        data?: import("../schemas/user.schema").User;
        message: string;
    }>;
    getAuthStatus(): Promise<{
        success: boolean;
        data: {
            status: string;
            availableEndpoints: string[];
        };
        message: string;
    }>;
    authenticateWithWallet(walletAuthDto: WalletAuthDto): Promise<{
        success: boolean;
        data: import("./auth.service").AuthResult;
        message: string;
    }>;
    authenticateWithEmail(emailAuthDto: EmailAuthDto): Promise<{
        success: boolean;
        data: import("./auth.service").AuthResult;
        message: string;
    }>;
    completeProfile(completeProfileDto: CompleteProfileDto): Promise<{
        success: boolean;
        data: import("./auth.service").AuthResult;
        message: string;
    }>;
    verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<{
        success: boolean;
        data: {
            success: boolean;
            message: string;
        };
        message: string;
    }>;
    resendVerification(resendVerificationDto: ResendVerificationDto): Promise<{
        success: boolean;
        data: {
            success: boolean;
            message: string;
        };
        message: string;
    }>;
    refreshToken(body: {
        refreshToken: string;
    }): Promise<{
        success: boolean;
        data: {
            accessToken: string;
            expiresIn: number;
        };
        message: string;
    }>;
    logout(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    changePassword(req: any, changePasswordDto: ChangePasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    confirmReset(confirmResetDto: ConfirmResetDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getProfile(req: any): Promise<{
        success: boolean;
        data: import("../schemas/user.schema").User;
        message: string;
    }>;
    verifyToken(body: {
        token: string;
    }): Promise<{
        success: boolean;
        data: import("./auth.service").JwtPayload;
        message: string;
    }>;
    getPermissions(req: any): Promise<{
        success: boolean;
        data: {
            role: import("../schemas/user.schema").UserRole;
            canCreateAssets: boolean;
            canVerifyAssets: boolean;
            canManageUsers: boolean;
            canReadAllAssets: boolean;
        };
        message: string;
    }>;
    personaWebhook(webhookData: any): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
    }>;
    diditWebhook(webhookData: DiditWebhookDto, req: any): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
    }>;
    updateKYCStatus(updateData: UpdateKYCStatusDto, req: any): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
    }>;
    getKYCStatus(req: any): Promise<{
        success: boolean;
        data: {
            kycStatus: any;
            kycInquiryId: any;
        };
        message: string;
    }>;
    createDiditSession(body: {
        vendorData?: string;
        workflowId?: string;
    }): Promise<{
        success: boolean;
        data: any;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    getDiditSessionStatus(sessionId: string): Promise<{
        success: boolean;
        data: any;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    createOnfidoSession(body: {
        vendorData?: string;
        verificationType?: string;
    }): Promise<{
        success: boolean;
        data: any;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getOnfidoSessionStatus(sessionId: string): Promise<{
        success: boolean;
        data: any;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    generateToken(body: {
        walletAddress: string;
    }): Promise<{
        success: boolean;
        data: {
            user: import("../schemas/user.schema").User;
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
}
