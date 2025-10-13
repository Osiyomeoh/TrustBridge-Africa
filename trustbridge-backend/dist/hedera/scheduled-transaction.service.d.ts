import { ConfigService } from '@nestjs/config';
import { PrivateKey } from '@hashgraph/sdk';
export interface ScheduledAuction {
    auctionId: string;
    assetTokenId: string;
    assetName: string;
    seller: string;
    startPrice: number;
    currentBid: number;
    highestBidder: string | null;
    endTime: Date;
    scheduleId: string | null;
    status: 'active' | 'completed' | 'cancelled';
}
export declare class ScheduledTransactionService {
    private configService;
    private readonly logger;
    private client;
    private operatorId;
    private operatorKey;
    constructor(configService: ConfigService);
    private initializeClient;
    createScheduledAuctionEnd(assetTokenId: string, seller: string, highestBidder: string, bidAmount: number, endTime: Date): Promise<{
        scheduleId: string;
        transactionId: string;
    }>;
    signScheduledTransaction(scheduleId: string, signerKey: PrivateKey): Promise<string>;
    getScheduleInfo(scheduleId: string): Promise<any>;
    createScheduledListing(assetTokenId: string, listingTime: Date): Promise<{
        scheduleId: string;
        transactionId: string;
    }>;
}
export default ScheduledTransactionService;
