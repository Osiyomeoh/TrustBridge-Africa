import { Document } from 'mongoose';
export type VerificationRequestDocument = VerificationRequest & Document;
export declare enum VerificationStatus {
    SUBMITTED = "SUBMITTED",
    EVIDENCE_GATHERING = "EVIDENCE_GATHERING",
    VERIFIED = "VERIFIED",
    REJECTED = "REJECTED"
}
export declare class IPFSFile {
    cid: string;
    ipfsUrl: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    description?: string;
    category?: string;
}
export declare class Evidence {
    type: string;
    provider: string;
    confidence: number;
    result: any;
    files: IPFSFile[];
}
export declare class Attestation {
    attestorAddress: string;
    confidence: number;
    evidence: string;
}
export declare class Scoring {
    automatedScore: number;
    attestorScore: number;
    finalScore: number;
}
export declare class VerificationRequest {
    assetId: string;
    status: VerificationStatus;
    evidence: Evidence[];
    attestations: Attestation[];
    scoring?: Scoring;
    documents: IPFSFile[];
    photos: IPFSFile[];
    submittedBy: string;
    completedAt?: Date;
}
export declare const VerificationRequestSchema: import("mongoose").Schema<VerificationRequest, import("mongoose").Model<VerificationRequest, any, any, any, Document<unknown, any, VerificationRequest, any, {}> & VerificationRequest & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, VerificationRequest, Document<unknown, {}, import("mongoose").FlatRecord<VerificationRequest>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<VerificationRequest> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
