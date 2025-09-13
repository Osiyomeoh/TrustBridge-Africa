import { AdminService } from './admin.service';
export declare class UpdateUserStatusDto {
    status: 'active' | 'inactive' | 'suspended';
}
export declare class UpdateAssetStatusDto {
    status: string;
}
export declare class UpdateAttestorStatusDto {
    status: 'active' | 'inactive' | 'suspended';
}
export declare class SendSystemAlertDto {
    alertType: string;
    message: string;
    recipients: string[];
}
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getDashboardMetrics(): Promise<{
        success: boolean;
        data: import("./admin.service").DashboardMetrics;
        message: string;
    }>;
    getSystemStats(): Promise<{
        success: boolean;
        data: import("./admin.service").SystemStats;
        message: string;
    }>;
    getUserManagementData(): Promise<{
        success: boolean;
        data: import("./admin.service").UserManagementData;
        message: string;
    }>;
    getAssetManagementData(): Promise<{
        success: boolean;
        data: import("./admin.service").AssetManagementData;
        message: string;
    }>;
    getVerificationManagementData(): Promise<{
        success: boolean;
        data: import("./admin.service").VerificationManagementData;
        message: string;
    }>;
    getSystemHealth(): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getSystemLogs(limit?: string): Promise<{
        success: boolean;
        data: any[];
        message: string;
    }>;
    updateUserStatus(userId: string, updateUserStatusDto: UpdateUserStatusDto): Promise<{
        success: boolean;
        message: string;
    }>;
    updateAssetStatus(assetId: string, updateAssetStatusDto: UpdateAssetStatusDto): Promise<{
        success: boolean;
        message: string;
    }>;
    updateAttestorStatus(attestorId: string, updateAttestorStatusDto: UpdateAttestorStatusDto): Promise<{
        success: boolean;
        message: string;
    }>;
    sendSystemAlert(sendSystemAlertDto: SendSystemAlertDto): Promise<{
        success: boolean;
        message: string;
    }>;
    generateVerificationReport(startDate?: string, endDate?: string): Promise<{
        success: boolean;
        data: {
            period: {
                startDate: string;
                endDate: string;
            };
            totalVerifications: number;
            completedVerifications: number;
            averageScore: number;
            topAttestors: any[];
            trends: any[];
        };
        message: string;
    }>;
    generateInvestmentReport(startDate?: string, endDate?: string): Promise<{
        success: boolean;
        data: {
            period: {
                startDate: string;
                endDate: string;
            };
            totalInvestments: number;
            totalVolume: number;
            averageAPY: number;
            topAssets: any[];
            trends: any[];
        };
        message: string;
    }>;
    generateFinancialReport(startDate?: string, endDate?: string): Promise<{
        success: boolean;
        data: {
            period: {
                startDate: string;
                endDate: string;
            };
            totalRevenue: number;
            totalFees: number;
            totalPayouts: number;
            netProfit: number;
            breakdown: {
                verificationFees: number;
                transactionFees: number;
                managementFees: number;
            };
        };
        message: string;
    }>;
    getSystemSettings(): Promise<{
        success: boolean;
        data: {
            verification: {
                autoApprovalThreshold: number;
                maxVerificationTime: number;
                requiredAttestors: number;
            };
            fees: {
                verificationFee: number;
                transactionFee: number;
                managementFee: number;
            };
            notifications: {
                emailEnabled: boolean;
                smsEnabled: boolean;
                pushEnabled: boolean;
            };
            blockchain: {
                network: string;
                gasLimit: number;
                confirmationBlocks: number;
            };
        };
        message: string;
    }>;
    updateSystemSettings(settings: any): Promise<{
        success: boolean;
        message: string;
    }>;
    createSystemBackup(): Promise<{
        success: boolean;
        data: {
            id: string;
            timestamp: Date;
            size: string;
            status: string;
        };
        message: string;
    }>;
    scheduleMaintenance(body: {
        scheduledAt: Date;
        duration: number;
        message: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
