import { Document } from 'mongoose';
export type AttestorDocument = Attestor & Document;
export declare enum AttestorType {
    COOPERATIVE = "COOPERATIVE",
    EXTENSION_OFFICER = "EXTENSION_OFFICER",
    GOVERNMENT_OFFICIAL = "GOVERNMENT_OFFICIAL",
    SURVEYOR = "SURVEYOR",
    APPRAISER = "APPRAISER",
    AUDITOR = "AUDITOR"
}
export declare class Credentials {
    licenseNumber?: string;
    certifications: string[];
    yearsExperience: number;
    registrationProof?: string;
}
export declare class ContactInfo {
    email?: string;
    phone?: string;
    address?: string;
}
export declare class Attestor {
    address: string;
    organizationName: string;
    type: AttestorType;
    organizationType: AttestorType;
    country: string;
    region: string;
    specialties: string[];
    credentials: Credentials;
    contactInfo: ContactInfo;
    contactEmail?: string;
    contactPhone?: string;
    isActive: boolean;
    reputation: number;
    totalStaked: number;
    stakeAmount: number;
    verificationCount: number;
    totalAttestations: number;
    successfulAttestations: number;
    successRate: number;
    averageResponseTime: number;
    lastVerificationDate?: Date;
    lastActivity?: Date;
    location?: {
        coordinates?: {
            lat: number;
            lng: number;
        };
        address?: string;
    };
    rejectionReason?: string;
}
export declare const AttestorSchema: import("mongoose").Schema<Attestor, import("mongoose").Model<Attestor, any, any, any, Document<unknown, any, Attestor, any, {}> & Attestor & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Attestor, Document<unknown, {}, import("mongoose").FlatRecord<Attestor>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Attestor> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
