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
exports.PoolSchema = exports.Pool = exports.TrancheType = exports.PoolRiskLevel = exports.PoolStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var PoolStatus;
(function (PoolStatus) {
    PoolStatus["DRAFT"] = "draft";
    PoolStatus["ACTIVE"] = "active";
    PoolStatus["PAUSED"] = "paused";
    PoolStatus["CLOSED"] = "closed";
    PoolStatus["MATURED"] = "matured";
})(PoolStatus || (exports.PoolStatus = PoolStatus = {}));
var PoolRiskLevel;
(function (PoolRiskLevel) {
    PoolRiskLevel["LOW"] = "low";
    PoolRiskLevel["MEDIUM"] = "medium";
    PoolRiskLevel["HIGH"] = "high";
})(PoolRiskLevel || (exports.PoolRiskLevel = PoolRiskLevel = {}));
var TrancheType;
(function (TrancheType) {
    TrancheType["SENIOR"] = "senior";
    TrancheType["JUNIOR"] = "junior";
})(TrancheType || (exports.TrancheType = TrancheType = {}));
let Pool = class Pool {
};
exports.Pool = Pool;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Pool.prototype, "poolId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Pool.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Pool.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Pool.prototype, "manager", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Pool.prototype, "managerName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Pool.prototype, "managerEmail", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Pool.prototype, "strategy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: [String] }),
    __metadata("design:type", Array)
], Pool.prototype, "assetIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Pool.prototype, "totalValue", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Pool.prototype, "dropTokens", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Pool.prototype, "tinTokens", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Pool.prototype, "dropTokenPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Pool.prototype, "tinTokenPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Pool.prototype, "targetAPY", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Pool.prototype, "actualAPY", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: PoolRiskLevel }),
    __metadata("design:type", String)
], Pool.prototype, "riskLevel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: PoolStatus, default: PoolStatus.DRAFT }),
    __metadata("design:type", String)
], Pool.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Pool.prototype, "minimumInvestment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Pool.prototype, "maximumInvestment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Pool.prototype, "lockupPeriod", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Pool.prototype, "maturityDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Pool.prototype, "totalInvestors", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Pool.prototype, "totalInvested", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Pool.prototype, "dropTokenContract", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Pool.prototype, "tinTokenContract", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Pool.prototype, "poolContract", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Pool.prototype, "performanceMetrics", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Pool.prototype, "feeStructure", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Object] }),
    __metadata("design:type", Array)
], Pool.prototype, "investors", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Object] }),
    __metadata("design:type", Array)
], Pool.prototype, "distributions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Pool.prototype, "compliance", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String] }),
    __metadata("design:type", Array)
], Pool.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Pool.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Pool.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Pool.prototype, "updatedAt", void 0);
exports.Pool = Pool = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Pool);
exports.PoolSchema = mongoose_1.SchemaFactory.createForClass(Pool);
//# sourceMappingURL=pool.schema.js.map