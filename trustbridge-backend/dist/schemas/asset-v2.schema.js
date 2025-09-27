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
exports.AssetV2Schema = exports.AssetV2 = exports.VerificationLevel = exports.AssetStatusV2 = exports.AssetTypeV2 = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var AssetTypeV2;
(function (AssetTypeV2) {
    AssetTypeV2["DIGITAL"] = "DIGITAL";
    AssetTypeV2["RWA"] = "RWA";
})(AssetTypeV2 || (exports.AssetTypeV2 = AssetTypeV2 = {}));
var AssetStatusV2;
(function (AssetStatusV2) {
    AssetStatusV2["PENDING"] = "PENDING";
    AssetStatusV2["VERIFIED"] = "VERIFIED";
    AssetStatusV2["ACTIVE"] = "ACTIVE";
    AssetStatusV2["DIGITAL_ACTIVE"] = "DIGITAL_ACTIVE";
    AssetStatusV2["VERIFIED_PENDING_AMC"] = "VERIFIED_PENDING_AMC";
    AssetStatusV2["AMC_MANAGED"] = "AMC_MANAGED";
    AssetStatusV2["MATURED"] = "MATURED";
    AssetStatusV2["SETTLED"] = "SETTLED";
})(AssetStatusV2 || (exports.AssetStatusV2 = AssetStatusV2 = {}));
var VerificationLevel;
(function (VerificationLevel) {
    VerificationLevel["BASIC"] = "BASIC";
    VerificationLevel["PROFESSIONAL"] = "PROFESSIONAL";
    VerificationLevel["EXPERT"] = "EXPERT";
    VerificationLevel["MASTER"] = "MASTER";
})(VerificationLevel || (exports.VerificationLevel = VerificationLevel = {}));
let AssetV2 = class AssetV2 {
};
exports.AssetV2 = AssetV2;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], AssetV2.prototype, "assetId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: AssetTypeV2 }),
    __metadata("design:type", String)
], AssetV2.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], AssetV2.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], AssetV2.prototype, "assetType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], AssetV2.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], AssetV2.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], AssetV2.prototype, "totalValue", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], AssetV2.prototype, "owner", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: AssetStatusV2, default: AssetStatusV2.PENDING }),
    __metadata("design:type", String)
], AssetV2.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], AssetV2.prototype, "tokenizedAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], AssetV2.prototype, "verificationScore", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: VerificationLevel, default: VerificationLevel.BASIC }),
    __metadata("design:type", String)
], AssetV2.prototype, "verificationLevel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], AssetV2.prototype, "imageURI", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], AssetV2.prototype, "documentURI", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], AssetV2.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], AssetV2.prototype, "isTradeable", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], AssetV2.prototype, "operations", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], AssetV2.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], AssetV2.prototype, "verifiedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], AssetV2.prototype, "tokenizedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], AssetV2.prototype, "maturityDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], AssetV2.prototype, "evidenceHashes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], AssetV2.prototype, "documentTypes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], AssetV2.prototype, "isListed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], AssetV2.prototype, "listingPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], AssetV2.prototype, "listingExpiry", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], AssetV2.prototype, "tradingVolume", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], AssetV2.prototype, "lastSalePrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], AssetV2.prototype, "currentAMC", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], AssetV2.prototype, "amcTransferredAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], AssetV2.prototype, "tokenId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], AssetV2.prototype, "isTokenized", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], AssetV2.prototype, "tokenizationDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], AssetV2.prototype, "metadata", void 0);
exports.AssetV2 = AssetV2 = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], AssetV2);
exports.AssetV2Schema = mongoose_1.SchemaFactory.createForClass(AssetV2);
//# sourceMappingURL=asset-v2.schema.js.map