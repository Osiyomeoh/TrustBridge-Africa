"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TradingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradingService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const trading_order_schema_1 = require("../schemas/trading-order.schema");
const trade_execution_schema_1 = require("../schemas/trade-execution.schema");
const amc_pool_schema_1 = require("../schemas/amc-pool.schema");
const hedera_service_1 = require("../hedera/hedera.service");
let TradingService = TradingService_1 = class TradingService {
    constructor(tradingOrderModel, tradeExecutionModel, amcPoolModel, hederaService) {
        this.tradingOrderModel = tradingOrderModel;
        this.tradeExecutionModel = tradeExecutionModel;
        this.amcPoolModel = amcPoolModel;
        this.hederaService = hederaService;
        this.logger = new common_1.Logger(TradingService_1.name);
    }
    async createOrder(createOrderDto, traderAddress) {
        try {
            const pool = await this.amcPoolModel.findOne({ poolId: createOrderDto.poolId });
            if (!pool) {
                throw new common_1.NotFoundException('Pool not found');
            }
            if (!pool.isTradeable || pool.status !== 'ACTIVE') {
                throw new common_1.BadRequestException('Pool is not available for trading');
            }
            const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const totalValue = createOrderDto.tokenAmount * createOrderDto.pricePerToken;
            const orderSide = createOrderDto.orderType === trading_order_schema_1.OrderType.BUY ? trading_order_schema_1.OrderSide.BID : trading_order_schema_1.OrderSide.ASK;
            const order = new this.tradingOrderModel({
                orderId,
                poolId: createOrderDto.poolId,
                poolTokenId: pool.hederaTokenId,
                traderAddress,
                orderType: createOrderDto.orderType,
                orderSide,
                tokenAmount: createOrderDto.tokenAmount,
                pricePerToken: createOrderDto.pricePerToken,
                totalValue,
                filledAmount: 0,
                remainingAmount: createOrderDto.tokenAmount,
                status: trading_order_schema_1.OrderStatus.PENDING,
                paymentToken: createOrderDto.paymentToken,
                expiresAt: createOrderDto.expiresAt,
                isMarketOrder: createOrderDto.isMarketOrder || false,
                stopPrice: createOrderDto.stopPrice || 0,
                orderParams: {
                    slippageTolerance: createOrderDto.slippageTolerance || 0.01,
                    maxGasPrice: 0,
                    deadline: 0
                }
            });
            const savedOrder = await order.save();
            this.logger.log(`Created trading order: ${orderId}`);
            await this.logOrderToHCS(savedOrder);
            await this.matchOrders(createOrderDto.poolId);
            return savedOrder;
        }
        catch (error) {
            this.logger.error('Failed to create trading order:', error);
            throw error;
        }
    }
    async cancelOrder(orderId, traderAddress) {
        try {
            const order = await this.tradingOrderModel.findOne({
                orderId,
                traderAddress,
                status: { $in: [trading_order_schema_1.OrderStatus.PENDING, trading_order_schema_1.OrderStatus.PARTIALLY_FILLED] }
            });
            if (!order) {
                throw new common_1.NotFoundException('Order not found or cannot be cancelled');
            }
            order.status = trading_order_schema_1.OrderStatus.CANCELLED;
            order.cancelledAt = new Date();
            const updatedOrder = await order.save();
            this.logger.log(`Cancelled trading order: ${orderId}`);
            return updatedOrder;
        }
        catch (error) {
            this.logger.error('Failed to cancel trading order:', error);
            throw error;
        }
    }
    async getOrderBook(poolId, depth = 20) {
        try {
            const pool = await this.amcPoolModel.findOne({ poolId });
            if (!pool) {
                throw new common_1.NotFoundException('Pool not found');
            }
            const bids = await this.tradingOrderModel
                .find({
                poolId,
                orderSide: trading_order_schema_1.OrderSide.BID,
                status: { $in: [trading_order_schema_1.OrderStatus.PENDING, trading_order_schema_1.OrderStatus.PARTIALLY_FILLED] }
            })
                .sort({ pricePerToken: -1 })
                .limit(depth);
            const asks = await this.tradingOrderModel
                .find({
                poolId,
                orderSide: trading_order_schema_1.OrderSide.ASK,
                status: { $in: [trading_order_schema_1.OrderStatus.PENDING, trading_order_schema_1.OrderStatus.PARTIALLY_FILLED] }
            })
                .sort({ pricePerToken: 1 })
                .limit(depth);
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const trades24h = await this.tradeExecutionModel.find({
                poolId,
                status: trade_execution_schema_1.TradeStatus.EXECUTED,
                executedAt: { $gte: oneDayAgo }
            });
            const volume24h = trades24h.reduce((sum, trade) => sum + trade.totalValue, 0);
            const prices24h = trades24h.map(trade => trade.pricePerToken);
            const high24h = prices24h.length > 0 ? Math.max(...prices24h) : 0;
            const low24h = prices24h.length > 0 ? Math.min(...prices24h) : 0;
            const lastPrice = prices24h.length > 0 ? prices24h[prices24h.length - 1] : pool.tokenPrice;
            const priceChange24h = prices24h.length > 1 ?
                ((lastPrice - prices24h[0]) / prices24h[0]) * 100 : 0;
            return {
                poolId,
                bids: bids.map(bid => ({
                    price: bid.pricePerToken,
                    amount: bid.remainingAmount,
                    total: bid.pricePerToken * bid.remainingAmount
                })),
                asks: asks.map(ask => ({
                    price: ask.pricePerToken,
                    amount: ask.remainingAmount,
                    total: ask.pricePerToken * ask.remainingAmount
                })),
                lastPrice,
                priceChange24h,
                volume24h,
                high24h,
                low24h
            };
        }
        catch (error) {
            this.logger.error('Failed to get order book:', error);
            throw error;
        }
    }
    async getUserOrders(traderAddress, poolId) {
        try {
            const query = { traderAddress };
            if (poolId) {
                query.poolId = poolId;
            }
            return await this.tradingOrderModel
                .find(query)
                .sort({ createdAt: -1 });
        }
        catch (error) {
            this.logger.error('Failed to get user orders:', error);
            throw error;
        }
    }
    async getUserTradeHistory(traderAddress, poolId) {
        try {
            const query = {
                $or: [
                    { buyerAddress: traderAddress },
                    { sellerAddress: traderAddress }
                ],
                status: trade_execution_schema_1.TradeStatus.EXECUTED
            };
            if (poolId) {
                query.poolId = poolId;
            }
            return await this.tradeExecutionModel
                .find(query)
                .sort({ executedAt: -1 });
        }
        catch (error) {
            this.logger.error('Failed to get user trade history:', error);
            throw error;
        }
    }
    async getRecentTrades(poolId, limit = 50) {
        try {
            return await this.tradeExecutionModel
                .find({
                poolId,
                status: trade_execution_schema_1.TradeStatus.EXECUTED
            })
                .sort({ executedAt: -1 })
                .limit(limit);
        }
        catch (error) {
            this.logger.error('Failed to get recent trades:', error);
            throw error;
        }
    }
    async matchOrders(poolId) {
        try {
            const bestBuyOrder = await this.tradingOrderModel
                .findOne({
                poolId,
                orderSide: trading_order_schema_1.OrderSide.BID,
                status: { $in: [trading_order_schema_1.OrderStatus.PENDING, trading_order_schema_1.OrderStatus.PARTIALLY_FILLED] }
            })
                .sort({ pricePerToken: -1 });
            const bestSellOrder = await this.tradingOrderModel
                .findOne({
                poolId,
                orderSide: trading_order_schema_1.OrderSide.ASK,
                status: { $in: [trading_order_schema_1.OrderStatus.PENDING, trading_order_schema_1.OrderStatus.PARTIALLY_FILLED] }
            })
                .sort({ pricePerToken: 1 });
            if (!bestBuyOrder || !bestSellOrder) {
                return;
            }
            if (bestBuyOrder.pricePerToken >= bestSellOrder.pricePerToken) {
                await this.executeTrade(bestBuyOrder, bestSellOrder);
                await this.matchOrders(poolId);
            }
        }
        catch (error) {
            this.logger.error('Failed to match orders:', error);
            throw error;
        }
    }
    async executeTrade(buyOrder, sellOrder) {
        try {
            const tradeId = `TRADE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const tradeAmount = Math.min(buyOrder.remainingAmount, sellOrder.remainingAmount);
            const executionPrice = sellOrder.pricePerToken;
            const totalValue = tradeAmount * executionPrice;
            let tradingFeeRate;
            switch (buyOrder.paymentToken) {
                case 'TRUST':
                    tradingFeeRate = 0.001;
                    break;
                case 'HBAR':
                    tradingFeeRate = 0.005;
                    break;
                case 'USD':
                    tradingFeeRate = 0.01;
                    break;
                default:
                    tradingFeeRate = 0.005;
            }
            const tradingFee = totalValue * tradingFeeRate;
            const totalFees = tradingFee;
            const trade = new this.tradeExecutionModel({
                tradeId,
                poolId: buyOrder.poolId,
                poolTokenId: buyOrder.poolTokenId,
                buyOrderId: buyOrder.orderId,
                sellOrderId: sellOrder.orderId,
                buyerAddress: buyOrder.traderAddress,
                sellerAddress: sellOrder.traderAddress,
                tokenAmount: tradeAmount,
                pricePerToken: executionPrice,
                totalValue,
                status: trade_execution_schema_1.TradeStatus.PENDING,
                paymentToken: buyOrder.paymentToken,
                tradingFees: tradingFee,
                totalFees
            });
            await trade.save();
            try {
                await this.executeHederaTrade(trade, buyOrder, sellOrder);
                trade.status = trade_execution_schema_1.TradeStatus.EXECUTED;
                trade.executedAt = new Date();
                trade.isSettled = true;
                trade.settledAt = new Date();
                await this.logTradeToHCS(trade);
                if (buyOrder.paymentToken === 'TRUST' && tradingFee > 0) {
                    await this.burnTrustTokensForTradingFee(trade, tradingFee);
                }
            }
            catch (hederaError) {
                this.logger.error('Hedera trade execution failed:', hederaError);
                trade.status = trade_execution_schema_1.TradeStatus.FAILED;
                trade.failedAt = new Date();
                trade.failureReason = hederaError.message;
            }
            await this.tradeExecutionModel.findByIdAndUpdate(trade._id, trade);
            if (trade.status === trade_execution_schema_1.TradeStatus.EXECUTED) {
                buyOrder.filledAmount += tradeAmount;
                buyOrder.remainingAmount -= tradeAmount;
                buyOrder.status = buyOrder.remainingAmount === 0 ? trading_order_schema_1.OrderStatus.FILLED : trading_order_schema_1.OrderStatus.PARTIALLY_FILLED;
                if (buyOrder.remainingAmount === 0) {
                    buyOrder.filledAt = new Date();
                }
                sellOrder.filledAmount += tradeAmount;
                sellOrder.remainingAmount -= tradeAmount;
                sellOrder.status = sellOrder.remainingAmount === 0 ? trading_order_schema_1.OrderStatus.FILLED : trading_order_schema_1.OrderStatus.PARTIALLY_FILLED;
                if (sellOrder.remainingAmount === 0) {
                    sellOrder.filledAt = new Date();
                }
                await Promise.all([
                    this.tradingOrderModel.findByIdAndUpdate(buyOrder._id, buyOrder),
                    this.tradingOrderModel.findByIdAndUpdate(sellOrder._id, sellOrder)
                ]);
                await this.updatePoolPrice(buyOrder.poolId, executionPrice);
            }
            this.logger.log(`Executed trade: ${tradeId} for ${tradeAmount} tokens at ${executionPrice} - Status: ${trade.status}`);
        }
        catch (error) {
            this.logger.error('Failed to execute trade:', error);
            throw error;
        }
    }
    async executeHederaTrade(trade, buyOrder, sellOrder) {
        try {
            const { TransferTransaction, TokenId, AccountId, Hbar } = await Promise.resolve().then(() => __importStar(require('@hashgraph/sdk')));
            const poolTokenId = TokenId.fromString(trade.poolTokenId);
            const buyerAccountId = AccountId.fromString(trade.buyerAddress);
            const sellerAccountId = AccountId.fromString(trade.sellerAddress);
            const transferTx = new TransferTransaction()
                .addTokenTransfer(poolTokenId, sellerAccountId, -trade.tokenAmount)
                .addTokenTransfer(poolTokenId, buyerAccountId, trade.tokenAmount)
                .setMaxTransactionFee(new Hbar(2))
                .setTransactionMemo(`Trade: ${trade.tradeId} | Pool: ${trade.poolId} | Amount: ${trade.tokenAmount} | Price: ${trade.pricePerToken}`);
            const response = await this.hederaService.executeTransaction(transferTx);
            trade.hederaTransactionHash = response.transactionId.toString();
            trade.settlementTransactionHash = response.transactionId.toString();
            this.logger.log(`Hedera trade executed: ${trade.tradeId} - TX: ${response.transactionId}`);
        }
        catch (error) {
            this.logger.error('Hedera trade execution failed:', error);
            throw error;
        }
    }
    async logOrderToHCS(order) {
        try {
            const orderEvent = {
                type: 'ORDER_CREATED',
                orderId: order.orderId,
                poolId: order.poolId,
                poolTokenId: order.poolTokenId,
                traderAddress: order.traderAddress,
                orderType: order.orderType,
                orderSide: order.orderSide,
                tokenAmount: order.tokenAmount,
                pricePerToken: order.pricePerToken,
                totalValue: order.totalValue,
                status: order.status,
                paymentToken: order.paymentToken,
                isMarketOrder: order.isMarketOrder,
                createdAt: order.createdAt,
                timestamp: new Date().toISOString()
            };
            await this.hederaService.submitToHCS('TRADING_EVENTS', JSON.stringify(orderEvent));
            this.logger.log(`Order logged to HCS: ${order.orderId}`);
        }
        catch (error) {
            this.logger.warn('Failed to log order to HCS (non-critical):', error.message);
        }
    }
    async burnTrustTokensForTradingFee(trade, feeAmount) {
        try {
            const treasuryAccount = this.configService.get('HEDERA_ACCOUNT_ID');
            if (!treasuryAccount) {
                this.logger.warn('Treasury account not configured, skipping TRUST burn');
                return;
            }
            await this.hederaService.burnTrustTokens(treasuryAccount, feeAmount);
            this.logger.log(`Burned ${feeAmount} TRUST tokens for trading fee: ${trade.tradeId}`);
        }
        catch (error) {
            this.logger.warn('Failed to burn TRUST tokens for trading fee (non-critical):', error.message);
        }
    }
    async logTradeToHCS(trade) {
        try {
            const tradeEvent = {
                type: 'TRADE_EXECUTED',
                tradeId: trade.tradeId,
                poolId: trade.poolId,
                poolTokenId: trade.poolTokenId,
                buyerAddress: trade.buyerAddress,
                sellerAddress: trade.sellerAddress,
                tokenAmount: trade.tokenAmount,
                pricePerToken: trade.pricePerToken,
                totalValue: trade.totalValue,
                tradingFees: trade.tradingFees,
                executedAt: trade.executedAt,
                hederaTransactionHash: trade.hederaTransactionHash,
                timestamp: new Date().toISOString()
            };
            await this.hederaService.submitToHCS('TRADING_EVENTS', JSON.stringify(tradeEvent));
            this.logger.log(`Trade logged to HCS: ${trade.tradeId}`);
        }
        catch (error) {
            this.logger.warn('Failed to log trade to HCS (non-critical):', error.message);
        }
    }
    async updatePoolPrice(poolId, newPrice) {
        try {
            const pool = await this.amcPoolModel.findOne({ poolId });
            if (!pool)
                return;
            const previousPrice = pool.currentPrice;
            const priceChange24h = previousPrice > 0 ?
                ((newPrice - previousPrice) / previousPrice) * 100 : 0;
            pool.currentPrice = newPrice;
            pool.priceChange24h = priceChange24h;
            await pool.save();
        }
        catch (error) {
            this.logger.error('Failed to update pool price:', error);
        }
    }
    async getPoolTradingStats(poolId) {
        try {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const [trades24h, trades7d, activeOrders] = await Promise.all([
                this.tradeExecutionModel.find({
                    poolId,
                    status: trade_execution_schema_1.TradeStatus.EXECUTED,
                    executedAt: { $gte: oneDayAgo }
                }),
                this.tradeExecutionModel.find({
                    poolId,
                    status: trade_execution_schema_1.TradeStatus.EXECUTED,
                    executedAt: { $gte: oneWeekAgo }
                }),
                this.tradingOrderModel.find({
                    poolId,
                    status: { $in: [trading_order_schema_1.OrderStatus.PENDING, trading_order_schema_1.OrderStatus.PARTIALLY_FILLED] }
                })
            ]);
            const volume24h = trades24h.reduce((sum, trade) => sum + trade.totalValue, 0);
            const volume7d = trades7d.reduce((sum, trade) => sum + trade.totalValue, 0);
            const tradesCount24h = trades24h.length;
            const tradesCount7d = trades7d.length;
            const buyOrders = activeOrders.filter(order => order.orderSide === trading_order_schema_1.OrderSide.BID);
            const sellOrders = activeOrders.filter(order => order.orderSide === trading_order_schema_1.OrderSide.ASK);
            return {
                poolId,
                volume24h,
                volume7d,
                tradesCount24h,
                tradesCount7d,
                activeBuyOrders: buyOrders.length,
                activeSellOrders: sellOrders.length,
                totalActiveOrders: activeOrders.length,
                buyVolume: buyOrders.reduce((sum, order) => sum + order.totalValue, 0),
                sellVolume: sellOrders.reduce((sum, order) => sum + order.totalValue, 0)
            };
        }
        catch (error) {
            this.logger.error('Failed to get pool trading stats:', error);
            throw error;
        }
    }
};
exports.TradingService = TradingService;
exports.TradingService = TradingService = TradingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(trading_order_schema_1.TradingOrder.name)),
    __param(1, (0, mongoose_1.InjectModel)(trade_execution_schema_1.TradeExecution.name)),
    __param(2, (0, mongoose_1.InjectModel)(amc_pool_schema_1.AMCPool.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        hedera_service_1.HederaService])
], TradingService);
//# sourceMappingURL=trading.service.js.map