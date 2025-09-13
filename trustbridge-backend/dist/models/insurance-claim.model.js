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
exports.InsuranceClaimModel = exports.ClaimType = exports.ClaimStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var ClaimStatus;
(function (ClaimStatus) {
    ClaimStatus["SUBMITTED"] = "SUBMITTED";
    ClaimStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
    ClaimStatus["APPROVED"] = "APPROVED";
    ClaimStatus["REJECTED"] = "REJECTED";
    ClaimStatus["PAID"] = "PAID";
})(ClaimStatus || (exports.ClaimStatus = ClaimStatus = {}));
var ClaimType;
(function (ClaimType) {
    ClaimType["ASSET_LOSS"] = "ASSET_LOSS";
    ClaimType["QUALITY_DEFECT"] = "QUALITY_DEFECT";
    ClaimType["DELIVERY_FAILURE"] = "DELIVERY_FAILURE";
    ClaimType["FRAUD"] = "FRAUD";
    ClaimType["NATURAL_DISASTER"] = "NATURAL_DISASTER";
})(ClaimType || (exports.ClaimType = ClaimType = {}));
const EvidenceSchema = new mongoose_1.Schema({
    type: { type: String, required: true },
    hash: { type: String, required: true },
    description: { type: String, required: true }
});
const InvestigationSchema = new mongoose_1.Schema({
    investigator: { type: String },
    findings: { type: String },
    recommendedAction: { type: String },
    completedAt: { type: Date }
});
const ResolutionSchema = new mongoose_1.Schema({
    approved: { type: Boolean, required: true },
    payoutAmount: { type: Number },
    reason: { type: String },
    resolvedBy: { type: String },
    resolvedAt: { type: Date },
    transactionHash: { type: String }
});
const InsuranceClaimSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true, index: true },
    assetId: { type: String, required: true, index: true },
    claimant: { type: String, required: true, index: true },
    type: {
        type: String,
        enum: Object.values(ClaimType),
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: Object.values(ClaimStatus),
        default: ClaimStatus.SUBMITTED,
        index: true
    },
    description: { type: String, required: true },
    claimAmount: { type: Number, required: true },
    evidence: [EvidenceSchema],
    investigation: InvestigationSchema,
    resolution: ResolutionSchema
}, {
    timestamps: true,
    collection: 'insurance_claims'
});
InsuranceClaimSchema.index({ status: 1, createdAt: -1 });
InsuranceClaimSchema.index({ assetId: 1, status: 1 });
exports.InsuranceClaimModel = mongoose_1.default.model('InsuranceClaim', InsuranceClaimSchema);
//# sourceMappingURL=insurance-claim.model.js.map