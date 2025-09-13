import mongoose, { Schema, Document } from 'mongoose';

export interface AnalyticsDocument extends Document {
  date: Date;
  metrics: {
    totalValueLocked: number;
    totalAssets: number;
    totalUsers: number;
    totalOperations: number;
    averageAPY: number;
    successRate: number;
    monthlyVolume: number;
    newAssets: number;
    newUsers: number;
    settledTransactions: number;
    verificationAccuracy: number;
  };
  countryBreakdown: Array<{
    country: string;
    assetCount: number;
    totalValue: number;
    userCount: number;
  }>;
  assetTypeBreakdown: Array<{
    type: string;
    count: number;
    totalValue: number;
    averageAPY: number;
  }>;
  tokenomics: {
    totalSupply: string;
    circulatingSupply: string;
    totalStaked: string;
    totalBurned: string;
    stakingAPY: number;
  };
  createdAt: Date;
}

const MetricsSchema = new Schema({
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

const CountryBreakdownSchema = new Schema({
  country: { type: String, required: true },
  assetCount: { type: Number, required: true },
  totalValue: { type: Number, required: true },
  userCount: { type: Number, required: true }
});

const AssetTypeBreakdownSchema = new Schema({
  type: { type: String, required: true },
  count: { type: Number, required: true },
  totalValue: { type: Number, required: true },
  averageAPY: { type: Number, required: true }
});

const TokenomicsSchema = new Schema({
  totalSupply: { type: String, required: true },
  circulatingSupply: { type: String, required: true },
  totalStaked: { type: String, required: true },
  totalBurned: { type: String, required: true },
  stakingAPY: { type: Number, required: true }
});

const AnalyticsSchema = new Schema({
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

export const AnalyticsModel = mongoose.model<AnalyticsDocument>('Analytics', AnalyticsSchema);

// Export all models
export * from './asset.model';
export * from './settlement.model';
export * from './user.model';
export * from './operation.model';