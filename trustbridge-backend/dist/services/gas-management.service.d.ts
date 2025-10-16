export declare class GasManagementService {
    private readonly logger;
    private client;
    private operatorId;
    private operatorKey;
    private readonly MIN_HBAR_BALANCE;
    private readonly TRUST_CONVERSION_AMOUNT;
    private readonly HBAR_PER_TRUST_RATE;
    constructor();
    private initializeClient;
    checkAndReplenishGas(): Promise<{
        hbarBalance: number;
        trustBalance: number;
        conversionNeeded: boolean;
        conversionDone: boolean;
    }>;
    private convertTRUSTToHBAR;
    getGasStatus(): Promise<{
        hbarBalance: number;
        trustBalance: number;
        estimatedDaysRemaining: number;
        needsTopUp: boolean;
    }>;
    manualTopUp(hbarAmount: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
