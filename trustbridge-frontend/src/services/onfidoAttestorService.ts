/**
 * Onfido Attestor Verification Service
 * Simple and easy professional verification for attestors
 */

export interface OnfidoAttestorData {
  walletAddress: string;
  email: string;
  name: string;
  specializations: string[];
  licenseNumber?: string;
  licenseType?: string;
  experience?: number;
  organization?: string;
}

export interface OnfidoSession {
  sessionId: string;
  verificationUrl: string;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  verificationType: 'attestor_professional';
}

export interface OnfidoVerificationResult {
  sessionId: string;
  status: 'completed' | 'failed' | 'expired';
  verificationType: 'attestor_professional';
  verificationData?: {
    identityVerified: boolean;
    documentVerified: boolean;
    professionalVerified: boolean;
    kycLevel: 'professional';
  };
}

class OnfidoAttestorService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4001';
  }

  /**
   * Create Onfido session for attestor verification
   */
  async createAttestorSession(verificationData: OnfidoAttestorData): Promise<OnfidoSession> {
    try {
      // Create vendor data for attestors
      const vendorData = JSON.stringify({
        walletAddress: verificationData.walletAddress,
        email: verificationData.email,
        name: verificationData.name,
        verificationType: 'attestor_professional',
        specializations: verificationData.specializations,
        licenseNumber: verificationData.licenseNumber,
        licenseType: verificationData.licenseType,
        experience: verificationData.experience,
        organization: verificationData.organization,
      });

      const response = await fetch(`${this.baseUrl}/api/auth/onfido/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorData,
          verificationType: 'attestor_professional',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Backend API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to create Onfido attestor session');
      }

      return {
        sessionId: result.data.session_id,
        verificationUrl: result.data.url || result.data.verification_url,
        status: 'pending',
        verificationType: 'attestor_professional',
      };
    } catch (error) {
      console.error('Onfido attestor session creation failed:', error);
      throw error;
    }
  }

  /**
   * Get verification status
   */
  async getVerificationStatus(sessionId: string): Promise<OnfidoVerificationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/onfido/session/${sessionId}`, {
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
        throw new Error(result.message || 'Failed to get verification status');
      }

      return {
        sessionId: result.data.session_id,
        status: result.data.status,
        verificationType: 'attestor_professional',
        verificationData: result.data.verification_data,
      };
    } catch (error) {
      console.error('Onfido verification status check failed:', error);
      throw error;
    }
  }

  /**
   * Open verification in popup
   */
  async openVerificationPopup(verificationData: OnfidoAttestorData): Promise<OnfidoVerificationResult> {
    const session = await this.createAttestorSession(verificationData);
    
    return new Promise((resolve, reject) => {
      const popup = window.open(
        session.verificationUrl,
        'onfido-attestor-verification',
        'width=600,height=800,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        reject(new Error('Failed to open Onfido verification popup'));
        return;
      }

      // Listen for popup messages
      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== 'https://onfido.com' && event.origin !== 'https://verify.onfido.com') {
          return;
        }

        if (event.data.type === 'ONFIDO_VERIFICATION_COMPLETE') {
          window.removeEventListener('message', messageHandler);
          popup.close();
          resolve({
            sessionId: event.data.sessionId,
            status: event.data.status,
            verificationType: 'attestor_professional',
            verificationData: event.data.verificationData,
          });
        } else if (event.data.type === 'ONFIDO_VERIFICATION_FAILED') {
          window.removeEventListener('message', messageHandler);
          popup.close();
          reject(new Error(event.data.error || 'Onfido verification failed'));
        }
      };

      window.addEventListener('message', messageHandler);

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          reject(new Error('Onfido verification cancelled by user'));
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
  validateAttestorData(data: OnfidoAttestorData): { isValid: boolean; errors: string[] } {
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
const onfidoAttestorService = new OnfidoAttestorService();

export default onfidoAttestorService;
