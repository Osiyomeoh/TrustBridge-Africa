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
exports.AssetSchema = exports.Asset = exports.Investment = exports.Location = exports.AssetStatus = exports.AssetType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var AssetType;
(function (AssetType) {
    AssetType["AGRICULTURAL"] = "AGRICULTURAL";
    AssetType["REAL_ESTATE"] = "REAL_ESTATE";
    AssetType["EQUIPMENT"] = "EQUIPMENT";
    AssetType["INVENTORY"] = "INVENTORY";
    AssetType["COMMODITY"] = "COMMODITY";
})(AssetType || (exports.AssetType = AssetType = {}));
var AssetStatus;
(function (AssetStatus) {
    AssetStatus["PENDING"] = "PENDING";
    AssetStatus["VERIFIED"] = "VERIFIED";
    AssetStatus["ACTIVE"] = "ACTIVE";
    AssetStatus["OPERATIONAL"] = "OPERATIONAL";
    AssetStatus["MATURED"] = "MATURED";
    AssetStatus["SETTLED"] = "SETTLED";
})(AssetStatus || (exports.AssetStatus = AssetStatus = {}));
let Location = class Location {
};
exports.Location = Location;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Location.prototype, "country", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Location.prototype, "region", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Location.prototype, "coordinates", void 0);
exports.Location = Location = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Location);
let Investment = class Investment {
};
exports.Investment = Investment;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Investment.prototype, "investor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Investment.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Investment.prototype, "tokens", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Investment.prototype, "pricePerToken", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], Investment.prototype, "timestamp", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'CONFIRMED' }),
    __metadata("design:type", String)
], Investment.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Investment.prototype, "transactionHash", void 0);
exports.Investment = Investment = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Investment);
let Asset = class Asset {
};
exports.Asset = Asset;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Asset.prototype, "assetId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Asset.prototype, "owner", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: AssetType }),
    __metadata("design:type", String)
], Asset.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Asset.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Asset.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Location, required: true }),
    __metadata("design:type", Location)
], Asset.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Asset.prototype, "totalValue", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Asset.prototype, "tokenSupply", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Asset.prototype, "tokenizedAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Asset.prototype, "maturityDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Asset.prototype, "expectedAPY", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Asset.prototype, "verificationScore", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: AssetStatus, default: AssetStatus.PENDING }),
    __metadata("design:type", String)
], Asset.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Asset.prototype, "tokenContract", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Asset.prototype, "transactionHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Asset.prototype, "verificationData", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Investment], default: [] }),
    __metadata("design:type", Array)
], Asset.prototype, "investments", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Asset.prototype, "operations", void 0);
exports.Asset = Asset = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Asset);
exports.AssetSchema = mongoose_1.SchemaFactory.createForClass(Asset);
//# sourceMappingURL=asset.schema.js.map