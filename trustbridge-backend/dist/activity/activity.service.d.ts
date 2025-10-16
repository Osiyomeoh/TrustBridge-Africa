export interface ActivityEvent {
    id: string;
    type: 'sale' | 'listing' | 'offer' | 'transfer' | 'mint';
    timestamp: string;
    transactionId: string;
    nftContract: string;
    tokenId: string;
    serialNumber: string;
    from: string;
    to: string;
    price?: number;
    currency?: string;
    metadata?: any;
}
export declare class ActivityService {
    private readonly logger;
    private readonly mirrorNodeUrl;
    getNFTActivity(tokenId: string, serialNumber: string, limit?: number): Promise<ActivityEvent[]>;
    getUserActivity(accountId: string, limit?: number): Promise<ActivityEvent[]>;
    getMarketplaceActivity(marketplaceAccount: string, limit?: number): Promise<ActivityEvent[]>;
    getCollectionActivity(tokenId: string, limit?: number): Promise<ActivityEvent[]>;
    private parseTransaction;
    private determineTransactionType;
    private parseMarketplaceTransaction;
    getNFTPriceHistory(tokenId: string, serialNumber: string): Promise<{
        timestamp: string;
        price: number;
    }[]>;
}
