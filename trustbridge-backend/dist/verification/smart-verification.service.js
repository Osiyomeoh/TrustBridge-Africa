"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SmartVerificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartVerificationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const verification_request_schema_1 = require("../schemas/verification-request.schema");
const asset_schema_1 = require("../schemas/asset.schema");
const event_emitter_1 = require("@nestjs/event-emitter");
const hedera_service_1 = require("../hedera/hedera.service");
let SmartVerificationService = SmartVerificationService_1 = class SmartVerificationService {
    constructor(verificationModel, assetModel, eventEmitter, hederaService) {
        this.verificationModel = verificationModel;
        this.assetModel = assetModel;
        this.eventEmitter = eventEmitter;
        this.hederaService = hederaService;
        this.logger = new common_1.Logger(SmartVerificationService_1.name);
        this.verificationTiers = [
            {
                name: 'INSTANT',
                maxAssetValue: 10000,
                maxProcessingTime: 5,
                requiresManualReview: false,
                confidenceThreshold: 0.85,
                description: 'Instant verification for low-value, high-confidence assets'
            },
            {
                name: 'FAST',
                maxAssetValue: 100000,
                maxProcessingTime: 30,
                requiresManualReview: false,
                confidenceThreshold: 0.75,
                description: 'Fast verification for medium-value assets with good documentation'
            },
            {
                name: 'STANDARD',
                maxAssetValue: Infinity,
                maxProcessingTime: 1440,
                requiresManualReview: true,
                confidenceThreshold: 0.6,
                description: 'Standard verification with manual review for high-value or complex assets'
            }
        ];
    }
    async processSmartVerification(assetId, evidence) {
        const startTime = Date.now();
        try {
            const asset = await this.assetModel.findOne({ assetId });
            if (!asset) {
                throw new Error('Asset not found');
            }
            const tier = this.determineVerificationTier(asset.totalValue, evidence);
            this.logger.log(`Asset ${assetId} assigned to ${tier.name} verification tier`);
            const result = await this.runTierBasedVerification(asset, evidence, tier);
            const processingTime = (Date.now() - startTime) / 1000 / 60;
            if (result.approved) {
                await this.updateAssetStatus(assetId, 'VERIFIED', result.confidence);
                await this.createVerificationRecord(assetId, tier, result, processingTime);
                this.eventEmitter.emit('verification.completed', {
                    assetId,
                    tier: tier.name,
                    confidence: result.confidence,
                    processingTime
                });
            }
            else {
                await this.updateAssetStatus(assetId, 'PENDING_MANUAL_REVIEW', result.confidence);
                this.eventEmitter.emit('verification.requires_review', {
                    assetId,
                    tier: tier.name,
                    reasons: result.reasons
                });
            }
            return {
                ...result,
                tier,
                processingTime
            };
        }
        catch (error) {
            this.logger.error(`Smart verification failed for asset ${assetId}:`, error);
            throw error;
        }
    }
    determineVerificationTier(assetValue, evidence) {
        const tier = this.verificationTiers.find(t => assetValue <= t.maxAssetValue) || this.verificationTiers[2];
        const evidenceQuality = this.assessEvidenceQuality(evidence);
        if (evidenceQuality < 0.7 && tier.name === 'INSTANT') {
            return this.verificationTiers[1];
        }
        if (evidenceQuality < 0.5 && tier.name === 'FAST') {
            return this.verificationTiers[2];
        }
        return tier;
    }
    assessEvidenceQuality(evidence) {
        let score = 0;
        let factors = 0;
        if (evidence.documents && evidence.documents.length > 0) {
            score += 0.3;
            factors++;
        }
        if (evidence.photos && evidence.photos.length > 0) {
            score += 0.2;
            factors++;
        }
        if (evidence.location && evidence.location.coordinates) {
            score += 0.2;
            factors++;
        }
        if (evidence.ownership && evidence.ownership.ownerName) {
            score += 0.2;
            factors++;
        }
        if (evidence.valuation && evidence.valuation.estimatedValue) {
            score += 0.1;
            factors++;
        }
        return factors > 0 ? score / factors : 0;
    }
    async runTierBasedVerification(asset, evidence, tier) {
        const confidence = await this.calculateConfidenceScore(asset, evidence);
        const reasons = [];
        const nextSteps = [];
        if (confidence >= tier.confidenceThreshold) {
            reasons.push(`High confidence score: ${(confidence * 100).toFixed(1)}%`);
            reasons.push(`Meets ${tier.name} tier requirements`);
            return {
                approved: true,
                confidence,
                reasons,
                nextSteps: ['Asset will be tokenized immediately', 'Available for investment within minutes']
            };
        }
        else {
            reasons.push(`Low confidence score: ${(confidence * 100).toFixed(1)}%`);
            reasons.push(`Below ${tier.name} tier threshold: ${(tier.confidenceThreshold * 100).toFixed(1)}%`);
            if (tier.requiresManualReview) {
                nextSteps.push('Asset will be reviewed by our verification team');
                nextSteps.push('You will receive updates via email and dashboard');
            }
            else {
                nextSteps.push('Please provide additional documentation');
                nextSteps.push('Resubmit with more complete evidence');
            }
            return {
                approved: false,
                confidence,
                reasons,
                nextSteps
            };
        }
    }
    async calculateConfidenceScore(asset, evidence) {
        let score = 0;
        let factors = 0;
        const evidenceQuality = this.assessEvidenceQuality(evidence);
        score += evidenceQuality * 0.4;
        factors += 0.4;
        const valueReasonableness = this.assessValueReasonableness(asset, evidence);
        score += valueReasonableness * 0.2;
        factors += 0.2;
        const docQuality = this.assessDocumentationQuality(evidence);
        score += docQuality * 0.2;
        factors += 0.2;
        const locationScore = this.assessLocationVerification(evidence);
        score += locationScore * 0.1;
        factors += 0.1;
        const ownershipScore = this.assessOwnershipVerification(evidence);
        score += ownershipScore * 0.1;
        factors += 0.1;
        return factors > 0 ? score / factors : 0;
    }
    assessValueReasonableness(asset, evidence) {
        const declaredValue = asset.totalValue;
        const estimatedValue = evidence.valuation?.estimatedValue || 0;
        if (estimatedValue > 0) {
            const variance = Math.abs(declaredValue - estimatedValue) / declaredValue;
            return variance < 0.2 ? 1.0 : Math.max(0, 1 - variance);
        }
        return 0.5;
    }
    assessDocumentationQuality(evidence) {
        let score = 0;
        let factors = 0;
        const requiredDocs = ['ownership', 'valuation', 'survey'];
        const providedDocs = evidence.documents?.map((d) => d.type) || [];
        requiredDocs.forEach(docType => {
            if (providedDocs.includes(docType)) {
                score += 1;
            }
            factors += 1;
        });
        return factors > 0 ? score / factors : 0.3;
    }
    assessLocationVerification(evidence) {
        if (evidence.location?.coordinates) {
            return 1.0;
        }
        if (evidence.location?.address) {
            return 0.7;
        }
        return 0.3;
    }
    assessOwnershipVerification(evidence) {
        if (evidence.ownership?.ownerName && evidence.ownership?.ownershipPercentage) {
            return 1.0;
        }
        if (evidence.ownership?.ownerName) {
            return 0.6;
        }
        return 0.2;
    }
    async updateAssetStatus(assetId, status, confidence) {
        await this.assetModel.findOneAndUpdate({ assetId }, {
            status,
            verificationScore: confidence * 100,
            updatedAt: new Date()
        });
    }
    async createVerificationRecord(assetId, tier, result, processingTime) {
        const verificationRecord = new this.verificationModel({
            assetId,
            status: result.approved ? verification_request_schema_1.VerificationStatus.VERIFIED : verification_request_schema_1.VerificationStatus.SUBMITTED,
            scoring: {
                automatedScore: result.confidence * 100,
                attestorScore: 0,
                finalScore: result.confidence * 100,
                breakdown: {
                    tier: tier.name,
                    processingTime,
                    reasons: result.reasons
                }
            },
            metadata: {
                tier: tier.name,
                processingTime,
                automated: true
            }
        });
        await verificationRecord.save();
    }
    async getVerificationStatus(assetId) {
        const verification = await this.verificationModel.findOne({ assetId });
        const asset = await this.assetModel.findOne({ assetId });
        if (!verification || !asset) {
            return null;
        }
        return {
            assetId,
            status: asset.status,
            tier: verification.metadata?.tier || 'STANDARD',
            confidence: verification.scoring?.finalScore || 0,
            processingTime: verification.metadata?.processingTime || 0,
            reasons: verification.scoring?.breakdown?.reasons || [],
            nextSteps: verification.metadata?.nextSteps || []
        };
    }
};
exports.SmartVerificationService = SmartVerificationService;
exports.SmartVerificationService = SmartVerificationService = SmartVerificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(verification_request_schema_1.VerificationRequest.name)),
    __param(1, (0, mongoose_1.InjectModel)(asset_schema_1.Asset.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        event_emitter_1.EventEmitter2,
        hedera_service_1.HederaService])
], SmartVerificationService);
//# sourceMappingURL=smart-verification.service.js.map