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
exports.UserModel = exports.KYCStatus = exports.UserRole = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var UserRole;
(function (UserRole) {
    UserRole["INVESTOR"] = "INVESTOR";
    UserRole["ASSET_OWNER"] = "ASSET_OWNER";
    UserRole["OPERATOR"] = "OPERATOR";
    UserRole["VERIFIER"] = "VERIFIER";
    UserRole["ADMIN"] = "ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
var KYCStatus;
(function (KYCStatus) {
    KYCStatus["PENDING"] = "PENDING";
    KYCStatus["VERIFIED"] = "VERIFIED";
    KYCStatus["REJECTED"] = "REJECTED";
})(KYCStatus || (exports.KYCStatus = KYCStatus = {}));
const ProfileSchema = new mongoose_1.Schema({
    name: { type: String },
    email: { type: String },
    country: { type: String },
    phoneNumber: { type: String }
});
const KYCDocumentSchema = new mongoose_1.Schema({
    type: { type: String, required: true },
    hash: { type: String, required: true },
    verified: { type: Boolean, default: false }
});
const KYCDataSchema = new mongoose_1.Schema({
    documents: [KYCDocumentSchema],
    verificationDate: { type: Date },
    verifier: { type: String }
});
const UserSchema = new mongoose_1.Schema({
    walletAddress: {
        type: String,
        required: true,
        unique: true,
        index: true,
        lowercase: true
    },
    role: {
        type: String,
        enum: Object.values(UserRole),
        required: true,
        index: true
    },
    kycStatus: {
        type: String,
        enum: Object.values(KYCStatus),
        default: KYCStatus.PENDING,
        index: true
    },
    kycInquiryId: {
        type: String,
        index: true
    },
    reputation: { type: Number, default: 50, min: 0, max: 100 },
    stakingBalance: { type: String, default: '0' },
    stakingRewards: { type: Number, default: 0 },
    stakingTimestamp: { type: Date },
    lockPeriod: { type: Number },
    profile: ProfileSchema,
    kycData: KYCDataSchema
}, {
    timestamps: true,
    collection: 'users'
});
UserSchema.index({ role: 1, kycStatus: 1 });
UserSchema.index({ reputation: -1 });
UserSchema.index({ createdAt: -1 });
exports.UserModel = mongoose_1.default.model('User', UserSchema);
//# sourceMappingURL=user.model.js.map