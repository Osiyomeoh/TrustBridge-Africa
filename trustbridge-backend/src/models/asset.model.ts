import mongoose, { Schema, Document } from 'mongoose';
import { AssetType, AssetStatus, Location, Operation, Investment } from '../types';

export interface AssetDocument extends Document {
  assetId: string;
  owner: string;
  type: AssetType;
  name: string;
  description?: string;
  location: Location;
  totalValue: number;
  tokenSupply: number;
  tokenizedAmount: number;
  maturityDate: Date;
  expectedAPY: number;
  verificationScore: number;
  status: AssetStatus;
  tokenContract: string;
  transactionHash?: string;
  verificationData?: any;
  operations: Operation[];
  investments: Investment[];
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema({
  country: { type: String, required: true, index: true },
  region: { type: String, required: true, index: true },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  address: { type: String }
});

const OperationSchema = new Schema({
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

const InvestmentSchema = new Schema({
  id: { type: String, required: true },
  investor: { type: String, required: true, index: true },
  assetId: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  tokens: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  returns: { type: Number, default: 0 }
});

const AssetSchema = new Schema({
  assetId: { type: String, required: true, unique: true, index: true },
  owner: { type: String, required: true, index: true },
  type: { 
    type: String, 
    enum: Object.values(AssetType),
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
    enum: Object.values(AssetStatus),
    default: AssetStatus.PENDING,
    index: true
  },
  tokenContract: { type: String, required: true },
  transactionHash: { type: String },
  verificationData: { type: Schema.Types.Mixed },
  operations: [OperationSchema],
  investments: [InvestmentSchema]
}, {
  timestamps: true,
  collection: 'assets'
});

// Indexes for efficient queries
AssetSchema.index({ 'location.country': 1, type: 1 });
AssetSchema.index({ totalValue: 1, expectedAPY: -1 });
AssetSchema.index({ verificationScore: -1, status: 1 });
AssetSchema.index({ createdAt: -1 });

// Virtual for tokenization percentage
AssetSchema.virtual('tokenizationPercentage').get(function() {
  return (this.tokenizedAmount / this.tokenSupply) * 100;
});

// Virtual for remaining tokens
AssetSchema.virtual('availableTokens').get(function() {
  return this.tokenSupply - this.tokenizedAmount;
});

export const AssetModel = mongoose.model<AssetDocument>('Asset', AssetSchema);