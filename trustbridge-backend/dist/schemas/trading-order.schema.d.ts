import { Document } from 'mongoose';
export type TradingOrderDocument = TradingOrder & Document;
export declare enum OrderType {
    BUY = "BUY",
    SELL = "SELL"
}
export declare enum OrderStatus {
    PENDING = "PENDING",
    PARTIALLY_FILLED = "PARTIALLY_FILLED",
    FILLED = "FILLED",
    CANCELLED = "CANCELLED",
    EXPIRED = "EXPIRED"
}
export declare enum OrderSide {
    BID = "BID",
    ASK = "ASK"
}
export declare class TradingOrder {
    orderId: string;
    poolId: string;
    poolTokenId: string;
    traderAddress: string;
    orderType: OrderType;
    orderSide: OrderSide;
    tokenAmount: number;
    pricePerToken: number;
    totalValue: number;
    filledAmount: number;
    remainingAmount: number;
    status: OrderStatus;
    paymentToken: string;
    fees: number;
    gasFees: number;
    expiresAt: Date;
    filledAt: Date;
    cancelledAt: Date;
    fills: {
        fillId: string;
        amount: number;
        price: number;
        timestamp: Date;
        counterpartyAddress: string;
        transactionHash: string;
    }[];
    transactionHash: string;
    metadata: string;
    isMarketOrder: boolean;
    stopPrice: number;
    isStopOrder: boolean;
    timeInForce: number;
    parentOrderId: string;
    childOrderIds: string[];
    orderParams: {
        slippageTolerance: number;
        maxGasPrice: number;
        deadline: number;
    };
}
export declare const TradingOrderSchema: import("mongoose").Schema<TradingOrder, import("mongoose").Model<TradingOrder, any, any, any, Document<unknown, any, TradingOrder, any, {}> & TradingOrder & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, TradingOrder, Document<unknown, {}, import("mongoose").FlatRecord<TradingOrder>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<TradingOrder> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
