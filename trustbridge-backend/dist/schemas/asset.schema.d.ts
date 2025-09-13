import { Document } from 'mongoose';
export type AssetDocument = Asset & Document;
export declare enum AssetType {
    AGRICULTURAL = "AGRICULTURAL",
    REAL_ESTATE = "REAL_ESTATE",
    EQUIPMENT = "EQUIPMENT",
    INVENTORY = "INVENTORY",
    COMMODITY = "COMMODITY"
}
export declare enum AssetStatus {
    PENDING = "PENDING",
    VERIFIED = "VERIFIED",
    ACTIVE = "ACTIVE",
    OPERATIONAL = "OPERATIONAL",
    MATURED = "MATURED",
    SETTLED = "SETTLED"
}
export declare class Location {
    country: string;
    region: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
}
export declare class Investment {
    investor: string;
    amount: number;
    tokens: number;
    pricePerToken: number;
    timestamp: Date;
    status: string;
    transactionHash?: string;
}
export declare class Asset {
    assetId: string;
    owner: string;
    type: AssetType;
    name: string;
    description?: string;
    location: Location;
    totalValue: number;
    tokenSupply: number;
    tokenizedAmount: number;
    maturityDate: Date;
    expectedAPY: number;
    verificationScore: number;
    status: AssetStatus;
    tokenContract?: string;
    transactionHash?: string;
    verificationData?: any;
    investments: Investment[];
    operations: string[];
}
export declare const AssetSchema: import("mongoose").Schema<Asset, import("mongoose").Model<Asset, any, any, any, Document<unknown, any, Asset, any, {}> & Asset & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Asset, Document<unknown, {}, import("mongoose").FlatRecord<Asset>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Asset> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
