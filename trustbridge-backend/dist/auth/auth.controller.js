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
exports.AuthController = exports.UpdateKYCStatusDto = exports.DiditWebhookDto = exports.PersonaWebhookDto = exports.ConfirmResetDto = exports.ResetPasswordDto = exports.ChangePasswordDto = exports.VerifyEmailDto = exports.CompleteProfileDto = exports.EmailAuthDto = exports.WalletAuthDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
class WalletAuthDto {
}
exports.WalletAuthDto = WalletAuthDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], WalletAuthDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], WalletAuthDto.prototype, "signature", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], WalletAuthDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], WalletAuthDto.prototype, "timestamp", void 0);
class EmailAuthDto {
}
exports.EmailAuthDto = EmailAuthDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EmailAuthDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], EmailAuthDto.prototype, "password", void 0);
class CompleteProfileDto {
}
exports.CompleteProfileDto = CompleteProfileDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CompleteProfileDto.prototype, "walletAddress", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CompleteProfileDto.prototype, "signature", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CompleteProfileDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CompleteProfileDto.prototype, "timestamp", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CompleteProfileDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CompleteProfileDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CompleteProfileDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CompleteProfileDto.prototype, "country", void 0);
class VerifyEmailDto {
}
exports.VerifyEmailDto = VerifyEmailDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VerifyEmailDto.prototype, "token", void 0);
class ChangePasswordDto {
}
exports.ChangePasswordDto = ChangePasswordDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "oldPassword", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
class ResetPasswordDto {
}
exports.ResetPasswordDto = ResetPasswordDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "email", void 0);
class ConfirmResetDto {
}
exports.ConfirmResetDto = ConfirmResetDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConfirmResetDto.prototype, "token", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], ConfirmResetDto.prototype, "newPassword", void 0);
class PersonaWebhookDto {
}
exports.PersonaWebhookDto = PersonaWebhookDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], PersonaWebhookDto.prototype, "data", void 0);
class DiditWebhookDto {
}
exports.DiditWebhookDto = DiditWebhookDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DiditWebhookDto.prototype, "session_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DiditWebhookDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DiditWebhookDto.prototype, "vendor_data", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], DiditWebhookDto.prototype, "verification_data", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DiditWebhookDto.prototype, "workflow_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DiditWebhookDto.prototype, "created_at", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DiditWebhookDto.prototype, "updated_at", void 0);
class UpdateKYCStatusDto {
}
exports.UpdateKYCStatusDto = UpdateKYCStatusDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateKYCStatusDto.prototype, "inquiryId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateKYCStatusDto.prototype, "status", void 0);
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async checkWalletUser(address) {
        return this.authService.checkWalletUser(address);
    }
    async getAuthStatus() {
        return {
            success: true,
            data: {
                status: 'Authentication service is running',
                availableEndpoints: [
                    'POST /api/auth/wallet - Connect wallet (step 1)',
                    'POST /api/auth/complete-profile - Complete profile (step 2)',
                    'POST /api/auth/verify-email - Verify email (step 3)',
                    'POST /api/auth/email - Authenticate with email',
                    'GET /api/auth/me - Get current user profile',
                    'GET /api/auth/check-wallet/:address - Check if user exists with wallet address',
                    'POST /api/auth/refresh - Refresh token',
                    'POST /api/auth/logout - Logout user'
                ]
            },
            message: 'Authentication service is operational'
        };
    }
    async authenticateWithWallet(walletAuthDto) {
        const result = await this.authService.authenticateWithWallet(walletAuthDto);
        return {
            success: true,
            data: result,
            message: 'Authentication successful',
        };
    }
    async authenticateWithEmail(emailAuthDto) {
        const result = await this.authService.authenticateWithEmail(emailAuthDto.email, emailAuthDto.password);
        return {
            success: true,
            data: result,
            message: 'Authentication successful',
        };
    }
    async completeProfile(completeProfileDto) {
        const walletSignature = {
            address: completeProfileDto.walletAddress,
            signature: completeProfileDto.signature,
            message: completeProfileDto.message,
            timestamp: completeProfileDto.timestamp,
        };
        const result = await this.authService.completeProfile(walletSignature, completeProfileDto.email, completeProfileDto.name, {
            phone: completeProfileDto.phone,
            country: completeProfileDto.country,
        });
        return {
            success: true,
            data: result,
            message: 'Profile completed successfully. Please check your email for verification.',
        };
    }
    async verifyEmail(verifyEmailDto) {
        const result = await this.authService.verifyEmail(verifyEmailDto.token);
        return {
            success: true,
            data: result,
            message: 'Email verified successfully',
        };
    }
    async resendVerification(body) {
        const result = await this.authService.resendVerificationEmail(body.email);
        return {
            success: true,
            data: result,
            message: 'Verification email sent successfully',
        };
    }
    async refreshToken(body) {
        const result = await this.authService.refreshToken(body.refreshToken);
        return {
            success: true,
            data: result,
            message: 'Token refreshed successfully',
        };
    }
    async logout(req) {
        await this.authService.logout(req.user.sub);
        return {
            success: true,
            message: 'Logout successful',
        };
    }
    async changePassword(req, changePasswordDto) {
        await this.authService.changePassword(req.user.sub, changePasswordDto.oldPassword, changePasswordDto.newPassword);
        return {
            success: true,
            message: 'Password changed successfully',
        };
    }
    async resetPassword(resetPasswordDto) {
        await this.authService.resetPassword(resetPasswordDto.email);
        return {
            success: true,
            message: 'Password reset email sent',
        };
    }
    async confirmReset(confirmResetDto) {
        await this.authService.confirmPasswordReset(confirmResetDto.token, confirmResetDto.newPassword);
        return {
            success: true,
            message: 'Password reset successful',
        };
    }
    async getProfile(req) {
        const user = await this.authService.getUserFromToken(req.headers.authorization?.replace('Bearer ', ''));
        return {
            success: true,
            data: user,
            message: 'User profile retrieved successfully',
        };
    }
    async verifyToken(body) {
        const payload = await this.authService.verifyToken(body.token);
        return {
            success: true,
            data: payload,
            message: 'Token is valid',
        };
    }
    async getPermissions(req) {
        const user = await this.authService.getUserFromToken(req.headers.authorization?.replace('Bearer ', ''));
        const permissions = {
            role: user.role,
            canCreateAssets: await this.authService.hasPermission(user._id.toString(), 'create:assets'),
            canVerifyAssets: await this.authService.hasPermission(user._id.toString(), 'verify:assets'),
            canManageUsers: await this.authService.hasPermission(user._id.toString(), 'manage:users'),
            canReadAllAssets: await this.authService.hasPermission(user._id.toString(), 'read:all_assets'),
        };
        return {
            success: true,
            data: permissions,
            message: 'Permissions retrieved successfully',
        };
    }
    async personaWebhook(webhookData) {
        try {
            await this.authService.processPersonaWebhook(webhookData);
            return {
                success: true,
                message: 'Webhook processed successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Webhook processing failed',
                error: error.message,
            };
        }
    }
    async diditWebhook(webhookData, req) {
        try {
            const isValidSignature = await this.authService.verifyDiditWebhookSignature(req);
            if (!isValidSignature) {
                return {
                    success: false,
                    message: 'Invalid webhook signature',
                };
            }
            await this.authService.processDiditWebhook(webhookData);
            return {
                success: true,
                message: 'Webhook processed successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Webhook processing failed',
                error: error.message,
            };
        }
    }
    async updateKYCStatus(updateData, req) {
        try {
            await this.authService.updateKYCStatus(req.user.sub, updateData.inquiryId, updateData.status);
            return {
                success: true,
                message: 'KYC status updated successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to update KYC status',
                error: error.message,
            };
        }
    }
    async getKYCStatus(req) {
        const user = await this.authService.getUserById(req.user.sub);
        return {
            success: true,
            data: {
                kycStatus: user.kycStatus,
                kycInquiryId: user.kycInquiryId,
            },
            message: 'KYC status retrieved successfully',
        };
    }
    async createDiditSession(body) {
        try {
            const result = await this.authService.createDiditSession(body.vendorData, body.workflowId);
            return {
                success: true,
                data: result,
                message: 'Didit session created successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to create Didit session',
                error: error.message,
            };
        }
    }
    async getDiditSessionStatus(sessionId) {
        try {
            const result = await this.authService.getDiditSessionStatus(sessionId);
            return {
                success: true,
                data: result,
                message: 'Session status retrieved successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to get session status',
                error: error.message,
            };
        }
    }
    async generateToken(body) {
        try {
            const result = await this.authService.generateTokenForVerifiedUser(body.walletAddress);
            return {
                success: true,
                data: result,
                message: 'Token generated successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to generate token',
                error: error.message,
            };
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('check-wallet/:address'),
    (0, swagger_1.ApiOperation)({ summary: 'Check if user exists with wallet address' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User check completed' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "checkWalletUser", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get authentication status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Authentication status retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getAuthStatus", null);
__decorate([
    (0, common_1.Post)('wallet'),
    (0, swagger_1.ApiOperation)({ summary: 'Authenticate with wallet signature' }),
    (0, swagger_1.ApiBody)({ type: WalletAuthDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Authentication successful' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Authentication failed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [WalletAuthDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "authenticateWithWallet", null);
__decorate([
    (0, common_1.Post)('email'),
    (0, swagger_1.ApiOperation)({ summary: 'Authenticate with email and password' }),
    (0, swagger_1.ApiBody)({ type: EmailAuthDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Authentication successful' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Authentication failed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [EmailAuthDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "authenticateWithEmail", null);
__decorate([
    (0, common_1.Post)('complete-profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete user profile after wallet connection' }),
    (0, swagger_1.ApiBody)({ type: CompleteProfileDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile completed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Profile completion failed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CompleteProfileDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "completeProfile", null);
__decorate([
    (0, common_1.Post)('verify-email'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify user email with 6-digit code' }),
    (0, swagger_1.ApiBody)({ type: VerifyEmailDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Email verified successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Email verification failed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [VerifyEmailDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)('resend-verification'),
    (0, swagger_1.ApiOperation)({ summary: 'Resend verification email with new 6-digit code' }),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { email: { type: 'string', format: 'email' } }, required: ['email'] } }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Verification email sent successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Resend verification failed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendVerification", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token refreshed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid refresh token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Logout user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Logout successful' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Put)('password'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Change password' }),
    (0, swagger_1.ApiBody)({ type: ChangePasswordDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password changed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Password change failed' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Request password reset' }),
    (0, swagger_1.ApiBody)({ type: ResetPasswordDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset email sent' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('confirm-reset'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm password reset' }),
    (0, swagger_1.ApiBody)({ type: ConfirmResetDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset successful' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Password reset failed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ConfirmResetDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "confirmReset", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User profile retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)('verify'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify JWT token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token is valid' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Token is invalid' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyToken", null);
__decorate([
    (0, common_1.Get)('permissions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user permissions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Permissions retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getPermissions", null);
__decorate([
    (0, common_1.Post)('persona/webhook'),
    (0, swagger_1.ApiOperation)({ summary: 'Persona KYC webhook' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid webhook data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "personaWebhook", null);
__decorate([
    (0, common_1.Post)('didit/webhook'),
    (0, swagger_1.ApiOperation)({ summary: 'Didit KYC webhook' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid webhook data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid webhook signature' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DiditWebhookDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "diditWebhook", null);
__decorate([
    (0, common_1.Post)('kyc/update-status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update KYC status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KYC status updated successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UpdateKYCStatusDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateKYCStatus", null);
__decorate([
    (0, common_1.Get)('kyc/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get KYC status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KYC status retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getKYCStatus", null);
__decorate([
    (0, common_1.Post)('didit/session'),
    (0, swagger_1.ApiOperation)({ summary: 'Create Didit verification session' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Session created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Session creation failed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "createDiditSession", null);
__decorate([
    (0, common_1.Get)('didit/session/:sessionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Didit session status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Session status retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Failed to get session status' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getDiditSessionStatus", null);
__decorate([
    (0, common_1.Post)('generate-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate access token for verified user' }),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { walletAddress: { type: 'string' } }, required: ['walletAddress'] } }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token generated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Token generation failed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "generateToken", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('api/auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map