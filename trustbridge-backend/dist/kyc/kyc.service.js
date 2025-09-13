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
var KycService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../schemas/user.schema");
const axios_1 = __importDefault(require("axios"));
let KycService = KycService_1 = class KycService {
    constructor(userModel) {
        this.userModel = userModel;
        this.logger = new common_1.Logger(KycService_1.name);
        this.personaApiKey = process.env.PERSONA_API_KEY;
        this.personaEnvironment = process.env.PERSONA_ENVIRONMENT || 'sandbox';
        this.personaBaseUrl = this.personaEnvironment === 'production'
            ? 'https://withpersona.com/api/v1'
            : 'https://sandbox-api.withpersona.com/api/v1';
    }
    async startKYC(userId) {
        try {
            const user = await this.userModel.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
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
            const response = await axios_1.default.post(`${this.personaBaseUrl}/inquiries`, inquiryData, {
                headers: {
                    'Authorization': `Bearer ${this.personaApiKey}`,
                    'Content-Type': 'application/json',
                    'Persona-Version': '2023-01-05',
                },
            });
            const inquiry = response.data.data;
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
        }
        catch (error) {
            this.logger.error(`Failed to start KYC for user ${userId}:`, error);
            throw new Error(`Failed to start KYC: ${error.message}`);
        }
    }
    async checkKYCStatus(inquiryId) {
        try {
            const response = await axios_1.default.get(`${this.personaBaseUrl}/inquiries/${inquiryId}`, {
                headers: {
                    'Authorization': `Bearer ${this.personaApiKey}`,
                    'Persona-Version': '2023-01-05',
                },
            });
            const inquiry = response.data.data;
            const status = inquiry.attributes?.status || 'unknown';
            let internalStatus;
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
            if (internalStatus === 'approved' || internalStatus === 'rejected') {
                await this.userModel.findOneAndUpdate({ kycInquiryId: inquiryId }, { kycStatus: internalStatus });
            }
            return {
                status: internalStatus,
                personaStatus: status,
                inquiryId: inquiry.id,
                completedAt: inquiry.attributes?.completedAt,
            };
        }
        catch (error) {
            this.logger.error(`Failed to check KYC status for inquiry ${inquiryId}:`, error);
            throw new Error(`Failed to check KYC status: ${error.message}`);
        }
    }
    async getKYCInquiry(inquiryId) {
        try {
            const response = await axios_1.default.get(`${this.personaBaseUrl}/inquiries/${inquiryId}`, {
                headers: {
                    'Authorization': `Bearer ${this.personaApiKey}`,
                    'Persona-Version': '2023-01-05',
                },
            });
            return response.data.data;
        }
        catch (error) {
            this.logger.error(`Failed to get KYC inquiry ${inquiryId}:`, error);
            throw new Error(`Failed to get KYC inquiry: ${error.message}`);
        }
    }
    async handleWebhook(webhookData) {
        try {
            this.logger.log('Received Persona webhook:', webhookData);
            const { data } = webhookData;
            if (data?.type === 'inquiry') {
                const inquiryId = data.id;
                const status = data.attributes?.status;
                let internalStatus;
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
                await this.userModel.findOneAndUpdate({ kycInquiryId: inquiryId }, { kycStatus: internalStatus });
                this.logger.log(`Updated KYC status for inquiry ${inquiryId} to ${internalStatus}`);
            }
            return { processed: true };
        }
        catch (error) {
            this.logger.error('Failed to process Persona webhook:', error);
            throw new Error(`Failed to process webhook: ${error.message}`);
        }
    }
    getCountryCode(country) {
        const countryMap = {
            'Nigeria': 'NG',
            'Ghana': 'GH',
            'Kenya': 'KE',
            'South Africa': 'ZA',
            'United States': 'US',
            'United Kingdom': 'GB',
            'Canada': 'CA',
            'Australia': 'AU',
        };
        return countryMap[country] || 'NG';
    }
};
exports.KycService = KycService;
exports.KycService = KycService = KycService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], KycService);
//# sourceMappingURL=kyc.service.js.map