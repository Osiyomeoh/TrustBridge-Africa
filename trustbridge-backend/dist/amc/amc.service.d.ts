import { HederaService } from '../hedera/hedera.service';
export interface RegisterAMCDto {
    name: string;
    description: string;
    jurisdiction: string;
    manager: string;
}
export interface ScheduleInspectionDto {
    assetId: string;
    inspector: string;
    inspectionTime: number;
    manager: string;
}
export interface CompleteInspectionDto {
    assetId: string;
    status: number;
    report: string;
    evidenceHash: string;
    inspector: string;
}
export interface InitiateLegalTransferDto {
    assetId: string;
    assetOwner: string;
    legalDocuments: string;
    manager: string;
}
export interface AMC {
    amcId: string;
    name: string;
    description: string;
    jurisdiction: string;
    manager: string;
    isActive: boolean;
    createdAt: Date;
}
export interface InspectionRecord {
    assetId: string;
    inspector: string;
    scheduledTime: number;
    status: number;
    report?: string;
    evidenceHash?: string;
    completedAt?: Date;
}
export interface LegalTransferRecord {
    assetId: string;
    assetOwner: string;
    amcAddress: string;
    status: number;
    legalDocuments: string;
    initiatedAt: Date;
    completedAt?: Date;
}
export declare class AMCService {
    private readonly hederaService;
    private readonly logger;
    constructor(hederaService: HederaService);
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
    completeLegalTransfer(assetId: string, manager: string): Promise<{
        transactionId: string;
    }>;
    getInspectionRecord(assetId: string): Promise<InspectionRecord>;
    getLegalTransferRecord(assetId: string): Promise<LegalTransferRecord>;
    getAMCStats(): Promise<{
        totalAMCs: number;
        activeAMCs: number;
        totalInspections: number;
        completedInspections: number;
        totalTransfers: number;
        completedTransfers: number;
    }>;
}
