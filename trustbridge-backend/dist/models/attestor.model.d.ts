import mongoose, { Document } from 'mongoose';
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
export declare const AttestorModel: mongoose.Model<IAttestor, {}, {}, {}, mongoose.Document<unknown, {}, IAttestor, {}, {}> & IAttestor & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
