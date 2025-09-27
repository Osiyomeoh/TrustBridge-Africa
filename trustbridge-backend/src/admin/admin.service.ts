import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Attestor, AttestorDocument } from '../schemas/attestor.schema';
import { VerificationRequest, VerificationRequestDocument } from '../schemas/verification-request.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Attestor.name)
    private attestorModel: Model<AttestorDocument>,
    @InjectModel(VerificationRequest.name)
    private verificationRequestModel: Model<VerificationRequestDocument>,
  ) {}

  async getAdminStats() {
    try {
      // Get total attestors
      const totalAttestors = await this.attestorModel.countDocuments();

      // Get pending applications
      const pendingApplications = await this.attestorModel.countDocuments({
        status: 'pending_review'
      });

      // Get approved attestors
      const approvedAttestors = await this.attestorModel.countDocuments({
        status: 'approved'
      });

      // Get rejected attestors
      const rejectedAttestors = await this.attestorModel.countDocuments({
        status: 'rejected'
      });

      // Get total verifications
      const totalVerifications = await this.verificationRequestModel.countDocuments();

      // Get active verifications
      const activeVerifications = await this.verificationRequestModel.countDocuments({
        status: 'pending'
      });

      return {
        totalAttestors,
        pendingApplications,
        approvedAttestors,
        rejectedAttestors,
        totalVerifications,
        activeVerifications
      };
    } catch (error) {
      console.error('Failed to get admin stats:', error);
      throw new Error('Failed to retrieve admin statistics');
    }
  }
}