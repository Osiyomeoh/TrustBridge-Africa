import mongoose, { Schema, Document } from 'mongoose';
import { SettlementStatus } from '../types';

export interface SettlementDocument extends Document {
  id: string;
  assetId: string;
  buyer: string;
  seller: string;
  amount: number;
  status: SettlementStatus;
  deliveryDeadline: Date;
  trackingHash: string;
  confirmations: Array<{
    confirmer: string;
    timestamp: Date;
    proofHash: string;
    isValid: boolean;
  }>;
  transactionHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryConfirmationSchema = new Schema({
  confirmer: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  proofHash: { type: String, required: true },
  isValid: { type: Boolean, default: true }
});

const SettlementSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  assetId: { type: String, required: true, index: true },
  buyer: { type: String, required: true, index: true },
  seller: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: Object.values(SettlementStatus),
    default: SettlementStatus.PENDING,
    index: true
  },
  deliveryDeadline: { type: Date, required: true, index: true },
  trackingHash: { type: String, required: true, unique: true },
  confirmations: [DeliveryConfirmationSchema],
  transactionHash: { type: String }
}, {
  timestamps: true,
  collection: 'settlements'
});

SettlementSchema.index({ buyer: 1, seller: 1 });
SettlementSchema.index({ createdAt: -1 });

export const SettlementModel = mongoose.model<SettlementDocument>('Settlement', SettlementSchema);
