import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TradingOrder, TradingOrderDocument, OrderType, OrderStatus, OrderSide } from '../schemas/trading-order.schema';
import { TradeExecution, TradeExecutionDocument, TradeStatus } from '../schemas/trade-execution.schema';
import { AMCPool, AMCPoolDocument } from '../schemas/amc-pool.schema';
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

@Injectable()
export class TradingService {
  private readonly logger = new Logger(TradingService.name);

  constructor(
    @InjectModel(TradingOrder.name) private tradingOrderModel: Model<TradingOrderDocument>,
    @InjectModel(TradeExecution.name) private tradeExecutionModel: Model<TradeExecutionDocument>,
    @InjectModel(AMCPool.name) private amcPoolModel: Model<AMCPoolDocument>,
    private hederaService: HederaService,
  ) {}

  /**
   * Create a new trading order
   */
  async createOrder(createOrderDto: CreateOrderDto, traderAddress: string): Promise<TradingOrder> {
    try {
      // Validate pool exists and is tradeable
      const pool = await this.amcPoolModel.findOne({ poolId: createOrderDto.poolId });
      if (!pool) {
        throw new NotFoundException('Pool not found');
      }

      if (!pool.isTradeable || pool.status !== 'ACTIVE') {
        throw new BadRequestException('Pool is not available for trading');
      }

      // Generate unique order ID
      const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Calculate total value
      const totalValue = createOrderDto.tokenAmount * createOrderDto.pricePerToken;

      // Determine order side
      const orderSide = createOrderDto.orderType === OrderType.BUY ? OrderSide.BID : OrderSide.ASK;

      // Create order
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
        status: OrderStatus.PENDING,
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

      // Log order creation to HCS
      await this.logOrderToHCS(savedOrder);

      // Try to match orders immediately
      await this.matchOrders(createOrderDto.poolId);

      return savedOrder;
    } catch (error) {
      this.logger.error('Failed to create trading order:', error);
      throw error;
    }
  }

  /**
   * Cancel a trading order
   */
  async cancelOrder(orderId: string, traderAddress: string): Promise<TradingOrder> {
    try {
      const order = await this.tradingOrderModel.findOne({ 
        orderId, 
        traderAddress,
        status: { $in: [OrderStatus.PENDING, OrderStatus.PARTIALLY_FILLED] }
      });

      if (!order) {
        throw new NotFoundException('Order not found or cannot be cancelled');
      }

      order.status = OrderStatus.CANCELLED;
      order.cancelledAt = new Date();

      const updatedOrder = await order.save();
      this.logger.log(`Cancelled trading order: ${orderId}`);

      return updatedOrder;
    } catch (error) {
      this.logger.error('Failed to cancel trading order:', error);
      throw error;
    }
  }

