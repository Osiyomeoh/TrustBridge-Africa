import { HederaService } from './hedera.service';
import { TrustTokenService } from './trust-token.service';
import { HscsContractService } from './hscs-contract.service';
import { HscsHybridService } from './hscs-hybrid.service';
import { MarketplaceService } from './marketplace.service';
import { HcsService } from './hcs.service';
import { TokenizationRequestDto } from './dto/tokenization-request.dto';
export declare class SettlementRequestDto {
    assetId: string;
    buyer: string;
    seller: string;
    amount: number;
    deliveryDeadline: Date;
}
export declare class KYCRequestDto {
    accountId: string;
    tokenId: string;
    kycStatus: 'GRANT' | 'REVOKE';
    reason?: string;
}
export declare class FreezeRequestDto {
    accountId: string;
    tokenId: string;
    freezeStatus: 'FREEZE' | 'UNFREEZE';
    reason?: string;
}
export declare class TokenAssociationRequestDto {
    accountId: string;
    tokenId: string;
    action: 'ASSOCIATE' | 'DISSOCIATE';
}
export declare class HederaController {
    private readonly hederaService;
    private readonly trustTokenService;
    private readonly hscsContractService;
    private readonly hscsHybridService;
    private readonly marketplaceService;
    private readonly hcsService;
    constructor(hederaService: HederaService, trustTokenService: TrustTokenService, hscsContractService: HscsContractService, hscsHybridService: HscsHybridService, marketplaceService: MarketplaceService, hcsService: HcsService);
    getHederaOverview(): Promise<{
        success: boolean;
        data: {
            status: string;
            availableEndpoints: string[];
        };
        message: string;
    }>;
    getStatus(): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    tokenizeAsset(tokenizationRequest: TokenizationRequestDto): Promise<{
        success: boolean;
        data: {
            tokenId: string;
            transactionId: string;
        };
        message: string;
    }>;
    mintTokens(tokenId: string, body: {
        amount: number;
        recipient: string;
    }): Promise<{
        success: boolean;
        data: {
            transactionId: string;
        };
        message: string;
    }>;
    transferTokens(body: {
        tokenId: string;
        from: string;
        to: string;
        amount: number;
    }): Promise<{
        success: boolean;
        data: {
            transactionId: string;
        };
        message: string;
    }>;
    createSettlement(settlementRequest: SettlementRequestDto): Promise<{
        success: boolean;
        data: {
            transactionId: string;
        };
        message: string;
    }>;
    getAccountBalance(accountId: string): Promise<{
        success: boolean;
        data: {
            accountId: string;
            balance: string;
        };
        message: string;
    }>;
    getTokenBalance(accountId: string, tokenId: string): Promise<{
        success: boolean;
        data: {
            accountId: string;
            tokenId: string;
            balance: number;
        };
        message: string;
    }>;
    submitHCSMessage(body: {
        topicId: string;
        message: any;
    }): Promise<{
        success: boolean;
        data: {
            transactionId: string;
        };
        message: string;
    }>;
    uploadFile(body: {
        content: string;
        fileName: string;
    }): Promise<{
        success: boolean;
        data: {
            fileId: string;
        };
        message: string;
    }>;
    createDualTokenization(body: {
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
        success: boolean;
        data: {
            erc721TokenId: string;
            erc721AssetId: string;
            htsTokenId: string;
            htsTransactionId: string;
            hcsMessageId: string;
            hfsFileId?: string;
        };
        message: string;
    }>;
    getUserAssets(userAddress: string): Promise<{
        success: boolean;
        data: {
            erc721Assets: any[];
            htsAssets: any[];
            totalAssets: number;
            totalValue: number;
        };
        message: string;
    }>;
    getMarketplaceData(): Promise<{
        success: boolean;
        data: {
            assets: any[];
            totalListings: number;
            totalValue: number;
        };
        message: string;
    }>;
    approveAsset(body: {
        tokenId: string;
        approved: boolean;
        comments?: string;
        verificationScore?: number;
    }): Promise<{
        success: boolean;
        data: any;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    rejectAsset(body: {
        tokenId: string;
        approved: boolean;
        comments?: string;
    }): Promise<{
        success: boolean;
        data: any;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    updateDualTokenization(body: {
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
        success: boolean;
        data: {
            erc721TokenId: string;
            erc721AssetId: string;
            htsTokenId: string;
            htsTransactionId: string;
            hcsMessageId: string;
            hfsFileId?: string;
        };
        message: string;
    }>;
    healthCheck(): Promise<{
        success: boolean;
        data: {
            healthy: boolean;
        };
        message: string;
    }>;
    testHTSSimple(): Promise<{
        success: boolean;
        data: {
            tokenId: string;
            transactionId: string;
            balance: string;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    testHFSHCS(): Promise<{
        success: boolean;
        data: {
            hfsFileId: string;
            hcsMessageId: string;
            hfsTransactionId: string;
            hcsTransactionId: string;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    grantKYC(kycRequest: KYCRequestDto): Promise<{
        success: boolean;
        data: {
            transactionId: string;
        };
        message: string;
    }>;
    revokeKYC(kycRequest: KYCRequestDto): Promise<{
        success: boolean;
        data: {
            transactionId: string;
        };
        message: string;
    }>;
    freezeAccount(freezeRequest: FreezeRequestDto): Promise<{
        success: boolean;
        data: {
            transactionId: string;
        };
        message: string;
    }>;
    unfreezeAccount(freezeRequest: FreezeRequestDto): Promise<{
        success: boolean;
        data: {
            transactionId: string;
        };
        message: string;
    }>;
    freezeToken(freezeRequest: FreezeRequestDto): Promise<{
        success: boolean;
        data: {
            transactionId: string;
        };
        message: string;
    }>;
    associateToken(associationRequest: TokenAssociationRequestDto): Promise<{
        success: boolean;
        data: {
            transactionId: string;
        };
        message: string;
    }>;
    dissociateToken(associationRequest: TokenAssociationRequestDto): Promise<{
        success: boolean;
        data: {
            transactionId: string;
        };
        message: string;
    }>;
    getTokenInfo(tokenId: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getAccountInfo(accountId: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    completeKYCWorkflow(body: {
        accountId: string;
        tokenId: string;
        kycStatus: 'GRANT' | 'REVOKE';
    }): Promise<{
        success: boolean;
        data: {
            associateTxId?: string;
            kycTxId: string;
            status: string;
        };
        message: string;
    }>;
    completeFreezeWorkflow(body: {
        accountId: string;
        tokenId: string;
        freezeStatus: 'FREEZE' | 'UNFREEZE';
    }): Promise<{
        success: boolean;
        data: {
            freezeTxId: string;
            status: string;
        };
        message: string;
    }>;
    initializeTrustToken(): Promise<{
        success: boolean;
        data: {
            tokenId: string;
        };
        message: string;
    }>;
    mintTrustTokens(body: {
        toAccountId: string;
        amount: number;
    }): Promise<{
        success: boolean;
        data: {
            transactionId: string;
        };
        message: string;
    }>;
    getTrustTokenBalance(accountId: string): Promise<{
        success: boolean;
        data: {
            balance: number;
        };
        message: string;
    }>;
    getTrustTokenInfo(): Promise<{
        success: boolean;
        data: {
            tokenId: string;
        };
        message: string;
    }>;
    exchangeHbarForTrust(exchangeRequest: any): Promise<{
        success: boolean;
        data: {
            transactionId: string;
            trustAmount: number;
            distribution: any;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    burnTrustTokens(burnRequest: any): Promise<{
        success: boolean;
        data: {
            transactionId: string;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getExchangeInfo(): Promise<{
        success: boolean;
        data: any;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    calculateNftCreationFee(feeRequest: any): Promise<{
        success: boolean;
        data: {
            fee: number;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    stakeTrustTokens(stakeRequest: any): Promise<{
        success: boolean;
        data: {
            transactionId: string;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    hybridExchangeHbarForTrust(exchangeRequest: any): Promise<{
        success: boolean;
        data: {
            transactionId: string;
            trustAmount: number;
            distribution: any;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    hybridBurnTrustTokens(burnRequest: any): Promise<{
        success: boolean;
        data: {
            transactionId: string;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    hybridCalculateNftCreationFee(feeRequest: any): Promise<{
        success: boolean;
        data: {
            fee: number;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    hybridGetTrustTokenBalance(accountId: string): Promise<{
        success: boolean;
        data: {
            balance: number;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    hybridStakeTrustTokens(stakeRequest: any): Promise<{
        success: boolean;
        data: {
            transactionId: string;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    marketplaceListNFT(listingData: {
        nftTokenId: string;
        serialNumber: number;
        price: number;
        sellerAccountId: string;
    }): Promise<{
        success: boolean;
        data: {
            listingId: number;
            transactionId: string;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    marketplaceBuyNFT(listingId: number, buyData: {
        buyerAccountId: string;
        buyerPrivateKey?: string;
    }): Promise<{
        success: boolean;
        data: {
            transactionId: string;
            seller: string;
            price: number;
            platformFee: number;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    marketplaceCancelListing(listingId: number): Promise<{
        success: boolean;
        data: {
            transactionId: string;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    marketplaceUpdatePrice(priceData: {
        listingId: number;
        newPrice: number;
    }): Promise<{
        success: boolean;
        data: {
            transactionId: string;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    marketplaceGetListing(listingId: number): Promise<{
        success: boolean;
        data: {
            seller: string;
            nftAddress: string;
            serialNumber: number;
            price: number;
            isActive: boolean;
            listedAt: number;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    marketplaceCheckListing(nftTokenId: string, serialNumber: number): Promise<{
        success: boolean;
        data: {
            isListed: boolean;
            listingId: number;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    marketplaceGetConfig(): Promise<{
        success: boolean;
        data: {
            trustToken: string;
            treasury: string;
            feeBps: number;
            owner: string;
            activeListings: number;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    marketplaceTransferNFT(transferData: {
        nftTokenId: string;
        serialNumber: number;
        buyerAccountId: string;
        listingId: number;
    }): Promise<{
        success: boolean;
        data: {
            transactionId: string;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    marketplaceReturnNFT(returnData: {
        nftTokenId: string;
        serialNumber: number;
        sellerAccountId: string;
    }): Promise<{
        success: boolean;
        data: {
            transactionId: string;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    submitMarketplaceEvent(event: any): Promise<{
        success: boolean;
        data: {
            transactionId: string;
            topicId: string;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getMarketplaceEvents(limit?: number, assetTokenId?: string): Promise<{
        success: boolean;
        data: {
            events: import("./hcs.service").MarketplaceEvent[];
            topicId: string;
            count: number;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getAssetEvents(assetTokenId: string): Promise<{
        success: boolean;
        data: {
            events: import("./hcs.service").MarketplaceEvent[];
            assetTokenId: string;
            count: number;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    submitOfferMessage(message: any): Promise<{
        success: boolean;
        data: {
            transactionId: string;
            topicId: string;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getOfferMessages(assetTokenId: string): Promise<{
        success: boolean;
        data: {
            messages: import("./hcs.service").OfferMessage[];
            assetTokenId: string;
            count: number;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getTopicsInfo(): Promise<{
        success: boolean;
        data: {
            marketplaceTopic: any;
            offerTopic: any;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    createRWAAssetWithHCS(assetData: {
        nftTokenId: string;
        creator: string;
        name: string;
        type: string;
        assetType: string;
        category: string;
        totalValue: number;
        expectedAPY: number;
        maturityDate: string;
        location: string;
        description: string;
        metadataCid: string;
        displayImage: string;
        documentUrls: string[];
        compressedHash: string;
    }): Promise<{
        success: boolean;
        data: {
            nftTokenId: string;
            hcsTransactionId: string;
            topicId: string;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getTrustBridgeRWAAssets(): Promise<{
        success: boolean;
        data: {
            assets: any[];
            count: number;
            totalMessages: number;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    updateRWAAssetStatus(statusData: {
        tokenId: string;
        status: string;
        adminAddress: string;
        notes?: string;
    }): Promise<{
        success: boolean;
        data: {
            tokenId: string;
            status: string;
            adminAddress: string;
            timestamp: number;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getTrustBridgeTopicInfo(): Promise<{
        success: boolean;
        data: {
            topicId: string;
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
