import mongoose, { Schema, Document } from 'mongoose';

export interface ValidatorDocument extends Document {
  walletAddress: string;
  stakedAmount: string; // BigInt as string
  reputation: number;
  verificationsCount: number;
  accuracyScore: number;
  isActive: boolean;
  specialties: string[]; // Asset types they specialize in
  location?: {
    country: string;
    region: string;
  };
  performance: {
    totalVerifications: number;
    correctVerifications: number;
    falsePositives: number;
    falseNegatives: number;
    averageResponseTime: number; // in hours
  };
  penalties: Array<{
    reason: string;
    amount: string; // Slashed amount
    timestamp: Date;
  }>;
  rewards: Array<{
    amount: number;
    reason: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ValidatorPerformanceSchema = new Schema({
  totalVerifications: { type: Number, default: 0 },
  correctVerifications: { type: Number, default: 0 },
  falsePositives: { type: Number, default: 0 },
  falseNegatives: { type: Number, default: 0 },
  averageResponseTime: { type: Number, default: 24 }
});

const PenaltySchema = new Schema({
  reason: { type: String, required: true },
  amount: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const RewardSchema = new Schema({
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const ValidatorSchema = new Schema({
  walletAddress: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  stakedAmount: { type: String, required: true }, // Minimum 10,000 TRUST
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

export const ValidatorModel = mongoose.model<ValidatorDocument>('Validator', ValidatorSchema);
