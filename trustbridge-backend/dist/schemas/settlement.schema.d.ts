import { Document } from 'mongoose';
export type SettlementDocument = Settlement & Document;
export declare enum SettlementStatus {
    PENDING = "PENDING",
    IN_TRANSIT = "IN_TRANSIT",
    SETTLED = "SETTLED",
    DISPUTED = "DISPUTED",
    CANCELLED = "CANCELLED"
}
export declare class Settlement {
    assetId: string;
    buyer: string;
    seller: string;
    amount: number;
    status: SettlementStatus;
    deliveryDeadline: Date;
    trackingHash?: string;
    deliveryConfirmation?: {
        confirmedBy: string;
        confirmedAt: Date;
        evidence: string;
    };
    disputeReason?: string;
    resolvedAt?: Date;
}
export declare const SettlementSchema: import("mongoose").Schema<Settlement, import("mongoose").Model<Settlement, any, any, any, Document<unknown, any, Settlement, any, {}> & Settlement & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Settlement, Document<unknown, {}, import("mongoose").FlatRecord<Settlement>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Settlement> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
