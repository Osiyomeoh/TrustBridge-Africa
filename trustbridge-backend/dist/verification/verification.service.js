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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const verification_request_schema_1 = require("../schemas/verification-request.schema");
const asset_schema_1 = require("../schemas/asset.schema");
const attestor_schema_1 = require("../schemas/attestor.schema");
const hedera_service_1 = require("../hedera/hedera.service");
const chainlink_service_1 = require("../chainlink/chainlink.service");
const attestors_service_1 = require("../attestors/attestors.service");
const external_apis_service_1 = require("../external-apis/external-apis.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const ipfs_service_1 = require("../services/ipfs.service");
let VerificationService = class VerificationService {
    constructor(verificationModel, assetModel, attestorModel, hederaService, chainlinkService, attestorsService, externalApisService, eventEmitter, ipfsService) {
        this.verificationModel = verificationModel;
        this.assetModel = assetModel;
        this.attestorModel = attestorModel;
        this.hederaService = hederaService;
        this.chainlinkService = chainlinkService;
        this.attestorsService = attestorsService;
        this.externalApisService = externalApisService;
        this.eventEmitter = eventEmitter;
        this.ipfsService = ipfsService;
    }
    async submitVerificationRequest(assetId, evidence) {
        const asset = await this.assetModel.findOne({ assetId });
        if (!asset) {
            throw new common_1.NotFoundException('Asset not found');
        }
        const automatedResult = await this.runAutomatedVerification(asset, evidence);
        const verificationRequest = new this.verificationModel({
            assetId,
            evidence: [{
                    type: 'automated_verification',
                    provider: 'system',
                    confidence: automatedResult.score / 100,
                    result: automatedResult.details,
                }],
            status: verification_request_schema_1.VerificationStatus.SUBMITTED,
            scoring: {
                automatedScore: automatedResult.score,
                attestorScore: 0,
                finalScore: automatedResult.score,
            },
            submittedBy: asset.owner,
        });
        const savedRequest = await verificationRequest.save();
        if (automatedResult.score >= 85) {
            await this.approveVerification(savedRequest._id.toString(), null, automatedResult.score);
        }
        else {
            const requirements = {
                assetType: asset.type,
                location: {
                    country: asset.location.country,
                    region: asset.location.region,
                    coordinates: asset.location.coordinates,
                },
                requiredSpecialties: [asset.type],
                minReputation: 70,
                maxDistance: 100,
            };
            const assignedAttestors = await this.attestorsService.assignAttestors(assetId, requirements);
            if (assignedAttestors.length > 0) {
                const attestorMatches = assignedAttestors.map(attestor => ({
                    attestor,
                    score: attestor.reputation,
                    reason: `Reputation: ${attestor.reputation}%, Location: ${attestor.country}`
                }));
                await this.assignAttestors(savedRequest._id.toString(), attestorMatches);
            }
        }
        this.eventEmitter.emit('verification.submitted', {
            assetId,
            verificationId: savedRequest._id,
            score: automatedResult.score,
            status: savedRequest.status,
        });
        return savedRequest;
    }
    async submitVerificationWithFiles(assetId, description, documents, photos, evidence) {
        const asset = await this.assetModel.findOne({ assetId });
        if (!asset) {
            throw new common_1.NotFoundException('Asset not found');
        }
        const verificationRequest = new this.verificationModel({
            assetId,
            status: verification_request_schema_1.VerificationStatus.SUBMITTED,
            documents,
            photos,
            evidence: [{
                    type: 'user_submission',
                    provider: 'user',
                    confidence: 1.0,
                    result: {
                        description,
                        evidence,
                        files: {
                            documents: documents.length,
                            photos: photos.length
                        }
                    },
                    files: documents.concat(photos)
                }],
            submittedBy: 'user',
        });
        const automatedResult = await this.runAutomatedVerification(asset, evidence);
        verificationRequest.scoring = {
            automatedScore: automatedResult.score,
            attestorScore: 0,
            finalScore: automatedResult.score
        };
        const savedRequest = await verificationRequest.save();
        this.eventEmitter.emit('verification.submitted', {
            assetId,
            verificationId: savedRequest._id,
            score: automatedResult.score,
            status: savedRequest.status,
            files: {
                documents: documents.length,
                photos: photos.length
            }
        });
        return savedRequest;
    }
    async runAutomatedVerification(asset, evidence) {
        let totalScore = 0;
        let maxScore = 0;
        const details = {};
        if (evidence.documents && evidence.documents.length > 0) {
            const docScore = await this.verifyDocuments(evidence.documents, asset);
            details.documentVerification = { score: docScore, maxScore: 25 };
            totalScore += docScore;
            maxScore += 25;
        }
        if (evidence.location && evidence.location.coordinates) {
            const gpsScore = await this.verifyGPSLocation(evidence.location, asset);
            details.gpsVerification = { score: gpsScore, maxScore: 20 };
            totalScore += gpsScore;
            maxScore += 20;
        }
        if (evidence.photos && evidence.photos.length > 0) {
            const photoScore = await this.analyzePhotos(evidence.photos, asset);
            details.photoAnalysis = { score: photoScore, maxScore: 20 };
            totalScore += photoScore;
            maxScore += 20;
        }
        const marketScore = await this.verifyMarketPrice(asset);
        details.marketVerification = { score: marketScore, maxScore: 15 };
        totalScore += marketScore;
        maxScore += 15;
        const weatherScore = await this.verifyWeatherData(asset);
        details.weatherVerification = { score: weatherScore, maxScore: 10 };
        totalScore += weatherScore;
        maxScore += 10;
        const historicalScore = await this.verifyHistoricalData(asset);
        details.historicalVerification = { score: historicalScore, maxScore: 10 };
        totalScore += historicalScore;
        maxScore += 10;
        const finalScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
        return {
            score: finalScore,
            details,
        };
    }
    async verifyDocuments(documents, asset) {
        let score = 0;
        const maxScore = 25;
        for (const doc of documents) {
            try {
                const ocrResult = await this.externalApisService.extractTextFromImage(Buffer.from(doc.data, 'base64'), doc.mimeType);
                const docVerification = await this.externalApisService.verifyDocument(Buffer.from(doc.data, 'base64'), doc.fileName?.includes('land') ? 'land_certificate' :
                    doc.fileName?.includes('business') ? 'business_license' : 'identity_document');
                if (docVerification.isValid)
                    score += 5;
                if (docVerification.confidence > 0.8)
                    score += 5;
                const isComplete = await this.checkDocumentCompleteness(ocrResult.text, asset);
                if (isComplete)
                    score += 5;
                const ownershipMatch = await this.verifyOwnershipInfo(ocrResult.text, asset);
                if (ownershipMatch)
                    score += 5;
            }
            catch (error) {
                console.error('Document verification failed:', error);
                score += 3;
            }
        }
        return Math.min(score, maxScore);
    }
    async verifyGPSLocation(location, asset) {
        let score = 0;
        const maxScore = 20;
        if (location.coordinates && location.coordinates.lat && location.coordinates.lng) {
            const isValid = await this.validateCoordinates(location.coordinates);
            if (isValid)
                score += 5;
            try {
                const gpsVerification = await this.externalApisService.verifyGPSLocation(location.coordinates.lat, location.coordinates.lng, location.address || '');
                if (gpsVerification.verified)
                    score += 10;
                if (gpsVerification.confidence > 0.8)
                    score += 5;
            }
            catch (error) {
                console.error('GPS verification failed:', error);
                score += 5;
            }
        }
        return Math.min(score, maxScore);
    }
    async analyzePhotos(photos, asset) {
        let score = 0;
        const maxScore = 20;
        for (const photo of photos) {
            const photoGPS = await this.extractGPSFromPhoto(photo);
            if (photoGPS)
                score += 5;
            const contentAnalysis = await this.analyzePhotoContent(photo, asset);
            if (contentAnalysis.matches)
                score += 10;
            const timestampValid = await this.verifyPhotoTimestamp(photo);
            if (timestampValid)
                score += 5;
        }
        return Math.min(score, maxScore);
    }
    async verifyMarketPrice(asset) {
        try {
            const marketPrice = await this.chainlinkService.getAssetPrice(asset.type, asset.location.country);
            if (marketPrice) {
                const priceDifference = Math.abs(asset.totalValue - marketPrice.price) / marketPrice.price;
                if (priceDifference <= 0.1)
                    return 15;
                if (priceDifference <= 0.2)
                    return 10;
                if (priceDifference <= 0.3)
                    return 5;
            }
        }
        catch (error) {
            console.error('Market price verification failed:', error);
        }
        return 0;
    }
    async verifyWeatherData(asset) {
        try {
            const weatherData = await this.externalApisService.getWeatherData(asset.location.coordinates.lat, asset.location.coordinates.lng);
            if (weatherData) {
                const isSuitable = await this.checkWeatherSuitability(weatherData, asset.type);
                return isSuitable ? 10 : 5;
            }
        }
        catch (error) {
            console.error('Weather verification failed:', error);
        }
        return 0;
    }
    async verifyHistoricalData(asset) {
        try {
            const previousAssets = await this.assetModel.find({
                owner: asset.owner,
                status: 'ACTIVE',
                verificationScore: { $gte: 80 }
            });
            if (previousAssets.length > 0) {
                return 10;
            }
            const anyPreviousAssets = await this.assetModel.find({ owner: asset.owner });
            return anyPreviousAssets.length > 0 ? 5 : 0;
        }
        catch (error) {
            console.error('Historical verification failed:', error);
        }
        return 0;
    }
    async findMatchingAttestors(asset, evidence) {
        const attestors = await this.attestorModel.find({
            isActive: true,
            specialties: { $in: [asset.type] },
            reputation: { $gte: 70 },
        });
        const matches = [];
        for (const attestor of attestors) {
            let score = 0;
            const reasons = [];
            if (this.isLocationMatch(attestor.country, asset.location)) {
                score += 40;
                reasons.push('Location match');
            }
            if (attestor.specialties.includes(asset.type)) {
                score += 30;
                reasons.push('Specialty match');
            }
            score += Math.round(attestor.reputation * 0.2);
            reasons.push(`Reputation: ${attestor.reputation}%`);
            if (attestor.isActive) {
                score += 10;
                reasons.push('Available');
            }
            if (score >= 60) {
                matches.push({
                    attestor,
                    score,
                    reason: reasons.join(', '),
                });
            }
        }
        return matches.sort((a, b) => b.score - a.score).slice(0, 3);
    }
    async assignAttestors(verificationId, matches) {
        const verification = await this.verificationModel.findById(verificationId);
        if (!verification) {
            throw new common_1.NotFoundException('Verification request not found');
        }
        const primaryAttestor = matches[0].attestor;
        verification.status = verification_request_schema_1.VerificationStatus.EVIDENCE_GATHERING;
        await verification.save();
        await this.notifyAttestor(primaryAttestor, verification);
        this.eventEmitter.emit('verification.assigned', {
            verificationId,
            attestorId: primaryAttestor._id?.toString() || '',
            assetId: verification.assetId,
        });
    }
    async submitAttestation(verificationId, attestorId, attestation) {
        const verification = await this.verificationModel.findById(verificationId);
        if (!verification) {
            throw new common_1.NotFoundException('Verification request not found');
        }
        const automatedWeight = 0.4;
        const attestorWeight = 0.6;
        const automatedScore = verification.scoring?.automatedScore || 0;
        const finalScore = Math.round((automatedScore * automatedWeight) +
            (attestation.confidence * attestorWeight));
        verification.attestations.push({
            attestorAddress: attestorId,
            confidence: attestation.confidence,
            evidence: JSON.stringify(attestation.evidence),
        });
        verification.scoring = {
            automatedScore,
            attestorScore: attestation.confidence,
            finalScore,
        };
        verification.status = finalScore >= 75 ? verification_request_schema_1.VerificationStatus.VERIFIED : verification_request_schema_1.VerificationStatus.REJECTED;
        verification.completedAt = new Date();
        await verification.save();
        await this.assetModel.updateOne({ assetId: verification.assetId }, {
            verificationScore: finalScore,
            status: finalScore >= 75 ? 'VERIFIED' : 'REJECTED'
        });
        if (verification.status === verification_request_schema_1.VerificationStatus.VERIFIED) {
            await this.submitToBlockchain(verification);
        }
        this.eventEmitter.emit('verification.completed', {
            verificationId,
            assetId: verification.assetId,
            finalScore,
            status: verification.status,
        });
    }
    async submitToBlockchain(verification) {
        try {
            await this.hederaService.submitVerification({
                assetId: verification.assetId,
                score: verification.scoring?.finalScore || 0,
                evidenceHash: await this.calculateEvidenceHash(verification.evidence),
                attestorId: verification.attestations[0]?.attestorAddress || '',
                timestamp: verification.completedAt || new Date(),
            });
        }
        catch (error) {
            console.error('Failed to submit verification to blockchain:', error);
            throw new Error('Blockchain submission failed');
        }
    }
    async calculateEvidenceHash(evidence) {
        return Buffer.from(JSON.stringify(evidence)).toString('base64');
    }
    async extractTextFromDocument(doc) {
        try {
            const ocrResult = await this.externalApisService.extractTextFromImage(Buffer.from(doc.data, 'base64'), doc.mimeType);
            return ocrResult.text;
        }
        catch (error) {
            console.error('OCR extraction failed:', error);
            return 'Extraction failed';
        }
    }
    async verifyDocumentAuthenticity(doc, text) {
        try {
            const docVerification = await this.externalApisService.verifyDocument(Buffer.from(doc.data, 'base64'), doc.fileName?.includes('land') ? 'land_certificate' :
                doc.fileName?.includes('business') ? 'business_license' : 'identity_document');
            return docVerification.isValid && docVerification.confidence > 0.7;
        }
        catch (error) {
            console.error('Document authenticity verification failed:', error);
            return false;
        }
    }
    async checkDocumentCompleteness(text, asset) {
        const requiredFields = {
            'AGRICULTURAL': ['farm', 'crop', 'hectares', 'location'],
            'REAL_ESTATE': ['property', 'land', 'building', 'location'],
            'MINING': ['mineral', 'mine', 'extraction', 'location'],
        };
        const fields = requiredFields[asset.type] || ['location', 'owner'];
        const textLower = text.toLowerCase();
        return fields.every(field => textLower.includes(field));
    }
    async verifyOwnershipInfo(text, asset) {
        const ownerName = asset.owner.toLowerCase();
        const textLower = text.toLowerCase();
        const nameParts = ownerName.split(' ');
        return nameParts.some(part => part.length > 2 && textLower.includes(part));
    }
    async validateCoordinates(coords) {
        return coords.lat >= -90 && coords.lat <= 90 && coords.lng >= -180 && coords.lng <= 180;
    }
    async compareLocations(location1, location2) {
        return true;
    }
    async verifyLocationExists(coords) {
        return true;
    }
    async extractGPSFromPhoto(photo) {
        return null;
    }
    async analyzePhotoContent(photo, asset) {
        return { matches: true };
    }
    async verifyPhotoTimestamp(photo) {
        return true;
    }
    async checkWeatherSuitability(weatherData, assetType) {
        return true;
    }
    isLocationMatch(attestorCountry, assetLocation) {
        return attestorCountry === assetLocation.country;
    }
    async notifyAttestor(attestor, verification) {
        console.log(`Notifying attestor ${attestor.organizationName} about verification ${verification._id?.toString()}`);
    }
    async approveVerification(verificationId, attestorId, score) {
        const verification = await this.verificationModel.findById(verificationId);
        if (!verification) {
            throw new common_1.NotFoundException('Verification request not found');
        }
        verification.scoring = {
            automatedScore: score,
            attestorScore: 0,
            finalScore: score,
        };
        verification.status = verification_request_schema_1.VerificationStatus.VERIFIED;
        verification.completedAt = new Date();
        await verification.save();
        await this.assetModel.updateOne({ assetId: verification.assetId }, {
            verificationScore: score,
            status: 'VERIFIED'
        });
        await this.submitToBlockchain(verification);
    }
    async getVerificationStatus(assetId) {
        const verification = await this.verificationModel.findOne({ assetId }).sort({ createdAt: -1 });
        if (!verification) {
            throw new common_1.NotFoundException('Verification request not found');
        }
        return verification;
    }
    async getAllVerifications() {
        return this.verificationModel.find().sort({ createdAt: -1 });
    }
    async getVerificationById(id) {
        const verification = await this.verificationModel.findById(id).exec();
        if (!verification) {
            throw new Error('Verification request not found');
        }
        return verification;
    }
};
exports.VerificationService = VerificationService;
exports.VerificationService = VerificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(verification_request_schema_1.VerificationRequest.name)),
    __param(1, (0, mongoose_1.InjectModel)(asset_schema_1.Asset.name)),
    __param(2, (0, mongoose_1.InjectModel)(attestor_schema_1.Attestor.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        hedera_service_1.HederaService,
        chainlink_service_1.ChainlinkService,
        attestors_service_1.AttestorsService,
        external_apis_service_1.ExternalApisService,
        event_emitter_1.EventEmitter2,
        ipfs_service_1.IPFSService])
], VerificationService);
//# sourceMappingURL=verification.service.js.map