import { AdminService, AdminRole } from './admin.service';
import { UserRole } from '../schemas/user.schema';
export declare class AssignRoleDto {
    targetWallet: string;
    role: UserRole;
}
export declare class RemoveRoleDto {
    targetWallet: string;
}
export declare class AdminController {
    private readonly adminService;
    private readonly logger;
    constructor(adminService: AdminService);
    getAdminStatus(req: any): Promise<AdminRole>;
    getAllAdminUsers(req: any): Promise<any[]>;
    getAdminStats(req: any): Promise<{
        totalAdmins: number;
        superAdmins: number;
        platformAdmins: number;
        amcAdmins: number;
        regularAdmins: number;
    }>;
    assignRole(req: any, assignRoleDto: AssignRoleDto): Promise<{
        success: boolean;
        message: string;
    }>;
    removeRole(req: any, removeRoleDto: RemoveRoleDto): Promise<{
        success: boolean;
        message: string;
    }>;
    checkPermission(req: any, permission: string): Promise<{
        walletAddress: any;
        permission: string;
        hasPermission: boolean;
    }>;
    createHederaAdmin(req: any, body: {
        adminName: string;
        role: string;
    }): Promise<{
        success: boolean;
        accountId?: string;
        privateKey?: string;
        message: string;
    }>;
    removeHederaAdmin(req: any, body: {
        accountId: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getHederaAdminAccounts(req: any): Promise<{
        superAdmins: string[];
        platformAdmins: string[];
        amcAdmins: string[];
        regularAdmins: string[];
    }>;
    checkHederaAdminStatus(req: any, accountId: string): Promise<{
        accountId: string;
        isAdmin: boolean;
        role: string;
        timestamp: string;
    }>;
    setupHederaAdminAccounts(req: any): Promise<{
        success: boolean;
        accounts?: any;
        message: string;
    }>;
    createInitialHederaSuperAdmin(req: any): Promise<{
        success: boolean;
        accountId?: string;
        privateKey?: string;
        message: string;
    }>;
    approveAsset(req: any, body: {
        assetId: string;
        approved: boolean;
        comments?: string;
        verificationScore?: number;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    rejectAsset(req: any, body: {
        assetId: string;
        approved: boolean;
        comments?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
