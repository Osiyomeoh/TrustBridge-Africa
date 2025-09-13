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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const MetricsSchema = new mongoose_1.Schema({
    totalValueLocked: { type: Number, required: true },
    totalAssets: { type: Number, required: true },
    totalUsers: { type: Number, required: true },
    totalOperations: { type: Number, required: true },
    averageAPY: { type: Number, required: true },
    successRate: { type: Number, required: true },
    monthlyVolume: { type: Number, required: true },
    newAssets: { type: Number, required: true },
    newUsers: { type: Number, required: true },
    settledTransactions: { type: Number, required: true },
    verificationAccuracy: { type: Number, required: true }
});
const CountryBreakdownSchema = new mongoose_1.Schema({
    country: { type: String, required: true },
    assetCount: { type: Number, required: true },
    totalValue: { type: Number, required: true },
    userCount: { type: Number, required: true }
});
const AssetTypeBreakdownSchema = new mongoose_1.Schema({
    type: { type: String, required: true },
    count: { type: Number, required: true },
    totalValue: { type: Number, required: true },
    averageAPY: { type: Number, required: true }
});
const TokenomicsSchema = new mongoose_1.Schema({
    totalSupply: { type: String, required: true },
    circulatingSupply: { type: String, required: true },
    totalStaked: { type: String, required: true },
    totalBurned: { type: String, required: true },
    stakingAPY: { type: Number, required: true }
});
const AnalyticsSchema = new mongoose_1.Schema({
    date: { type: Date, required: true, unique: true, index: true },
    metrics: { type: MetricsSchema, required: true },
    countryBreakdown: [CountryBreakdownSchema],
    assetTypeBreakdown: [AssetTypeBreakdownSchema],
    tokenomics: { type: TokenomicsSchema, required: true }
}, {
    timestamps: true,
    collection: 'analytics'
});
AnalyticsSchema.index({ date: -1 });
exports.AnalyticsModel = mongoose_1.default.model('Analytics', AnalyticsSchema);
__exportStar(require("./asset.model"), exports);
__exportStar(require("./settlement.model"), exports);
__exportStar(require("./user.model"), exports);
__exportStar(require("./operation.model"), exports);
//# sourceMappingURL=analytics.model.js.map