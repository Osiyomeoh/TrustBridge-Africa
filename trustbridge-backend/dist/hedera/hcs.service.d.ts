import { ConfigService } from '@nestjs/config';
export interface MarketplaceEvent {
    type: 'listing' | 'sale' | 'unlisting' | 'offer' | 'offer_accepted' | 'offer_rejected' | 'price_update' | 'transfer';
    assetTokenId: string;
    assetName: string;
    from?: string;
    to?: string;
    price?: number;
    oldPrice?: number;
    newPrice?: number;
    timestamp: string;
    transactionId?: string;
    metadata?: any;
}
export interface OfferMessage {
    type: 'offer' | 'counter_offer' | 'offer_message';
    assetTokenId: string;
    from: string;
    to: string;
    message: string;
    amount?: number;
    timestamp: string;
}
export declare class HcsService {
    private configService;
    private readonly logger;
    private client;
    private operatorId;
    private operatorKey;
    private marketplaceEventsTopic;
    private offerMessagesTopic;
    constructor(configService: ConfigService);
    private initializeClient;
    createMarketplaceTopics(): Promise<{
        marketplaceTopicId: string;
        offerTopicId: string;
    }>;
    submitMarketplaceEvent(event: MarketplaceEvent): Promise<string>;
    submitOfferMessage(message: OfferMessage): Promise<string>;
    getTopicInfo(topicId: string): Promise<any>;
    queryMarketplaceEvents(limit?: number, assetTokenId?: string): Promise<MarketplaceEvent[]>;
    queryOfferMessages(assetTokenId?: string, accountId?: string, limit?: number): Promise<OfferMessage[]>;
    getMarketplaceTopicId(): string | null;
    getOfferTopicId(): string | null;
    trackListing(assetTokenId: string, assetName: string, seller: string, price: number, transactionId: string): Promise<void>;
    trackSale(assetTokenId: string, assetName: string, seller: string, buyer: string, price: number, transactionId: string): Promise<void>;
    trackUnlisting(assetTokenId: string, assetName: string, seller: string, transactionId: string): Promise<void>;
    trackPriceUpdate(assetTokenId: string, assetName: string, seller: string, oldPrice: number, newPrice: number, transactionId: string): Promise<void>;
    trackOffer(assetTokenId: string, assetName: string, buyer: string, seller: string, offerPrice: number): Promise<void>;
    trackOfferAccepted(assetTokenId: string, assetName: string, seller: string, buyer: string, price: number, transactionId: string): Promise<void>;
    trackOfferRejected(assetTokenId: string, assetName: string, seller: string, buyer: string, price: number): Promise<void>;
}
