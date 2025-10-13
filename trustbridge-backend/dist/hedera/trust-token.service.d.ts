import { ConfigService } from '@nestjs/config';
export declare class TrustTokenService {
    private configService;
    private readonly logger;
    private client;
    private operatorId;
    private operatorKey;
    private trustTokenId;
    constructor(configService: ConfigService);
    private initializeClient;
    createTrustToken(): Promise<string>;
    mintTrustTokens(toAccountId: string, amount: number): Promise<string>;
    transferTrustTokens(fromAccountId: string, toAccountId: string, amount: number): Promise<string>;
    getTrustTokenBalance(accountId: string): Promise<number>;
    getTrustTokenId(): string | null;
    burnTrustTokens(fromAccountId: string, amount: number): Promise<string>;
    exchangeHbarForTrust(fromAccountId: string, hbarAmount: number, treasuryAccountId: string, operationsAccountId: string, stakingAccountId: string): Promise<{
        transactionId: string;
        trustAmount: number;
        distribution: any;
    }>;
    getExchangeInfo(): {
        exchangeRate: number;
        exchangeFeeRate: number;
        minExchange: number;
        distribution: {
            treasury: number;
            operations: number;
            staking: number;
            fees: number;
        };
    };
    initializeTrustToken(): Promise<string>;
}