  /**
   * Get order book for a pool
   */
  async getOrderBook(poolId: string, depth: number = 20): Promise<OrderBookData> {
    try {
      const pool = await this.amcPoolModel.findOne({ poolId });
      if (!pool) {
        throw new NotFoundException('Pool not found');
      }

      // Get active buy orders (bids)
      const bids = await this.tradingOrderModel
        .find({
          poolId,
          orderSide: OrderSide.BID,
          status: { $in: [OrderStatus.PENDING, OrderStatus.PARTIALLY_FILLED] }
        })
        .sort({ pricePerToken: -1 })
        .limit(depth);

      // Get active sell orders (asks)
      const asks = await this.tradingOrderModel
        .find({
          poolId,
          orderSide: OrderSide.ASK,
          status: { $in: [OrderStatus.PENDING, OrderStatus.PARTIALLY_FILLED] }
        })
        .sort({ pricePerToken: 1 })
        .limit(depth);

      // Calculate 24h statistics
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const trades24h = await this.tradeExecutionModel.find({
        poolId,
        status: TradeStatus.EXECUTED,
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
    } catch (error) {
      this.logger.error('Failed to get order book:', error);
      throw error;
    }
  }

  /**
   * Get user's trading orders
   */
  async getUserOrders(traderAddress: string, poolId?: string): Promise<TradingOrder[]> {
    try {
      const query: any = { traderAddress };
      if (poolId) {
        query.poolId = poolId;
      }

      return await this.tradingOrderModel
        .find(query)
        .sort({ createdAt: -1 });
    } catch (error) {
      this.logger.error('Failed to get user orders:', error);
      throw error;
    }
  }

  /**
   * Get user's trade history
   */
  async getUserTradeHistory(traderAddress: string, poolId?: string): Promise<TradeExecution[]> {
    try {
      const query: any = {
        $or: [
          { buyerAddress: traderAddress },
          { sellerAddress: traderAddress }
        ],
        status: TradeStatus.EXECUTED
      };
      
      if (poolId) {
        query.poolId = poolId;
      }

      return await this.tradeExecutionModel
        .find(query)
        .sort({ executedAt: -1 });
    } catch (error) {
      this.logger.error('Failed to get user trade history:', error);
      throw error;
    }
  }

  /**
   * Get recent trades for a pool
   */
  async getRecentTrades(poolId: string, limit: number = 50): Promise<TradeExecution[]> {
    try {
      return await this.tradeExecutionModel
        .find({
          poolId,
          status: TradeStatus.EXECUTED
        })
        .sort({ executedAt: -1 })
        .limit(limit);
    } catch (error) {
      this.logger.error('Failed to get recent trades:', error);
      throw error;
    }
  }

  /**
   * Match orders and execute trades
   */
  async matchOrders(poolId: string): Promise<void> {
    try {
      // Get best buy and sell orders
      const bestBuyOrder = await this.tradingOrderModel
        .findOne({
          poolId,
          orderSide: OrderSide.BID,
          status: { $in: [OrderStatus.PENDING, OrderStatus.PARTIALLY_FILLED] }
        })
        .sort({ pricePerToken: -1 });

      const bestSellOrder = await this.tradingOrderModel
        .findOne({
          poolId,
          orderSide: OrderSide.ASK,
          status: { $in: [OrderStatus.PENDING, OrderStatus.PARTIALLY_FILLED] }
        })
        .sort({ pricePerToken: 1 });

      if (!bestBuyOrder || !bestSellOrder) {
        return; // No orders to match
      }

      // Check if orders can match
      if (bestBuyOrder.pricePerToken >= bestSellOrder.pricePerToken) {
        await this.executeTrade(bestBuyOrder, bestSellOrder);
        
        // Continue matching if there are more orders
        await this.matchOrders(poolId);
      }
    } catch (error) {
      this.logger.error('Failed to match orders:', error);
      throw error;
    }
  }

  /**
   * Execute a trade between two orders with Hedera integration
   */
  private async executeTrade(buyOrder: TradingOrder, sellOrder: TradingOrder): Promise<void> {
    try {
      const tradeId = `TRADE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Determine trade amount (minimum of both orders)
      const tradeAmount = Math.min(buyOrder.remainingAmount, sellOrder.remainingAmount);
      const executionPrice = sellOrder.pricePerToken; // Execute at sell order price
      const totalValue = tradeAmount * executionPrice;

      // Calculate fees based on payment token
      let tradingFeeRate: number;
      switch (buyOrder.paymentToken) {
        case 'TRUST':
          tradingFeeRate = 0.001; // 0.1% for TRUST tokens
          break;
        case 'HBAR':
          tradingFeeRate = 0.005; // 0.5% for HBAR
          break;
        case 'USD':
          tradingFeeRate = 0.01; // 1% for fiat
          break;
        default:
          tradingFeeRate = 0.005; // Default to HBAR rate
      }
      
      const tradingFee = totalValue * tradingFeeRate;
      const totalFees = tradingFee;

      // Create trade execution record
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
        status: TradeStatus.PENDING,
        paymentToken: buyOrder.paymentToken,
        tradingFees: tradingFee,
        totalFees
      });

      await trade.save();

      try {
        // Execute Hedera token transfers
        await this.executeHederaTrade(trade, buyOrder, sellOrder);
        
        // Update trade status to executed
        trade.status = TradeStatus.EXECUTED;
        trade.executedAt = new Date();
        trade.isSettled = true;
        trade.settledAt = new Date();
        
        // Log trade to HCS
        await this.logTradeToHCS(trade);
        
        // Burn TRUST tokens for trading fees if using TRUST
        if (buyOrder.paymentToken === 'TRUST' && tradingFee > 0) {
          await this.burnTrustTokensForTradingFee(trade, tradingFee);
        }
        
      } catch (hederaError) {
        this.logger.error('Hedera trade execution failed:', hederaError);
        trade.status = TradeStatus.FAILED;
        trade.failedAt = new Date();
        trade.failureReason = hederaError.message;
      }

      await this.tradeExecutionModel.findByIdAndUpdate((trade as any)._id, trade);

      // Update orders only if trade was successful
      if (trade.status === TradeStatus.EXECUTED) {
        buyOrder.filledAmount += tradeAmount;
        buyOrder.remainingAmount -= tradeAmount;
        buyOrder.status = buyOrder.remainingAmount === 0 ? OrderStatus.FILLED : OrderStatus.PARTIALLY_FILLED;
        if (buyOrder.remainingAmount === 0) {
          buyOrder.filledAt = new Date();
        }

        sellOrder.filledAmount += tradeAmount;
        sellOrder.remainingAmount -= tradeAmount;
        sellOrder.status = sellOrder.remainingAmount === 0 ? OrderStatus.FILLED : OrderStatus.PARTIALLY_FILLED;
        if (sellOrder.remainingAmount === 0) {
          sellOrder.filledAt = new Date();
        }

        await Promise.all([
          this.tradingOrderModel.findByIdAndUpdate((buyOrder as any)._id, buyOrder), 
          this.tradingOrderModel.findByIdAndUpdate((sellOrder as any)._id, sellOrder)
        ]);

        // Update pool current price
        await this.updatePoolPrice(buyOrder.poolId, executionPrice);
      }

      this.logger.log(`Executed trade: ${tradeId} for ${tradeAmount} tokens at ${executionPrice} - Status: ${trade.status}`);
    } catch (error) {
      this.logger.error('Failed to execute trade:', error);
      throw error;
    }
  }

  /**
   * Execute Hedera token transfers for trade
   */
  private async executeHederaTrade(trade: TradeExecution, buyOrder: TradingOrder, sellOrder: TradingOrder): Promise<void> {
    try {
      const { TransferTransaction, TokenId, AccountId, Hbar } = await import('@hashgraph/sdk');
      
      // Get pool token ID
      const poolTokenId = TokenId.fromString(trade.poolTokenId);
      const buyerAccountId = AccountId.fromString(trade.buyerAddress);
      const sellerAccountId = AccountId.fromString(trade.sellerAddress);
      
      // Create token transfer transaction
      const transferTx = new TransferTransaction()
        .addTokenTransfer(poolTokenId, sellerAccountId, -trade.tokenAmount) // From seller
        .addTokenTransfer(poolTokenId, buyerAccountId, trade.tokenAmount)  // To buyer
        .setMaxTransactionFee(new Hbar(2))
        .setTransactionMemo(`Trade: ${trade.tradeId} | Pool: ${trade.poolId} | Amount: ${trade.tokenAmount} | Price: ${trade.pricePerToken}`);

      // Execute the transfer
      const response = await transferTx.execute(this.hederaService['client']);
      
      // Update trade with transaction details
      trade.hederaTransactionHash = response.transactionId.toString();
      trade.settlementTransactionHash = response.transactionId.toString();
      
      this.logger.log(`Hedera trade executed: ${trade.tradeId} - TX: ${response.transactionId}`);
      
    } catch (error) {
      this.logger.error('Hedera trade execution failed:', error);
      throw error;
    }
  }

  /**
   * Log order to HCS for public verification
   */
  private async logOrderToHCS(order: TradingOrder): Promise<void> {
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
        createdAt: new Date().toISOString(),
        timestamp: new Date().toISOString()
      };

      await this.hederaService.createHCSMessage('TRADING_EVENTS', orderEvent);
      this.logger.log(`Order logged to HCS: ${order.orderId}`);
      
    } catch (error) {
      this.logger.warn('Failed to log order to HCS (non-critical):', error.message);
    }
  }

  /**
   * Burn TRUST tokens for trading fees
   */
  private async burnTrustTokensForTradingFee(trade: TradeExecution, feeAmount: number): Promise<void> {
    try {
      // Get platform treasury account for burning
      const treasuryAccount = process.env.HEDERA_ACCOUNT_ID;
      if (!treasuryAccount) {
        this.logger.warn('Treasury account not configured, skipping TRUST burn');
        return;
      }

      // Burn TRUST tokens from treasury (representing fees collected)
      await this.hederaService.burnTokens(feeAmount);
      
      this.logger.log(`Burned ${feeAmount} TRUST tokens for trading fee: ${trade.tradeId}`);
      
    } catch (error) {
      this.logger.warn('Failed to burn TRUST tokens for trading fee (non-critical):', error.message);
    }
  }

  /**
   * Log trade to HCS for public verification
   */
  private async logTradeToHCS(trade: TradeExecution): Promise<void> {
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

      await this.hederaService.createHCSMessage('TRADING_EVENTS', tradeEvent);
      this.logger.log(`Trade logged to HCS: ${trade.tradeId}`);
      
    } catch (error) {
      this.logger.warn('Failed to log trade to HCS (non-critical):', error.message);
    }
  }

  /**
   * Update pool current price based on recent trades
   */
  private async updatePoolPrice(poolId: string, newPrice: number): Promise<void> {
    try {
      const pool = await this.amcPoolModel.findOne({ poolId });
      if (!pool) return;

      const previousPrice = pool.currentPrice;
      const priceChange24h = previousPrice > 0 ? 
        ((newPrice - previousPrice) / previousPrice) * 100 : 0;

      pool.currentPrice = newPrice;
      pool.priceChange24h = priceChange24h;
      
      await pool.save();
    } catch (error) {
      this.logger.error('Failed to update pool price:', error);
    }
  }

  /**
   * Get trading statistics for a pool
   */
  async getPoolTradingStats(poolId: string): Promise<any> {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const [trades24h, trades7d, activeOrders] = await Promise.all([
        this.tradeExecutionModel.find({
          poolId,
          status: TradeStatus.EXECUTED,
          executedAt: { $gte: oneDayAgo }
        }),
        this.tradeExecutionModel.find({
          poolId,
          status: TradeStatus.EXECUTED,
          executedAt: { $gte: oneWeekAgo }
        }),
        this.tradingOrderModel.find({
          poolId,
          status: { $in: [OrderStatus.PENDING, OrderStatus.PARTIALLY_FILLED] }
        })
      ]);

      const volume24h = trades24h.reduce((sum, trade) => sum + trade.totalValue, 0);
      const volume7d = trades7d.reduce((sum, trade) => sum + trade.totalValue, 0);
      const tradesCount24h = trades24h.length;
      const tradesCount7d = trades7d.length;

      const buyOrders = activeOrders.filter(order => order.orderSide === OrderSide.BID);
      const sellOrders = activeOrders.filter(order => order.orderSide === OrderSide.ASK);

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
    } catch (error) {
      this.logger.error('Failed to get pool trading stats:', error);
      throw error;
    }
  }
}