import { Model } from 'mongoose';
import { VerificationRequestDocument } from '../schemas/verification-request.schema';
import { AssetDocument } from '../schemas/asset.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HederaService } from '../hedera/hedera.service';
export interface VerificationTier {
    name: 'INSTANT' | 'FAST' | 'STANDARD';
    maxAssetValue: number;
    maxProcessingTime: number;
    requiresManualReview: boolean;
    confidenceThreshold: number;
    description: string;
}
export interface SmartVerificationResult {
    tier: VerificationTier;
    approved: boolean;
    confidence: number;
    processingTime: number;
    reasons: string[];
    nextSteps?: string[];
}
export declare class SmartVerificationService {
    private verificationModel;
    private assetModel;
    private eventEmitter;
    private hederaService;
    private readonly logger;
    private readonly verificationTiers;
    constructor(verificationModel: Model<VerificationRequestDocument>, assetModel: Model<AssetDocument>, eventEmitter: EventEmitter2, hederaService: HederaService);
    processSmartVerification(assetId: string, evidence: any): Promise<SmartVerificationResult>;
    private determineVerificationTier;
    private assessEvidenceQuality;
    private runTierBasedVerification;
    private calculateConfidenceScore;
    private assessValueReasonableness;
    private assessDocumentationQuality;
    private assessLocationVerification;
    private assessOwnershipVerification;
    private updateAssetStatus;
    private createVerificationRecord;
    getVerificationStatus(assetId: string): Promise<any>;
}
