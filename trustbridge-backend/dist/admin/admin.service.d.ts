import { Model } from 'mongoose';
import { UserDocument } from '../schemas/user.schema';
import { AttestorDocument } from '../schemas/attestor.schema';
import { VerificationRequestDocument } from '../schemas/verification-request.schema';
export declare class AdminService {
    private userModel;
    private attestorModel;
    private verificationRequestModel;
    constructor(userModel: Model<UserDocument>, attestorModel: Model<AttestorDocument>, verificationRequestModel: Model<VerificationRequestDocument>);
    getAdminStats(): Promise<{
        totalAttestors: number;
        pendingApplications: number;
        approvedAttestors: number;
        rejectedAttestors: number;
        totalVerifications: number;
        activeVerifications: number;
    }>;
}
