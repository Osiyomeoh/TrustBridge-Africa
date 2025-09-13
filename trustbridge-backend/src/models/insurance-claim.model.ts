import mongoose, { Schema, Document } from 'mongoose';

export enum ClaimStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID'
}

export enum ClaimType {
  ASSET_LOSS = 'ASSET_LOSS',
  QUALITY_DEFECT = 'QUALITY_DEFECT',
  DELIVERY_FAILURE = 'DELIVERY_FAILURE',
  FRAUD = 'FRAUD',
  NATURAL_DISASTER = 'NATURAL_DISASTER'
}

export interface InsuranceClaimDocument extends Document {
  id: string;
  assetId: string;
  claimant: string; // Wallet address
  type: ClaimType;
  status: ClaimStatus;
  description: string;
  claimAmount: number;
  evidence: Array<{
    type: string;
    hash: string;
    description: string;
  }>;
  investigation: {
    investigator?: string;
    findings?: string;
    recommendedAction?: string;
    completedAt?: Date;
  };
  resolution: {
    approved: boolean;
    payoutAmount?: number;
    reason?: string;
    resolvedBy?: string;
    resolvedAt?: Date;
    transactionHash?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EvidenceSchema = new Schema({
  type: { type: String, required: true },
  hash: { type: String, required: true },
  description: { type: String, required: true }
});

const InvestigationSchema = new Schema({
  investigator: { type: String },
  findings: { type: String },
  recommendedAction: { type: String },
  completedAt: { type: Date }
});

const ResolutionSchema = new Schema({
  approved: { type: Boolean, required: true },
  payoutAmount: { type: Number },
  reason: { type: String },
  resolvedBy: { type: String },
  resolvedAt: { type: Date },
  transactionHash: { type: String }
});

const InsuranceClaimSchema = new Schema({
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

export const InsuranceClaimModel = mongoose.model<InsuranceClaimDocument>('InsuranceClaim', InsuranceClaimSchema);
