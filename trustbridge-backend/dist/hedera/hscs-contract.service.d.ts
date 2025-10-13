import { ConfigService } from '@nestjs/config';
export declare class HscsContractService {
    private configService;
    private readonly logger;
    private client;
    private operatorId;
    private operatorKey;
    private trustTokenExchangeContract;
    private trustTokenBurnerContract;
    private trustTokenStakingContract;
    constructor(configService: ConfigService);
    private initializeClient;
    private loadContractAddresses;
    exchangeHbarForTrust(fromAccountId: string, hbarAmount: number, treasuryAccountId: string, operationsAccountId: string, stakingAccountId: string): Promise<{
        transactionId: string;
        trustAmount: number;
        distribution: any;
    }>;
    burnTrustTokens(fromAccountId: string, amount: number, reason?: string): Promise<string>;
    calculateNftCreationFee(verificationLevel: string, rarity: string): Promise<number>;
    getExchangeInfo(): Promise<any>;
    stakeTrustTokens(fromAccountId: string, amount: number, duration: number): Promise<string>;
    private getDefaultExchangeInfo;
    private getDefaultFee;
    setContractAddresses(exchangeContractId: string, burnerContractId: string, stakingContractId: string): void;
}
