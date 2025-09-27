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
export interface HCSTopicMessage {
    topicId: string;
    message: string;
    timestamp: Date;
    sequenceNumber: number;
}
export interface HCSTopic {
    topicId: string;
    topicName: string;
    adminKey?: PrivateKey;
    submitKey?: PrivateKey;
    autoRenewAccountId?: string;
    autoRenewPeriod?: number;
}
export interface HTSToken {
    tokenId: string;
    tokenName: string;
    tokenSymbol: string;
    decimals: number;
    initialSupply: number;
    maxSupply?: number;
    tokenType: 'FUNGIBLE_COMMON' | 'NON_FUNGIBLE_UNIQUE';
    supplyType: 'INFINITE' | 'FINITE';
    treasuryAccountId: string;
    adminKey?: PrivateKey;
    kycKey?: PrivateKey;
    freezeKey?: PrivateKey;
    supplyKey?: PrivateKey;
    wipeKey?: PrivateKey;
    pauseKey?: PrivateKey;
}
export interface HFSFile {
    fileId: string;
    fileName: string;
    fileSize: number;
    fileHash: string;
    expirationTime?: Date;
    adminKey?: PrivateKey;
    waclKey?: PrivateKey;
}
export interface HFSFileUpload {
    fileName: string;
    fileContent: Buffer;
    fileType: string;
    adminKey?: PrivateKey;
    waclKey?: PrivateKey;
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
    createDigitalAsset(assetData: {
        category: number;
        assetType: string;
        name: string;
        location: string;
        totalValue: string;
        imageURI: string;
        description: string;
    }): Promise<{
        assetId: string;
        transactionId: string;
    }>;
    createRWAAsset(assetData: {
        category: number;
        assetType: string;
        name: string;
        location: string;
        totalValue: string;
        maturityDate: number;
        evidenceHashes: string[];
        documentTypes: string[];
        imageURI: string;
        documentURI: string;
        description: string;
    }): Promise<{
        assetId: string;
        transactionId: string;
    }>;
    verifyAsset(assetId: string, verificationLevel: number): Promise<string>;
    listDigitalAssetForSale(assetId: string, price: string, expiry: number): Promise<string>;
    makeOfferOnDigitalAsset(assetId: string, offerAmount: string, expiry: number): Promise<string>;
    createPool(poolData: {
        name: string;
        description: string;
        managementFee: number;
        performanceFee: number;
    }): Promise<{
        poolId: string;
        transactionId: string;
    }>;
    investInPool(poolId: string, amount: string): Promise<string>;
    registerAMC(name: string, description: string, jurisdiction: string): Promise<string>;
    scheduleInspection(assetId: string, inspector: string, inspectionTime: number): Promise<string>;
    addPoolInvestor(poolContract: string, investor: string, amount: number): Promise<{
        transactionId: string;
    }>;
    distributePoolRewards(poolContract: string, amount: number): Promise<{
        transactionId: string;
    }>;
    updatePoolStatus(poolContract: string, status: number): Promise<{
        transactionId: string;
    }>;
    getPoolPerformance(poolContract: string): Promise<{
        totalReturn: number;
        monthlyReturn: number;
        volatility: number;
        sharpeRatio: number;
        maxDrawdown: number;
    }>;
    createHCSTopic(topicName: string, adminKey?: PrivateKey, submitKey?: PrivateKey): Promise<{
        topicId: string;
        transactionId: string;
    }>;
    submitHCSTopicMessage(topicId: string, message: string): Promise<{
        transactionId: string;
        sequenceNumber: number;
    }>;
    getHCSTopicInfo(topicId: string): Promise<{
        topicId: string;
        topicMemo: string;
        runningHash: string;
        sequenceNumber: number;
        expirationTime: Date;
        adminKey?: string;
        submitKey?: string;
    }>;
    createDualTokenization(assetData: {
        name: string;
        symbol: string;
        description: string;
        imageURI: string;
        owner: string;
        category: string;
        assetType: string;
        totalValue: string;
        erc721TokenId: string;
        erc721AssetId: string;
    }): Promise<{
        erc721TokenId: string;
        erc721AssetId: string;
        htsTokenId: string;
        htsTransactionId: string;
        hcsMessageId: string;
        hfsFileId?: string;
    }>;
    createHTSToken(tokenData: HTSToken): Promise<{
        tokenId: string;
        transactionId: string;
    }>;
    getHTSTokenInfo(tokenId: string): Promise<{
        tokenId: string;
        tokenName: string;
        tokenSymbol: string;
        decimals: number;
        totalSupply: number;
        maxSupply?: number;
        tokenType: string;
        supplyType: string;
        treasuryAccountId: string;
        adminKey?: string;
        kycKey?: string;
        freezeKey?: string;
        supplyKey?: string;
        wipeKey?: string;
        pauseKey?: string;
    }>;
    getUserAssets(userAddress: string): Promise<{
        erc721Assets: any[];
        htsAssets: any[];
        totalAssets: number;
        totalValue: number;
    }>;
    private getERC721Assets;
    private getHTSAssets;
    getMarketplaceData(): Promise<{
        assets: any[];
        totalListings: number;
        totalValue: number;
    }>;
    private getHTSMarketplaceData;
    private getERC721MarketplaceData;
    private deduplicateAssets;
    uploadHFSToFile(fileData: HFSFileUpload): Promise<{
        fileId: string;
        transactionId: string;
    }>;
    getHFSFileInfo(fileId: string): Promise<{
        fileId: string;
        fileSize: number;
        expirationTime: Date;
        isDeleted: boolean;
        keys?: string[];
    }>;
    getHFSFileContents(fileId: string): Promise<Buffer>;
    updateDualTokenization(assetData: {
        erc721TokenId: string;
        erc721AssetId: string;
        name: string;
        symbol: string;
        description: string;
        imageURI: string;
        owner: string;
        category: string;
        assetType: string;
        totalValue: string;
    }): Promise<{
        erc721TokenId: string;
        erc721AssetId: string;
        htsTokenId: string;
        htsTransactionId: string;
        hcsMessageId: string;
        hfsFileId?: string;
    }>;
    testSimpleHTSToken(): Promise<{
        tokenId: string;
        transactionId: string;
        balance: string;
    }>;
    testHFSHCSIntegration(): Promise<{
        hfsFileId: string;
        hcsMessageId: string;
        hfsTransactionId: string;
        hcsTransactionId: string;
    }>;
}
