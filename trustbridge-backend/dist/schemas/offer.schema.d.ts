import { Document } from 'mongoose';
export type OfferDocument = Offer & Document;
export declare class Offer {
    listingId: string;
    nftContract: string;
    tokenId: string;
    buyer: string;
    seller: string;
    offerAmount: number;
    status: string;
    expiresAt: Date;
    transactionId?: string;
    acceptedAt?: Date;
    rejectedAt?: Date;
    cancelledAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const OfferSchema: import("mongoose").Schema<Offer, import("mongoose").Model<Offer, any, any, any, Document<unknown, any, Offer, any, {}> & Offer & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Offer, Document<unknown, {}, import("mongoose").FlatRecord<Offer>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Offer> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
