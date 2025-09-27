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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AttestorsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttestorsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const attestor_schema_1 = require("../schemas/attestor.schema");
const hedera_service_1 = require("../hedera/hedera.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const axios_1 = __importDefault(require("axios"));
let AttestorsService = AttestorsService_1 = class AttestorsService {
    constructor(attestorModel, hederaService, eventEmitter) {
        this.attestorModel = attestorModel;
        this.hederaService = hederaService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(AttestorsService_1.name);
    }
    async registerExternalParty(partyData) {
        try {
            const credentialVerification = await this.verifyExternalCredentials(partyData);
            if (!credentialVerification.isValid) {
                throw new common_1.BadRequestException(`Credential verification failed: ${credentialVerification.reason}`);
            }
            const attestor = new this.attestorModel({
                address: `0x${Math.random().toString(16).substr(2, 40)}`,
                organizationName: partyData.organizationName,
                type: partyData.organizationType,
                organizationType: partyData.organizationType,
                country: partyData.country,
                region: partyData.region || '',
                specialties: partyData.specialties,
                credentials: {
                    licenseNumber: partyData.credentials.licenseNumber,
                    certifications: [],
                    yearsExperience: 0,
                    registrationProof: partyData.credentials.registrationNumber,
                },
                contactInfo: {
                    email: partyData.contactEmail,
                    phone: partyData.contactPhone,
                    address: '',
                },
                contactEmail: partyData.contactEmail,
                contactPhone: partyData.contactPhone,
                stakeAmount: partyData.stakeAmount,
                reputation: 50,
                isActive: false,
                totalAttestations: 0,
                successfulAttestations: 0,
                averageResponseTime: 0,
                lastActivity: new Date(),
            });
            const savedAttestor = await attestor.save();
            await this.registerOnBlockchain(savedAttestor, partyData.stakeAmount);
            this.eventEmitter.emit('attestor.registered', {
                attestorId: savedAttestor._id,
                organizationName: partyData.organizationName,
                organizationType: partyData.organizationType,
                country: partyData.country,
            });
            this.logger.log(`External party registered: ${partyData.organizationName} (${partyData.organizationType})`);
            return savedAttestor;
        }
        catch (error) {
            this.logger.error('Failed to register external party:', error);
            throw error;
        }
    }
    async verifyExternalCredentials(partyData) {
        try {
            switch (partyData.organizationType) {
                case attestor_schema_1.AttestorType.COOPERATIVE:
                    return await this.verifyCooperativeCredentials(partyData);
                case attestor_schema_1.AttestorType.GOVERNMENT_OFFICIAL:
                    return await this.verifyGovernmentCredentials(partyData);
                case attestor_schema_1.AttestorType.SURVEYOR:
                    return await this.verifySurveyorCredentials(partyData);
                case attestor_schema_1.AttestorType.EXTENSION_OFFICER:
                    return await this.verifyExtensionOfficerCredentials(partyData);
                case attestor_schema_1.AttestorType.APPRAISER:
                    return await this.verifyAppraiserCredentials(partyData);
                case attestor_schema_1.AttestorType.AUDITOR:
                    return await this.verifyAuditorCredentials(partyData);
                default:
                    return { isValid: false, reason: 'Unknown organization type' };
            }
        }
        catch (error) {
            this.logger.error('Credential verification failed:', error);
            return { isValid: false, reason: 'Verification service unavailable' };
        }
    }
    async verifyCooperativeCredentials(partyData) {
        try {
            const { organizationName, country, credentials } = partyData;
            const businessVerification = await this.verifyBusinessRegistration(organizationName, country);
            if (!businessVerification.exists) {
                return { isValid: false, reason: 'Organization not found in business registry' };
            }
            const isCooperative = await this.verifyCooperativeStatus(organizationName, country);
            if (!isCooperative) {
                return { isValid: false, reason: 'Not registered as a cooperative' };
            }
            if (credentials.website) {
                const websiteValid = await this.verifyWebsite(credentials.website);
                if (!websiteValid) {
                    return { isValid: false, reason: 'Invalid website' };
                }
            }
            return { isValid: true };
        }
        catch (error) {
            return { isValid: false, reason: 'Cooperative verification failed' };
        }
    }
    async verifyGovernmentCredentials(partyData) {
        try {
            const { organizationName, country, credentials } = partyData;
            const isGovernmentEntity = await this.verifyGovernmentEntity(organizationName, country);
            if (!isGovernmentEntity) {
                return { isValid: false, reason: 'Not a recognized government entity' };
            }
            if (credentials.licenseNumber) {
                const licenseValid = await this.verifyGovernmentLicense(credentials.licenseNumber, country);
                if (!licenseValid) {
                    return { isValid: false, reason: 'Invalid government license' };
                }
            }
            return { isValid: true };
        }
        catch (error) {
            return { isValid: false, reason: 'Government verification failed' };
        }
    }
    async verifySurveyorCredentials(partyData) {
        try {
            const { country, credentials } = partyData;
            if (!credentials.licenseNumber) {
                return { isValid: false, reason: 'Surveyor license number required' };
            }
            const licenseValid = await this.verifySurveyorLicense(credentials.licenseNumber, country);
            if (!licenseValid) {
                return { isValid: false, reason: 'Invalid surveyor license' };
            }
            return { isValid: true };
        }
        catch (error) {
            return { isValid: false, reason: 'Surveyor verification failed' };
        }
    }
    async verifyExtensionOfficerCredentials(partyData) {
        try {
            const { organizationName, country } = partyData;
            const isExtensionService = await this.verifyExtensionService(organizationName, country);
            if (!isExtensionService) {
                return { isValid: false, reason: 'Not a recognized extension service' };
            }
            return { isValid: true };
        }
        catch (error) {
            return { isValid: false, reason: 'Extension officer verification failed' };
        }
    }
    async verifyAppraiserCredentials(partyData) {
        try {
            const { country, credentials } = partyData;
            if (!credentials.licenseNumber) {
                return { isValid: false, reason: 'Appraiser license number required' };
            }
            const licenseValid = await this.verifyAppraiserLicense(credentials.licenseNumber, country);
            if (!licenseValid) {
                return { isValid: false, reason: 'Invalid appraiser license' };
            }
            return { isValid: true };
        }
        catch (error) {
            return { isValid: false, reason: 'Appraiser verification failed' };
        }
    }
    async verifyAuditorCredentials(partyData) {
        try {
            const { country, credentials } = partyData;
            if (!credentials.licenseNumber) {
                return { isValid: false, reason: 'Auditor license number required' };
            }
            const licenseValid = await this.verifyAuditorLicense(credentials.licenseNumber, country);
            if (!licenseValid) {
                return { isValid: false, reason: 'Invalid auditor license' };
            }
            return { isValid: true };
        }
        catch (error) {
            return { isValid: false, reason: 'Auditor verification failed' };
        }
    }
    async verifyBusinessRegistration(organizationName, country) {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const commonCooperativeNames = [
                'cooperative', 'co-op', 'union', 'association', 'society', 'group',
                'farmers', 'agricultural', 'development', 'programme', 'board'
            ];
            const nigeriaPatterns = [
                'state', 'federal', 'ministry', 'department', 'agency', 'authority',
                'institution', 'council', 'board', 'commission', 'corporation'
            ];
            const hasCooperativeIndicator = commonCooperativeNames.some(indicator => organizationName.toLowerCase().includes(indicator));
            const hasNigeriaPattern = nigeriaPatterns.some(pattern => organizationName.toLowerCase().includes(pattern));
            const exists = hasCooperativeIndicator || hasNigeriaPattern || Math.random() > 0.1;
            return { exists };
        }
        catch (error) {
            this.logger.error('Business registration verification failed:', error);
            return { exists: false };
        }
    }
    async verifyCooperativeStatus(organizationName, country) {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const isCooperative = organizationName.toLowerCase().includes('cooperative') ||
                organizationName.toLowerCase().includes('co-op');
            return isCooperative || Math.random() > 0.2;
        }
        catch (error) {
            return false;
        }
    }
    async verifyWebsite(website) {
        try {
            const response = await axios_1.default.head(website, { timeout: 5000 });
            return response.status === 200;
        }
        catch (error) {
            return false;
        }
    }
    async verifyGovernmentEntity(organizationName, country) {
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            const governmentKeywords = [
                'ministry', 'department', 'bureau', 'agency', 'authority', 'commission',
                'office', 'service', 'board', 'council', 'institute'
            ];
            const hasGovernmentIndicator = governmentKeywords.some(keyword => organizationName.toLowerCase().includes(keyword));
            return hasGovernmentIndicator || Math.random() > 0.1;
        }
        catch (error) {
            return false;
        }
    }
    async verifyGovernmentLicense(licenseNumber, country) {
        try {
            await new Promise(resolve => setTimeout(resolve, 600));
            const validPatterns = [
                /^[A-Z]{2,3}\d{6,8}$/,
                /^\d{4,6}[A-Z]{2,3}$/,
                /^[A-Z]{2}\d{4}[A-Z]{2}$/,
            ];
            return validPatterns.some(pattern => pattern.test(licenseNumber));
        }
        catch (error) {
            return false;
        }
    }
    async verifySurveyorLicense(licenseNumber, country) {
        try {
            await new Promise(resolve => setTimeout(resolve, 700));
            const surveyorPatterns = [
                /^SURV\d{6}$/,
                /^SURV-NG-\d{6}$/,
                /^[A-Z]{2}S\d{4}$/,
                /^LS\d{6}$/,
                /^NIS\d{6}$/,
            ];
            return surveyorPatterns.some(pattern => pattern.test(licenseNumber));
        }
        catch (error) {
            return false;
        }
    }
    async verifyExtensionService(organizationName, country) {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const extensionKeywords = [
                'extension', 'agricultural', 'farming', 'rural', 'development',
                'advisory', 'support', 'service'
            ];
            const hasExtensionIndicator = extensionKeywords.some(keyword => organizationName.toLowerCase().includes(keyword));
            return hasExtensionIndicator || Math.random() > 0.2;
        }
        catch (error) {
            return false;
        }
    }
    async verifyAppraiserLicense(licenseNumber, country) {
        try {
            await new Promise(resolve => setTimeout(resolve, 600));
            const appraiserPatterns = [
                /^APP\d{6}$/,
                /^APP-NG-\d{6}$/,
                /^[A-Z]{2}A\d{4}$/,
                /^PA\d{6}$/,
                /^NIESV\d{6}$/,
            ];
            return appraiserPatterns.some(pattern => pattern.test(licenseNumber));
        }
        catch (error) {
            return false;
        }
    }
    async verifyAuditorLicense(licenseNumber, country) {
        try {
            await new Promise(resolve => setTimeout(resolve, 600));
            const auditorPatterns = [
                /^AUD\d{6}$/,
                /^AUD-NG-\d{6}$/,
                /^[A-Z]{2}U\d{4}$/,
                /^CA\d{6}$/,
                /^ICAN\d{6}$/,
            ];
            return auditorPatterns.some(pattern => pattern.test(licenseNumber));
        }
        catch (error) {
            return false;
        }
    }
    async registerOnBlockchain(attestor, stakeAmount) {
        try {
            await this.hederaService.callContract('0.0.6759291', 'registerAttestor', [
                attestor.organizationName,
                attestor.organizationType,
                attestor.country,
                stakeAmount
            ]);
            this.logger.log(`Attestor registered on blockchain: ${attestor.organizationName}`);
        }
        catch (error) {
            this.logger.error('Failed to register attestor on blockchain:', error);
        }
    }
    async assignAttestors(assetId, requirements) {
        try {
            const attestors = await this.attestorModel.find({
                isActive: true,
                country: requirements.location.country,
                specialties: { $in: requirements.requiredSpecialties },
                reputation: { $gte: requirements.minReputation },
            });
            let filteredAttestors = attestors;
            if (requirements.location.coordinates && requirements.maxDistance) {
                filteredAttestors = attestors.filter(attestor => {
                    const distance = this.calculateDistance(requirements.location.coordinates, attestor.location?.coordinates || { lat: 0, lng: 0 });
                    return distance <= requirements.maxDistance;
                });
            }
            const sortedAttestors = filteredAttestors.sort((a, b) => {
                const scoreA = a.reputation + (a.isActive ? 10 : 0);
                const scoreB = b.reputation + (b.isActive ? 10 : 0);
                return scoreB - scoreA;
            });
            const assignedAttestors = sortedAttestors.slice(0, 3);
            for (const attestor of assignedAttestors) {
                await this.notifyAttestor(attestor, assetId, requirements);
            }
            this.logger.log(`Assigned ${assignedAttestors.length} attestors for asset ${assetId}`);
            return assignedAttestors;
        }
        catch (error) {
            this.logger.error('Failed to assign attestors:', error);
            throw error;
        }
    }
    async submitAttestation(attestorId, attestationData) {
        try {
            const attestor = await this.attestorModel.findById(attestorId);
            if (!attestor) {
                throw new common_1.NotFoundException('Attestor not found');
            }
            attestor.totalAttestations += 1;
            if (attestationData.recommendation === 'VERIFIED') {
                attestor.successfulAttestations += 1;
            }
            const successRate = attestor.successfulAttestations / attestor.totalAttestations;
            attestor.reputation = Math.round(successRate * 100);
            attestor.lastActivity = new Date();
            await attestor.save();
            await this.submitAttestationToBlockchain(attestor, attestationData);
            this.eventEmitter.emit('attestation.submitted', {
                attestorId,
                assetId: attestationData.assetId,
                recommendation: attestationData.recommendation,
                confidence: attestationData.confidence,
            });
            this.logger.log(`Attestation submitted by ${attestor.organizationName} for asset ${attestationData.assetId}`);
        }
        catch (error) {
            this.logger.error('Failed to submit attestation:', error);
            throw error;
        }
    }
    async updateReputation(attestorId, performance) {
        try {
            const attestor = await this.attestorModel.findById(attestorId);
            if (!attestor) {
                throw new common_1.NotFoundException('Attestor not found');
            }
            const performanceScore = (performance.accuracy + performance.completeness) / 2;
            const responseScore = Math.max(0, 100 - performance.responseTime);
            const newReputation = Math.round((performanceScore + responseScore) / 2);
            attestor.reputation = Math.min(100, Math.max(0, newReputation));
            attestor.averageResponseTime = performance.responseTime;
            await attestor.save();
            await this.updateReputationOnBlockchain(attestorId, newReputation);
            this.logger.log(`Updated reputation for ${attestor.organizationName}: ${newReputation}%`);
        }
        catch (error) {
            this.logger.error('Failed to update reputation:', error);
            throw error;
        }
    }
    calculateDistance(coord1, coord2) {
        const R = 6371;
        const dLat = this.deg2rad(coord2.lat - coord1.lat);
        const dLon = this.deg2rad(coord2.lng - coord1.lng);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(coord1.lat)) * Math.cos(this.deg2rad(coord2.lat)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
    async notifyAttestor(attestor, assetId, requirements) {
        this.eventEmitter.emit('attestor.notification', {
            attestorId: attestor._id?.toString() || '',
            assetId,
            requirements,
            contactEmail: attestor.contactEmail,
            contactPhone: attestor.contactPhone,
        });
    }
    async submitAttestationToBlockchain(attestor, attestationData) {
        try {
            await this.hederaService.callContract('0.0.6759292', 'submitAttestation', [
                attestationData.assetId,
                attestationData.confidence,
                JSON.stringify(attestationData.evidence),
                attestationData.recommendation
            ]);
        }
        catch (error) {
            this.logger.error('Failed to submit attestation to blockchain:', error);
        }
    }
    async updateReputationOnBlockchain(attestorId, reputation) {
        try {
            await this.hederaService.callContract('0.0.6759291', 'updateReputation', [attestorId, reputation]);
        }
        catch (error) {
            this.logger.error('Failed to update reputation on blockchain:', error);
        }
    }
    async getAllAttestors() {
        return this.attestorModel.find().sort({ reputation: -1 });
    }
    async getAttestor(attestorId) {
        const attestor = await this.attestorModel.findById(attestorId);
        if (!attestor) {
            throw new common_1.NotFoundException('Attestor not found');
        }
        return attestor;
    }
    async getAttestorsByLocation(country, region) {
        const query = { country, isActive: true };
        if (region) {
            query.region = region;
        }
        return this.attestorModel.find(query).sort({ reputation: -1 });
    }
    async getAttestorsBySpecialty(specialty) {
        return this.attestorModel.find({
            specialties: specialty,
            isActive: true
        }).sort({ reputation: -1 });
    }
    async approveAttestor(attestorId) {
        const attestor = await this.attestorModel.findById(attestorId);
        if (!attestor) {
            throw new common_1.NotFoundException('Attestor not found');
        }
        attestor.isActive = true;
        await attestor.save();
        this.eventEmitter.emit('attestor.approved', {
            attestorId,
            organizationName: attestor.organizationName,
        });
    }
    async rejectAttestor(attestorId, reason) {
        const attestor = await this.attestorModel.findById(attestorId);
        if (!attestor) {
            throw new common_1.NotFoundException('Attestor not found');
        }
        attestor.isActive = false;
        attestor.rejectionReason = reason;
        await attestor.save();
        this.eventEmitter.emit('attestor.rejected', {
            attestorId,
            organizationName: attestor.organizationName,
            reason,
        });
    }
    async processManualAttestorApplication(applicationData) {
        try {
            this.logger.log('Processing manual attestor application:', applicationData);
            const { walletAddress, email, name, specializations, licenseNumber, licenseType, experience, organization, selectedTier, tierRequirements, uploadedDocuments, references, portfolio, verificationType, status } = applicationData;
            if (!walletAddress || !email || !name || !specializations || !selectedTier) {
                throw new common_1.BadRequestException('Missing required fields for attestor application');
            }
            const existingAttestor = await this.attestorModel.findOne({ address: walletAddress });
            if (existingAttestor) {
                throw new common_1.BadRequestException('Attestor with this wallet address already exists');
            }
            const attestor = new this.attestorModel({
                address: walletAddress,
                organizationName: organization || name,
                type: 'APPRAISER',
                organizationType: 'APPRAISER',
                country: 'US',
                region: 'Global',
                specialties: specializations,
                credentials: {
                    licenseNumber,
                    certifications: [licenseType],
                    yearsExperience: experience || 1,
                    registrationProof: 'manual_verification_pending',
                },
                contactInfo: {
                    email,
                    name,
                    organization: organization || name,
                },
                verificationStatus: 'PENDING',
                tier: selectedTier,
                tierRequirements: tierRequirements,
                uploadedDocuments: uploadedDocuments || [],
                references: references || [],
                portfolio: portfolio || [],
                verificationType: verificationType || 'manual_verification',
                status: status || 'pending_review',
                submittedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            });
            await attestor.save();
            this.logger.log(`Manual attestor application created: ${attestor._id}`);
            return {
                success: true,
                data: {
                    id: attestor._id,
                    walletAddress: attestor.address,
                    email: attestor.contactInfo.email,
                    name: attestor.organizationName,
                    tier: attestor.type,
                    status: attestor.isActive ? 'active' : 'inactive',
                    submittedAt: attestor.createdAt || new Date()
                },
                message: 'Attestor application submitted for manual review'
            };
        }
        catch (error) {
            this.logger.error('Failed to process manual attestor application:', error);
            throw error;
        }
    }
    async getAllAttestorApplications() {
        try {
            const applications = await this.attestorModel.find({
                verificationType: 'manual_verification'
            }).sort({ submittedAt: -1 });
            return applications.map(app => ({
                id: app._id,
                walletAddress: app.address,
                email: app.contactInfo.email,
                name: app.organizationName,
                specializations: app.specialties,
                licenseNumber: app.credentials.licenseNumber,
                licenseType: app.credentials.certifications[0],
                experience: app.credentials.yearsExperience,
                organization: app.organizationName,
                selectedTier: app.type,
                tierRequirements: app.credentials,
                uploadedDocuments: [],
                references: [],
                portfolio: [],
                status: app.isActive ? 'active' : 'inactive',
                submittedAt: app.createdAt || new Date(),
                reviewedAt: app.lastActivity,
                reviewerNotes: app.rejectionReason
            }));
        }
        catch (error) {
            this.logger.error('Failed to get attestor applications:', error);
            throw error;
        }
    }
    async approveAttestorApplication(applicationId, reviewerNotes) {
        try {
            const application = await this.attestorModel.findById(applicationId);
            if (!application) {
                throw new common_1.BadRequestException('Application not found');
            }
            application.isActive = true;
            application.lastActivity = new Date();
            await application.save();
            this.logger.log(`Attestor application approved: ${applicationId}`);
            return {
                id: application._id,
                status: application.isActive ? 'active' : 'inactive',
                reviewedAt: application.lastActivity,
                reviewerNotes: reviewerNotes
            };
        }
        catch (error) {
            this.logger.error('Failed to approve attestor application:', error);
            throw error;
        }
    }
    async rejectAttestorApplication(applicationId, reviewerNotes) {
        try {
            const application = await this.attestorModel.findById(applicationId);
            if (!application) {
                throw new common_1.BadRequestException('Application not found');
            }
            application.isActive = false;
            application.rejectionReason = reviewerNotes;
            application.lastActivity = new Date();
            await application.save();
            this.logger.log(`Attestor application rejected: ${applicationId}`);
            return {
                id: application._id,
                status: application.isActive ? 'active' : 'inactive',
                reviewedAt: application.lastActivity,
                reviewerNotes: application.rejectionReason
            };
        }
        catch (error) {
            this.logger.error('Failed to reject attestor application:', error);
            throw error;
        }
    }
    async processAttestorApplication(applicationData) {
        try {
            this.logger.log('Processing attestor application:', applicationData);
            const { walletAddress, email, name, specializations, licenseNumber, licenseType, experience, organization, onfidoSessionId, onfidoVerificationData, verificationTier, requirements } = applicationData;
            if (!walletAddress || !email || !name || !specializations || !licenseNumber) {
                throw new common_1.BadRequestException('Missing required fields for attestor application');
            }
            const existingAttestor = await this.attestorModel.findOne({ address: walletAddress });
            if (existingAttestor) {
                throw new common_1.BadRequestException('Attestor with this wallet address already exists');
            }
            const attestor = new this.attestorModel({
                address: walletAddress,
                organizationName: organization || name,
                type: 'APPRAISER',
                organizationType: 'APPRAISER',
                country: 'US',
                region: 'Global',
                specialties: specializations,
                credentials: {
                    licenseNumber,
                    certifications: [licenseType],
                    yearsExperience: experience || 1,
                    registrationProof: onfidoSessionId,
                },
                contactInfo: {
                    email,
                    phone: '',
                    address: '',
                },
                contactEmail: email,
                contactPhone: '',
                stakeAmount: requirements?.trustTokenStake || 10000,
                reputation: 50,
                isActive: false,
                totalAttestations: 0,
                successfulAttestations: 0,
                averageResponseTime: 0,
                lastActivity: new Date(),
                verificationTier: verificationTier || 'tier1_enhanced_kyc',
                verificationStatus: {
                    basicKycCompleted: requirements?.kycCompleted || false,
                    enhancedKycCompleted: requirements?.enhancedKycCompleted || false,
                    professionalDocsVerified: requirements?.professionalDocsVerified || false,
                    tier2ProfessionalReview: false,
                    tier3InterviewCompleted: false,
                    onfidoVerification: {
                        sessionId: onfidoSessionId,
                        verificationData: onfidoVerificationData,
                        verifiedAt: new Date(),
                    }
                }
            });
            const savedAttestor = await attestor.save();
            this.eventEmitter.emit('attestor.application.submitted', {
                attestorId: savedAttestor._id,
                walletAddress,
                name,
                email,
                specializations,
                verificationTier,
                onfidoSessionId,
            });
            this.logger.log(`Attestor application submitted: ${savedAttestor._id} - Tier: ${verificationTier}`);
            return {
                attestorId: savedAttestor._id,
                status: 'TIER1_COMPLETED',
                verificationTier: 'tier1_enhanced_kyc',
                message: 'Tier 1 (Enhanced KYC) completed successfully. Awaiting Tier 2 (Professional Review).',
                nextSteps: [
                    'Complete 10,000 TRUST token staking + $100 registration fee',
                    'Wait for Tier 2 professional review (manual verification)',
                    'Prepare for Tier 3 interview process',
                    'Start receiving verification requests after full approval'
                ],
                requirements: {
                    trustTokenStake: 10000,
                    registrationFee: 100,
                    tier2ProfessionalReview: true,
                    tier3Interview: true
                }
            };
        }
        catch (error) {
            this.logger.error('Failed to process attestor application:', error);
            throw error;
        }
    }
};
exports.AttestorsService = AttestorsService;
exports.AttestorsService = AttestorsService = AttestorsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(attestor_schema_1.Attestor.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        hedera_service_1.HederaService,
        event_emitter_1.EventEmitter2])
], AttestorsService);
//# sourceMappingURL=attestors.service.js.map