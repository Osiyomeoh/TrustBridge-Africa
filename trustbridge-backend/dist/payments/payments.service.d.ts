import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { PaymentDocument, PaymentStatus, PaymentMethod, PaymentType } from '../schemas/payment.schema';
import { HederaService } from '../hedera/hedera.service';
import { NotificationsService } from '../notifications/notifications.service';
export interface PaymentRequest {
    userId: string;
    assetId?: string;
    amount: number;
    currency: string;
    method: PaymentMethod;
    type: PaymentType;
    description?: string;
    metadata?: any;
}
export interface PaymentResult {
    paymentId: string;
    status: PaymentStatus;
    externalTransactionId?: string;
    blockchainTxId?: string;
    paymentUrl?: string;
    qrCode?: string;
    expiresAt?: Date;
}
export interface EscrowRequest {
    buyerId: string;
    sellerId: string;
    assetId: string;
    amount: number;
    currency: string;
    deliveryDeadline: Date;
    conditions: string[];
}
export declare class PaymentsService {
    private paymentModel;
    private configService;
    private hederaService;
    private notificationsService;
    private readonly logger;
    private stripe;
    private readonly feeRates;
    constructor(paymentModel: Model<PaymentDocument>, configService: ConfigService, hederaService: HederaService, notificationsService: NotificationsService);
    createPayment(paymentRequest: PaymentRequest): Promise<PaymentResult>;
    processHbarPayment(payment: PaymentDocument): Promise<PaymentResult>;
    processStripePayment(payment: PaymentDocument): Promise<PaymentResult>;
    processPayPalPayment(payment: PaymentDocument): Promise<PaymentResult>;
    processMobileMoneyPayment(payment: PaymentDocument): Promise<PaymentResult>;
    createEscrow(escrowRequest: EscrowRequest): Promise<PaymentResult>;
    releaseEscrow(paymentId: string, buyerConfirmation: boolean): Promise<void>;
    processWebhook(provider: string, payload: any): Promise<void>;
    private processStripeWebhook;
    private processPayPalWebhook;
    private processMobileMoneyWebhook;
    getPaymentStatus(paymentId: string): Promise<PaymentDocument>;
    getUserPayments(userId: string, limit?: number): Promise<PaymentDocument[]>;
    refundPayment(paymentId: string, reason: string): Promise<void>;
    private generatePaymentId;
    private calculateFee;
    getPaymentStats(): Promise<{
        totalPayments: number;
        totalVolume: number;
        successRate: number;
        averageAmount: number;
        methodBreakdown: {
            [method: string]: number;
        };
    }>;
}
