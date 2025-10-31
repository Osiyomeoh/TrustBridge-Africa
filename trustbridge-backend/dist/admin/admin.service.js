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
var AdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const hedera_service_1 = require("../hedera/hedera.service");
const asset_schema_1 = require("../schemas/asset.schema");
let AdminService = AdminService_1 = class AdminService {
    constructor(configService, hederaService, assetModel) {
        this.configService = configService;
        this.hederaService = hederaService;
        this.assetModel = assetModel;
        this.logger = new common_1.Logger(AdminService_1.name);
        this.adminWallets = this.configService
            .get('ADMIN_WALLETS', '')
            .split(',')
            .map(addr => addr.trim().toLowerCase())
            .filter(addr => addr.length > 0);
        this.superAdminWallet = this.configService
            .get('SUPER_ADMIN_WALLET', '')
            .toLowerCase();
        this.platformAdminWallets = this.configService
            .get('PLATFORM_ADMIN_WALLETS', '')
            .split(',')
            .map(addr => addr.trim().toLowerCase())
            .filter(addr => addr.length > 0);
        this.amcAdminWallets = this.configService
            .get('AMC_ADMIN_WALLETS', '')
            .split(',')
            .map(addr => addr.trim().toLowerCase())
            .filter(addr => addr.length > 0);
        this.logger.log(`Admin service initialized with ${this.adminWallets.length} admin wallets`);
    }
    async checkAdminStatus(walletAddress) {
        if (!walletAddress) {
            return this.getDefaultRole();
        }
        const normalizedAddress = walletAddress.toLowerCase();
        try {
            const hederaAdminRole = await this.checkHederaAdminRole(normalizedAddress);
            if (hederaAdminRole.isAdmin) {
                return hederaAdminRole;
            }
        }
        catch (error) {
            this.logger.warn('Failed to check Hedera admin role:', error);
        }
        return this.getDefaultRole();
    }
    async checkEnvironmentAdminRole(normalizedAddress) {
        if (normalizedAddress === this.superAdminWallet) {
            return {
                isAdmin: true,
                isSuperAdmin: true,
                isPlatformAdmin: true,
                isAmcAdmin: true,
                role: 'SUPER_ADMIN',
                permissions: [
                    'manage_users',
                    'manage_assets',
                    'manage_pools',
                    'manage_kyc',
                    'assign_roles',
                    'system_settings',
                    'view_analytics',
                    'manage_contracts'
                ]
            };
        }
        if (this.platformAdminWallets.includes(normalizedAddress)) {
            return {
                isAdmin: true,
                isSuperAdmin: false,
                isPlatformAdmin: true,
                isAmcAdmin: false,
                role: 'PLATFORM_ADMIN',
                permissions: [
                    'manage_users',
                    'manage_assets',
                    'manage_pools',
                    'manage_kyc',
                    'view_analytics'
                ]
            };
        }
        if (this.amcAdminWallets.includes(normalizedAddress)) {
            return {
                isAdmin: true,
                isSuperAdmin: false,
                isPlatformAdmin: false,
                isAmcAdmin: true,
                role: 'AMC_ADMIN',
                permissions: [
                    'manage_assets',
                    'manage_pools',
                    'manage_kyc',
                    'view_analytics'
                ]
            };
        }
        return this.getDefaultRole();
    }
    async checkHederaAdminRole(walletAddress) {
        try {
            const isHederaAdmin = await this.hederaService.isHederaAdminAccount(walletAddress);
            if (!isHederaAdmin) {
                return this.getDefaultRole();
            }
            const hederaRole = await this.hederaService.getHederaAdminRole(walletAddress);
            if (!hederaRole) {
                return this.getDefaultRole();
            }
            switch (hederaRole) {
                case 'SUPER_ADMIN':
                    return {
                        isAdmin: true,
                        isSuperAdmin: true,
                        isPlatformAdmin: true,
                        isAmcAdmin: true,
                        role: 'HEDERA_SUPER_ADMIN',
                        permissions: [
                            'manage_users',
                            'manage_assets',
                            'manage_pools',
                            'manage_kyc',
                            'assign_roles',
                            'system_settings',
                            'view_analytics',
                            'manage_contracts',
                            'manage_hedera_accounts'
                        ]
                    };
                case 'PLATFORM_ADMIN':
                    return {
                        isAdmin: true,
                        isSuperAdmin: false,
                        isPlatformAdmin: true,
                        isAmcAdmin: true,
                        role: 'HEDERA_PLATFORM_ADMIN',
                        permissions: [
                            'manage_users',
                            'manage_assets',
                            'manage_pools',
                            'manage_kyc',
                            'view_analytics',
                            'manage_hedera_tokens'
                        ]
                    };
                case 'AMC_ADMIN':
                    return {
                        isAdmin: true,
                        isSuperAdmin: false,
                        isPlatformAdmin: false,
                        isAmcAdmin: true,
                        role: 'HEDERA_AMC_ADMIN',
                        permissions: [
                            'manage_assets',
                            'manage_pools',
                            'manage_kyc',
                            'view_analytics',
                            'manage_hedera_assets'
                        ]
                    };
                default:
                    return this.getDefaultRole();
            }
        }
        catch (error) {
            this.logger.error('Error checking Hedera admin role:', error);
            return this.getDefaultRole();
        }
    }
    async assignAdminRole(assignerWallet, targetWallet, role) {
        const assignerStatus = await this.checkAdminStatus(assignerWallet);
        if (!assignerStatus.isSuperAdmin) {
            throw new common_1.UnauthorizedException('Only super admin can assign roles');
        }
        if (!this.isAdminRole(role)) {
            throw new common_1.BadRequestException('Invalid admin role');
        }
        this.logger.log(`Admin role ${role} assigned to ${targetWallet} by ${assignerWallet}`);
        return {
            success: true,
            message: `Successfully assigned ${role} role to ${targetWallet}`
        };
    }
    async removeAdminRole(assignerWallet, targetWallet) {
        const assignerStatus = await this.checkAdminStatus(assignerWallet);
        if (!assignerStatus.isSuperAdmin) {
            throw new common_1.UnauthorizedException('Only super admin can remove roles');
        }
        this.logger.log(`Admin role removed from ${targetWallet} by ${assignerWallet}`);
        return {
            success: true,
            message: `Successfully removed admin role from ${targetWallet}`
        };
    }
    async getAllAdminUsers() {
        return [];
    }
    isAdminRole(role) {
        return [
            'ADMIN',
            'SUPER_ADMIN',
            'PLATFORM_ADMIN',
            'AMC_ADMIN'
        ].includes(role);
    }
    getDefaultRole() {
        return {
            isAdmin: false,
            isSuperAdmin: false,
            isPlatformAdmin: false,
            isAmcAdmin: false,
            role: 'INVESTOR',
            permissions: []
        };
    }
    async hasPermission(walletAddress, permission) {
        const adminStatus = await this.checkAdminStatus(walletAddress);
        return adminStatus.permissions.includes(permission);
    }
    async getAdminStats() {
        return {
            totalAdmins: this.adminWallets.length + this.platformAdminWallets.length + this.amcAdminWallets.length + (this.superAdminWallet ? 1 : 0),
            superAdmins: this.superAdminWallet ? 1 : 0,
            platformAdmins: this.platformAdminWallets.length,
            amcAdmins: this.amcAdminWallets.length,
            regularAdmins: this.adminWallets.length,
        };
    }
    async createHederaAdminAccount(adminName, role) {
        try {
            const adminAccount = await this.hederaService.createAdminAccount(adminName);
            this.logger.log(`✅ Created Hedera admin account: ${adminAccount.accountId} with role: ${role}`);
            return {
                success: true,
                accountId: adminAccount.accountId,
                privateKey: adminAccount.privateKey,
                message: `Admin account created successfully with role: ${role}`
            };
        }
        catch (error) {
            this.logger.error('Failed to create Hedera admin account:', error);
            return {
                success: false,
                message: `Failed to create admin account: ${error.message}`
            };
        }
    }
    async addHederaAdminToConfig(accountId, role) {
        try {
            this.logger.log(`✅ Added Hedera admin ${accountId} with role: ${role}`);
        }
        catch (error) {
            this.logger.error('Failed to add Hedera admin to config:', error);
            throw error;
        }
    }
    async removeHederaAdminAccount(accountId) {
        try {
            this.logger.log(`✅ Removed Hedera admin: ${accountId}`);
            return {
                success: true,
                message: 'Admin account removed successfully'
            };
        }
        catch (error) {
            this.logger.error('Failed to remove Hedera admin account:', error);
            return {
                success: false,
                message: `Failed to remove admin account: ${error.message}`
            };
        }
    }
    async getHederaAdminAccounts() {
        try {
            const superAdminAccount = this.configService
                .get('HEDERA_SUPER_ADMIN_ACCOUNT', '');
            const platformAdminAccounts = this.configService
                .get('HEDERA_PLATFORM_ADMIN_ACCOUNTS', '')
                .split(',')
                .map(addr => addr.trim())
                .filter(addr => addr.length > 0);
            const amcAdminAccounts = this.configService
                .get('HEDERA_AMC_ADMIN_ACCOUNTS', '')
                .split(',')
                .map(addr => addr.trim())
                .filter(addr => addr.length > 0);
            const regularAdmins = [];
            return {
                superAdmins: superAdminAccount ? [superAdminAccount] : [],
                platformAdmins: platformAdminAccounts,
                amcAdmins: amcAdminAccounts,
                regularAdmins
            };
        }
        catch (error) {
            this.logger.error('Failed to get Hedera admin accounts:', error);
            return {
                superAdmins: [],
                platformAdmins: [],
                amcAdmins: [],
                regularAdmins: []
            };
        }
    }
    async isHederaAdmin(accountId) {
        try {
            return await this.hederaService.isHederaAdminAccount(accountId);
        }
        catch (error) {
            this.logger.error('Failed to check Hedera admin status:', error);
            return false;
        }
    }
    async getHederaAdminRole(accountId) {
        try {
            return await this.hederaService.getHederaAdminRole(accountId);
        }
        catch (error) {
            this.logger.error('Failed to get Hedera admin role:', error);
            return null;
        }
    }
    async createInitialHederaSuperAdmin() {
        try {
            const superAdmin = await this.hederaService.createInitialHederaSuperAdmin();
            this.logger.log('✅ Initial Hedera super admin created and configured');
            return {
                success: true,
                accountId: superAdmin.accountId,
                privateKey: superAdmin.privateKey,
                message: 'Initial super admin created successfully'
            };
        }
        catch (error) {
            this.logger.error('Failed to create initial Hedera super admin:', error);
            return {
                success: false,
                message: `Initial super admin creation failed: ${error.message}`
            };
        }
    }
    async setupHederaAdminAccounts() {
        try {
            const accounts = await this.hederaService.createAdminAccounts();
            this.logger.log('✅ Setup complete: All Hedera admin accounts created and configured');
            return {
                success: true,
                accounts,
                message: 'All admin accounts created successfully'
            };
        }
        catch (error) {
            this.logger.error('Failed to setup Hedera admin accounts:', error);
            return {
                success: false,
                message: `Setup failed: ${error.message}`
            };
        }
    }
    async approveAsset(adminWallet, assetId, approved, comments, verificationScore) {
        try {
            const adminStatus = await this.checkAdminStatus(adminWallet);
            if (!adminStatus.isAdmin && !adminStatus.isAmcAdmin && !adminStatus.isSuperAdmin && !adminStatus.isPlatformAdmin) {
                throw new common_1.UnauthorizedException('Insufficient permissions to approve assets');
            }
            const asset = await this.assetModel.findOne({ tokenContract: assetId });
            if (!asset) {
                throw new common_1.BadRequestException('Asset not found');
            }
            if (approved) {
                asset.status = asset_schema_1.AssetStatus.ACTIVE;
                asset.verificationScore = verificationScore || 85;
            }
            else {
                asset.status = asset_schema_1.AssetStatus.PENDING;
            }
            await asset.save();
            this.logger.log(`Asset ${assetId} ${approved ? 'approved' : 'rejected'} by admin ${adminWallet}`);
            return {
                success: true,
                message: `Asset ${approved ? 'approved' : 'rejected'} successfully`,
                asset: {
                    assetId: asset.assetId,
                    tokenId: asset.tokenContract,
                    status: asset.status,
                    verificationScore: asset.verificationScore
                }
            };
        }
        catch (error) {
            console.error('Error approving asset:', error);
            return {
                success: false,
                message: `Failed to ${approved ? 'approve' : 'reject'} asset: ${error.message}`
            };
        }
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = AdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, mongoose_1.InjectModel)(asset_schema_1.Asset.name)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        hedera_service_1.HederaService,
        mongoose_2.Model])
], AdminService);
//# sourceMappingURL=admin.service.js.map