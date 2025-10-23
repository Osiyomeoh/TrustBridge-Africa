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
exports.PoolTokenHoldingsSchema = exports.PoolTokenHoldings = exports.DividendRecord = exports.TokenTransfer = exports.TokenTransferType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var TokenTransferType;
(function (TokenTransferType) {
    TokenTransferType["INVESTMENT"] = "INVESTMENT";
    TokenTransferType["DIVIDEND"] = "DIVIDEND";
    TokenTransferType["TRADE"] = "TRADE";
    TokenTransferType["BURN"] = "BURN";
    TokenTransferType["MINT"] = "MINT";
    TokenTransferType["TRANSFER"] = "TRANSFER";
    TokenTransferType["REWARD"] = "REWARD";
})(TokenTransferType || (exports.TokenTransferType = TokenTransferType = {}));
let TokenTransfer = class TokenTransfer {
};
exports.TokenTransfer = TokenTransfer;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TokenTransfer.prototype, "transferId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(TokenTransferType), required: true }),
    __metadata("design:type", String)
], TokenTransfer.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TokenTransfer.prototype, "fromAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TokenTransfer.prototype, "toAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], TokenTransfer.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], TokenTransfer.prototype, "pricePerToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], TokenTransfer.prototype, "totalValue", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], TokenTransfer.prototype, "transactionHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], TokenTransfer.prototype, "hederaTransactionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], TokenTransfer.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], TokenTransfer.prototype, "transferDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], TokenTransfer.prototype, "fees", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], TokenTransfer.prototype, "referenceId", void 0);
exports.TokenTransfer = TokenTransfer = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], TokenTransfer);
let DividendRecord = class DividendRecord {
};
exports.DividendRecord = DividendRecord;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], DividendRecord.prototype, "dividendId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], DividendRecord.prototype, "poolId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], DividendRecord.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], DividendRecord.prototype, "perToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], DividendRecord.prototype, "distributedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], DividendRecord.prototype, "transactionHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], DividendRecord.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], DividendRecord.prototype, "isClaimed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], DividendRecord.prototype, "claimedAt", void 0);
exports.DividendRecord = DividendRecord = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], DividendRecord);
let PoolTokenHoldings = class PoolTokenHoldings {
};
exports.PoolTokenHoldings = PoolTokenHoldings;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PoolTokenHoldings.prototype, "holderAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PoolTokenHoldings.prototype, "poolId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PoolTokenHoldings.prototype, "poolTokenId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PoolTokenHoldings.prototype, "poolName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], PoolTokenHoldings.prototype, "totalTokens", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], PoolTokenHoldings.prototype, "availableTokens", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], PoolTokenHoldings.prototype, "lockedTokens", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], PoolTokenHoldings.prototype, "totalInvested", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], PoolTokenHoldings.prototype, "totalDividendsReceived", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], PoolTokenHoldings.prototype, "totalDividendsClaimed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], PoolTokenHoldings.prototype, "totalDividendsUnclaimed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], PoolTokenHoldings.prototype, "averageBuyPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], PoolTokenHoldings.prototype, "currentValue", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], PoolTokenHoldings.prototype, "unrealizedPnL", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], PoolTokenHoldings.prototype, "realizedPnL", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], PoolTokenHoldings.prototype, "totalPnL", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], PoolTokenHoldings.prototype, "roi", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [TokenTransfer], default: [] }),
    __metadata("design:type", Array)
], PoolTokenHoldings.prototype, "transfers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [DividendRecord], default: [] }),
    __metadata("design:type", Array)
], PoolTokenHoldings.prototype, "dividends", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], PoolTokenHoldings.prototype, "firstInvestmentDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], PoolTokenHoldings.prototype, "lastActivityDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], PoolTokenHoldings.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
            poolType: { type: String, default: '' },
            expectedAPY: { type: Number, default: 0 },
            maturityDate: { type: Date, default: null },
            isTradeable: { type: Boolean, default: false },
            lastPriceUpdate: { type: Date, default: null },
            priceChange24h: { type: Number, default: 0 }
        },
        default: {}
    }),
    __metadata("design:type", Object)
], PoolTokenHoldings.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: [] }),
    __metadata("design:type", Array)
], PoolTokenHoldings.prototype, "stakingRecords", void 0);
exports.PoolTokenHoldings = PoolTokenHoldings = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PoolTokenHoldings);
exports.PoolTokenHoldingsSchema = mongoose_1.SchemaFactory.createForClass(PoolTokenHoldings);
exports.PoolTokenHoldingsSchema.index({ holderAddress: 1 });
exports.PoolTokenHoldingsSchema.index({ poolId: 1 });
exports.PoolTokenHoldingsSchema.index({ poolTokenId: 1 });
exports.PoolTokenHoldingsSchema.index({ holderAddress: 1, poolId: 1 });
exports.PoolTokenHoldingsSchema.index({ holderAddress: 1, isActive: 1 });
exports.PoolTokenHoldingsSchema.index({ totalTokens: 1 });
exports.PoolTokenHoldingsSchema.index({ lastActivityDate: 1 });
exports.PoolTokenHoldingsSchema.index({ 'transfers.transferId': 1 });
exports.PoolTokenHoldingsSchema.index({ 'dividends.dividendId': 1 });
//# sourceMappingURL=pool-token-holdings.schema.js.map