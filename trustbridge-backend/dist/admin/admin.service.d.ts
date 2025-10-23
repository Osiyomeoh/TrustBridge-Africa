import { ConfigService } from '@nestjs/config';
import { HederaService } from '../hedera/hedera.service';
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
export declare class AdminService {
    private configService;
    private hederaService;
    private readonly logger;
    private readonly adminWallets;
    private readonly superAdminWallet;
    private readonly platformAdminWallets;
    private readonly amcAdminWallets;
    constructor(configService: ConfigService, hederaService: HederaService);
    checkAdminStatus(walletAddress: string): Promise<AdminRole>;
    private checkEnvironmentAdminRole;
    private checkHederaAdminRole;
    assignAdminRole(assignerWallet: string, targetWallet: string, role: string): Promise<{
        success: boolean;
        message: string;
    }>;
    removeAdminRole(assignerWallet: string, targetWallet: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getAllAdminUsers(): Promise<any[]>;
    private isAdminRole;
    private getDefaultRole;
    hasPermission(walletAddress: string, permission: string): Promise<boolean>;
    getAdminStats(): Promise<{
        totalAdmins: number;
        superAdmins: number;
        platformAdmins: number;
        amcAdmins: number;
        regularAdmins: number;
    }>;
    createHederaAdminAccount(adminName: string, role: string): Promise<{
        success: boolean;
        accountId?: string;
        privateKey?: string;
        message: string;
    }>;
    private addHederaAdminToConfig;
    removeHederaAdminAccount(accountId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getHederaAdminAccounts(): Promise<{
        superAdmins: string[];
        platformAdmins: string[];
        amcAdmins: string[];
        regularAdmins: string[];
    }>;
    isHederaAdmin(accountId: string): Promise<boolean>;
    getHederaAdminRole(accountId: string): Promise<string | null>;
    createInitialHederaSuperAdmin(): Promise<{
        success: boolean;
        accountId?: string;
        privateKey?: string;
        message: string;
    }>;
    setupHederaAdminAccounts(): Promise<{
        success: boolean;
        accounts?: any;
        message: string;
    }>;
    approveAsset(adminWallet: string, assetId: string, approved: boolean, comments?: string, verificationScore?: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
