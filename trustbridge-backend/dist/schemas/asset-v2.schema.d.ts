import { Document } from 'mongoose';
export type AssetV2Document = AssetV2 & Document;
export declare enum AssetTypeV2 {
    DIGITAL = "DIGITAL",
    RWA = "RWA"
}
export declare enum AssetStatusV2 {
    PENDING = "PENDING",
    VERIFIED = "VERIFIED",
    ACTIVE = "ACTIVE",
    DIGITAL_ACTIVE = "DIGITAL_ACTIVE",
    VERIFIED_PENDING_AMC = "VERIFIED_PENDING_AMC",
    AMC_MANAGED = "AMC_MANAGED",
    MATURED = "MATURED",
    SETTLED = "SETTLED"
}
export declare enum VerificationLevel {
    BASIC = "BASIC",
    PROFESSIONAL = "PROFESSIONAL",
    EXPERT = "EXPERT",
    MASTER = "MASTER"
}
export declare class AssetV2 {
    assetId: string;
    type: AssetTypeV2;
    category: string;
    assetType: string;
    name: string;
    location: string;
    totalValue: number;
    owner: string;
    status: AssetStatusV2;
    tokenizedAmount: number;
    verificationScore: number;
    verificationLevel: VerificationLevel;
    imageURI: string;
    documentURI: string;
    description: string;
    isTradeable: boolean;
    operations: string[];
    createdAt: Date;
    verifiedAt: Date;
    tokenizedAt: Date;
    maturityDate: Date;
    evidenceHashes: string[];
    documentTypes: string[];
    isListed: boolean;
    listingPrice: number;
    listingExpiry: Date;
    tradingVolume: number;
    lastSalePrice: number;
    currentAMC: string;
    amcTransferredAt: Date;
    tokenId: string;
    isTokenized: boolean;
    tokenizationDate: Date;
    metadata: Record<string, any>;
}
export declare const AssetV2Schema: import("mongoose").Schema<AssetV2, import("mongoose").Model<AssetV2, any, any, any, Document<unknown, any, AssetV2, any, {}> & AssetV2 & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AssetV2, Document<unknown, {}, import("mongoose").FlatRecord<AssetV2>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<AssetV2> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
