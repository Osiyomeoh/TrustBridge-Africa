import { Document } from 'mongoose';
export type OperationDocument = Operation & Document;
export declare enum OperationType {
    INVESTMENT = "INVESTMENT",
    WITHDRAWAL = "WITHDRAWAL",
    VERIFICATION = "VERIFICATION",
    SETTLEMENT = "SETTLEMENT",
    STAKE = "STAKE",
    UNSTAKE = "UNSTAKE"
}
export declare enum OperationStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED"
}
export declare class Operation {
    assetId: string;
    userAddress: string;
    type: OperationType;
    status: OperationStatus;
    amount?: number;
    tokens?: number;
    transactionHash?: string;
    blockchainTxId?: string;
    userId?: string;
    data?: any;
    metadata?: any;
    completedAt?: Date;
}
export declare const OperationSchema: import("mongoose").Schema<Operation, import("mongoose").Model<Operation, any, any, any, Document<unknown, any, Operation, any, {}> & Operation & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Operation, Document<unknown, {}, import("mongoose").FlatRecord<Operation>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Operation> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
