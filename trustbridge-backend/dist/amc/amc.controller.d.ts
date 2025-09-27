import { AMCService, RegisterAMCDto, ScheduleInspectionDto, CompleteInspectionDto, InitiateLegalTransferDto } from './amc.service';
export declare class AMCController {
    private readonly amcService;
    constructor(amcService: AMCService);
    registerAMC(registerDto: RegisterAMCDto): Promise<{
        amcId: string;
        transactionId: string;
    }>;
    scheduleInspection(scheduleDto: ScheduleInspectionDto): Promise<{
        transactionId: string;
    }>;
    completeInspection(completeDto: CompleteInspectionDto): Promise<{
        transactionId: string;
    }>;
    initiateLegalTransfer(transferDto: InitiateLegalTransferDto): Promise<{
        transactionId: string;
    }>;
    completeLegalTransfer(assetId: string, body: {
        manager: string;
    }): Promise<{
        transactionId: string;
    }>;
    getInspectionRecord(assetId: string): Promise<import("./amc.service").InspectionRecord>;
    getLegalTransferRecord(assetId: string): Promise<import("./amc.service").LegalTransferRecord>;
    getAMCStats(): Promise<{
        totalAMCs: number;
        activeAMCs: number;
        totalInspections: number;
        completedInspections: number;
        totalTransfers: number;
        completedTransfers: number;
    }>;
}
