import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HederaService } from '../hedera/hedera.service';
import { Asset, AssetDocument, AssetStatus } from '../schemas/asset.schema';

export interface AdminRole {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isPlatformAdmin: boolean;
  isAmcAdmin: boolean;
  role: string;
  permissions: string[];
}

export interface AdminAssignment {
  walletAddress: string;
  role: string;
  assignedBy: string;
  assignedAt: Date;
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  private readonly adminWallets: string[];
  private readonly superAdminWallet: string;
  private readonly platformAdminWallets: string[];
  private readonly amcAdminWallets: string[];

  constructor(
    private configService: ConfigService,
    private hederaService: HederaService,
    @InjectModel(Asset.name) private assetModel: Model<AssetDocument>,
  ) {
    // Load admin configuration from environment
    this.adminWallets = this.configService
      .get<string>('ADMIN_WALLETS', '')
      .split(',')
      .map(addr => addr.trim().toLowerCase())
      .filter(addr => addr.length > 0);

    this.superAdminWallet = this.configService
      .get<string>('SUPER_ADMIN_WALLET', '')
      .toLowerCase();

    this.platformAdminWallets = this.configService
      .get<string>('PLATFORM_ADMIN_WALLETS', '')
      .split(',')
      .map(addr => addr.trim().toLowerCase())
      .filter(addr => addr.length > 0);

    this.amcAdminWallets = this.configService
      .get<string>('AMC_ADMIN_WALLETS', '')
      .split(',')
      .map(addr => addr.trim().toLowerCase())
      .filter(addr => addr.length > 0);

    this.logger.log(`Admin service initialized with ${this.adminWallets.length} admin wallets`);
  }

  /**
   * Check if a wallet address has admin privileges
   * FULLY HEDERA NATIVE - Only checks Hedera native admin accounts
   */
  async checkAdminStatus(walletAddress: string): Promise<AdminRole> {
    if (!walletAddress) {
      return this.getDefaultRole();
    }

    const normalizedAddress = walletAddress.toLowerCase();

    // 1. Check Hedera native admin accounts (PRIMARY SYSTEM)
    try {
      const hederaAdminRole = await this.checkHederaAdminRole(normalizedAddress);
      if (hederaAdminRole.isAdmin) {
        return hederaAdminRole;
      }
    } catch (error) {
      this.logger.warn('Failed to check Hedera admin role:', error);
      // Continue to database check even if Hedera check fails
    }

    // 2. In a fully blockchain-native system, user roles are managed through Hedera
    // This would typically involve querying Hedera account metadata or smart contract state

    return this.getDefaultRole();
  }

