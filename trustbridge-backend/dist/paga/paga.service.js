"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PagaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
let PagaService = PagaService_1 = class PagaService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(PagaService_1.name);
        this.apiUrl = 'https://beta-collect.paga.com';
        this.publicKey = this.configService.get('PAGA_PUBLIC_KEY') || '';
        this.secretKey = this.configService.get('PAGA_SECRET_KEY') || '';
        this.hashKey = this.configService.get('PAGA_HASH_KEY') || '';
        this.callbackUrl = this.configService.get('PAGA_CALLBACK_URL') ||
            'https://tbafrica.xyz/api/paga/webhook';
        if (!this.publicKey || !this.secretKey) {
            this.logger.warn('Paga credentials not fully configured');
        }
    }
    generatePaymentCode(userId, amount) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `TB-${timestamp}-${random}`;
    }
    generateHash(data) {
        if (!this.hashKey) {
            return '';
        }
        return crypto.createHmac('sha512', this.hashKey).update(data).digest('hex');
    }
    async createAgentPaymentRequest(phoneNumber, amount, reference, description) {
        try {
            if (!this.publicKey || !this.secretKey) {
                return this.createSimulatedPaymentRequest(phoneNumber, amount, reference, description);
            }
            const banksResponse = await axios_1.default.post(`${this.apiUrl}/getBanks`, {}, {
                headers: {
                    Authorization: `Basic ${Buffer.from(`${this.publicKey}:${this.secretKey}`).toString('base64')}`,
                    'Content-Type': 'application/json',
                },
            });
            const defaultBankId = '43F4DED6-78EC-4047-AD34-BAB75E679EB7';
            const requestBody = {
                referenceNumber: reference,
                amount: amount,
                currency: 'NGN',
                payer: {
                    name: 'User',
                    phoneNumber: phoneNumber,
                    bankId: defaultBankId,
                },
                payee: {
                    name: 'TrustBridge Africa',
                },
                expiryDateTimeUTC: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                isSuppressMessages: false,
                payerCollectionFeeShare: 0.0,
                payeeCollectionFeeShare: 1.0,
                callBackUrl: this.callbackUrl,
                paymentMethods: ['FUNDING_USSD'],
            };
            const requestData = JSON.stringify(requestBody);
            const hash = this.generateHash(requestData);
            const response = await axios_1.default.post(`${this.apiUrl}/paymentRequest`, requestBody, {
                headers: {
                    Authorization: `Basic ${Buffer.from(`${this.publicKey}:${this.secretKey}`).toString('base64')}`,
                    'Content-Type': 'application/json',
                    hash: hash,
                },
            });
            if (response.data.statusCode === '0') {
                const ussdCode = response.data.paymentMethods[0]?.properties?.USSDShortCode;
                return {
                    reference: response.data.referenceNumber,
                    paymentCode: response.data.paymentMethods[0]?.properties?.PaymentReference,
                    ussdCode: ussdCode || '*894*000#',
                    bank: 'Bank USSD',
                    instructions: this.formatUSSDInstructions(ussdCode, amount),
                };
            }
            throw new Error(response.data.statusMessage || 'Payment request failed');
        }
        catch (error) {
            this.logger.error('Error creating Paga Bank USSD payment:', error);
            return this.createSimulatedPaymentRequest(phoneNumber, amount, reference, description);
        }
    }
    createSimulatedPaymentRequest(phoneNumber, amount, reference, description) {
        const paymentCode = this.generatePaymentCode(phoneNumber, amount);
        return {
            reference: reference,
            paymentCode: paymentCode,
            ussdCode: '*894*000#',
            bank: 'Simulated',
            instructions: this.formatUSSDInstructions('*894*000#', amount),
        };
    }
    formatUSSDInstructions(ussdCode, amount) {
        return `
Bank USSD Payment

USSD Code: ${ussdCode}
Amount: ₦${amount.toLocaleString()}

Instructions:
1. Dial ${ussdCode} on your phone
2. Enter your 4-digit PIN
3. Confirm payment
4. You'll receive SMS confirmation

No need to visit an agent!
Available at any bank with USSD.
    `.trim();
    }
    async verifyPayment(reference) {
        try {
            this.logger.warn(`Payment verification for ${reference} not yet implemented`);
            return {
                verified: false,
            };
        }
        catch (error) {
            this.logger.error('Error verifying payment:', error);
            throw new Error('Failed to verify payment');
        }
    }
    async getNearbyAgents(latitude, longitude) {
        try {
            return {
                agents: [
                    {
                        name: 'Paga Agent - Ikeja',
                        address: 'Shop 5, Ikeja Lagos',
                        distance: '2.5 km',
                        phone: '08012345678',
                    },
                    {
                        name: 'Paga Agent - Victoria Island',
                        address: 'Victoria Island, Lagos',
                        distance: '5.0 km',
                        phone: '08087654321',
                    },
                ],
            };
        }
        catch (error) {
            this.logger.error('Error getting nearby agents:', error);
            throw new Error('Failed to get agent locations');
        }
    }
    async sendPaymentInstructions(phoneNumber, paymentCode, amount) {
        try {
            const message = `
TrustBridge Africa Payment

Pay ₦${amount.toLocaleString()} at any Paga agent.

Payment Code: ${paymentCode}

Find nearest agent:
- Visit paga.com/agents
- Or dial *242*242# on your phone

After payment, you'll receive confirmation.
      `.trim();
            this.logger.log(`SMS to ${phoneNumber}: ${message}`);
        }
        catch (error) {
            this.logger.error('Error sending SMS:', error);
        }
    }
};
exports.PagaService = PagaService;
exports.PagaService = PagaService = PagaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PagaService);
//# sourceMappingURL=paga.service.js.map