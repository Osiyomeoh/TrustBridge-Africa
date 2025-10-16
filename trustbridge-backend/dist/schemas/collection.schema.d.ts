import { Document } from 'mongoose';
export type CollectionDocument = Collection & Document;
export declare class Collection {
    collectionId: string;
    name: string;
    description?: string;
    symbol?: string;
    creator: string;
    bannerImage?: string;
    profileImage?: string;
    verified: boolean;
    nftTokenIds: string[];
    totalVolume: number;
    floorPrice: number;
    itemCount: number;
    ownerCount: number;
    listedCount: number;
    stats: {
        sales24h?: number;
        volume24h?: number;
        sales7d?: number;
        volume7d?: number;
        sales30d?: number;
        volume30d?: number;
        avgPrice?: number;
        highestSale?: number;
    };
    royalty: {
        percentage: number;
        receiver: string;
    };
    category: string[];
    socialLinks: {
        twitter?: string;
        discord?: string;
        website?: string;
        instagram?: string;
    };
    metadata: any;
    createdAt: Date;
    updatedAt: Date;
}
export declare const CollectionSchema: import("mongoose").Schema<Collection, import("mongoose").Model<Collection, any, any, any, Document<unknown, any, Collection, any, {}> & Collection & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Collection, Document<unknown, {}, import("mongoose").FlatRecord<Collection>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Collection> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
