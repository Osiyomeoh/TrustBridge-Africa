import mongoose, { Document, Schema } from 'mongoose';

export interface IAttestor extends Document {
  walletAddress: string;
  organizationName: string;
  type: 'COOPERATIVE' | 'EXTENSION_OFFICER' | 'GOVERNMENT_OFFICIAL' | 'SURVEYOR' | 'APPRAISER' | 'AUDITOR';
  country: string;
  region: string;
  specialties: string[];
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
  stakeAmount: string;
  reputation: {
    totalAttestations: number;
    correctAttestations: number;
    disputedAttestations: number;
    score: number;
  };
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  credentials: {
    licenseNumber?: string;
    certifications: string[];
    yearsExperience: number;
    registrationProof: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AttestorSchema = new Schema<IAttestor>({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  organizationName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['COOPERATIVE', 'EXTENSION_OFFICER', 'GOVERNMENT_OFFICER', 'SURVEYOR', 'APPRAISER', 'AUDITOR'],
    required: true
  },
  country: {
    type: String,
    required: true,
    index: true
  },
  region: {
    type: String,
    required: true
  },
  specialties: [{
    type: String,
    required: true
  }],
  status: {
    type: String,
    enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'REVOKED'],
    default: 'PENDING'
  },
  stakeAmount: {
    type: String,
    required: true
  },
  reputation: {
    totalAttestations: {
      type: Number,
      default: 0
    },
    correctAttestations: {
      type: Number,
      default: 0
    },
    disputedAttestations: {
      type: Number,
      default: 0
    },
    score: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    }
  },
  contactInfo: {
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  credentials: {
    licenseNumber: String,
    certifications: [String],
    yearsExperience: {
      type: Number,
      required: true
    },
    registrationProof: {
      type: String,
      required: true
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
AttestorSchema.index({ country: 1, status: 1 });
AttestorSchema.index({ specialties: 1 });
AttestorSchema.index({ 'reputation.score': -1 });

export const AttestorModel = mongoose.model<IAttestor>('Attestor', AttestorSchema);
