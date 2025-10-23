import { TradingService, CreateOrderDto } from './trading.service';
export declare class TradingController {
    private readonly tradingService;
    constructor(tradingService: TradingService);
    createOrder(createOrderDto: CreateOrderDto, req: any): Promise<import("../schemas/trading-order.schema").TradingOrder>;
    cancelOrder(orderId: string, req: any): Promise<import("../schemas/trading-order.schema").TradingOrder>;
    getOrderBook(poolId: string, depth?: number): Promise<import("./trading.service").OrderBookData>;
    getUserOrders(req: any, poolId?: string): Promise<import("../schemas/trading-order.schema").TradingOrder[]>;
    getUserTradeHistory(req: any, poolId?: string): Promise<import("../schemas/trade-execution.schema").TradeExecution[]>;
    getRecentTrades(poolId: string, limit?: number): Promise<import("../schemas/trade-execution.schema").TradeExecution[]>;
    getPoolTradingStats(poolId: string): Promise<any>;
    getMarketData(): Promise<{
        message: string;
    }>;
    getTradingPairs(): Promise<{
        message: string;
    }>;
    getPriceHistory(poolId: string, timeframe?: string, limit?: number): Promise<{
        message: string;
    }>;
    getTradingFees(): Promise<{
        makerFee: number;
        takerFee: number;
        withdrawalFee: number;
        depositFee: number;
    }>;
    getTradingLimits(): Promise<{
        minOrderSize: number;
        maxOrderSize: number;
        minPrice: number;
        maxPrice: number;
        dailyVolumeLimit: number;
    }>;
}
