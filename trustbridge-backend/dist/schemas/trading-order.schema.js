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
exports.TradingOrderSchema = exports.TradingOrder = exports.OrderSide = exports.OrderStatus = exports.OrderType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var OrderType;
(function (OrderType) {
    OrderType["BUY"] = "BUY";
    OrderType["SELL"] = "SELL";
})(OrderType || (exports.OrderType = OrderType = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["PARTIALLY_FILLED"] = "PARTIALLY_FILLED";
    OrderStatus["FILLED"] = "FILLED";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["EXPIRED"] = "EXPIRED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var OrderSide;
(function (OrderSide) {
    OrderSide["BID"] = "BID";
    OrderSide["ASK"] = "ASK";
})(OrderSide || (exports.OrderSide = OrderSide = {}));
let TradingOrder = class TradingOrder {
};
exports.TradingOrder = TradingOrder;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], TradingOrder.prototype, "orderId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TradingOrder.prototype, "poolId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TradingOrder.prototype, "poolTokenId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TradingOrder.prototype, "traderAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(OrderType), required: true }),
    __metadata("design:type", String)
], TradingOrder.prototype, "orderType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(OrderSide), required: true }),
    __metadata("design:type", String)
], TradingOrder.prototype, "orderSide", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], TradingOrder.prototype, "tokenAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], TradingOrder.prototype, "pricePerToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], TradingOrder.prototype, "totalValue", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], TradingOrder.prototype, "filledAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], TradingOrder.prototype, "remainingAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING }),
    __metadata("design:type", String)
], TradingOrder.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TradingOrder.prototype, "paymentToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TradingOrder.prototype, "fees", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TradingOrder.prototype, "gasFees", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], TradingOrder.prototype, "expiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], TradingOrder.prototype, "filledAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], TradingOrder.prototype, "cancelledAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: [] }),
    __metadata("design:type", Array)
], TradingOrder.prototype, "fills", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], TradingOrder.prototype, "transactionHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], TradingOrder.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], TradingOrder.prototype, "isMarketOrder", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TradingOrder.prototype, "stopPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], TradingOrder.prototype, "isStopOrder", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TradingOrder.prototype, "timeInForce", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], TradingOrder.prototype, "parentOrderId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: [] }),
    __metadata("design:type", Array)
], TradingOrder.prototype, "childOrderIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            slippageTolerance: { type: Number, default: 0.5 },
            maxGasPrice: { type: Number, default: 0 },
            deadline: { type: Number, default: 0 }
        },
        default: {}
    }),
    __metadata("design:type", Object)
], TradingOrder.prototype, "orderParams", void 0);
exports.TradingOrder = TradingOrder = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], TradingOrder);
exports.TradingOrderSchema = mongoose_1.SchemaFactory.createForClass(TradingOrder);
exports.TradingOrderSchema.index({ orderId: 1 });
exports.TradingOrderSchema.index({ poolId: 1, status: 1 });
exports.TradingOrderSchema.index({ poolTokenId: 1, status: 1 });
exports.TradingOrderSchema.index({ traderAddress: 1 });
exports.TradingOrderSchema.index({ orderType: 1, status: 1 });
exports.TradingOrderSchema.index({ orderSide: 1, status: 1 });
exports.TradingOrderSchema.index({ pricePerToken: 1, status: 1 });
exports.TradingOrderSchema.index({ status: 1, createdAt: 1 });
exports.TradingOrderSchema.index({ expiresAt: 1, status: 1 });
//# sourceMappingURL=trading-order.schema.js.map