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
exports.AMCPoolSchema = exports.AMCPool = exports.DividendDistribution = exports.PoolInvestment = exports.PoolAsset = exports.PoolType = exports.PoolStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var PoolStatus;
(function (PoolStatus) {
    PoolStatus["DRAFT"] = "DRAFT";
    PoolStatus["ACTIVE"] = "ACTIVE";
    PoolStatus["CLOSED"] = "CLOSED";
    PoolStatus["MATURED"] = "MATURED";
    PoolStatus["SUSPENDED"] = "SUSPENDED";
})(PoolStatus || (exports.PoolStatus = PoolStatus = {}));
var PoolType;
(function (PoolType) {
    PoolType["REAL_ESTATE"] = "REAL_ESTATE";
    PoolType["AGRICULTURAL"] = "AGRICULTURAL";
    PoolType["COMMODITIES"] = "COMMODITIES";
    PoolType["MIXED"] = "MIXED";
})(PoolType || (exports.PoolType = PoolType = {}));
let PoolAsset = class PoolAsset {
};
exports.PoolAsset = PoolAsset;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PoolAsset.prototype, "assetId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PoolAsset.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], PoolAsset.prototype, "value", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], PoolAsset.prototype, "percentage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], PoolAsset.prototype, "isActive", void 0);
exports.PoolAsset = PoolAsset = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PoolAsset);
let PoolInvestment = class PoolInvestment {
};
exports.PoolInvestment = PoolInvestment;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PoolInvestment.prototype, "investorId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PoolInvestment.prototype, "investorAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], PoolInvestment.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], PoolInvestment.prototype, "tokens", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], PoolInvestment.prototype, "tokenPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], PoolInvestment.prototype, "investedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], PoolInvestment.prototype, "dividendsReceived", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], PoolInvestment.prototype, "isActive", void 0);
exports.PoolInvestment = PoolInvestment = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PoolInvestment);
let DividendDistribution = class DividendDistribution {
};
exports.DividendDistribution = DividendDistribution;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], DividendDistribution.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], DividendDistribution.prototype, "perToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], DividendDistribution.prototype, "distributedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], DividendDistribution.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], DividendDistribution.prototype, "transactionHash", void 0);
exports.DividendDistribution = DividendDistribution = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], DividendDistribution);
let AMCPool = class AMCPool {
};
exports.AMCPool = AMCPool;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], AMCPool.prototype, "poolId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], AMCPool.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], AMCPool.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], AMCPool.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], AMCPool.prototype, "createdByName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(PoolType), required: true }),
    __metadata("design:type", String)
], AMCPool.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(PoolStatus), default: PoolStatus.DRAFT }),
    __metadata("design:type", String)
], AMCPool.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [PoolAsset], default: [] }),
    __metadata("design:type", Array)
], AMCPool.prototype, "assets", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], AMCPool.prototype, "totalValue", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], AMCPool.prototype, "tokenSupply", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], AMCPool.prototype, "tokenPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], AMCPool.prototype, "minimumInvestment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], AMCPool.prototype, "expectedAPY", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], AMCPool.prototype, "maturityDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], AMCPool.prototype, "totalInvested", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], AMCPool.prototype, "totalInvestors", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [PoolInvestment], default: [] }),
    __metadata("design:type", Array)
], AMCPool.prototype, "investments", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [DividendDistribution], default: [] }),
    __metadata("design:type", Array)
], AMCPool.prototype, "dividends", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], AMCPool.prototype, "totalDividendsDistributed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], AMCPool.prototype, "hederaTokenId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], AMCPool.prototype, "hederaContractId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], AMCPool.prototype, "imageURI", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], AMCPool.prototype, "documentURI", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: [] }),
    __metadata("design:type", Array)
], AMCPool.prototype, "riskFactors", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: [] }),
    __metadata("design:type", Array)
], AMCPool.prototype, "terms", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], AMCPool.prototype, "isTradeable", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], AMCPool.prototype, "tradingVolume", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], AMCPool.prototype, "currentPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], AMCPool.prototype, "priceChange24h", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: [] }),
    __metadata("design:type", Array)
], AMCPool.prototype, "operations", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
            liquidity: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' },
            diversification: { type: Number, default: 0 },
            geographicDistribution: { type: [String], default: [] },
            sectorDistribution: { type: Map, of: Number, default: {} }
        },
        default: {}
    }),
    __metadata("design:type", Object)
], AMCPool.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], AMCPool.prototype, "launchedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], AMCPool.prototype, "closedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], AMCPool.prototype, "maturedAt", void 0);
exports.AMCPool = AMCPool = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], AMCPool);
exports.AMCPoolSchema = mongoose_1.SchemaFactory.createForClass(AMCPool);
exports.AMCPoolSchema.index({ poolId: 1 });
exports.AMCPoolSchema.index({ status: 1 });
exports.AMCPoolSchema.index({ type: 1 });
exports.AMCPoolSchema.index({ createdBy: 1 });
exports.AMCPoolSchema.index({ totalValue: 1, expectedAPY: -1 });
exports.AMCPoolSchema.index({ maturityDate: 1 });
exports.AMCPoolSchema.index({ 'assets.assetId': 1 });
exports.AMCPoolSchema.index({ 'investments.investorId': 1 });
exports.AMCPoolSchema.index({ isTradeable: 1, status: 1 });
//# sourceMappingURL=amc-pool.schema.js.map