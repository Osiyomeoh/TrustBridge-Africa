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
exports.AttestorModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AttestorSchema = new mongoose_1.Schema({
    walletAddress: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    organizationName: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['COOPERATIVE', 'EXTENSION_OFFICER', 'GOVERNMENT_OFFICER', 'SURVEYOR', 'APPRAISER', 'AUDITOR'],
        required: true
    },
    country: {
        type: String,
        required: true,
        index: true
    },
    region: {
        type: String,
        required: true
    },
    specialties: [{
            type: String,
            required: true
        }],
    status: {
        type: String,
        enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'REVOKED'],
        default: 'PENDING'
    },
    stakeAmount: {
        type: String,
        required: true
    },
    reputation: {
        totalAttestations: {
            type: Number,
            default: 0
        },
        correctAttestations: {
            type: Number,
            default: 0
        },
        disputedAttestations: {
            type: Number,
            default: 0
        },
        score: {
            type: Number,
            default: 50,
            min: 0,
            max: 100
        }
    },
    contactInfo: {
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        }
    },
    credentials: {
        licenseNumber: String,
        certifications: [String],
        yearsExperience: {
            type: Number,
            required: true
        },
        registrationProof: {
            type: String,
            required: true
        }
    }
}, {
    timestamps: true
});
AttestorSchema.index({ country: 1, status: 1 });
AttestorSchema.index({ specialties: 1 });
AttestorSchema.index({ 'reputation.score': -1 });
exports.AttestorModel = mongoose_1.default.model('Attestor', AttestorSchema);
//# sourceMappingURL=attestor.model.js.map