import { Document } from 'mongoose';
export type RoyaltyDocument = Royalty & Document;
export declare class RoyaltyPayment {
    transactionId: string;
    nftContract: string;
    tokenId: string;
    salePrice: number;
    royaltyAmount: number;
    royaltyPercentage: number;
    creator: string;
    seller: string;
    buyer: string;
    timestamp: Date;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const RoyaltyPaymentSchema: import("mongoose").Schema<RoyaltyPayment, import("mongoose").Model<RoyaltyPayment, any, any, any, Document<unknown, any, RoyaltyPayment, any, {}> & RoyaltyPayment & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, RoyaltyPayment, Document<unknown, {}, import("mongoose").FlatRecord<RoyaltyPayment>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<RoyaltyPayment> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare class CreatorRoyaltyStats {
    creator: string;
    totalEarned: number;
    salesCount: number;
    averageRoyalty: number;
    monthlyEarnings: {
        [key: string]: number;
    };
    nftContracts: string[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const CreatorRoyaltyStatsSchema: import("mongoose").Schema<CreatorRoyaltyStats, import("mongoose").Model<CreatorRoyaltyStats, any, any, any, Document<unknown, any, CreatorRoyaltyStats, any, {}> & CreatorRoyaltyStats & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, CreatorRoyaltyStats, Document<unknown, {}, import("mongoose").FlatRecord<CreatorRoyaltyStats>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<CreatorRoyaltyStats> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
