import { Model } from 'mongoose';
import { TradingOrder, TradingOrderDocument, OrderType } from '../schemas/trading-order.schema';
import { TradeExecution, TradeExecutionDocument } from '../schemas/trade-execution.schema';
import { AMCPoolDocument } from '../schemas/amc-pool.schema';
import { HederaService } from '../hedera/hedera.service';
export interface CreateOrderDto {
    poolId: string;
    orderType: OrderType;
    tokenAmount: number;
    pricePerToken: number;
    paymentToken: string;
    expiresAt?: Date;
    isMarketOrder?: boolean;
    stopPrice?: number;
    slippageTolerance?: number;
}
export interface OrderBookData {
    poolId: string;
    bids: {
        price: number;
        amount: number;
        total: number;
    }[];
    asks: {
        price: number;
        amount: number;
        total: number;
    }[];
    lastPrice: number;
    priceChange24h: number;
    volume24h: number;
    high24h: number;
    low24h: number;
}
export declare class TradingService {
    private tradingOrderModel;
    private tradeExecutionModel;
    private amcPoolModel;
    private hederaService;
    private readonly logger;
    constructor(tradingOrderModel: Model<TradingOrderDocument>, tradeExecutionModel: Model<TradeExecutionDocument>, amcPoolModel: Model<AMCPoolDocument>, hederaService: HederaService);
    createOrder(createOrderDto: CreateOrderDto, traderAddress: string): Promise<TradingOrder>;
    cancelOrder(orderId: string, traderAddress: string): Promise<TradingOrder>;
    getOrderBook(poolId: string, depth?: number): Promise<OrderBookData>;
    getUserOrders(traderAddress: string, poolId?: string): Promise<TradingOrder[]>;
    getUserTradeHistory(traderAddress: string, poolId?: string): Promise<TradeExecution[]>;
    getRecentTrades(poolId: string, limit?: number): Promise<TradeExecution[]>;
    matchOrders(poolId: string): Promise<void>;
    private executeTrade;
    private executeHederaTrade;
    private logOrderToHCS;
    private burnTrustTokensForTradingFee;
    private logTradeToHCS;
    private updatePoolPrice;
    getPoolTradingStats(poolId: string): Promise<any>;
}
