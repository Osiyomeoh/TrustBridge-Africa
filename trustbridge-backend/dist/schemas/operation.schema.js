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
exports.OperationSchema = exports.Operation = exports.OperationStatus = exports.OperationType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var OperationType;
(function (OperationType) {
    OperationType["INVESTMENT"] = "INVESTMENT";
    OperationType["WITHDRAWAL"] = "WITHDRAWAL";
    OperationType["VERIFICATION"] = "VERIFICATION";
    OperationType["SETTLEMENT"] = "SETTLEMENT";
    OperationType["STAKE"] = "STAKE";
    OperationType["UNSTAKE"] = "UNSTAKE";
})(OperationType || (exports.OperationType = OperationType = {}));
var OperationStatus;
(function (OperationStatus) {
    OperationStatus["PENDING"] = "PENDING";
    OperationStatus["CONFIRMED"] = "CONFIRMED";
    OperationStatus["FAILED"] = "FAILED";
    OperationStatus["CANCELLED"] = "CANCELLED";
})(OperationStatus || (exports.OperationStatus = OperationStatus = {}));
let Operation = class Operation {
};
exports.Operation = Operation;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Operation.prototype, "assetId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Operation.prototype, "userAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: OperationType }),
    __metadata("design:type", String)
], Operation.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: OperationStatus, default: OperationStatus.PENDING }),
    __metadata("design:type", String)
], Operation.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Operation.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Operation.prototype, "tokens", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Operation.prototype, "transactionHash", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Operation.prototype, "blockchainTxId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Operation.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Operation.prototype, "data", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Operation.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Operation.prototype, "completedAt", void 0);
exports.Operation = Operation = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Operation);
exports.OperationSchema = mongoose_1.SchemaFactory.createForClass(Operation);
//# sourceMappingURL=operation.schema.js.map