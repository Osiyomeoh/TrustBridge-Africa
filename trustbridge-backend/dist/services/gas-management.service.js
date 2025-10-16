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
var GasManagementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GasManagementService = void 0;
const common_1 = require("@nestjs/common");
const sdk_1 = require("@hashgraph/sdk");
let GasManagementService = GasManagementService_1 = class GasManagementService {
    constructor() {
        this.logger = new common_1.Logger(GasManagementService_1.name);
        this.MIN_HBAR_BALANCE = 100;
        this.TRUST_CONVERSION_AMOUNT = 100;
        this.HBAR_PER_TRUST_RATE = 0.1;
        this.initializeClient();
    }
    initializeClient() {
        try {
            const accountId = process.env.HEDERA_ACCOUNT_ID;
            const privateKey = process.env.HEDERA_PRIVATE_KEY;
            if (!accountId || !privateKey) {
                throw new Error('Missing Hedera credentials');
            }
            this.client = sdk_1.Client.forTestnet();
            this.operatorId = sdk_1.AccountId.fromString(accountId);
            try {
                this.operatorKey = sdk_1.PrivateKey.fromStringECDSA(privateKey);
            }
            catch {
                this.operatorKey = sdk_1.PrivateKey.fromString(privateKey);
            }
            this.client.setOperator(this.operatorId, this.operatorKey);
            this.logger.log('✅ Gas Management Service initialized');
        }
        catch (error) {
            this.logger.error('❌ Failed to initialize Gas Management:', error);
        }
    }
    async checkAndReplenishGas() {
        try {
            this.logger.log('🔍 Checking marketplace gas balance...');
            const balance = await new sdk_1.AccountBalanceQuery()
                .setAccountId(this.operatorId)
                .execute(this.client);
            const hbarBalance = balance.hbars.toTinybars().toNumber() / 100000000;
            const trustTokenId = sdk_1.TokenId.fromString(process.env.TRUST_TOKEN_ID || '0.0.6935064');
            const trustBalance = balance.tokens?.get(trustTokenId)?.toNumber() || 0;
            this.logger.log(`💰 Current balances - HBAR: ${hbarBalance}, TRUST: ${trustBalance}`);
            if (hbarBalance < this.MIN_HBAR_BALANCE && trustBalance >= this.TRUST_CONVERSION_AMOUNT) {
                this.logger.warn(`⚠️ Low HBAR balance: ${hbarBalance} ℏ`);
                this.logger.log(`💱 Converting ${this.TRUST_CONVERSION_AMOUNT} TRUST to HBAR...`);
                const conversionDone = await this.convertTRUSTToHBAR(this.TRUST_CONVERSION_AMOUNT);
                return {
                    hbarBalance,
                    trustBalance,
                    conversionNeeded: true,
                    conversionDone,
                };
            }
            return {
                hbarBalance,
                trustBalance,
                conversionNeeded: false,
                conversionDone: false,
            };
        }
        catch (error) {
            this.logger.error('❌ Failed to check gas balance:', error);
            throw error;
        }
    }
    async convertTRUSTToHBAR(trustAmount) {
        try {
            const exchangeContractId = process.env.TRUST_EXCHANGE_CONTRACT_ID;
            if (exchangeContractId) {
                this.logger.log('🔄 Using TrustTokenExchange contract...');
                this.logger.warn('⚠️ Exchange contract integration pending');
                return false;
            }
            this.logger.log('🔄 DEX integration not yet implemented');
            this.logger.warn('⚠️ MANUAL TOP-UP NEEDED!');
            this.logger.warn(`   Current HBAR: Low`);
            this.logger.warn(`   TRUST available: ${trustAmount}`);
            this.logger.warn(`   Action: Exchange ${trustAmount} TRUST for HBAR manually`);
            return false;
        }
        catch (error) {
            this.logger.error('❌ Failed to convert TRUST to HBAR:', error);
            return false;
        }
    }
    async getGasStatus() {
        try {
            const balance = await new sdk_1.AccountBalanceQuery()
                .setAccountId(this.operatorId)
                .execute(this.client);
            const hbarBalance = balance.hbars.toTinybars().toNumber() / 100000000;
            const trustTokenId = sdk_1.TokenId.fromString(process.env.TRUST_TOKEN_ID || '0.0.6935064');
            const trustBalance = balance.tokens?.get(trustTokenId)?.toNumber() || 0;
            const dailyHbarUsage = 50;
            const estimatedDaysRemaining = Math.floor(hbarBalance / dailyHbarUsage);
            const needsTopUp = hbarBalance < this.MIN_HBAR_BALANCE;
            return {
                hbarBalance,
                trustBalance,
                estimatedDaysRemaining,
                needsTopUp,
            };
        }
        catch (error) {
            this.logger.error('❌ Failed to get gas status:', error);
            throw error;
        }
    }
    async manualTopUp(hbarAmount) {
        try {
            this.logger.log(`💰 Manual HBAR top-up: ${hbarAmount} ℏ`);
            return {
                success: true,
                message: `Manual top-up of ${hbarAmount} HBAR initiated`,
            };
        }
        catch (error) {
            this.logger.error('❌ Failed manual top-up:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Top-up failed',
            };
        }
    }
};
exports.GasManagementService = GasManagementService;
exports.GasManagementService = GasManagementService = GasManagementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], GasManagementService);
//# sourceMappingURL=gas-management.service.js.map