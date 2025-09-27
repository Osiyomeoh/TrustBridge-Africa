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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = exports.RefundPaymentDto = exports.ReleaseEscrowDto = exports.CreateEscrowDto = exports.CreatePaymentDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payments_service_1 = require("./payments.service");
class CreatePaymentDto {
}
exports.CreatePaymentDto = CreatePaymentDto;
class CreateEscrowDto {
}
exports.CreateEscrowDto = CreateEscrowDto;
class ReleaseEscrowDto {
}
exports.ReleaseEscrowDto = ReleaseEscrowDto;
class RefundPaymentDto {
}
exports.RefundPaymentDto = RefundPaymentDto;
let PaymentsController = class PaymentsController {
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async createPayment(createPaymentDto) {
        const result = await this.paymentsService.createPayment(createPaymentDto);
        return {
            success: true,
            data: result,
            message: 'Payment created successfully',
        };
    }
    async createEscrow(createEscrowDto) {
        const result = await this.paymentsService.createEscrow(createEscrowDto);
        return {
            success: true,
            data: result,
            message: 'Escrow created successfully',
        };
    }
    async releaseEscrow(paymentId, releaseEscrowDto) {
        await this.paymentsService.releaseEscrow(paymentId, releaseEscrowDto.buyerConfirmation);
        return {
            success: true,
            message: 'Escrow processed successfully',
        };
    }
    async getPaymentStatus(paymentId) {
        const payment = await this.paymentsService.getPaymentStatus(paymentId);
        return {
            success: true,
            data: payment,
            message: 'Payment status retrieved successfully',
        };
    }
    async getUserPayments(userId, limit) {
        const limitNumber = limit ? parseInt(limit, 10) : 50;
        const payments = await this.paymentsService.getUserPayments(userId, limitNumber);
        return {
            success: true,
            data: payments,
            message: 'User payments retrieved successfully',
        };
    }
    async refundPayment(paymentId, refundPaymentDto) {
        await this.paymentsService.refundPayment(paymentId, refundPaymentDto.reason);
        return {
            success: true,
            message: 'Payment refunded successfully',
        };
    }
    async processWebhook(provider, payload) {
        await this.paymentsService.processWebhook(provider, payload);
        return {
            success: true,
            message: 'Webhook processed successfully',
        };
    }
    async getPaymentStats() {
        const stats = await this.paymentsService.getPaymentStats();
        return {
            success: true,
            data: stats,
            message: 'Payment statistics retrieved successfully',
        };
    }
    async getPaymentMethods() {
        const methods = [
            {
                id: 'HBAR',
                name: 'Hedera HBAR',
                description: 'Pay with Hedera HBAR tokens',
                icon: 'hbar',
                supported: true,
                fees: '0.1%',
            },
            {
                id: 'STRIPE',
                name: 'Credit/Debit Card',
                description: 'Pay with Visa, Mastercard, or other cards',
                icon: 'card',
                supported: true,
                fees: '2.9% + $0.30',
            },
            {
                id: 'PAYPAL',
                name: 'PayPal',
                description: 'Pay with PayPal account',
                icon: 'paypal',
                supported: true,
                fees: '2.9% + $0.30',
            },
            {
                id: 'MOBILE_MONEY',
                name: 'Mobile Money',
                description: 'Pay with M-Pesa, Airtel Money, etc.',
                icon: 'mobile',
                supported: true,
                fees: '1.5%',
            },
        ];
        return {
            success: true,
            data: methods,
            message: 'Payment methods retrieved successfully',
        };
    }
    async getFeeStructure() {
        const fees = {
            tokenization: {
                rate: '2%',
                description: 'Fee for tokenizing an asset',
                minimum: '$10',
                maximum: '$10,000',
            },
            verification: {
                rate: '1%',
                description: 'Fee for asset verification',
                minimum: '$5',
                maximum: '$5,000',
            },
            investment: {
                rate: '0.5%',
                description: 'Platform fee for investments',
                minimum: '$1',
                maximum: '$1,000',
            },
            attestor: {
                rate: '1%',
                description: 'Fee paid to attestors for verification',
                minimum: '$5',
                maximum: '$5,000',
            },
        };
        return {
            success: true,
            data: fees,
            message: 'Fee structure retrieved successfully',
        };
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new payment' }),
    (0, swagger_1.ApiBody)({ type: CreatePaymentDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Payment created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid payment request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreatePaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createPayment", null);
__decorate([
    (0, common_1.Post)('escrow'),
    (0, swagger_1.ApiOperation)({ summary: 'Create escrow payment' }),
    (0, swagger_1.ApiBody)({ type: CreateEscrowDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Escrow created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid escrow request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateEscrowDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createEscrow", null);
__decorate([
    (0, common_1.Put)('escrow/:paymentId/release'),
    (0, swagger_1.ApiOperation)({ summary: 'Release or refund escrow' }),
    (0, swagger_1.ApiBody)({ type: ReleaseEscrowDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Escrow processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid escrow operation' }),
    __param(0, (0, common_1.Param)('paymentId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ReleaseEscrowDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "releaseEscrow", null);
__decorate([
    (0, common_1.Get)('status/:paymentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment status retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Payment not found' }),
    __param(0, (0, common_1.Param)('paymentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPaymentStatus", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user payments' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User payments retrieved successfully' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getUserPayments", null);
__decorate([
    (0, common_1.Put)('refund/:paymentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Refund payment' }),
    (0, swagger_1.ApiBody)({ type: RefundPaymentDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment refunded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Refund not possible' }),
    __param(0, (0, common_1.Param)('paymentId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, RefundPaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "refundPayment", null);
__decorate([
    (0, common_1.Post)('webhook/:provider'),
    (0, swagger_1.ApiOperation)({ summary: 'Process payment webhook' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed successfully' }),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "processWebhook", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment statistics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPaymentStats", null);
__decorate([
    (0, common_1.Get)('methods'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available payment methods' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment methods retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPaymentMethods", null);
__decorate([
    (0, common_1.Get)('fees'),
    (0, swagger_1.ApiOperation)({ summary: 'Get fee structure' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fee structure retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getFeeStructure", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('Payments'),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map