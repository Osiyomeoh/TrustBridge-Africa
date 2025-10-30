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
var PagaController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagaController = void 0;
const common_1 = require("@nestjs/common");
const paga_service_1 = require("./paga.service");
let PagaController = PagaController_1 = class PagaController {
    constructor(pagaService) {
        this.pagaService = pagaService;
        this.logger = new common_1.Logger(PagaController_1.name);
    }
    async createPayment(body) {
        try {
            const reference = this.pagaService.generatePaymentCode(body.userId, body.amount);
            const paymentRequest = await this.pagaService.createAgentPaymentRequest(body.phoneNumber, body.amount, reference, body.description);
            await this.pagaService.sendPaymentInstructions(body.phoneNumber, paymentRequest.paymentCode, body.amount);
            return {
                success: true,
                data: paymentRequest,
            };
        }
        catch (error) {
            this.logger.error('Error creating Paga payment:', error);
            throw error;
        }
    }
    async verifyPayment(reference) {
        try {
            const verification = await this.pagaService.verifyPayment(reference);
            return {
                success: true,
                data: verification,
            };
        }
        catch (error) {
            this.logger.error('Error verifying payment:', error);
            throw error;
        }
    }
    async getNearbyAgents(lat, lng) {
        try {
            const agents = await this.pagaService.getNearbyAgents(parseFloat(lat), parseFloat(lng));
            return {
                success: true,
                data: agents,
            };
        }
        catch (error) {
            this.logger.error('Error getting nearby agents:', error);
            throw error;
        }
    }
    async handleWebhook(body) {
        try {
            this.logger.log('Paga webhook received:', body);
            const { referenceNumber, amount, status, transactionReference } = body.data || body;
            if (!referenceNumber || !status) {
                this.logger.warn('Invalid webhook data:', body);
                return {
                    success: false,
                    message: 'Invalid webhook data',
                };
            }
            const isPaid = status === 'SUCCESSFUL' || status === 'COMPLETED';
            if (isPaid) {
                this.logger.log(`✅ Payment confirmed: ${referenceNumber}, Amount: ₦${amount}`);
                this.logger.log('Payment verified - asset creation should proceed');
            }
            else {
                this.logger.warn(`❌ Payment failed: ${referenceNumber}, Status: ${status}`);
            }
            return {
                success: true,
                message: 'Webhook processed',
                paymentStatus: status,
            };
        }
        catch (error) {
            this.logger.error('Error handling webhook:', error);
            throw error;
        }
    }
};
exports.PagaController = PagaController;
__decorate([
    (0, common_1.Post)('create-payment'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PagaController.prototype, "createPayment", null);
__decorate([
    (0, common_1.Get)('verify/:reference'),
    __param(0, (0, common_1.Param)('reference')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PagaController.prototype, "verifyPayment", null);
__decorate([
    (0, common_1.Get)('agents/:lat/:lng'),
    __param(0, (0, common_1.Param)('lat')),
    __param(1, (0, common_1.Param)('lng')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PagaController.prototype, "getNearbyAgents", null);
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PagaController.prototype, "handleWebhook", null);
exports.PagaController = PagaController = PagaController_1 = __decorate([
    (0, common_1.Controller)('paga'),
    __metadata("design:paramtypes", [paga_service_1.PagaService])
], PagaController);
//# sourceMappingURL=paga.controller.js.map