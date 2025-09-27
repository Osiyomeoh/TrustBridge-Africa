import { TradingService, ListDigitalAssetForSaleDto, MakeOfferDto, AcceptOfferDto } from './trading.service';
export declare class TradingController {
    private readonly tradingService;
    constructor(tradingService: TradingService);
    listDigitalAssetForSale(listingDto: ListDigitalAssetForSaleDto): Promise<{
        transactionId: string;
    }>;
    makeOfferOnDigitalAsset(offerDto: MakeOfferDto): Promise<{
        transactionId: string;
    }>;
    getDigitalAssetOffers(assetId: string): Promise<import("./trading.service").DigitalAssetOffer[]>;
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
        listings: import("./trading.service").DigitalAssetListing[];
        offers: import("./trading.service").DigitalAssetOffer[];
        trades: any[];
    }>;
}
