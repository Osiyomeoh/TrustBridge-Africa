import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attestor, AttestorDocument, AttestorType } from '../schemas/attestor.schema';
import { HederaService } from '../hedera/hedera.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import axios from 'axios';

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
    coordinates?: { lat: number; lng: number };
  };
  requiredSpecialties: string[];
  minReputation: number;
  maxDistance?: number; // in kilometers
}

export interface AttestationData {
  assetId: string;
  confidence: number; // 0-100
  evidence: {
    visitDate: Date;
    observations: string[];
    photos: string[];
    documents: string[];
    gpsCoordinates: { lat: number; lng: number };
  };
  recommendation: 'VERIFIED' | 'REJECTED' | 'NEEDS_MORE_INFO';
  comments: string;
}

export interface PerformanceData {
  accuracy: number; // 0-100
  responseTime: number; // in hours
  completeness: number; // 0-100
  feedback: string;
}

@Injectable()
export class AttestorsService {
  private readonly logger = new Logger(AttestorsService.name);

  constructor(
    @InjectModel(Attestor.name) private attestorModel: Model<AttestorDocument>,
    private hederaService: HederaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async registerExternalParty(partyData: ExternalPartyData): Promise<Attestor> {
    try {
      // Verify credentials with external systems
      const credentialVerification = await this.verifyExternalCredentials(partyData);
      
      if (!credentialVerification.isValid) {
        throw new BadRequestException(`Credential verification failed: ${credentialVerification.reason}`);
      }

      // Create attestor record
      const attestor = new this.attestorModel({
        address: `0x${Math.random().toString(16).substr(2, 40)}`, // Mock wallet address
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
        reputation: 50, // Initial reputation
        isActive: false, // Pending admin approval
        totalAttestations: 0,
        successfulAttestations: 0,
        averageResponseTime: 0,
        lastActivity: new Date(),
      });

      const savedAttestor = await attestor.save();

      // Register on blockchain
      await this.registerOnBlockchain(savedAttestor, partyData.stakeAmount);

      // Emit event for admin notification
      this.eventEmitter.emit('attestor.registered', {
        attestorId: savedAttestor._id,
        organizationName: partyData.organizationName,
        organizationType: partyData.organizationType,
        country: partyData.country,
      });

      this.logger.log(`External party registered: ${partyData.organizationName} (${partyData.organizationType})`);
      return savedAttestor;
    } catch (error) {
      this.logger.error('Failed to register external party:', error);
      throw error;
    }
  }

  async verifyExternalCredentials(partyData: ExternalPartyData): Promise<{ isValid: boolean; reason?: string }> {
    try {
      switch (partyData.organizationType) {
        case AttestorType.COOPERATIVE:
          return await this.verifyCooperativeCredentials(partyData);
        case AttestorType.GOVERNMENT_OFFICIAL:
          return await this.verifyGovernmentCredentials(partyData);
        case AttestorType.SURVEYOR:
          return await this.verifySurveyorCredentials(partyData);
        case AttestorType.EXTENSION_OFFICER:
          return await this.verifyExtensionOfficerCredentials(partyData);
        case AttestorType.APPRAISER:
          return await this.verifyAppraiserCredentials(partyData);
        case AttestorType.AUDITOR:
          return await this.verifyAuditorCredentials(partyData);
        default:
          return { isValid: false, reason: 'Unknown organization type' };
      }
    } catch (error) {
      this.logger.error('Credential verification failed:', error);
      return { isValid: false, reason: 'Verification service unavailable' };
    }
  }

  // Free API implementations for credential verification
  private async verifyCooperativeCredentials(partyData: ExternalPartyData): Promise<{ isValid: boolean; reason?: string }> {
    try {
      const { organizationName, country, credentials } = partyData;
      
      // Check if organization exists using free business registry APIs
      const businessVerification = await this.verifyBusinessRegistration(organizationName, country);
      
      if (!businessVerification.exists) {
        return { isValid: false, reason: 'Organization not found in business registry' };
      }

      // Verify cooperative status (simulated)
      const isCooperative = await this.verifyCooperativeStatus(organizationName, country);
      if (!isCooperative) {
        return { isValid: false, reason: 'Not registered as a cooperative' };
      }

      // Check website if provided
      if (credentials.website) {
        const websiteValid = await this.verifyWebsite(credentials.website);
        if (!websiteValid) {
          return { isValid: false, reason: 'Invalid website' };
        }
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, reason: 'Cooperative verification failed' };
    }
  }

  private async verifyGovernmentCredentials(partyData: ExternalPartyData): Promise<{ isValid: boolean; reason?: string }> {
    try {
      const { organizationName, country, credentials } = partyData;
      
      // Check if it's a recognized government entity
      const isGovernmentEntity = await this.verifyGovernmentEntity(organizationName, country);
      if (!isGovernmentEntity) {
        return { isValid: false, reason: 'Not a recognized government entity' };
      }

      // Verify license number if provided
      if (credentials.licenseNumber) {
        const licenseValid = await this.verifyGovernmentLicense(credentials.licenseNumber, country);
        if (!licenseValid) {
          return { isValid: false, reason: 'Invalid government license' };
        }
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, reason: 'Government verification failed' };
    }
  }

  private async verifySurveyorCredentials(partyData: ExternalPartyData): Promise<{ isValid: boolean; reason?: string }> {
    try {
      const { country, credentials } = partyData;
      
      if (!credentials.licenseNumber) {
        return { isValid: false, reason: 'Surveyor license number required' };
      }

      // Verify surveyor license (simulated)
      const licenseValid = await this.verifySurveyorLicense(credentials.licenseNumber, country);
      if (!licenseValid) {
        return { isValid: false, reason: 'Invalid surveyor license' };
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, reason: 'Surveyor verification failed' };
    }
  }

  private async verifyExtensionOfficerCredentials(partyData: ExternalPartyData): Promise<{ isValid: boolean; reason?: string }> {
    try {
      const { organizationName, country } = partyData;
      
      // Check if it's a recognized agricultural extension service
      const isExtensionService = await this.verifyExtensionService(organizationName, country);
      if (!isExtensionService) {
        return { isValid: false, reason: 'Not a recognized extension service' };
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, reason: 'Extension officer verification failed' };
    }
  }

  private async verifyAppraiserCredentials(partyData: ExternalPartyData): Promise<{ isValid: boolean; reason?: string }> {
    try {
      const { country, credentials } = partyData;
      
      if (!credentials.licenseNumber) {
        return { isValid: false, reason: 'Appraiser license number required' };
      }

      // Verify appraiser license (simulated)
      const licenseValid = await this.verifyAppraiserLicense(credentials.licenseNumber, country);
      if (!licenseValid) {
        return { isValid: false, reason: 'Invalid appraiser license' };
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, reason: 'Appraiser verification failed' };
    }
  }

  private async verifyAuditorCredentials(partyData: ExternalPartyData): Promise<{ isValid: boolean; reason?: string }> {
    try {
      const { country, credentials } = partyData;
      
      if (!credentials.licenseNumber) {
        return { isValid: false, reason: 'Auditor license number required' };
      }

      // Verify auditor license (simulated)
      const licenseValid = await this.verifyAuditorLicense(credentials.licenseNumber, country);
      if (!licenseValid) {
        return { isValid: false, reason: 'Invalid auditor license' };
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, reason: 'Auditor verification failed' };
    }
  }

  // Free API implementations for credential verification
  private async verifyBusinessRegistration(organizationName: string, country: string): Promise<{ exists: boolean }> {
    try {
      // Simulate API call delay for realism
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Realistic simulation based on common patterns - Nigeria focused
      const commonCooperativeNames = [
        'cooperative', 'co-op', 'union', 'association', 'society', 'group',
        'farmers', 'agricultural', 'development', 'programme', 'board'
      ];
      
      // Nigeria-specific organization patterns
      const nigeriaPatterns = [
        'state', 'federal', 'ministry', 'department', 'agency', 'authority',
        'institution', 'council', 'board', 'commission', 'corporation'
      ];
      
      const hasCooperativeIndicator = commonCooperativeNames.some(indicator => 
        organizationName.toLowerCase().includes(indicator)
      );
      
      const hasNigeriaPattern = nigeriaPatterns.some(pattern => 
        organizationName.toLowerCase().includes(pattern)
      );
      
      // Higher success rate for Nigeria-specific patterns
      const exists = hasCooperativeIndicator || hasNigeriaPattern || Math.random() > 0.1;
      
      return { exists };
    } catch (error) {
      this.logger.error('Business registration verification failed:', error);
      return { exists: false };
    }
  }

  private async verifyCooperativeStatus(organizationName: string, country: string): Promise<boolean> {
    try {
      // Simulate cooperative status verification
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Realistic simulation - 80% of organizations with "cooperative" in name are valid
      const isCooperative = organizationName.toLowerCase().includes('cooperative') || 
                           organizationName.toLowerCase().includes('co-op');
      
      return isCooperative || Math.random() > 0.2;
    } catch (error) {
      return false;
    }
  }

  private async verifyWebsite(website: string): Promise<boolean> {
    try {
      // Use free website verification
      const response = await axios.head(website, { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  private async verifyGovernmentEntity(organizationName: string, country: string): Promise<boolean> {
    try {
      // Simulate government entity verification
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const governmentKeywords = [
        'ministry', 'department', 'bureau', 'agency', 'authority', 'commission',
        'office', 'service', 'board', 'council', 'institute'
      ];
      
      const hasGovernmentIndicator = governmentKeywords.some(keyword => 
        organizationName.toLowerCase().includes(keyword)
      );
      
      return hasGovernmentIndicator || Math.random() > 0.1;
    } catch (error) {
      return false;
    }
  }

  private async verifyGovernmentLicense(licenseNumber: string, country: string): Promise<boolean> {
    try {
      // Simulate government license verification
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Realistic license number patterns
      const validPatterns = [
        /^[A-Z]{2,3}\d{6,8}$/, // Format: ABC123456
        /^\d{4,6}[A-Z]{2,3}$/, // Format: 123456ABC
        /^[A-Z]{2}\d{4}[A-Z]{2}$/, // Format: AB1234CD
      ];
      
      return validPatterns.some(pattern => pattern.test(licenseNumber));
    } catch (error) {
      return false;
    }
  }

  private async verifySurveyorLicense(licenseNumber: string, country: string): Promise<boolean> {
    try {
      // Simulate surveyor license verification
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Surveyor license patterns - Nigeria focused
      const surveyorPatterns = [
        /^SURV\d{6}$/, // Format: SURV123456
        /^SURV-NG-\d{6}$/, // Format: SURV-NG-123456 (Nigeria specific)
        /^[A-Z]{2}S\d{4}$/, // Format: NGS1234 (Nigeria)
        /^LS\d{6}$/, // Format: LS123456
        /^NIS\d{6}$/, // Format: NIS123456 (Nigerian Institution of Surveyors)
      ];
      
      return surveyorPatterns.some(pattern => pattern.test(licenseNumber));
    } catch (error) {
      return false;
    }
  }

  private async verifyExtensionService(organizationName: string, country: string): Promise<boolean> {
    try {
      // Simulate extension service verification
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const extensionKeywords = [
        'extension', 'agricultural', 'farming', 'rural', 'development',
        'advisory', 'support', 'service'
      ];
      
      const hasExtensionIndicator = extensionKeywords.some(keyword => 
        organizationName.toLowerCase().includes(keyword)
      );
      
      return hasExtensionIndicator || Math.random() > 0.2;
    } catch (error) {
      return false;
    }
  }

  private async verifyAppraiserLicense(licenseNumber: string, country: string): Promise<boolean> {
    try {
      // Simulate appraiser license verification
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const appraiserPatterns = [
        /^APP\d{6}$/, // Format: APP123456
        /^APP-NG-\d{6}$/, // Format: APP-NG-123456 (Nigeria specific)
        /^[A-Z]{2}A\d{4}$/, // Format: NGA1234 (Nigeria)
        /^PA\d{6}$/, // Format: PA123456
        /^NIESV\d{6}$/, // Format: NIESV123456 (Nigerian Institution of Estate Surveyors and Valuers)
      ];
      
      return appraiserPatterns.some(pattern => pattern.test(licenseNumber));
    } catch (error) {
      return false;
    }
  }

  private async verifyAuditorLicense(licenseNumber: string, country: string): Promise<boolean> {
    try {
      // Simulate auditor license verification
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const auditorPatterns = [
        /^AUD\d{6}$/, // Format: AUD123456
        /^AUD-NG-\d{6}$/, // Format: AUD-NG-123456 (Nigeria specific)
        /^[A-Z]{2}U\d{4}$/, // Format: NGU1234 (Nigeria)
        /^CA\d{6}$/, // Format: CA123456
        /^ICAN\d{6}$/, // Format: ICAN123456 (Institute of Chartered Accountants of Nigeria)
      ];
      
      return auditorPatterns.some(pattern => pattern.test(licenseNumber));
    } catch (error) {
      return false;
    }
  }

  private async registerOnBlockchain(attestor: Attestor, stakeAmount: number): Promise<void> {
    try {
      // Register attestor on Hedera blockchain
      await this.hederaService.callContract(
        '0.0.6759291', // AttestorManager contract (Hedera format)
        'registerAttestor',
        [
          attestor.organizationName,
          attestor.organizationType,
          attestor.country,
          stakeAmount
        ]
      );
      
      this.logger.log(`Attestor registered on blockchain: ${attestor.organizationName}`);
    } catch (error) {
      this.logger.error('Failed to register attestor on blockchain:', error);
      // Don't throw error - allow offline registration
    }
  }

  async assignAttestors(assetId: string, requirements: AttestorRequirements): Promise<Attestor[]> {
    try {
      const attestors = await this.attestorModel.find({
        isActive: true,
        country: requirements.location.country,
        specialties: { $in: requirements.requiredSpecialties },
        reputation: { $gte: requirements.minReputation },
      });

      // Filter by location if coordinates provided
      let filteredAttestors = attestors;
      if (requirements.location.coordinates && requirements.maxDistance) {
        filteredAttestors = attestors.filter(attestor => {
          const distance = this.calculateDistance(
            requirements.location.coordinates!,
            attestor.location?.coordinates || { lat: 0, lng: 0 }
          );
          return distance <= requirements.maxDistance!;
        });
      }

      // Sort by reputation and availability
      const sortedAttestors = filteredAttestors.sort((a, b) => {
        const scoreA = a.reputation + (a.isActive ? 10 : 0);
        const scoreB = b.reputation + (b.isActive ? 10 : 0);
        return scoreB - scoreA;
      });

      // Return top 3 matches
      const assignedAttestors = sortedAttestors.slice(0, 3);

      // Notify assigned attestors
      for (const attestor of assignedAttestors) {
        await this.notifyAttestor(attestor, assetId, requirements);
      }

      this.logger.log(`Assigned ${assignedAttestors.length} attestors for asset ${assetId}`);
      return assignedAttestors;
    } catch (error) {
      this.logger.error('Failed to assign attestors:', error);
      throw error;
    }
  }

  async submitAttestation(attestorId: string, attestationData: AttestationData): Promise<void> {
    try {
      const attestor = await this.attestorModel.findById(attestorId);
      if (!attestor) {
        throw new NotFoundException('Attestor not found');
      }

      // Update attestor statistics
      attestor.totalAttestations += 1;
      if (attestationData.recommendation === 'VERIFIED') {
        attestor.successfulAttestations += 1;
      }

      // Calculate new reputation
      const successRate = attestor.successfulAttestations / attestor.totalAttestations;
      attestor.reputation = Math.round(successRate * 100);
      attestor.lastActivity = new Date();

      await attestor.save();

      // Submit to blockchain
      await this.submitAttestationToBlockchain(attestor, attestationData);

      // Emit event
      this.eventEmitter.emit('attestation.submitted', {
        attestorId,
        assetId: attestationData.assetId,
        recommendation: attestationData.recommendation,
        confidence: attestationData.confidence,
      });

      this.logger.log(`Attestation submitted by ${attestor.organizationName} for asset ${attestationData.assetId}`);
    } catch (error) {
      this.logger.error('Failed to submit attestation:', error);
      throw error;
    }
  }

  async updateReputation(attestorId: string, performance: PerformanceData): Promise<void> {
    try {
      const attestor = await this.attestorModel.findById(attestorId);
      if (!attestor) {
        throw new NotFoundException('Attestor not found');
      }

      // Calculate new reputation based on performance
      const performanceScore = (performance.accuracy + performance.completeness) / 2;
      const responseScore = Math.max(0, 100 - performance.responseTime);
      const newReputation = Math.round((performanceScore + responseScore) / 2);

      attestor.reputation = Math.min(100, Math.max(0, newReputation));
      attestor.averageResponseTime = performance.responseTime;
      await attestor.save();

      // Update on blockchain
      await this.updateReputationOnBlockchain(attestorId, newReputation);

      this.logger.log(`Updated reputation for ${attestor.organizationName}: ${newReputation}%`);
    } catch (error) {
      this.logger.error('Failed to update reputation:', error);
      throw error;
    }
  }

  // Helper methods
  private calculateDistance(coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(coord2.lat - coord1.lat);
    const dLon = this.deg2rad(coord2.lng - coord1.lng);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(coord1.lat)) * Math.cos(this.deg2rad(coord2.lat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  private async notifyAttestor(attestor: Attestor, assetId: string, requirements: AttestorRequirements): Promise<void> {
    // Send notification to attestor (email, SMS, or in-app)
    this.eventEmitter.emit('attestor.notification', {
      attestorId: (attestor as any)._id?.toString() || '',
      assetId,
      requirements,
      contactEmail: attestor.contactEmail,
      contactPhone: attestor.contactPhone,
    });
  }

  private async submitAttestationToBlockchain(attestor: Attestor, attestationData: AttestationData): Promise<void> {
    try {
      await this.hederaService.callContract(
        '0.0.6759292', // VerificationRegistry contract (Hedera format)
        'submitAttestation',
        [
          attestationData.assetId,
          attestationData.confidence,
          JSON.stringify(attestationData.evidence),
          attestationData.recommendation
        ]
      );
    } catch (error) {
      this.logger.error('Failed to submit attestation to blockchain:', error);
    }
  }

  private async updateReputationOnBlockchain(attestorId: string, reputation: number): Promise<void> {
    try {
      await this.hederaService.callContract(
        '0.0.6759291', // AttestorManager contract (Hedera format)
        'updateReputation',
        [attestorId, reputation]
      );
    } catch (error) {
      this.logger.error('Failed to update reputation on blockchain:', error);
    }
  }

  // Public methods for external access
  async getAllAttestors(): Promise<Attestor[]> {
    return this.attestorModel.find().sort({ reputation: -1 });
  }

  async getAttestor(attestorId: string): Promise<Attestor> {
    const attestor = await this.attestorModel.findById(attestorId);
    if (!attestor) {
      throw new NotFoundException('Attestor not found');
    }
    return attestor;
  }

  async getAttestorsByLocation(country: string, region?: string): Promise<Attestor[]> {
    const query: any = { country, isActive: true };
    if (region) {
      query.region = region;
    }
    return this.attestorModel.find(query).sort({ reputation: -1 });
  }

  async getAttestorsBySpecialty(specialty: string): Promise<Attestor[]> {
    return this.attestorModel.find({
      specialties: specialty,
      isActive: true
    }).sort({ reputation: -1 });
  }

  async approveAttestor(attestorId: string): Promise<void> {
    const attestor = await this.attestorModel.findById(attestorId);
    if (!attestor) {
      throw new NotFoundException('Attestor not found');
    }

    attestor.isActive = true;
    await attestor.save();

    this.eventEmitter.emit('attestor.approved', {
      attestorId,
      organizationName: attestor.organizationName,
    });
  }

  async rejectAttestor(attestorId: string, reason: string): Promise<void> {
    const attestor = await this.attestorModel.findById(attestorId);
    if (!attestor) {
      throw new NotFoundException('Attestor not found');
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
}
