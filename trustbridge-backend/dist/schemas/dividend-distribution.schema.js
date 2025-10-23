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
exports.DividendDistributionSchema = exports.DividendDistribution = exports.DividendRecipient = exports.DividendType = exports.DividendStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var DividendStatus;
(function (DividendStatus) {
    DividendStatus["PENDING"] = "PENDING";
    DividendStatus["DISTRIBUTING"] = "DISTRIBUTING";
    DividendStatus["DISTRIBUTED"] = "DISTRIBUTED";
    DividendStatus["COMPLETED"] = "COMPLETED";
    DividendStatus["FAILED"] = "FAILED";
    DividendStatus["CANCELLED"] = "CANCELLED";
})(DividendStatus || (exports.DividendStatus = DividendStatus = {}));
var DividendType;
(function (DividendType) {
    DividendType["REGULAR"] = "REGULAR";
    DividendType["SPECIAL"] = "SPECIAL";
    DividendType["BONUS"] = "BONUS";
    DividendType["FINAL"] = "FINAL";
    DividendType["INTERIM"] = "INTERIM";
})(DividendType || (exports.DividendType = DividendType = {}));
let DividendRecipient = class DividendRecipient {
};
exports.DividendRecipient = DividendRecipient;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], DividendRecipient.prototype, "holderAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], DividendRecipient.prototype, "tokenAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], DividendRecipient.prototype, "dividendAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], DividendRecipient.prototype, "perTokenRate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], DividendRecipient.prototype, "isClaimed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], DividendRecipient.prototype, "claimedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], DividendRecipient.prototype, "claimTransactionHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], DividendRecipient.prototype, "hederaTransactionId", void 0);
exports.DividendRecipient = DividendRecipient = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], DividendRecipient);
let DividendDistribution = class DividendDistribution {
};
exports.DividendDistribution = DividendDistribution;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], DividendDistribution.prototype, "distributionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], DividendDistribution.prototype, "poolId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], DividendDistribution.prototype, "poolName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], DividendDistribution.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(DividendType), required: true }),
    __metadata("design:type", String)
], DividendDistribution.prototype, "dividendType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(DividendStatus), default: DividendStatus.PENDING }),
    __metadata("design:type", String)
], DividendDistribution.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], DividendDistribution.prototype, "totalDividendAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], DividendDistribution.prototype, "perTokenRate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], DividendDistribution.prototype, "totalTokensEligible", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], DividendDistribution.prototype, "totalRecipients", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], DividendDistribution.prototype, "distributionDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], DividendDistribution.prototype, "recordDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], DividendDistribution.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], DividendDistribution.prototype, "sourceOfFunds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], DividendDistribution.prototype, "transactionHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], DividendDistribution.prototype, "hederaTransactionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [DividendRecipient], default: [] }),
    __metadata("design:type", Array)
], DividendDistribution.prototype, "recipients", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DividendDistribution.prototype, "totalClaimed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DividendDistribution.prototype, "totalUnclaimed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DividendDistribution.prototype, "claimCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], DividendDistribution.prototype, "distributedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], DividendDistribution.prototype, "completedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], DividendDistribution.prototype, "cancelledAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], DividendDistribution.prototype, "failureReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DividendDistribution.prototype, "distributionFees", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], DividendDistribution.prototype, "gasFees", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            previousDividendId: { type: String, default: '' },
            dividendYield: { type: Number, default: 0 },
            payoutRatio: { type: Number, default: 0 },
            frequency: { type: String, enum: ['MONTHLY', 'QUARTERLY', 'ANNUALLY', 'SPECIAL'], default: 'SPECIAL' },
            taxWithholding: { type: Number, default: 0 },
            currency: { type: String, default: 'USD' },
            exchangeRate: { type: Number, default: 1 }
        },
        default: {}
    }),
    __metadata("design:type", Object)
], DividendDistribution.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: [] }),
    __metadata("design:type", Array)
], DividendDistribution.prototype, "auditTrail", void 0);
exports.DividendDistribution = DividendDistribution = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], DividendDistribution);
exports.DividendDistributionSchema = mongoose_1.SchemaFactory.createForClass(DividendDistribution);
exports.DividendDistributionSchema.index({ distributionId: 1 });
exports.DividendDistributionSchema.index({ poolId: 1 });
exports.DividendDistributionSchema.index({ createdBy: 1 });
exports.DividendDistributionSchema.index({ status: 1 });
exports.DividendDistributionSchema.index({ distributionDate: 1 });
exports.DividendDistributionSchema.index({ recordDate: 1 });
exports.DividendDistributionSchema.index({ dividendType: 1 });
exports.DividendDistributionSchema.index({ 'recipients.holderAddress': 1 });
exports.DividendDistributionSchema.index({ poolId: 1, status: 1 });
exports.DividendDistributionSchema.index({ distributionDate: 1, status: 1 });
//# sourceMappingURL=dividend-distribution.schema.js.map