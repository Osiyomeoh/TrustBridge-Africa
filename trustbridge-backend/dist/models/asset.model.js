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
exports.AssetModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const types_1 = require("../types");
const LocationSchema = new mongoose_1.Schema({
    country: { type: String, required: true, index: true },
    region: { type: String, required: true, index: true },
    coordinates: {
        lat: { type: Number },
        lng: { type: Number }
    },
    address: { type: String }
});
const OperationSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    assetId: { type: String, required: true, index: true },
    type: {
        type: String,
        enum: ['CREATION', 'VERIFICATION', 'TRANSFER', 'DELIVERY', 'SETTLEMENT'],
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'],
        required: true
    },
    operator: { type: String, required: true, index: true },
    location: LocationSchema,
    timestamp: { type: Date, default: Date.now },
    proofHash: { type: String },
    verified: { type: Boolean, default: false },
    metadata: { type: String },
    transactionHash: { type: String }
});
const InvestmentSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    investor: { type: String, required: true, index: true },
    assetId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    tokens: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    returns: { type: Number, default: 0 }
});
const AssetSchema = new mongoose_1.Schema({
    assetId: { type: String, required: true, unique: true, index: true },
    owner: { type: String, required: true, index: true },
    type: {
        type: String,
        enum: Object.values(types_1.AssetType),
        required: true,
        index: true
    },
    name: { type: String, required: true, index: 'text' },
    description: { type: String, index: 'text' },
    location: { type: LocationSchema, required: true },
    totalValue: { type: Number, required: true, index: true },
    tokenSupply: { type: Number, required: true },
    tokenizedAmount: { type: Number, default: 0 },
    maturityDate: { type: Date, required: true, index: true },
    expectedAPY: { type: Number, required: true, index: true },
    verificationScore: { type: Number, default: 0, index: true },
    status: {
        type: String,
        enum: Object.values(types_1.AssetStatus),
        default: types_1.AssetStatus.PENDING,
        index: true
    },
    tokenContract: { type: String, required: true },
    transactionHash: { type: String },
    verificationData: { type: mongoose_1.Schema.Types.Mixed },
    operations: [OperationSchema],
    investments: [InvestmentSchema]
}, {
    timestamps: true,
    collection: 'assets'
});
AssetSchema.index({ 'location.country': 1, type: 1 });
AssetSchema.index({ totalValue: 1, expectedAPY: -1 });
AssetSchema.index({ verificationScore: -1, status: 1 });
AssetSchema.index({ createdAt: -1 });
AssetSchema.virtual('tokenizationPercentage').get(function () {
    return (this.tokenizedAmount / this.tokenSupply) * 100;
});
AssetSchema.virtual('availableTokens').get(function () {
    return this.tokenSupply - this.tokenizedAmount;
});
exports.AssetModel = mongoose_1.default.model('Asset', AssetSchema);
//# sourceMappingURL=asset.model.js.map