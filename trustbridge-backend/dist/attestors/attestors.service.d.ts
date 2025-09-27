import { Model } from 'mongoose';
import { Attestor, AttestorDocument, AttestorType } from '../schemas/attestor.schema';
import { HederaService } from '../hedera/hedera.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
export interface ExternalPartyData {
    organizationName: string;
    organizationType: AttestorType;
    country: string;
    region?: string;
    contactEmail: string;
    contactPhone: string;
    specialties: string[];
    credentials: {
        registrationNumber?: string;
        licenseNumber?: string;
        certificationBody?: string;
        website?: string;
    };
    stakeAmount: number;
}
export interface AttestorRequirements {
    assetType: string;
    location: {
        country: string;
        region?: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
    };
    requiredSpecialties: string[];
    minReputation: number;
    maxDistance?: number;
}
export interface AttestationData {
    assetId: string;
    confidence: number;
    evidence: {
        visitDate: Date;
        observations: string[];
        photos: string[];
        documents: string[];
        gpsCoordinates: {
            lat: number;
            lng: number;
        };
    };
    recommendation: 'VERIFIED' | 'REJECTED' | 'NEEDS_MORE_INFO';
    comments: string;
}
export interface PerformanceData {
    accuracy: number;
    responseTime: number;
    completeness: number;
    feedback: string;
}
export declare class AttestorsService {
    private attestorModel;
    private hederaService;
    private eventEmitter;
    private readonly logger;
    constructor(attestorModel: Model<AttestorDocument>, hederaService: HederaService, eventEmitter: EventEmitter2);
    registerExternalParty(partyData: ExternalPartyData): Promise<Attestor>;
    verifyExternalCredentials(partyData: ExternalPartyData): Promise<{
        isValid: boolean;
        reason?: string;
    }>;
    private verifyCooperativeCredentials;
    private verifyGovernmentCredentials;
    private verifySurveyorCredentials;
    private verifyExtensionOfficerCredentials;
    private verifyAppraiserCredentials;
    private verifyAuditorCredentials;
    private verifyBusinessRegistration;
    private verifyCooperativeStatus;
    private verifyWebsite;
    private verifyGovernmentEntity;
    private verifyGovernmentLicense;
    private verifySurveyorLicense;
    private verifyExtensionService;
    private verifyAppraiserLicense;
    private verifyAuditorLicense;
    private registerOnBlockchain;
    assignAttestors(assetId: string, requirements: AttestorRequirements): Promise<Attestor[]>;
    submitAttestation(attestorId: string, attestationData: AttestationData): Promise<void>;
    updateReputation(attestorId: string, performance: PerformanceData): Promise<void>;
    private calculateDistance;
    private deg2rad;
    private notifyAttestor;
    private submitAttestationToBlockchain;
    private updateReputationOnBlockchain;
    getAllAttestors(): Promise<Attestor[]>;
    getAttestor(attestorId: string): Promise<Attestor>;
    getAttestorsByLocation(country: string, region?: string): Promise<Attestor[]>;
    getAttestorsBySpecialty(specialty: string): Promise<Attestor[]>;
    approveAttestor(attestorId: string): Promise<void>;
    rejectAttestor(attestorId: string, reason: string): Promise<void>;
    processManualAttestorApplication(applicationData: any): Promise<any>;
    getAllAttestorApplications(): Promise<any[]>;
    approveAttestorApplication(applicationId: string, reviewerNotes?: string): Promise<any>;
    rejectAttestorApplication(applicationId: string, reviewerNotes?: string): Promise<any>;
    processAttestorApplication(applicationData: any): Promise<any>;
}
