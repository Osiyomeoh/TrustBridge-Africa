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
var TrustTokenService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrustTokenService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sdk_1 = require("@hashgraph/sdk");
let TrustTokenService = TrustTokenService_1 = class TrustTokenService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(TrustTokenService_1.name);
        this.trustTokenId = null;
        this.initializeClient();
    }
    initializeClient() {
        try {
            const accountId = this.configService.get('HEDERA_ACCOUNT_ID');
            const privateKey = this.configService.get('HEDERA_PRIVATE_KEY');
            const network = this.configService.get('HEDERA_NETWORK', 'testnet');
            if (!accountId || !privateKey) {
                throw new Error('Hedera credentials are required for TRUST token management');
            }
            this.operatorId = sdk_1.AccountId.fromString(accountId);
            try {
                this.operatorKey = sdk_1.PrivateKey.fromStringECDSA(privateKey);
                this.logger.log('Using ECDSA key format for TRUST token service');
            }
            catch (ecdsaError) {
                this.logger.warn('ECDSA parsing failed, trying regular format:', ecdsaError.message);
                this.operatorKey = sdk_1.PrivateKey.fromString(privateKey);
                this.logger.log('Using regular key format for TRUST token service');
            }
            this.client = sdk_1.Client.forName(network);
            this.client.setOperator(this.operatorId, this.operatorKey);
            this.logger.log(`TRUST token service initialized for ${network} with account ${accountId}`);
        }
        catch (error) {
            this.logger.error('Failed to initialize TRUST token service:', error);
            throw error;
        }
    }
    async createTrustToken() {
        try {
            this.logger.log('Creating TRUST token on Hedera Token Service...');
            const tokenCreateTx = new sdk_1.TokenCreateTransaction()
                .setTokenName('TrustBridge Token')
                .setTokenSymbol('TRUST')
                .setTokenType(sdk_1.TokenType.FungibleCommon)
                .setDecimals(8)
                .setInitialSupply(0)
                .setTreasuryAccountId(this.operatorId)
                .setSupplyType(sdk_1.TokenSupplyType.Infinite)
                .setMaxTransactionFee(1000);
            const tokenCreateResponse = await tokenCreateTx.execute(this.client);
            const tokenCreateReceipt = await tokenCreateResponse.getReceipt(this.client);
            this.trustTokenId = tokenCreateReceipt.tokenId;
            this.logger.log(`✅ TRUST token created successfully: ${this.trustTokenId.toString()}`);
            return this.trustTokenId.toString();
        }
        catch (error) {
            this.logger.error('Failed to create TRUST token:', error);
            throw error;
        }
    }
    async mintTrustTokens(toAccountId, amount) {
        try {
            if (!this.trustTokenId) {
                const tokenId = this.getTrustTokenId();
                if (!tokenId) {
                    throw new Error('TRUST token not found. Please check TRUST_TOKEN_ID environment variable.');
                }
                this.trustTokenId = sdk_1.TokenId.fromString(tokenId);
            }
            this.logger.log(`Minting ${amount} TRUST tokens to ${toAccountId}...`);
            const mintTx = new sdk_1.TokenMintTransaction()
                .setTokenId(this.trustTokenId)
                .setAmount(amount)
                .setMaxTransactionFee(1000);
            const mintResponse = await mintTx.execute(this.client);
            const mintReceipt = await mintResponse.getReceipt(this.client);
            this.logger.log(`✅ Minted ${amount} TRUST tokens to ${toAccountId}`);
            return mintResponse.transactionId.toString();
        }
        catch (error) {
            this.logger.error('Failed to mint TRUST tokens:', error);
            throw error;
        }
    }
    async transferTrustTokens(fromAccountId, toAccountId, amount) {
        try {
            if (!this.trustTokenId) {
                throw new Error('TRUST token not created yet. Call createTrustToken() first.');
            }
            this.logger.log(`Transferring ${amount} TRUST tokens from ${fromAccountId} to ${toAccountId}...`);
            const transferTx = new sdk_1.TransferTransaction()
                .addTokenTransfer(this.trustTokenId, sdk_1.AccountId.fromString(fromAccountId), -amount)
                .addTokenTransfer(this.trustTokenId, sdk_1.AccountId.fromString(toAccountId), amount)
                .setMaxTransactionFee(1000);
            const transferResponse = await transferTx.execute(this.client);
            const transferReceipt = await transferResponse.getReceipt(this.client);
            this.logger.log(`✅ Transferred ${amount} TRUST tokens from ${fromAccountId} to ${toAccountId}`);
            return transferResponse.transactionId.toString();
        }
        catch (error) {
            this.logger.error('Failed to transfer TRUST tokens:', error);
            throw error;
        }
    }
    async getTrustTokenBalance(accountId) {
        try {
            if (!this.trustTokenId) {
                return 0;
            }
            const balanceQuery = new sdk_1.AccountBalanceQuery()
                .setAccountId(sdk_1.AccountId.fromString(accountId));
            const balance = await balanceQuery.execute(this.client);
            const tokenBalance = balance.tokens?.get(this.trustTokenId.toString());
            return tokenBalance ? Number(tokenBalance) : 0;
        }
        catch (error) {
            this.logger.error('Failed to get TRUST token balance:', error);
            return 0;
        }
    }
    getTrustTokenId() {
        return this.trustTokenId?.toString() || null;
    }
    async burnTrustTokens(fromAccountId, amount) {
        try {
            if (!this.trustTokenId) {
                throw new Error('TRUST token not created yet. Call createTrustToken() first.');
            }
            this.logger.log(`Burning ${amount} TRUST tokens from ${fromAccountId}...`);
            const burnTx = new sdk_1.TransferTransaction()
                .addTokenTransfer(this.trustTokenId, sdk_1.AccountId.fromString(fromAccountId), -amount)
                .addTokenTransfer(this.trustTokenId, this.operatorId, amount)
                .setMaxTransactionFee(1000);
            const burnResponse = await burnTx.execute(this.client);
            const burnReceipt = await burnResponse.getReceipt(this.client);
            this.logger.log(`✅ Burned ${amount} TRUST tokens from ${fromAccountId}`);
            return burnResponse.transactionId.toString();
        }
        catch (error) {
            this.logger.error('Failed to burn TRUST tokens:', error);
            throw error;
        }
    }
    async exchangeHbarForTrust(fromAccountId, hbarAmount, treasuryAccountId, operationsAccountId, stakingAccountId) {
        try {
            if (!this.trustTokenId) {
                throw new Error('TRUST token not created yet. Call createTrustToken() first.');
            }
            const exchangeRate = 100;
            const exchangeFeeRate = 0.01;
            const exchangeFee = hbarAmount * exchangeFeeRate;
            const netHbarAmount = hbarAmount - exchangeFee;
            const trustAmount = netHbarAmount * exchangeRate;
            this.logger.log(`Exchanging ${hbarAmount} HBAR for ${trustAmount} TRUST tokens...`);
            const distribution = {
                treasury: netHbarAmount * 0.6,
                operations: netHbarAmount * 0.25,
                staking: netHbarAmount * 0.1,
                fees: netHbarAmount * 0.05
            };
            const hbarTransferTx = new sdk_1.TransferTransaction()
                .addHbarTransfer(sdk_1.AccountId.fromString(fromAccountId), -hbarAmount)
                .addHbarTransfer(sdk_1.AccountId.fromString(treasuryAccountId), distribution.treasury)
                .addHbarTransfer(sdk_1.AccountId.fromString(operationsAccountId), distribution.operations)
                .addHbarTransfer(sdk_1.AccountId.fromString(stakingAccountId), distribution.staking)
                .addHbarTransfer(this.operatorId, distribution.fees)
                .setMaxTransactionFee(1000);
            const hbarTransferResponse = await hbarTransferTx.execute(this.client);
            const hbarTransferReceipt = await hbarTransferResponse.getReceipt(this.client);
            const mintTx = new sdk_1.TokenMintTransaction()
                .setTokenId(this.trustTokenId)
                .setAmount(trustAmount)
                .setMaxTransactionFee(1000);
            const mintResponse = await mintTx.execute(this.client);
            const mintReceipt = await mintResponse.getReceipt(this.client);
            const trustTransferTx = new sdk_1.TransferTransaction()
                .addTokenTransfer(this.trustTokenId, this.operatorId, -trustAmount)
                .addTokenTransfer(this.trustTokenId, sdk_1.AccountId.fromString(fromAccountId), trustAmount)
                .setMaxTransactionFee(1000);
            const trustTransferResponse = await trustTransferTx.execute(this.client);
            const trustTransferReceipt = await trustTransferResponse.getReceipt(this.client);
            this.logger.log(`✅ Exchanged ${hbarAmount} HBAR for ${trustAmount} TRUST tokens`);
            this.logger.log(`HBAR Distribution:`, distribution);
            return {
                transactionId: hbarTransferResponse.transactionId.toString(),
                trustAmount,
                distribution
            };
        }
        catch (error) {
            this.logger.error('Failed to exchange HBAR for TRUST tokens:', error);
            throw error;
        }
    }
    getExchangeInfo() {
        return {
            exchangeRate: 100,
            exchangeFeeRate: 0.01,
            minExchange: 0.5,
            distribution: {
                treasury: 0.6,
                operations: 0.25,
                staking: 0.1,
                fees: 0.05
            }
        };
    }
    async initializeTrustToken() {
        if (this.trustTokenId) {
            return this.trustTokenId.toString();
        }
        const existingTokenId = this.configService.get('TRUST_TOKEN_ID');
        if (existingTokenId) {
            this.trustTokenId = sdk_1.TokenId.fromString(existingTokenId);
            this.logger.log(`Using existing TRUST token: ${existingTokenId}`);
            return existingTokenId;
        }
        return await this.createTrustToken();
    }
};
exports.TrustTokenService = TrustTokenService;
exports.TrustTokenService = TrustTokenService = TrustTokenService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TrustTokenService);
//# sourceMappingURL=trust-token.service.js.map