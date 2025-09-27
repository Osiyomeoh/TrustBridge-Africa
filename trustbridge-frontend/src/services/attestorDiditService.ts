/**
 * Enhanced Didit Service for Attestor Verification
 * Handles professional verification with enhanced KYC and license verification
 */

import diditService from './didit';

export interface AttestorVerificationData {
  walletAddress: string;
  email: string;
  name: string;
  specializations: string[];
  licenseNumber?: string;
  licenseType?: string;
  experience?: number;
  organization?: string;
}

export interface AttestorDiditSession {
  sessionId: string;
  verificationUrl: string;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  verificationType: 'attestor_enhanced';
  vendorData?: string;
}

export interface AttestorVerificationResult {
  sessionId: string;
  status: 'completed' | 'failed' | 'expired';
  verificationType: 'attestor_enhanced';
  vendorData?: string;
  verificationData?: {
    identityVerified: boolean;
    licenseVerified: boolean;
    backgroundCheck: boolean;
    professionalCredentials: boolean;
    kycLevel: 'basic' | 'enhanced' | 'professional';
  };
}

class AttestorDiditService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4001';
  }

  /**
   * Create enhanced Didit session for attestor verification
   */
  async createAttestorSession(verificationData: AttestorVerificationData): Promise<AttestorDiditSession> {
    try {
      // Create enhanced vendor data for attestors
      const vendorData = JSON.stringify({
        walletAddress: verificationData.walletAddress,
        email: verificationData.email,
        name: verificationData.name,
        verificationType: 'attestor_enhanced',
        specializations: verificationData.specializations,
        licenseNumber: verificationData.licenseNumber,
        licenseType: verificationData.licenseType,
        experience: verificationData.experience,
        organization: verificationData.organization,
      });

      // Use enhanced workflow for attestors
      const workflowId = import.meta.env.VITE_DIDIT_ATTESTOR_WORKFLOW_ID || 'attestor_enhanced';
      
      const response = await fetch(`${this.baseUrl}/api/auth/didit/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorData,
          workflowId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Backend API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to create attestor verification session');
      }

      return {
        sessionId: result.data.session_id,
        verificationUrl: result.data.url || result.data.verification_url,
        status: 'pending',
        verificationType: 'attestor_enhanced',
        vendorData,
      };
    } catch (error) {
      console.error('Attestor Didit session creation failed:', error);
      throw error;
    }
  }

  /**
   * Get attestor verification status
   */
  async getAttestorSessionStatus(sessionId: string): Promise<AttestorVerificationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/didit/session/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Backend API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to get attestor session status');
      }

      return {
        sessionId: result.data.session_id,
        status: result.data.status,
        verificationType: 'attestor_enhanced',
        vendorData: result.data.vendor_data,
        verificationData: result.data.verification_data,
      };
    } catch (error) {
      console.error('Attestor Didit session status check failed:', error);
      throw error;
    }
  }

  /**
   * Open attestor verification in popup
   */
  async openAttestorVerificationPopup(verificationData: AttestorVerificationData): Promise<AttestorVerificationResult> {
    const session = await this.createAttestorSession(verificationData);
    
    return new Promise((resolve, reject) => {
      const popup = window.open(
        session.verificationUrl,
        'didit-attestor-verification',
        'width=600,height=800,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        reject(new Error('Failed to open attestor verification popup'));
        return;
      }

      // Listen for popup messages
      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== 'https://verify.didit.me') {
          return;
        }

        if (event.data.type === 'DIDIT_VERIFICATION_COMPLETE') {
          window.removeEventListener('message', messageHandler);
          popup.close();
          resolve({
            sessionId: event.data.sessionId,
            status: event.data.status,
            verificationType: 'attestor_enhanced',
            vendorData: event.data.vendorData,
            verificationData: event.data.verificationData,
          });
        } else if (event.data.type === 'DIDIT_VERIFICATION_FAILED') {
          window.removeEventListener('message', messageHandler);
          popup.close();
          reject(new Error(event.data.error || 'Attestor verification failed'));
        }
      };

      window.addEventListener('message', messageHandler);

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          reject(new Error('Attestor verification cancelled by user'));
        }
      }, 1000);
    });
  }

  /**
   * Get available specializations for attestors
   */
  getAvailableSpecializations() {
    return [
      {
        id: 'real_estate',
        name: 'Real Estate',
        description: 'Residential, commercial, and industrial property verification',
        requiredLicense: 'Real Estate Appraiser License',
        icon: '🏠',
      },
      {
        id: 'art_collectibles',
        name: 'Art & Collectibles',
        description: 'Paintings, sculptures, antiques, and collectible items',
        requiredLicense: 'Art Appraiser Certification',
        icon: '🎨',
      },
      {
        id: 'vehicles',
        name: 'Vehicles',
        description: 'Cars, motorcycles, boats, aircraft, and heavy machinery',
        requiredLicense: 'Automotive Appraiser License',
        icon: '🚗',
      },
      {
        id: 'agriculture',
        name: 'Agriculture',
        description: 'Farmland, equipment, livestock, and agricultural products',
        requiredLicense: 'Agricultural Expert Certification',
        icon: '🚜',
      },
      {
        id: 'business_assets',
        name: 'Business Assets',
        description: 'Equipment, intellectual property, and business assets',
        requiredLicense: 'Business Appraiser License',
        icon: '🏢',
      },
      {
        id: 'legal',
        name: 'Legal Verification',
        description: 'Legal documents and compliance verification',
        requiredLicense: 'Attorney License',
        icon: '⚖️',
      },
    ];
  }

  /**
   * Validate attestor application data
   */
  validateAttestorData(data: AttestorVerificationData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.walletAddress) {
      errors.push('Wallet address is required');
    }

    if (!data.email) {
      errors.push('Email is required');
    }

    if (!data.name) {
      errors.push('Full name is required');
    }

    if (!data.specializations || data.specializations.length === 0) {
      errors.push('At least one specialization is required');
    }

    if (!data.licenseNumber) {
      errors.push('License number is required');
    }

    if (!data.licenseType) {
      errors.push('License type is required');
    }

    if (!data.experience || data.experience < 1) {
      errors.push('At least 1 year of experience is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Create singleton instance
const attestorDiditService = new AttestorDiditService();

export default attestorDiditService;
