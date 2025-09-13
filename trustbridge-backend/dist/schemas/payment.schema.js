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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentSchema = exports.Payment = exports.PaymentType = exports.PaymentMethod = exports.PaymentStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["PROCESSING"] = "PROCESSING";
    PaymentStatus["COMPLETED"] = "COMPLETED";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
    PaymentStatus["CANCELLED"] = "CANCELLED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["HBAR"] = "HBAR";
    PaymentMethod["STRIPE"] = "STRIPE";
    PaymentMethod["PAYPAL"] = "PAYPAL";
    PaymentMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethod["MOBILE_MONEY"] = "MOBILE_MONEY";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var PaymentType;
(function (PaymentType) {
    PaymentType["TOKENIZATION_FEE"] = "TOKENIZATION_FEE";
    PaymentType["VERIFICATION_FEE"] = "VERIFICATION_FEE";
    PaymentType["INVESTMENT"] = "INVESTMENT";
    PaymentType["ESCROW"] = "ESCROW";
    PaymentType["SETTLEMENT"] = "SETTLEMENT";
    PaymentType["REFUND"] = "REFUND";
    PaymentType["PLATFORM_FEE"] = "PLATFORM_FEE";
})(PaymentType || (exports.PaymentType = PaymentType = {}));
let Payment = class Payment {
};
exports.Payment = Payment;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Payment.prototype, "paymentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Payment.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Payment.prototype, "assetId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Payment.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Payment.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: PaymentMethod }),
    __metadata("design:type", String)
], Payment.prototype, "method", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: PaymentType }),
    __metadata("design:type", String)
], Payment.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDING }),
    __metadata("design:type", String)
], Payment.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Payment.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Payment.prototype, "externalTransactionId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Payment.prototype, "blockchainTxId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Payment.prototype, "feeAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Payment.prototype, "netAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Payment.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Payment.prototype, "failureReason", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Payment.prototype, "refundAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Payment.prototype, "refundReason", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Payment.prototype, "refundedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Payment.prototype, "completedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Payment.prototype, "expiresAt", void 0);
exports.Payment = Payment = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Payment);
exports.PaymentSchema = mongoose_1.SchemaFactory.createForClass(Payment);
//# sourceMappingURL=payment.schema.js.map