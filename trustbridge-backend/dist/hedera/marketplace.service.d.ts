import { ConfigService } from '@nestjs/config';
export declare class MarketplaceService {
    private configService;
    private readonly logger;
    private client;
    private operatorId;
    private operatorKey;
    private marketplaceContractId;
    private trustTokenId;
    constructor(configService: ConfigService);
    private initializeClient;
    listNFT(nftTokenId: string, serialNumber: number, price: number, sellerAccountId: string): Promise<{
        listingId: number;
        transactionId: string;
    }>;
    buyNFT(listingId: number, buyerAccountId: string, buyerPrivateKey?: string): Promise<{
        transactionId: string;
        seller: string;
        price: number;
        platformFee: number;
    }>;
    private transferTrustForPurchase;
    cancelListing(listingId: number): Promise<{
        transactionId: string;
    }>;
    updatePrice(listingId: number, newPrice: number): Promise<{
        transactionId: string;
    }>;
    getListing(listingId: number): Promise<{
        seller: string;
        nftAddress: string;
        serialNumber: number;
        price: number;
        isActive: boolean;
        listedAt: number;
    }>;
    isNFTListed(nftTokenId: string, serialNumber: number): Promise<{
        isListed: boolean;
        listingId: number;
    }>;
    calculatePlatformFee(price: number): Promise<number>;
    getMarketplaceConfig(): Promise<{
        trustToken: string;
        treasury: string;
        feeBps: number;
        owner: string;
        activeListings: number;
    }>;
    transferNFTFromEscrow(nftTokenId: string, serialNumber: number, buyerAccountId: string): Promise<{
        transactionId: string;
    }>;
}
