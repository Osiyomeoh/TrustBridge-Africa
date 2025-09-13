import mongoose, { Schema, Document } from 'mongoose';
import { OperationType, OperationStatus, Location } from '../types';

export interface OperationDocument extends Document {
  id: string;
  assetId: string;
  type: OperationType;
  status: OperationStatus;
  operator: string;
  location?: Location;
  timestamp: Date;
  proofHash?: string;
  verified: boolean;
  metadata?: string;
  transactionHash?: string;
  hcsSequenceNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OperationSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  assetId: { type: String, required: true, index: true },
  type: { 
    type: String, 
    enum: Object.values(OperationType),
    required: true,
    index: true
  },
  status: { 
    type: String, 
    enum: Object.values(OperationStatus),
    default: OperationStatus.PENDING,
    index: true
  },
  operator: { type: String, required: true, index: true },
  location: {
    country: { type: String, index: true },
    region: { type: String, index: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },
    address: { type: String }
  },
  timestamp: { type: Date, default: Date.now, index: true },
  proofHash: { type: String, index: true },
  verified: { type: Boolean, default: false, index: true },
  metadata: { type: String },
  transactionHash: { type: String },
  hcsSequenceNumber: { type: String } // Hedera Consensus Service sequence
}, {
  timestamps: true,
  collection: 'operations'
});

OperationSchema.index({ assetId: 1, timestamp: -1 });
OperationSchema.index({ operator: 1, timestamp: -1 });
OperationSchema.index({ type: 1, status: 1 });

export const OperationModel = mongoose.model<OperationDocument>('Operation', OperationSchema);
