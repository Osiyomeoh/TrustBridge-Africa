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
exports.SettlementSchema = exports.Settlement = exports.SettlementStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var SettlementStatus;
(function (SettlementStatus) {
    SettlementStatus["PENDING"] = "PENDING";
    SettlementStatus["IN_TRANSIT"] = "IN_TRANSIT";
    SettlementStatus["SETTLED"] = "SETTLED";
    SettlementStatus["DISPUTED"] = "DISPUTED";
    SettlementStatus["CANCELLED"] = "CANCELLED";
})(SettlementStatus || (exports.SettlementStatus = SettlementStatus = {}));
let Settlement = class Settlement {
};
exports.Settlement = Settlement;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Settlement.prototype, "assetId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Settlement.prototype, "buyer", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Settlement.prototype, "seller", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Settlement.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: SettlementStatus, default: SettlementStatus.PENDING }),
    __metadata("design:type", String)
], Settlement.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Settlement.prototype, "deliveryDeadline", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Settlement.prototype, "trackingHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Settlement.prototype, "deliveryConfirmation", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Settlement.prototype, "disputeReason", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Settlement.prototype, "resolvedAt", void 0);
exports.Settlement = Settlement = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Settlement);
exports.SettlementSchema = mongoose_1.SchemaFactory.createForClass(Settlement);
//# sourceMappingURL=settlement.schema.js.map