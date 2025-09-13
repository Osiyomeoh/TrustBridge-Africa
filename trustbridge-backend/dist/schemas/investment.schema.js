"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvestmentModel = exports.InvestmentSchema = exports.InvestmentModelName = exports.Investment = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose = __importStar(require("mongoose"));
let Investment = class Investment {
};
exports.Investment = Investment;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true }),
    __metadata("design:type", String)
], Investment.prototype, "investmentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], Investment.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], Investment.prototype, "assetId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", Number)
], Investment.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Investment.prototype, "tokens", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['ACTIVE', 'MATURED', 'CANCELLED'],
        default: 'ACTIVE',
        index: true
    }),
    __metadata("design:type", String)
], Investment.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ index: true }),
    __metadata("design:type", String)
], Investment.prototype, "transactionHash", void 0);
exports.Investment = Investment = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'investments' })
], Investment);
exports.InvestmentModelName = 'Investment';
exports.InvestmentSchema = mongoose_1.SchemaFactory.createForClass(Investment);
exports.InvestmentSchema.index({ userId: 1, status: 1 });
exports.InvestmentSchema.index({ assetId: 1, status: 1 });
exports.InvestmentSchema.index({ amount: 1 });
exports.InvestmentModel = mongoose.model(exports.InvestmentModelName, exports.InvestmentSchema);
//# sourceMappingURL=investment.schema.js.map