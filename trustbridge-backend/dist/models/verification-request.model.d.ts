import mongoose, { Document } from 'mongoose';
export interface IEvidence {
    type: string;
    provider: string;
    confidence: number;
    result: any;
    timestamp: Date;
}
export interface IAttestation {
    attestorAddress: string;
    confidence: number;
    evidence: string;
    timestamp: Date;
    onChainTxHash?: string;
}
export interface IVerificationScoring {
    automatedScore: number;
    attestorScore: number;
    finalScore: number;
    breakdown: any;
}
export interface IVerificationRequest extends Document {
    assetId: string;
    assetType: string;
    ownerAddress: string;
    declaredValue: number;
    status: 'SUBMITTED' | 'EVIDENCE_GATHERING' | 'ATTESTOR_REVIEW' | 'MANUAL_REVIEW' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';
    evidence: IEvidence[];
    attestations: IAttestation[];
    scoring: IVerificationScoring;
    assignedAttestors: string[];
    metadata: any;
    documents: Array<{
        name: string;
        fileRef: string;
    }>;
    photos: Array<{
        description: string;
        fileRef: string;
        gpsData?: {
            lat: number;
            lng: number;
        };
    }>;
    createdAt: Date;
    expiresAt?: Date;
    updatedAt: Date;
}
export declare const VerificationRequestModel: mongoose.Model<IVerificationRequest, {}, {}, {}, mongoose.Document<unknown, {}, IVerificationRequest, {}, {}> & IVerificationRequest & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
