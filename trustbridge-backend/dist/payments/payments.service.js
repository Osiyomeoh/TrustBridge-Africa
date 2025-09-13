"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const config_1 = require("@nestjs/config");
const payment_schema_1 = require("../schemas/payment.schema");
const hedera_service_1 = require("../hedera/hedera.service");
const notifications_service_1 = require("../notifications/notifications.service");
const stripe_1 = __importDefault(require("stripe"));
const axios_1 = __importDefault(require("axios"));
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(paymentModel, configService, hederaService, notificationsService) {
        this.paymentModel = paymentModel;
        this.configService = configService;
        this.hederaService = hederaService;
        this.notificationsService = notificationsService;
        this.logger = new common_1.Logger(PaymentsService_1.name);
        this.feeRates = {
            tokenization: 0.02,
            verification: 0.01,
            platform: 0.005,
            attestor: 0.01,
        };
        const stripeSecretKey = this.configService.get('STRIPE_SECRET_KEY');
        if (stripeSecretKey) {
            this.stripe = new stripe_1.default(stripeSecretKey, { apiVersion: '2025-08-27.basil' });
        }
    }
    async createPayment(paymentRequest) {
        try {
            const paymentId = this.generatePaymentId();
            const feeAmount = this.calculateFee(paymentRequest.amount, paymentRequest.type);
            const netAmount = paymentRequest.amount - feeAmount;
            const payment = new this.paymentModel({
                paymentId,
                userId: paymentRequest.userId,
                assetId: paymentRequest.assetId,
                amount: paymentRequest.amount,
                currency: paymentRequest.currency,
                method: paymentRequest.method,
                type: paymentRequest.type,
                status: payment_schema_1.PaymentStatus.PENDING,
                description: paymentRequest.description,
                feeAmount,
                netAmount,
                metadata: paymentRequest.metadata,
                expiresAt: new Date(Date.now() + 30 * 60 * 1000),
            });
            await payment.save();
            let result;
            switch (paymentRequest.method) {
                case payment_schema_1.PaymentMethod.HBAR:
                    result = await this.processHbarPayment(payment);
                    break;
                case payment_schema_1.PaymentMethod.STRIPE:
                    result = await this.processStripePayment(payment);
                    break;
                case payment_schema_1.PaymentMethod.PAYPAL:
                    result = await this.processPayPalPayment(payment);
                    break;
                case payment_schema_1.PaymentMethod.MOBILE_MONEY:
                    result = await this.processMobileMoneyPayment(payment);
                    break;
                default:
                    throw new common_1.BadRequestException(`Unsupported payment method: ${paymentRequest.method}`);
            }
            payment.status = result.status;
            payment.externalTransactionId = result.externalTransactionId;
            payment.blockchainTxId = result.blockchainTxId;
            await payment.save();
            return result;
        }
        catch (error) {
            this.logger.error('Failed to create payment:', error);
            throw error;
        }
    }
    async processHbarPayment(payment) {
        try {
            const transactionId = await this.hederaService.transferTokens(payment.userId, '0.0.12345', payment.amount.toString(), 0);
            return {
                paymentId: payment.paymentId,
                status: payment_schema_1.PaymentStatus.COMPLETED,
                blockchainTxId: transactionId,
            };
        }
        catch (error) {
            this.logger.error('HBAR payment failed:', error);
            return {
                paymentId: payment.paymentId,
                status: payment_schema_1.PaymentStatus.FAILED,
            };
        }
    }
    async processStripePayment(payment) {
        try {
            if (!this.stripe) {
                throw new common_1.BadRequestException('Stripe not configured');
            }
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(payment.amount * 100),
                currency: payment.currency.toLowerCase(),
                metadata: {
                    paymentId: payment.paymentId,
                    userId: payment.userId,
                    type: payment.type,
                },
                description: payment.description,
            });
            return {
                paymentId: payment.paymentId,
                status: payment_schema_1.PaymentStatus.PROCESSING,
                externalTransactionId: paymentIntent.id,
                paymentUrl: `https://checkout.stripe.com/pay/${paymentIntent.client_secret}`,
            };
        }
        catch (error) {
            this.logger.error('Stripe payment failed:', error);
            return {
                paymentId: payment.paymentId,
                status: payment_schema_1.PaymentStatus.FAILED,
            };
        }
    }
    async processPayPalPayment(payment) {
        try {
            const paypalOrderId = `paypal_${Date.now()}`;
            return {
                paymentId: payment.paymentId,
                status: payment_schema_1.PaymentStatus.PROCESSING,
                externalTransactionId: paypalOrderId,
                paymentUrl: `https://paypal.com/checkout/${paypalOrderId}`,
            };
        }
        catch (error) {
            this.logger.error('PayPal payment failed:', error);
            return {
                paymentId: payment.paymentId,
                status: payment_schema_1.PaymentStatus.FAILED,
            };
        }
    }
    async processMobileMoneyPayment(payment) {
        try {
            const mobileMoneyResponse = await axios_1.default.post('https://api.africastalking.com/version1/payments/mobile/checkout/request', {
                username: this.configService.get('AT_USERNAME'),
                productName: 'TrustBridge',
                phoneNumber: payment.metadata?.phoneNumber,
                currencyCode: payment.currency,
                amount: payment.amount,
                metadata: {
                    paymentId: payment.paymentId,
                    userId: payment.userId,
                },
            }, {
                headers: {
                    'apiKey': this.configService.get('AT_API_KEY'),
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            return {
                paymentId: payment.paymentId,
                status: payment_schema_1.PaymentStatus.PROCESSING,
                externalTransactionId: mobileMoneyResponse.data.transactionId,
                qrCode: mobileMoneyResponse.data.qrCode,
            };
        }
        catch (error) {
            this.logger.error('Mobile money payment failed:', error);
            return {
                paymentId: payment.paymentId,
                status: payment_schema_1.PaymentStatus.FAILED,
            };
        }
    }
    async createEscrow(escrowRequest) {
        try {
            const paymentId = this.generatePaymentId();
            const escrowPayment = new this.paymentModel({
                paymentId,
                userId: escrowRequest.buyerId,
                assetId: escrowRequest.assetId,
                amount: escrowRequest.amount,
                currency: escrowRequest.currency,
                method: payment_schema_1.PaymentMethod.HBAR,
                type: payment_schema_1.PaymentType.ESCROW,
                status: payment_schema_1.PaymentStatus.PENDING,
                description: `Escrow for asset ${escrowRequest.assetId}`,
                metadata: {
                    sellerId: escrowRequest.sellerId,
                    deliveryDeadline: escrowRequest.deliveryDeadline,
                    conditions: escrowRequest.conditions,
                },
                expiresAt: escrowRequest.deliveryDeadline,
            });
            await escrowPayment.save();
            const escrowTxId = await this.hederaService.createEscrow(escrowRequest.buyerId, escrowRequest.sellerId, escrowRequest.amount, escrowRequest.deliveryDeadline, escrowRequest.conditions.join(','));
            escrowPayment.status = payment_schema_1.PaymentStatus.COMPLETED;
            escrowPayment.blockchainTxId = escrowTxId;
            await escrowPayment.save();
            return {
                paymentId,
                status: payment_schema_1.PaymentStatus.COMPLETED,
                blockchainTxId: escrowTxId,
            };
        }
        catch (error) {
            this.logger.error('Failed to create escrow:', error);
            throw error;
        }
    }
    async releaseEscrow(paymentId, buyerConfirmation) {
        try {
            const payment = await this.paymentModel.findOne({ paymentId });
            if (!payment) {
                throw new common_1.BadRequestException('Payment not found');
            }
            if (payment.type !== payment_schema_1.PaymentType.ESCROW) {
                throw new common_1.BadRequestException('Payment is not an escrow');
            }
            if (buyerConfirmation) {
                await this.hederaService.releaseEscrow(payment.blockchainTxId);
                payment.status = payment_schema_1.PaymentStatus.COMPLETED;
                payment.completedAt = new Date();
            }
            else {
                await this.hederaService.refundEscrow(payment.blockchainTxId);
                payment.status = payment_schema_1.PaymentStatus.REFUNDED;
                payment.refundedAt = new Date();
            }
            await payment.save();
            await this.notificationsService.sendNotification({
                to: payment.metadata?.sellerId,
                type: 'email',
                templateId: buyerConfirmation ? 'escrow_released' : 'escrow_refunded',
                message: `Escrow ${buyerConfirmation ? 'released' : 'refunded'} for payment ${paymentId}`,
            });
        }
        catch (error) {
            this.logger.error('Failed to release escrow:', error);
            throw error;
        }
    }
    async processWebhook(provider, payload) {
        try {
            switch (provider) {
                case 'stripe':
                    await this.processStripeWebhook(payload);
                    break;
                case 'paypal':
                    await this.processPayPalWebhook(payload);
                    break;
                case 'mobile_money':
                    await this.processMobileMoneyWebhook(payload);
                    break;
                default:
                    this.logger.warn(`Unknown webhook provider: ${provider}`);
            }
        }
        catch (error) {
            this.logger.error('Webhook processing failed:', error);
            throw error;
        }
    }
    async processStripeWebhook(payload) {
        const { type, data } = payload;
        if (type === 'payment_intent.succeeded') {
            const paymentIntent = data.object;
            const payment = await this.paymentModel.findOne({
                externalTransactionId: paymentIntent.id,
            });
            if (payment) {
                payment.status = payment_schema_1.PaymentStatus.COMPLETED;
                payment.completedAt = new Date();
                await payment.save();
                await this.notificationsService.sendNotification({
                    to: payment.userId,
                    type: 'email',
                    templateId: 'payment_completed',
                    message: `Payment of ${payment.amount} ${payment.currency} completed successfully`,
                });
            }
        }
    }
    async processPayPalWebhook(payload) {
        this.logger.log('PayPal webhook received:', payload);
    }
    async processMobileMoneyWebhook(payload) {
        this.logger.log('Mobile money webhook received:', payload);
    }
    async getPaymentStatus(paymentId) {
        const payment = await this.paymentModel.findOne({ paymentId });
        if (!payment) {
            throw new common_1.BadRequestException('Payment not found');
        }
        return payment;
    }
    async getUserPayments(userId, limit = 50) {
        return this.paymentModel.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit);
    }
    async refundPayment(paymentId, reason) {
        try {
            const payment = await this.paymentModel.findOne({ paymentId });
            if (!payment) {
                throw new common_1.BadRequestException('Payment not found');
            }
            if (payment.status !== payment_schema_1.PaymentStatus.COMPLETED) {
                throw new common_1.BadRequestException('Only completed payments can be refunded');
            }
            let refundTxId;
            switch (payment.method) {
                case payment_schema_1.PaymentMethod.HBAR:
                    refundTxId = await this.hederaService.transferTokens('0.0.12345', payment.userId, payment.amount.toString(), 0);
                    break;
                case payment_schema_1.PaymentMethod.STRIPE:
                    if (this.stripe) {
                        const refund = await this.stripe.refunds.create({
                            payment_intent: payment.externalTransactionId,
                            reason: 'requested_by_customer',
                        });
                        refundTxId = refund.id;
                    }
                    break;
                default:
                    throw new common_1.BadRequestException(`Refund not supported for ${payment.method}`);
            }
            payment.status = payment_schema_1.PaymentStatus.REFUNDED;
            payment.refundAmount = payment.amount;
            payment.refundReason = reason;
            payment.refundedAt = new Date();
            payment.blockchainTxId = refundTxId;
            await payment.save();
            await this.notificationsService.sendNotification({
                to: payment.userId,
                type: 'email',
                templateId: 'payment_refunded',
                message: `Payment refunded: ${payment.amount} ${payment.currency}`,
            });
        }
        catch (error) {
            this.logger.error('Failed to refund payment:', error);
            throw error;
        }
    }
    generatePaymentId() {
        return `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    calculateFee(amount, type) {
        switch (type) {
            case payment_schema_1.PaymentType.TOKENIZATION_FEE:
                return amount * this.feeRates.tokenization;
            case payment_schema_1.PaymentType.VERIFICATION_FEE:
                return amount * this.feeRates.verification;
            case payment_schema_1.PaymentType.INVESTMENT:
                return amount * this.feeRates.platform;
            default:
                return 0;
        }
    }
    async getPaymentStats() {
        const stats = await this.paymentModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalPayments: { $sum: 1 },
                    totalVolume: { $sum: '$amount' },
                    successfulPayments: {
                        $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
                    },
                    averageAmount: { $avg: '$amount' },
                }
            }
        ]);
        const methodStats = await this.paymentModel.aggregate([
            { $group: { _id: '$method', count: { $sum: 1 } } }
        ]);
        const methodBreakdown = {};
        methodStats.forEach(stat => {
            methodBreakdown[stat._id] = stat.count;
        });
        const result = stats[0] || {
            totalPayments: 0,
            totalVolume: 0,
            successfulPayments: 0,
            averageAmount: 0,
        };
        return {
            totalPayments: result.totalPayments,
            totalVolume: result.totalVolume,
            successRate: result.totalPayments > 0 ? (result.successfulPayments / result.totalPayments) * 100 : 0,
            averageAmount: result.averageAmount,
            methodBreakdown,
        };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(payment_schema_1.Payment.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        config_1.ConfigService,
        hedera_service_1.HederaService,
        notifications_service_1.NotificationsService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map