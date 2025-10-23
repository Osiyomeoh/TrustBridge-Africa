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
        this.diditApiKey = process.env.DIDIT_API_KEY;
        this.diditWorkflowId = process.env.DIDIT_WORKFLOW_ID;
        this.diditBaseUrl = 'https://verification.didit.me/v2';
    }
    async startKYC(userId) {
        try {
            const user = await this.userModel.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            const sessionData = {
                vendor_data: JSON.stringify({ userId, walletAddress: user.walletAddress }),
                workflow_id: this.diditWorkflowId,
                callback: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/kyc-callback`,
            };
            const response = await axios_1.default.post(`${this.diditBaseUrl}/session/`, sessionData, {
                headers: {
                    'x-api-key': this.diditApiKey,
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                },
            });
            const session = response.data;
            await this.userModel.findByIdAndUpdate(userId, {
                kycInquiryId: session.session_id,
                kycStatus: 'in_progress',
                kycProvider: 'didit',
            });
            this.logger.log(`KYC started for user ${userId}, session ID: ${session.session_id}`);
            return {
                inquiryId: session.session_id,
                inquiryUrl: session.url,
                status: 'in_progress',
                provider: 'didit',
                sessionToken: session.session_token,
            };
        }
        catch (error) {
            this.logger.error(`Failed to start KYC for user ${userId}:`, error);
            if (error.response?.status === 403) {
                this.logger.error('DidIt API returned 403 - API key lacks session creation permissions');
                throw new Error('KYC service is currently unavailable. Please contact support or try again later.');
            }
            if (error.response?.status === 400) {
                this.logger.error('DidIt API returned 400 - Invalid request data');
                throw new Error('Invalid KYC request. Please check your profile information.');
            }
            throw new Error(`Failed to start KYC: ${error.message}`);
        }
    }
    async checkKYCStatus(inquiryId) {
        try {
            const response = await axios_1.default.get(`${this.diditBaseUrl}/session/${inquiryId}`, {
                headers: {
                    'x-api-key': this.diditApiKey,
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                },
            });
            const session = response.data;
            const status = session.status || 'unknown';
            let internalStatus;
            switch (status) {
                case 'Not Started':
                    internalStatus = 'not_started';
                    break;
                case 'In Progress':
                case 'Pending':
                    internalStatus = 'in_progress';
                    break;
                case 'Completed':
                case 'Approved':
                    internalStatus = 'approved';
                    break;
                case 'Failed':
                case 'Rejected':
                case 'Declined':
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
                diditStatus: status,
                inquiryId: session.session_id,
                completedAt: session.completed_at,
            };
        }
        catch (error) {
            this.logger.error(`Failed to check KYC status for session ${inquiryId}:`, error);
            throw new Error(`Failed to check KYC status: ${error.message}`);
        }
    }
    async getKYCInquiry(inquiryId) {
        try {
            const response = await axios_1.default.get(`${this.diditBaseUrl}/session/${inquiryId}`, {
                headers: {
                    'x-api-key': this.diditApiKey,
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                },
            });
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to get KYC session ${inquiryId}:`, error);
            throw new Error(`Failed to get KYC session: ${error.message}`);
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
    async handleWebhook(webhookData) {
        try {
            this.logger.log('Received DidIt webhook:', webhookData);
            const { session_id, status } = webhookData;
            if (session_id) {
                let internalStatus;
                switch (status) {
                    case 'Not Started':
                        internalStatus = 'not_started';
                        break;
                    case 'In Progress':
                    case 'Pending':
                        internalStatus = 'in_progress';
                        break;
                    case 'Completed':
                    case 'Approved':
                        internalStatus = 'approved';
                        break;
                    case 'Failed':
                    case 'Rejected':
                    case 'Declined':
                        internalStatus = 'rejected';
                        break;
                    default:
                        internalStatus = 'pending';
                }
                await this.userModel.findOneAndUpdate({ kycInquiryId: session_id }, { kycStatus: internalStatus });
                this.logger.log(`Updated KYC status for session ${session_id} to ${internalStatus}`);
            }
            return { processed: true };
        }
        catch (error) {
            this.logger.error('Failed to process DidIt webhook:', error);
            throw new Error(`Failed to process webhook: ${error.message}`);
        }
    }
};
exports.KycService = KycService;
exports.KycService = KycService = KycService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], KycService);
//# sourceMappingURL=kyc.service.js.map