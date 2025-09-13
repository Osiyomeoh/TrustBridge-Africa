import { ConfigService } from '@nestjs/config';
import { PrivateKey } from '@hashgraph/sdk';
export interface HederaConfig {
    accountId: string;
    privateKey: string;
    network: 'testnet' | 'mainnet';
}
export interface TokenizationRequest {
    assetId: string;
    owner: string;
    totalSupply: number;
    tokenName: string;
    tokenSymbol: string;
    metadata?: any;
    enableKyc?: boolean;
    enableFreeze?: boolean;
    kycKey?: PrivateKey;
    freezeKey?: PrivateKey;
}
export interface VerificationSubmission {
    assetId: string;
    score: number;
    evidenceHash: string;
    attestorId: string;
    timestamp: Date;
}
export interface SettlementRequest {
    assetId: string;
    buyer: string;
    seller: string;
    amount: number;
    deliveryDeadline: Date;
}
export interface KYCRequest {
    accountId: string;
    tokenId: string;
    kycStatus: 'GRANT' | 'REVOKE';
    reason?: string;
}
export interface FreezeRequest {
    accountId: string;
    tokenId: string;
    freezeStatus: 'FREEZE' | 'UNFREEZE';
    reason?: string;
}
export interface TokenAssociationRequest {
    accountId: string;
    tokenId: string;
    action: 'ASSOCIATE' | 'DISSOCIATE';
}
export declare class HederaService {
    private configService;
    private readonly logger;
    private client;
    private operatorId;
    private operatorKey;
    private network;
    private readonly contracts;
    private isValidHederaEntityId;
    constructor(configService: ConfigService);
    private initializeClient;
    getNetworkStatus(): Promise<any>;
    createAssetToken(request: TokenizationRequest): Promise<{
        tokenId: string;
        transactionId: string;
    }>;
    mintTokens(tokenId: string, amount: number, recipient: string): Promise<string>;
    transferTokens(tokenId: string, from: string, to: string, amount: number): Promise<string>;
    submitVerification(verification: VerificationSubmission): Promise<string>;
    createSettlement(settlement: SettlementRequest): Promise<string>;
    createHCSMessage(topicId: string, message: any): Promise<string>;
    createHCSAssetTopic(assetId: string): Promise<string>;
    storeFileOnHFS(content: Buffer, fileName: string): Promise<string>;
    scheduleSettlement(assetId: string, maturityDate: Date, amount: number): Promise<string>;
    getTokenBalance(accountId: string, tokenId: string): Promise<number>;
    getAssetValue(assetId: string): Promise<number>;
    getAccountBalance(accountId: string): Promise<string>;
    callContract(contractId: string, functionName: string, parameters: any[]): Promise<any>;
    executeContract(contractId: string, functionName: string, parameters: any[]): Promise<string>;
    grantKYC(request: KYCRequest): Promise<string>;
    revokeKYC(request: KYCRequest): Promise<string>;
    freezeAccount(request: FreezeRequest): Promise<string>;
    unfreezeAccount(request: FreezeRequest): Promise<string>;
    freezeToken(request: FreezeRequest): Promise<string>;
    associateToken(request: TokenAssociationRequest): Promise<string>;
    dissociateToken(request: TokenAssociationRequest): Promise<string>;
    getTokenInfo(tokenId: string): Promise<any>;
    getAccountInfo(accountId: string): Promise<any>;
    completeKYCWorkflow(accountId: string, tokenId: string, kycStatus: 'GRANT' | 'REVOKE'): Promise<{
        associateTxId?: string;
        kycTxId: string;
        status: string;
    }>;
    completeFreezeWorkflow(accountId: string, tokenId: string, freezeStatus: 'FREEZE' | 'UNFREEZE'): Promise<{
        freezeTxId: string;
        status: string;
    }>;
    createEscrow(buyer: string, seller: string, amount: number, deliveryDeadline: Date, conditions: string): Promise<string>;
    releaseEscrow(escrowId: string): Promise<string>;
    refundEscrow(escrowId: string): Promise<string>;
    getContractAddresses(): any;
    isClientAvailable(): boolean;
    healthCheck(): Promise<boolean>;
    buybackTokens(amount: number): Promise<string>;
    burnTokens(amount: number): Promise<string>;
    stakeTokens(walletAddress: string, stakingType: string, amount: number, lockPeriod: number): Promise<string>;
    unstakeTokens(walletAddress: string, stakingType: string, amount: number): Promise<string>;
    getTokenPrice(tokenId: number): Promise<number>;
    transferToTreasury(amount: number): Promise<string>;
    transferToInsurancePool(amount: number): Promise<string>;
    transferToValidatorPool(amount: number): Promise<string>;
    updateContractParameters(contractAddress: string, parameterName: string, newValue: any): Promise<string>;
    addAssetType(assetType: string, minScore: number, ttlSeconds: number, requiredAttestors: number): Promise<string>;
    updateOracleConfig(oracleAddress: string, newConfig: any): Promise<string>;
    allocateTreasury(recipient: string, amount: number, purpose: string): Promise<string>;
    upgradeProtocol(newImplementation: string, upgradeData: any): Promise<string>;
}
