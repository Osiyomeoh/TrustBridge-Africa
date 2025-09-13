import { PaymentsService } from './payments.service';
import { PaymentMethod, PaymentType } from '../schemas/payment.schema';
export declare class CreatePaymentDto {
    userId: string;
    assetId?: string;
    amount: number;
    currency: string;
    method: PaymentMethod;
    type: PaymentType;
    description?: string;
    metadata?: any;
}
export declare class CreateEscrowDto {
    buyerId: string;
    sellerId: string;
    assetId: string;
    amount: number;
    currency: string;
    deliveryDeadline: Date;
    conditions: string[];
}
export declare class ReleaseEscrowDto {
    buyerConfirmation: boolean;
}
export declare class RefundPaymentDto {
    reason: string;
}
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    createPayment(createPaymentDto: CreatePaymentDto): Promise<{
        success: boolean;
        data: import("./payments.service").PaymentResult;
        message: string;
    }>;
    createEscrow(createEscrowDto: CreateEscrowDto): Promise<{
        success: boolean;
        data: import("./payments.service").PaymentResult;
        message: string;
    }>;
    releaseEscrow(paymentId: string, releaseEscrowDto: ReleaseEscrowDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getPaymentStatus(paymentId: string): Promise<{
        success: boolean;
        data: import("../schemas/payment.schema").PaymentDocument;
        message: string;
    }>;
    getUserPayments(userId: string, limit?: string): Promise<{
        success: boolean;
        data: import("../schemas/payment.schema").PaymentDocument[];
        message: string;
    }>;
    refundPayment(paymentId: string, refundPaymentDto: RefundPaymentDto): Promise<{
        success: boolean;
        message: string;
    }>;
    processWebhook(provider: string, payload: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getPaymentStats(): Promise<{
        success: boolean;
        data: {
            totalPayments: number;
            totalVolume: number;
            successRate: number;
            averageAmount: number;
            methodBreakdown: {
                [method: string]: number;
            };
        };
        message: string;
    }>;
    getPaymentMethods(): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            description: string;
            icon: string;
            supported: boolean;
            fees: string;
        }[];
        message: string;
    }>;
    getFeeStructure(): Promise<{
        success: boolean;
        data: {
            tokenization: {
                rate: string;
                description: string;
                minimum: string;
                maximum: string;
            };
            verification: {
                rate: string;
                description: string;
                minimum: string;
                maximum: string;
            };
            investment: {
                rate: string;
                description: string;
                minimum: string;
                maximum: string;
            };
            attestor: {
                rate: string;
                description: string;
                minimum: string;
                maximum: string;
            };
        };
        message: string;
    }>;
}
