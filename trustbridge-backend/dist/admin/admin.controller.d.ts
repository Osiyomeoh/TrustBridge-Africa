import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getAdminStats(): Promise<{
        success: boolean;
        data: {
            totalAttestors: number;
            pendingApplications: number;
            approvedAttestors: number;
            rejectedAttestors: number;
            totalVerifications: number;
            activeVerifications: number;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
}
