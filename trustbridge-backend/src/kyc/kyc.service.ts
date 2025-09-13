import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import axios from 'axios';

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);
  private readonly personaApiKey = process.env.PERSONA_API_KEY;
  private readonly personaEnvironment = process.env.PERSONA_ENVIRONMENT || 'sandbox';
  private readonly personaBaseUrl = this.personaEnvironment === 'production' 
    ? 'https://withpersona.com/api/v1'
    : 'https://sandbox-api.withpersona.com/api/v1';

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async startKYC(userId: string) {
    try {
      // Get user details
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Create Persona inquiry
      const inquiryData = {
        data: {
          type: 'inquiry',
          attributes: {
            referenceId: `user_${userId}`,
            inquiryTemplateId: process.env.PERSONA_TEMPLATE_ID || 'itmpl_1234567890',
            fields: {
              'name-first': user.name?.split(' ')[0] || '',
              'name-last': user.name?.split(' ').slice(1).join(' ') || '',
              'email-address': user.email || '',
              'phone-number': user.phone || '',
              'address-street-1': '',
              'address-city': '',
              'address-subdivision': user.country || '',
              'address-postal-code': '',
              'address-country-code': this.getCountryCode(user.country || ''),
            },
          },
        },
      };

      const response = await axios.post(
        `${this.personaBaseUrl}/inquiries`,
        inquiryData,
        {
          headers: {
            'Authorization': `Bearer ${this.personaApiKey}`,
            'Content-Type': 'application/json',
            'Persona-Version': '2023-01-05',
          },
        }
      );

      const inquiry = response.data.data;
      
      // Update user with inquiry ID and status
      await this.userModel.findByIdAndUpdate(userId, {
        kycInquiryId: inquiry.id,
        kycStatus: 'in_progress',
      });

      this.logger.log(`KYC started for user ${userId}, inquiry ID: ${inquiry.id}`);

      return {
        inquiryId: inquiry.id,
        inquiryUrl: inquiry.attributes?.webUrl || '',
        status: 'in_progress',
      };
    } catch (error) {
      this.logger.error(`Failed to start KYC for user ${userId}:`, error);
      throw new Error(`Failed to start KYC: ${error.message}`);
    }
  }

  async checkKYCStatus(inquiryId: string) {
    try {
      const response = await axios.get(
        `${this.personaBaseUrl}/inquiries/${inquiryId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.personaApiKey}`,
            'Persona-Version': '2023-01-05',
          },
        }
      );

      const inquiry = response.data.data;
      const status = inquiry.attributes?.status || 'unknown';

      // Map Persona status to our internal status
      let internalStatus: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'not_started';
      switch (status) {
        case 'pending':
        case 'processing':
          internalStatus = 'in_progress';
          break;
        case 'completed':
          internalStatus = 'approved';
          break;
        case 'failed':
        case 'declined':
          internalStatus = 'rejected';
          break;
        default:
          internalStatus = 'pending';
      }

      // Update user status if changed
      if (internalStatus === 'approved' || internalStatus === 'rejected') {
        await this.userModel.findOneAndUpdate(
          { kycInquiryId: inquiryId },
          { kycStatus: internalStatus }
        );
      }

      return {
        status: internalStatus,
        personaStatus: status,
        inquiryId: inquiry.id,
        completedAt: inquiry.attributes?.completedAt,
      };
    } catch (error) {
      this.logger.error(`Failed to check KYC status for inquiry ${inquiryId}:`, error);
      throw new Error(`Failed to check KYC status: ${error.message}`);
    }
  }

  async getKYCInquiry(inquiryId: string) {
    try {
      const response = await axios.get(
        `${this.personaBaseUrl}/inquiries/${inquiryId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.personaApiKey}`,
            'Persona-Version': '2023-01-05',
          },
        }
      );

      return response.data.data;
    } catch (error) {
      this.logger.error(`Failed to get KYC inquiry ${inquiryId}:`, error);
      throw new Error(`Failed to get KYC inquiry: ${error.message}`);
    }
  }

  async handleWebhook(webhookData: any) {
    try {
      this.logger.log('Received Persona webhook:', webhookData);

      const { data } = webhookData;
      if (data?.type === 'inquiry') {
        const inquiryId = data.id;
        const status = data.attributes?.status;

        // Map Persona status to internal status
        let internalStatus: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'not_started';
        switch (status) {
          case 'pending':
          case 'processing':
            internalStatus = 'in_progress';
            break;
          case 'completed':
            internalStatus = 'approved';
            break;
          case 'failed':
          case 'declined':
            internalStatus = 'rejected';
            break;
          default:
            internalStatus = 'pending';
        }

        // Update user status
        await this.userModel.findOneAndUpdate(
          { kycInquiryId: inquiryId },
          { kycStatus: internalStatus }
        );

        this.logger.log(`Updated KYC status for inquiry ${inquiryId} to ${internalStatus}`);
      }

      return { processed: true };
    } catch (error) {
      this.logger.error('Failed to process Persona webhook:', error);
      throw new Error(`Failed to process webhook: ${error.message}`);
    }
  }

  private getCountryCode(country: string): string {
    const countryMap: { [key: string]: string } = {
      'Nigeria': 'NG',
      'Ghana': 'GH',
      'Kenya': 'KE',
      'South Africa': 'ZA',
      'United States': 'US',
      'United Kingdom': 'GB',
      'Canada': 'CA',
      'Australia': 'AU',
    };
    
    return countryMap[country] || 'NG'; // Default to Nigeria
  }
}
