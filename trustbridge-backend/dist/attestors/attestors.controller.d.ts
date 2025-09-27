import { AttestorsService, ExternalPartyData, AttestationData, PerformanceData } from './attestors.service';
export declare class AttestorsController {
    private readonly attestorsService;
    constructor(attestorsService: AttestorsService);
    getAttestors(): Promise<{
        success: boolean;
        data: import("../schemas/attestor.schema").Attestor[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    registerExternalParty(partyData: ExternalPartyData): Promise<{
        success: boolean;
        data: import("../schemas/attestor.schema").Attestor;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    applyAsAttestor(applicationData: any): Promise<{
        success: boolean;
        data: any;
        message: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getAttestorApplications(): Promise<{
        success: boolean;
        data: any[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    approveAttestorApplication(id: string, body: {
        reviewerNotes?: string;
    }): Promise<{
        success: boolean;
        data: any;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    rejectAttestorApplication(id: string, body: {
        reviewerNotes?: string;
    }): Promise<{
        success: boolean;
        data: any;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getAttestorsByLocation(country: string, region?: string): Promise<{
        success: boolean;
        data: import("../schemas/attestor.schema").Attestor[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getAttestorsBySpecialty(specialty: string): Promise<{
        success: boolean;
        data: import("../schemas/attestor.schema").Attestor[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    getAttestor(id: string): Promise<{
        success: boolean;
        data: import("../schemas/attestor.schema").Attestor;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
        data?: undefined;
    }>;
    submitAttestation(attestorId: string, attestationData: AttestationData): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    updateReputation(attestorId: string, performance: PerformanceData): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    approveAttestor(attestorId: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
    rejectAttestor(attestorId: string, body: {
        reason: string;
    }): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message: string;
    }>;
}
