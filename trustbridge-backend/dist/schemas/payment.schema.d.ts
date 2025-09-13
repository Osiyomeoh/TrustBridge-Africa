import { Document } from 'mongoose';
export declare enum PaymentStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED",
    CANCELLED = "CANCELLED"
}
export declare enum PaymentMethod {
    HBAR = "HBAR",
    STRIPE = "STRIPE",
    PAYPAL = "PAYPAL",
    BANK_TRANSFER = "BANK_TRANSFER",
    MOBILE_MONEY = "MOBILE_MONEY"
}
export declare enum PaymentType {
    TOKENIZATION_FEE = "TOKENIZATION_FEE",
    VERIFICATION_FEE = "VERIFICATION_FEE",
    INVESTMENT = "INVESTMENT",
    ESCROW = "ESCROW",
    SETTLEMENT = "SETTLEMENT",
    REFUND = "REFUND",
    PLATFORM_FEE = "PLATFORM_FEE"
}
export declare class Payment {
    paymentId: string;
    userId: string;
    assetId?: string;
    amount: number;
    currency: string;
    method: PaymentMethod;
    type: PaymentType;
    status: PaymentStatus;
    description?: string;
    externalTransactionId?: string;
    blockchainTxId?: string;
    feeAmount?: number;
    netAmount?: number;
    metadata?: {
        stripePaymentIntentId?: string;
        paypalOrderId?: string;
        bankReference?: string;
        mobileMoneyReference?: string;
        hbarAccountId?: string;
        hbarTokenId?: string;
    };
    failureReason?: string;
    refundAmount?: number;
    refundReason?: string;
    refundedAt?: Date;
    completedAt?: Date;
    expiresAt?: Date;
}
export type PaymentDocument = Payment & Document;
export declare const PaymentSchema: import("mongoose").Schema<Payment, import("mongoose").Model<Payment, any, any, any, Document<unknown, any, Payment, any, {}> & Payment & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Payment, Document<unknown, {}, import("mongoose").FlatRecord<Payment>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Payment> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
