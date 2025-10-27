import { Response } from 'express';
import { MobileService } from './mobile.service';
export declare class SubmitVerificationDto {
    assetId: string;
    evidence: {
        documents?: any[];
        photos?: any[];
        location?: {
            coordinates: {
                lat: number;
                lng: number;
            };
            address: string;
        };
        additionalInfo?: any;
    };
}
export declare class CreateInvestmentDto {
    assetId: string;
    amount: number;
}
export declare class UpdateOperationStatusDto {
    status: string;
    data?: any;
}
export declare class MobileController {
    private readonly mobileService;
    constructor(mobileService: MobileService);
    handleUSSD(body: any, res: Response): Promise<Response<any, Record<string, any>>>;
    getMobileDashboard(userId: string): Promise<{
        success: boolean;
        data: import("./mobile.service").MobileDashboard;
        message: string;
    }>;
    getUserOperations(userId: string): Promise<{
        success: boolean;
        data: import("./mobile.service").OperationTracking[];
        message: string;
    }>;
    trackOperation(operationId: string): Promise<{
        success: boolean;
        data: import("./mobile.service").OperationTracking;
        message: string;
    }>;
    getUserNotifications(userId: string): Promise<{
        success: boolean;
        data: import("./mobile.service").MobileNotification[];
        message: string;
    }>;
    markNotificationAsRead(userId: string, notificationId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getAssetDetails(assetId: string, userId: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getInvestmentDetails(investmentId: string, userId: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getMarketData(assetType: string, country?: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getBlockchainStatus(assetId: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    submitAssetForVerification(submitVerificationDto: SubmitVerificationDto & {
        userId: string;
    }): Promise<{
        success: boolean;
        data: import("./mobile.service").OperationTracking;
        message: string;
    }>;
    createInvestment(createInvestmentDto: CreateInvestmentDto & {
        userId: string;
    }): Promise<{
        success: boolean;
        data: import("./mobile.service").OperationTracking;
        message: string;
    }>;
    getAttestorOperations(attestorId: string): Promise<{
        success: boolean;
        data: import("./mobile.service").OperationTracking[];
        message: string;
    }>;
    updateOperationStatus(operationId: string, updateOperationStatusDto: UpdateOperationStatusDto): Promise<{
        success: boolean;
        message: string;
    }>;
    syncOfflineData(userId: string): Promise<{
        success: boolean;
        data: {
            lastSync: Date;
            pendingOperations: any[];
            cachedAssets: any[];
            cachedInvestments: any[];
        };
        message: string;
    }>;
    healthCheck(): Promise<{
        success: boolean;
        data: {
            status: string;
            timestamp: Date;
            version: string;
            services: {
                database: boolean;
                blockchain: boolean;
                notifications: boolean;
                websocket: boolean;
            };
        };
        message: string;
    }>;
}
