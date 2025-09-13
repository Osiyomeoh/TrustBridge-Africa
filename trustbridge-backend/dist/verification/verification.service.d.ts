import { Model } from 'mongoose';
import { VerificationRequest, VerificationRequestDocument, VerificationStatus, IPFSFile } from '../schemas/verification-request.schema';
import { AssetDocument } from '../schemas/asset.schema';
import { Attestor, AttestorDocument } from '../schemas/attestor.schema';
import { HederaService } from '../hedera/hedera.service';
import { ChainlinkService } from '../chainlink/chainlink.service';
import { AttestorsService } from '../attestors/attestors.service';
import { ExternalApisService } from '../external-apis/external-apis.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IPFSService } from '../services/ipfs.service';
export interface VerificationResult {
    assetId: string;
    automatedScore: number;
    attestorScore?: number;
    finalScore: number;
    status: VerificationStatus;
    evidence: any;
    attestorId?: string;
    timestamp: Date;
}
export interface AttestorMatch {
    attestor: Attestor;
    score: number;
    reason: string;
}
export declare class VerificationService {
    private verificationModel;
    private assetModel;
    private attestorModel;
    private hederaService;
    private chainlinkService;
    private attestorsService;
    private externalApisService;
    private eventEmitter;
    private ipfsService;
    constructor(verificationModel: Model<VerificationRequestDocument>, assetModel: Model<AssetDocument>, attestorModel: Model<AttestorDocument>, hederaService: HederaService, chainlinkService: ChainlinkService, attestorsService: AttestorsService, externalApisService: ExternalApisService, eventEmitter: EventEmitter2, ipfsService: IPFSService);
    submitVerificationRequest(assetId: string, evidence: any): Promise<VerificationRequest>;
    submitVerificationWithFiles(assetId: string, description: string, documents: IPFSFile[], photos: IPFSFile[], evidence: any): Promise<VerificationRequest>;
    private runAutomatedVerification;
    private verifyDocuments;
    private verifyGPSLocation;
    private analyzePhotos;
    private verifyMarketPrice;
    private verifyWeatherData;
    private verifyHistoricalData;
    private findMatchingAttestors;
    private assignAttestors;
    submitAttestation(verificationId: string, attestorId: string, attestation: any): Promise<void>;
    private submitToBlockchain;
    private calculateEvidenceHash;
    private extractTextFromDocument;
    private verifyDocumentAuthenticity;
    private checkDocumentCompleteness;
    private verifyOwnershipInfo;
    private validateCoordinates;
    private compareLocations;
    private verifyLocationExists;
    private extractGPSFromPhoto;
    private analyzePhotoContent;
    private verifyPhotoTimestamp;
    private checkWeatherSuitability;
    private isLocationMatch;
    private notifyAttestor;
    private approveVerification;
    getVerificationStatus(assetId: string): Promise<VerificationRequest>;
    getAllVerifications(): Promise<VerificationRequest[]>;
    getVerificationById(id: string): Promise<VerificationRequest>;
}
