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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettlementModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const types_1 = require("../types");
const DeliveryConfirmationSchema = new mongoose_1.Schema({
    confirmer: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    proofHash: { type: String, required: true },
    isValid: { type: Boolean, default: true }
});
const SettlementSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true, index: true },
    assetId: { type: String, required: true, index: true },
    buyer: { type: String, required: true, index: true },
    seller: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    status: {
        type: String,
        enum: Object.values(types_1.SettlementStatus),
        default: types_1.SettlementStatus.PENDING,
        index: true
    },
    deliveryDeadline: { type: Date, required: true, index: true },
    trackingHash: { type: String, required: true, unique: true },
    confirmations: [DeliveryConfirmationSchema],
    transactionHash: { type: String }
}, {
    timestamps: true,
    collection: 'settlements'
});
SettlementSchema.index({ buyer: 1, seller: 1 });
SettlementSchema.index({ createdAt: -1 });
exports.SettlementModel = mongoose_1.default.model('Settlement', SettlementSchema);
//# sourceMappingURL=settlement.model.js.map