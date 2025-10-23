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
exports.TradeExecutionSchema = exports.TradeExecution = exports.TradeStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var TradeStatus;
(function (TradeStatus) {
    TradeStatus["PENDING"] = "PENDING";
    TradeStatus["EXECUTED"] = "EXECUTED";
    TradeStatus["FAILED"] = "FAILED";
    TradeStatus["CANCELLED"] = "CANCELLED";
})(TradeStatus || (exports.TradeStatus = TradeStatus = {}));
let TradeExecution = class TradeExecution {
};
exports.TradeExecution = TradeExecution;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], TradeExecution.prototype, "tradeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TradeExecution.prototype, "poolId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TradeExecution.prototype, "poolTokenId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TradeExecution.prototype, "buyOrderId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TradeExecution.prototype, "sellOrderId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TradeExecution.prototype, "buyerAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TradeExecution.prototype, "sellerAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], TradeExecution.prototype, "tokenAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], TradeExecution.prototype, "pricePerToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], TradeExecution.prototype, "totalValue", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(TradeStatus), default: TradeStatus.PENDING }),
    __metadata("design:type", String)
], TradeExecution.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TradeExecution.prototype, "paymentToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TradeExecution.prototype, "tradingFees", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TradeExecution.prototype, "gasFees", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TradeExecution.prototype, "totalFees", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], TradeExecution.prototype, "hederaTransactionHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], TradeExecution.prototype, "executedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], TradeExecution.prototype, "failedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], TradeExecution.prototype, "failureReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            blockNumber: { type: Number, default: 0 },
            gasUsed: { type: Number, default: 0 },
            gasPrice: { type: Number, default: 0 },
            nonce: { type: Number, default: 0 },
            fromAddress: { type: String, default: '' },
            toAddress: { type: String, default: '' }
        },
        default: {}
    }),
    __metadata("design:type", Object)
], TradeExecution.prototype, "executionDetails", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: [] }),
    __metadata("design:type", Array)
], TradeExecution.prototype, "tokenTransfers", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            beforePrice: { type: Number, default: 0 },
            afterPrice: { type: Number, default: 0 },
            impactPercentage: { type: Number, default: 0 },
            volumeWeightedPrice: { type: Number, default: 0 }
        },
        default: {}
    }),
    __metadata("design:type", Object)
], TradeExecution.prototype, "priceImpact", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], TradeExecution.prototype, "orderBookSnapshot", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], TradeExecution.prototype, "isSettled", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], TradeExecution.prototype, "settledAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], TradeExecution.prototype, "settlementTransactionHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            marketMaker: { type: Boolean, default: false },
            liquidityProvider: { type: Boolean, default: false },
            arbitrageTrade: { type: Boolean, default: false },
            largeTrade: { type: Boolean, default: false },
            tradeSize: { type: String, enum: ['SMALL', 'MEDIUM', 'LARGE', 'WHALE'], default: 'SMALL' }
        },
        default: {}
    }),
    __metadata("design:type", Object)
], TradeExecution.prototype, "metadata", void 0);
exports.TradeExecution = TradeExecution = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], TradeExecution);
exports.TradeExecutionSchema = mongoose_1.SchemaFactory.createForClass(TradeExecution);
exports.TradeExecutionSchema.index({ tradeId: 1 });
exports.TradeExecutionSchema.index({ poolId: 1, status: 1 });
exports.TradeExecutionSchema.index({ poolTokenId: 1, status: 1 });
exports.TradeExecutionSchema.index({ buyerAddress: 1 });
exports.TradeExecutionSchema.index({ sellerAddress: 1 });
exports.TradeExecutionSchema.index({ buyOrderId: 1 });
exports.TradeExecutionSchema.index({ sellOrderId: 1 });
exports.TradeExecutionSchema.index({ status: 1, executedAt: 1 });
exports.TradeExecutionSchema.index({ hederaTransactionHash: 1 });
exports.TradeExecutionSchema.index({ paymentToken: 1, executedAt: 1 });
//# sourceMappingURL=trade-execution.schema.js.map