import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AttestorDocument = Attestor & Document;

export enum AttestorType {
  COOPERATIVE = 'COOPERATIVE',
  EXTENSION_OFFICER = 'EXTENSION_OFFICER',
  GOVERNMENT_OFFICIAL = 'GOVERNMENT_OFFICIAL',
  SURVEYOR = 'SURVEYOR',
  APPRAISER = 'APPRAISER',
  AUDITOR = 'AUDITOR',
}

@Schema({ timestamps: true })
export class Credentials {
  @Prop()
  licenseNumber?: string;

  @Prop({ type: [String], default: [] })
  certifications: string[];

  @Prop({ default: 0 })
  yearsExperience: number;

  @Prop()
  registrationProof?: string;
}

@Schema({ timestamps: true })
export class ContactInfo {
  @Prop()
  email?: string;

  @Prop()
  phone?: string;

  @Prop()
  address?: string;
}

@Schema({ timestamps: true })
export class Attestor {
  @Prop({ required: true, unique: true })
  address: string;

  @Prop({ required: true })
  organizationName: string;

  @Prop({ required: true, enum: AttestorType })
  type: AttestorType;

  @Prop({ required: true, enum: AttestorType })
  organizationType: AttestorType;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  region: string;

  @Prop({ type: [String], default: [] })
  specialties: string[];

  @Prop({ type: Credentials, required: true })
  credentials: Credentials;

  @Prop({ type: ContactInfo, required: true })
  contactInfo: ContactInfo;

  @Prop()
  contactEmail?: string;

  @Prop()
  contactPhone?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  reputation: number;

  @Prop({ default: 0 })
  totalStaked: number;

  @Prop({ default: 0 })
  stakeAmount: number;

  @Prop({ default: 0 })
  verificationCount: number;

  @Prop({ default: 0 })
  totalAttestations: number;

  @Prop({ default: 0 })
  successfulAttestations: number;

  @Prop({ default: 0 })
  successRate: number;

  @Prop({ default: 0 })
  averageResponseTime: number;

  @Prop()
  lastVerificationDate?: Date;

  @Prop()
  lastActivity?: Date;

  @Prop({ type: Object })
  location?: {
    coordinates?: { lat: number; lng: number };
    address?: string;
  };

  @Prop()
  rejectionReason?: string;
}

export const AttestorSchema = SchemaFactory.createForClass(Attestor);