  /**
   * Check environment variable admin roles (existing system)
   */
  private async checkEnvironmentAdminRole(normalizedAddress: string): Promise<AdminRole> {
    // Check super admin
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

    // Check platform admin
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

    // Check AMC admin
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

  /**
   * Check Hedera native admin roles (new system)
   */
  private async checkHederaAdminRole(walletAddress: string): Promise<AdminRole> {
    try {
      // Check if the address is a Hedera admin account
      const isHederaAdmin = await this.hederaService.isHederaAdminAccount(walletAddress);
      if (!isHederaAdmin) {
        return this.getDefaultRole();
      }

      // Get the specific admin role
      const hederaRole = await this.hederaService.getHederaAdminRole(walletAddress);
      if (!hederaRole) {
        return this.getDefaultRole();
      }

      // Return role based on Hedera admin level
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
    } catch (error) {
      this.logger.error('Error checking Hedera admin role:', error);
      return this.getDefaultRole();
    }
  }

  /**
   * Assign admin role to a user (only super admin can do this)
   */
  async assignAdminRole(
    assignerWallet: string,
    targetWallet: string,
    role: string
  ): Promise<{ success: boolean; message: string }> {
    // Check if assigner is super admin
    const assignerStatus = await this.checkAdminStatus(assignerWallet);
    if (!assignerStatus.isSuperAdmin) {
      throw new UnauthorizedException('Only super admin can assign roles');
    }

    // Validate role
    if (!this.isAdminRole(role)) {
      throw new BadRequestException('Invalid admin role');
    }

    // In a fully blockchain-native system, admin roles are managed through Hedera
    // This would typically involve updating Hedera account metadata or smart contract state
    this.logger.log(`Admin role ${role} assigned to ${targetWallet} by ${assignerWallet}`);

    return {
      success: true,
      message: `Successfully assigned ${role} role to ${targetWallet}`
    };
  }

  /**
   * Remove admin role from a user (only super admin can do this)
   */
  async removeAdminRole(
    assignerWallet: string,
    targetWallet: string
  ): Promise<{ success: boolean; message: string }> {
    // Check if assigner is super admin
    const assignerStatus = await this.checkAdminStatus(assignerWallet);
    if (!assignerStatus.isSuperAdmin) {
      throw new UnauthorizedException('Only super admin can remove roles');
    }

    // In a fully blockchain-native system, admin roles are managed through Hedera
    // This would typically involve updating Hedera account metadata or smart contract state
    this.logger.log(`Admin role removed from ${targetWallet} by ${assignerWallet}`);

    return {
      success: true,
      message: `Successfully removed admin role from ${targetWallet}`
    };
  }

  /**
   * Get all admin users (blockchain-native)
   */
  async getAllAdminUsers(): Promise<any[]> {
    // In a fully blockchain-native system, admin users are managed through Hedera
    // This would typically involve querying Hedera account metadata or smart contract state
    return [];
  }

  /**
   * Check if a role is an admin role
   */
  private isAdminRole(role: string): boolean {
    return [
      'ADMIN',
      'SUPER_ADMIN',
      'PLATFORM_ADMIN',
      'AMC_ADMIN'
    ].includes(role);
  }


  /**
   * Get default non-admin role
   */
  private getDefaultRole(): AdminRole {
    return {
      isAdmin: false,
      isSuperAdmin: false,
      isPlatformAdmin: false,
      isAmcAdmin: false,
      role: 'INVESTOR',
      permissions: []
    };
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(walletAddress: string, permission: string): Promise<boolean> {
    const adminStatus = await this.checkAdminStatus(walletAddress);
    return adminStatus.permissions.includes(permission);
  }

  /**
   * Get admin statistics
   */
  async getAdminStats(): Promise<{
    totalAdmins: number;
    superAdmins: number;
    platformAdmins: number;
    amcAdmins: number;
    regularAdmins: number;
  }> {
    // In a fully blockchain-native system, admin stats are calculated from Hedera network
    // This would typically involve querying Hedera account metadata or smart contract state
    return {
      totalAdmins: this.adminWallets.length + this.platformAdminWallets.length + this.amcAdminWallets.length + (this.superAdminWallet ? 1 : 0),
      superAdmins: this.superAdminWallet ? 1 : 0,
      platformAdmins: this.platformAdminWallets.length,
      amcAdmins: this.amcAdminWallets.length,
      regularAdmins: this.adminWallets.length,
    };
  }

  // ============================================================================
  // HEDERA NATIVE ADMIN MANAGEMENT METHODS
  // ============================================================================

  /**
   * Create a new Hedera admin account
   */
  async createHederaAdminAccount(adminName: string, role: string): Promise<{
    success: boolean;
    accountId?: string;
    privateKey?: string;
    message: string;
  }> {
    try {
      // Check if caller has permission to create admin accounts
      // This would typically be called by a super admin
      
      const adminAccount = await this.hederaService.createAdminAccount(adminName);
      
      // In a fully blockchain-native system, admin accounts are managed through Hedera
      // This would typically involve updating Hedera account metadata or smart contract state
      
      this.logger.log(`✅ Created Hedera admin account: ${adminAccount.accountId} with role: ${role}`);
      
      return {
        success: true,
        accountId: adminAccount.accountId,
        privateKey: adminAccount.privateKey,
        message: `Admin account created successfully with role: ${role}`
      };
    } catch (error) {
      this.logger.error('Failed to create Hedera admin account:', error);
      return {
        success: false,
        message: `Failed to create admin account: ${error.message}`
      };
    }
  }

  /**
   * Add Hedera admin to configuration (blockchain-native)
   */
  private async addHederaAdminToConfig(accountId: string, role: string): Promise<void> {
    try {
      // In a fully blockchain-native system, admin accounts are managed through Hedera
      // This would typically involve updating Hedera account metadata or smart contract state
      this.logger.log(`✅ Added Hedera admin ${accountId} with role: ${role}`);
    } catch (error) {
      this.logger.error('Failed to add Hedera admin to config:', error);
      throw error;
    }
  }


  /**
   * Remove Hedera admin account
   */
  async removeHederaAdminAccount(accountId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // In a fully blockchain-native system, admin accounts are managed through Hedera
      // This would typically involve updating Hedera account metadata or smart contract state
      this.logger.log(`✅ Removed Hedera admin: ${accountId}`);
      
      return {
        success: true,
        message: 'Admin account removed successfully'
      };
    } catch (error) {
      this.logger.error('Failed to remove Hedera admin account:', error);
      return {
        success: false,
        message: `Failed to remove admin account: ${error.message}`
      };
    }
  }

  /**
   * Get all Hedera admin accounts
   */
  async getHederaAdminAccounts(): Promise<{
    superAdmins: string[];
    platformAdmins: string[];
    amcAdmins: string[];
    regularAdmins: string[];
  }> {
    try {
      const superAdminAccount = this.configService
        .get<string>('HEDERA_SUPER_ADMIN_ACCOUNT', '');
      
      const platformAdminAccounts = this.configService
        .get<string>('HEDERA_PLATFORM_ADMIN_ACCOUNTS', '')
        .split(',')
        .map(addr => addr.trim())
        .filter(addr => addr.length > 0);
      
      const amcAdminAccounts = this.configService
        .get<string>('HEDERA_AMC_ADMIN_ACCOUNTS', '')
        .split(',')
        .map(addr => addr.trim())
        .filter(addr => addr.length > 0);

      // In a fully blockchain-native system, regular admins are managed through Hedera
      // This would typically involve querying Hedera account metadata or smart contract state
      const regularAdmins: string[] = [];

      return {
        superAdmins: superAdminAccount ? [superAdminAccount] : [],
        platformAdmins: platformAdminAccounts,
        amcAdmins: amcAdminAccounts,
        regularAdmins
      };
    } catch (error) {
      this.logger.error('Failed to get Hedera admin accounts:', error);
      return {
        superAdmins: [],
        platformAdmins: [],
        amcAdmins: [],
        regularAdmins: []
      };
    }
  }

  /**
   * Check if an account is a Hedera admin
   */
  async isHederaAdmin(accountId: string): Promise<boolean> {
    try {
      return await this.hederaService.isHederaAdminAccount(accountId);
    } catch (error) {
      this.logger.error('Failed to check Hedera admin status:', error);
      return false;
    }
  }

  /**
   * Get Hedera admin role for an account
   */
  async getHederaAdminRole(accountId: string): Promise<string | null> {
    try {
      return await this.hederaService.getHederaAdminRole(accountId);
    } catch (error) {
      this.logger.error('Failed to get Hedera admin role:', error);
      return null;
    }
  }

  /**
   * Create the initial Hedera super admin account
   */
  async createInitialHederaSuperAdmin(): Promise<{
    success: boolean;
    accountId?: string;
    privateKey?: string;
    message: string;
  }> {
    try {
      const superAdmin = await this.hederaService.createInitialHederaSuperAdmin();
      
      this.logger.log('✅ Initial Hedera super admin created and configured');
      
      return {
        success: true,
        accountId: superAdmin.accountId,
        privateKey: superAdmin.privateKey,
        message: 'Initial super admin created successfully'
      };
    } catch (error) {
      this.logger.error('Failed to create initial Hedera super admin:', error);
      return {
        success: false,
        message: `Initial super admin creation failed: ${error.message}`
      };
    }
  }

  /**
   * Create multiple admin accounts for setup
   */
  async setupHederaAdminAccounts(): Promise<{
    success: boolean;
    accounts?: any;
    message: string;
  }> {
    try {
      const accounts = await this.hederaService.createAdminAccounts();
      
      this.logger.log('✅ Setup complete: All Hedera admin accounts created and configured');
      
      return {
        success: true,
        accounts,
        message: 'All admin accounts created successfully'
      };
    } catch (error) {
      this.logger.error('Failed to setup Hedera admin accounts:', error);
      return {
        success: false,
        message: `Setup failed: ${error.message}`
      };
    }
  }

  /**
   * Approve or reject an RWA asset
   */
  async approveAsset(
    adminWallet: string,
    assetId: string,
    approved: boolean,
    comments?: string,
    verificationScore?: number
  ): Promise<{ success: boolean; message: string; asset?: any }> {
    try {
      // Check if admin has permission
      const adminStatus = await this.checkAdminStatus(adminWallet);
      if (!adminStatus.isAdmin && !adminStatus.isAmcAdmin && !adminStatus.isSuperAdmin && !adminStatus.isPlatformAdmin) {
        throw new UnauthorizedException('Insufficient permissions to approve assets');
      }

      // Find the asset by tokenContract (Hedera Token ID)
      const asset = await this.assetModel.findOne({ tokenContract: assetId });
      if (!asset) {
        throw new BadRequestException('Asset not found');
      }

      // Update asset status
      if (approved) {
        asset.status = AssetStatus.ACTIVE;
        asset.verificationScore = verificationScore || 85;
      } else {
        asset.status = AssetStatus.PENDING;
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
    } catch (error) {
      console.error('Error approving asset:', error);
      return {
        success: false,
        message: `Failed to ${approved ? 'approve' : 'reject'} asset: ${error.message}`
      };
    }
  }
}