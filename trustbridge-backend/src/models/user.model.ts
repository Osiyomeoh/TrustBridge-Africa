import mongoose, { Schema, Document } from 'mongoose';

export enum UserRole {
  INVESTOR = 'INVESTOR',
  ASSET_OWNER = 'ASSET_OWNER',
  OPERATOR = 'OPERATOR',
  VERIFIER = 'VERIFIER',
  ADMIN = 'ADMIN'
}

export enum KYCStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export interface UserDocument extends Document {
  walletAddress: string;
  role: UserRole;
  kycStatus: KYCStatus;
  kycInquiryId?: string;
  reputation: number;
  stakingBalance: string; // BigInt as string
  stakingRewards: number;
  stakingTimestamp?: Date;
  lockPeriod?: number;
  profile: {
    name?: string;
    email?: string;
    country?: string;
    phoneNumber?: string;
  };
  kycData?: {
    documents: Array<{
      type: string;
      hash: string;
      verified: boolean;
    }>;
    verificationDate?: Date;
    verifier?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema({
  name: { type: String },
  email: { type: String },
  country: { type: String },
  phoneNumber: { type: String }
});

const KYCDocumentSchema = new Schema({
  type: { type: String, required: true },
  hash: { type: String, required: true },
  verified: { type: Boolean, default: false }
});

const KYCDataSchema = new Schema({
  documents: [KYCDocumentSchema],
  verificationDate: { type: Date },
  verifier: { type: String }
});

const UserSchema = new Schema({
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
  stakingBalance: { type: String, default: '0' }, // BigInt stored as string
  stakingRewards: { type: Number, default: 0 },
  stakingTimestamp: { type: Date },
  lockPeriod: { type: Number }, // in seconds
  profile: ProfileSchema,
  kycData: KYCDataSchema
}, {
  timestamps: true,
  collection: 'users'
});

UserSchema.index({ role: 1, kycStatus: 1 });
UserSchema.index({ reputation: -1 });
UserSchema.index({ createdAt: -1 });

export const UserModel = mongoose.model<UserDocument>('User', UserSchema);
