import { HederaService } from '../hedera/hedera.service';
export interface ListDigitalAssetForSaleDto {
    assetId: string;
    price: string;
    expiry: number;
    seller: string;
}
export interface MakeOfferDto {
    assetId: string;
    offerAmount: string;
    expiry: number;
    buyer: string;
}
export interface AcceptOfferDto {
    offerId: string;
    seller: string;
}
export interface DigitalAssetListing {
    assetId: string;
    seller: string;
    price: string;
    expiry: number;
    isActive: boolean;
    createdAt: Date;
}
export interface DigitalAssetOffer {
    offerId: string;
    assetId: string;
    buyer: string;
    offerAmount: string;
    expiry: number;
    isActive: boolean;
    createdAt: Date;
}
export declare class TradingService {
    private readonly hederaService;
    private readonly logger;
    constructor(hederaService: HederaService);
    listDigitalAssetForSale(listingDto: ListDigitalAssetForSaleDto): Promise<{
        transactionId: string;
    }>;
    makeOfferOnDigitalAsset(offerDto: MakeOfferDto): Promise<{
        transactionId: string;
    }>;
    getDigitalAssetOffers(assetId: string): Promise<DigitalAssetOffer[]>;
    acceptOfferOnDigitalAsset(acceptDto: AcceptOfferDto): Promise<{
        transactionId: string;
    }>;
    getTradingStats(): Promise<{
        totalVolume: number;
        totalTrades: number;
        averagePrice: number;
        activeListings: number;
        activeOffers: number;
    }>;
    getAssetTradingHistory(assetId: string): Promise<{
        listings: DigitalAssetListing[];
        offers: DigitalAssetOffer[];
        trades: any[];
    }>;
}
