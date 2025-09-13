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
exports.ValidatorModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ValidatorPerformanceSchema = new mongoose_1.Schema({
    totalVerifications: { type: Number, default: 0 },
    correctVerifications: { type: Number, default: 0 },
    falsePositives: { type: Number, default: 0 },
    falseNegatives: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 24 }
});
const PenaltySchema = new mongoose_1.Schema({
    reason: { type: String, required: true },
    amount: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});
const RewardSchema = new mongoose_1.Schema({
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});
const ValidatorSchema = new mongoose_1.Schema({
    walletAddress: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    stakedAmount: { type: String, required: true },
    reputation: { type: Number, default: 50, min: 0, max: 100 },
    verificationsCount: { type: Number, default: 0 },
    accuracyScore: { type: Number, default: 50, min: 0, max: 100 },
    isActive: { type: Boolean, default: true, index: true },
    specialties: [{
            type: String,
            enum: ['AGRICULTURAL', 'REAL_ESTATE', 'EQUIPMENT', 'INVENTORY', 'COMMODITY']
        }],
    location: {
        country: { type: String },
        region: { type: String }
    },
    performance: ValidatorPerformanceSchema,
    penalties: [PenaltySchema],
    rewards: [RewardSchema]
}, {
    timestamps: true,
    collection: 'validators'
});
ValidatorSchema.index({ isActive: 1, accuracyScore: -1 });
ValidatorSchema.index({ 'location.country': 1 });
ValidatorSchema.index({ specialties: 1 });
exports.ValidatorModel = mongoose_1.default.model('Validator', ValidatorSchema);
//# sourceMappingURL=validator.model.js.map