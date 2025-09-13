import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  INVESTOR = 'INVESTOR',
  ASSET_OWNER = 'ASSET_OWNER',
  VERIFIER = 'VERIFIER',
  ADMIN = 'ADMIN',
}

export enum KycStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum EmailVerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  NOT_VERIFIED = 'NOT_VERIFIED',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  walletAddress: string;

  @Prop({ unique: true, sparse: true })
  email?: string;

  @Prop()
  name?: string;

  @Prop()
  phone?: string;

  @Prop()
  country?: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.INVESTOR })
  role: UserRole;

  @Prop({ required: true, enum: KycStatus, default: KycStatus.PENDING })
  kycStatus: KycStatus;

  @Prop({ required: true, enum: EmailVerificationStatus, default: EmailVerificationStatus.NOT_VERIFIED })
  emailVerificationStatus: EmailVerificationStatus;

  @Prop({ default: 0 })
  reputation: number;

  @Prop({ default: 0 })
  stakingBalance: number;

  @Prop({ default: 0 })
  stakingRewards: number;

  @Prop({ default: 0 })
  totalInvested: number;

  @Prop({ default: 0 })
  investmentCount: number;

  @Prop()
  lastInvestmentDate?: Date;

  @Prop()
  lastActivity?: Date;

  @Prop()
  region?: string;

  @Prop()
  password?: string;

  @Prop()
  lastLoginAt?: Date;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;

  @Prop()
  emailVerificationToken?: string;

  @Prop()
  emailVerificationExpires?: Date;

  @Prop({ type: Object })
  profile?: {
    bio?: string;
    avatar?: string;
    website?: string;
    socialLinks?: {
      twitter?: string;
      linkedin?: string;
      github?: string;
    };
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
