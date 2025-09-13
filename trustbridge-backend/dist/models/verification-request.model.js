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
exports.VerificationRequestModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const EvidenceSchema = new mongoose_1.Schema({
    type: {
        type: String,
        required: true
    },
    provider: {
        type: String,
        required: true
    },
    confidence: {
        type: Number,
        required: true,
        min: 0,
        max: 1
    },
    result: {
        type: mongoose_1.Schema.Types.Mixed,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    }
}, { _id: false });
const AttestationSchema = new mongoose_1.Schema({
    attestorAddress: {
        type: String,
        required: true
    },
    confidence: {
        type: Number,
        required: true,
        min: 0,
        max: 1
    },
    evidence: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    },
    onChainTxHash: String
}, { _id: false });
const VerificationScoringSchema = new mongoose_1.Schema({
    automatedScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 1
    },
    attestorScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 1
    },
    finalScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 1
    },
    breakdown: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {}
    }
}, { _id: false });
const VerificationRequestSchema = new mongoose_1.Schema({
    assetId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    assetType: {
        type: String,
        required: true,
        index: true
    },
    ownerAddress: {
        type: String,
        required: true,
        index: true
    },
    declaredValue: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['SUBMITTED', 'EVIDENCE_GATHERING', 'ATTESTOR_REVIEW', 'MANUAL_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED'],
        default: 'SUBMITTED',
        index: true
    },
    evidence: [EvidenceSchema],
    attestations: [AttestationSchema],
    scoring: {
        type: VerificationScoringSchema,
        default: () => ({})
    },
    assignedAttestors: [{
            type: String,
            index: true
        }],
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {}
    },
    documents: [{
            name: {
                type: String,
                required: true
            },
            fileRef: {
                type: String,
                required: true
            }
        }],
    photos: [{
            description: {
                type: String,
                required: true
            },
            fileRef: {
                type: String,
                required: true
            },
            gpsData: {
                lat: Number,
                lng: Number
            }
        }],
    expiresAt: {
        type: Date,
        index: true
    }
}, {
    timestamps: true
});
VerificationRequestSchema.index({ status: 1, createdAt: -1 });
VerificationRequestSchema.index({ assetType: 1, status: 1 });
VerificationRequestSchema.index({ 'metadata.country': 1 });
VerificationRequestSchema.index({ assignedAttestors: 1, status: 1 });
exports.VerificationRequestModel = mongoose_1.default.model('VerificationRequest', VerificationRequestSchema);
//# sourceMappingURL=verification-request.model.js.map