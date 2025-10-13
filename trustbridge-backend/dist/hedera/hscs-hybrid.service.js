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
var HscsHybridService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HscsHybridService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sdk_1 = require("@hashgraph/sdk");
let HscsHybridService = HscsHybridService_1 = class HscsHybridService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(HscsHybridService_1.name);
        this.trustTokenExchangeContract = null;
        this.trustTokenBurnerContract = null;
        this.trustTokenStakingContract = null;
        this.initializeClient();
    }
    initializeClient() {
        try {
            const accountId = this.configService.get('HEDERA_ACCOUNT_ID');
            const privateKey = this.configService.get('HEDERA_PRIVATE_KEY');
            const network = this.configService.get('HEDERA_NETWORK', 'testnet');
            const trustTokenIdStr = this.configService.get('TRUST_TOKEN_ID');
            if (!accountId || !privateKey || !trustTokenIdStr) {
                throw new Error('Hedera credentials and TRUST_TOKEN_ID are required for HSCS hybrid service');
            }
            this.operatorId = sdk_1.AccountId.fromString(accountId);
            this.trustTokenId = sdk_1.TokenId.fromString(trustTokenIdStr);
            try {
                this.operatorKey = sdk_1.PrivateKey.fromStringECDSA(privateKey);
                this.logger.log('Using ECDSA key format for HSCS hybrid service');
            }
            catch (ecdsaError) {
                this.logger.warn('ECDSA parsing failed, trying regular format:', ecdsaError.message);
                this.operatorKey = sdk_1.PrivateKey.fromString(privateKey);
                this.logger.log('Using regular key format for HSCS hybrid service');
            }
            this.client = sdk_1.Client.forName(network);
            this.client.setOperator(this.operatorId, this.operatorKey);
            this.loadContractAddresses();
            this.logger.log(`HSCS Hybrid service initialized for ${network} with account ${accountId}`);
        }
        catch (error) {
            this.logger.error('Failed to initialize HSCS hybrid service:', error);
            throw error;
        }
    }
    loadContractAddresses() {
        const exchangeContractId = this.configService.get('TRUST_TOKEN_EXCHANGE_CONTRACT_ID');
        const burnerContractId = this.configService.get('TRUST_TOKEN_BURNER_CONTRACT_ID');
        const stakingContractId = this.configService.get('TRUST_TOKEN_STAKING_CONTRACT_ID');
        if (exchangeContractId) {
            this.trustTokenExchangeContract = sdk_1.ContractId.fromString(exchangeContractId);
            this.logger.log(`Loaded exchange contract: ${exchangeContractId}`);
        }
        if (burnerContractId) {
            this.trustTokenBurnerContract = sdk_1.ContractId.fromString(burnerContractId);
            this.logger.log(`Loaded burner contract: ${burnerContractId}`);
        }
        if (stakingContractId) {
            this.trustTokenStakingContract = sdk_1.ContractId.fromString(stakingContractId);
            this.logger.log(`Loaded staking contract: ${stakingContractId}`);
        }
    }
    async exchangeHbarForTrust(fromAccountId, hbarAmount, treasuryAccountId, operationsAccountId, stakingAccountId, fromAccountPrivateKey) {
        try {
            this.logger.log(`🔄 Starting hybrid HBAR to TRUST exchange: ${hbarAmount} HBAR`);
            const exchangeInfo = await this.getExchangeInfo();
            const exchangeRate = exchangeInfo.exchangeRate || 100;
            const exchangeFeeRate = exchangeInfo.exchangeFeeRate || 0.01;
            const exchangeFee = hbarAmount * exchangeFeeRate;
            const netHbarAmount = hbarAmount - exchangeFee;
            const trustAmount = netHbarAmount * exchangeRate;
            const distribution = {
                treasury: netHbarAmount * 0.6,
                operations: netHbarAmount * 0.25,
                staking: netHbarAmount * 0.1,
                fees: netHbarAmount * 0.05
            };
            this.logger.log(`📊 Exchange calculation: ${hbarAmount} HBAR → ${trustAmount} TRUST tokens (fee: ${exchangeFee} HBAR)`);
            const hbarInTinybars = Math.floor(hbarAmount * 100000000);
            const netHbarInTinybars = Math.floor(netHbarAmount * 100000000);
            const distributionInTinybars = {
                treasury: Math.floor(distribution.treasury * 100000000),
                operations: Math.floor(distribution.operations * 100000000),
                staking: Math.floor(distribution.staking * 100000000),
                fees: Math.floor(distribution.fees * 100000000)
            };
            this.logger.log(`📊 Tinybars: ${hbarInTinybars} → ${netHbarInTinybars} (distribution: ${JSON.stringify(distributionInTinybars)})`);
            let hbarDistributionResponse;
            if (fromAccountPrivateKey) {
                this.logger.log(`Using real HBAR transfer with user's private key from ${fromAccountId}`);
                let userPrivateKey;
                try {
                    userPrivateKey = sdk_1.PrivateKey.fromStringECDSA(fromAccountPrivateKey);
                }
                catch (ecdsaError) {
                    userPrivateKey = sdk_1.PrivateKey.fromString(fromAccountPrivateKey);
                }
                const hbarDistributionTx = new sdk_1.TransferTransaction()
                    .addHbarTransfer(sdk_1.AccountId.fromString(fromAccountId), -hbarInTinybars)
                    .addHbarTransfer(this.operatorId, hbarInTinybars)
                    .setMaxTransactionFee(new sdk_1.Hbar(10))
                    .freezeWith(this.client);
                hbarDistributionTx.sign(userPrivateKey);
                hbarDistributionResponse = await hbarDistributionTx.execute(this.client);
                const hbarDistributionReceipt = await hbarDistributionResponse.getReceipt(this.client);
                this.logger.log(`✅ Real HBAR transfer successful: ${hbarDistributionResponse.transactionId.toString()}`);
                this.logger.log(`Transferred ${hbarAmount} HBAR from ${fromAccountId} to treasury`);
            }
            else {
                this.logger.log(`No private key provided, simulating HBAR distribution: ${hbarAmount} HBAR from ${fromAccountId}`);
                this.logger.log(`Distribution: Treasury ${distribution.treasury}, Operations ${distribution.operations}, Staking ${distribution.staking}, Fees ${distribution.fees}`);
                const simulatedTransactionId = `simulated-${Date.now()}`;
                this.logger.log(`✅ HBAR distribution simulated: ${simulatedTransactionId}`);
                hbarDistributionResponse = {
                    transactionId: { toString: () => simulatedTransactionId }
                };
            }
            const mintTx = new sdk_1.TokenMintTransaction()
                .setTokenId(this.trustTokenId)
                .setAmount(trustAmount)
                .setMaxTransactionFee(new sdk_1.Hbar(5));
            const mintResponse = await mintTx.execute(this.client);
            const mintReceipt = await mintResponse.getReceipt(this.client);
            this.logger.log(`✅ TRUST tokens minted: ${mintResponse.transactionId.toString()}`);
            const transferTx = new sdk_1.TransferTransaction()
                .addTokenTransfer(this.trustTokenId, this.operatorId, -trustAmount)
                .addTokenTransfer(this.trustTokenId, sdk_1.AccountId.fromString(fromAccountId), trustAmount)
                .setMaxTransactionFee(new sdk_1.Hbar(5))
                .freezeWith(this.client);
            const transferResponse = await transferTx.execute(this.client);
            const transferReceipt = await transferResponse.getReceipt(this.client);
            this.logger.log(`✅ TRUST tokens transferred to user: ${transferResponse.transactionId.toString()}`);
            this.logger.log(`🎉 Exchange completed: ${hbarAmount} HBAR → ${trustAmount} TRUST tokens`);
            return {
                transactionId: hbarDistributionResponse.transactionId.toString(),
                trustAmount,
                distribution
            };
        }
        catch (error) {
            this.logger.error('Failed to exchange HBAR for TRUST tokens:', error);
            throw error;
        }
    }
    async burnTrustTokens(fromAccountId, amount, reason = "NFT_CREATION", fromAccountPrivateKey) {
        try {
            this.logger.log(`🔥 Burning ${amount} TRUST tokens for ${reason}...`);
            if (fromAccountPrivateKey) {
                this.logger.log(`Using real token transfer for burning from ${fromAccountId}`);
                let userPrivateKey;
                try {
                    userPrivateKey = sdk_1.PrivateKey.fromStringECDSA(fromAccountPrivateKey);
                }
                catch (ecdsaError) {
                    userPrivateKey = sdk_1.PrivateKey.fromString(fromAccountPrivateKey);
                }
                this.logger.log(`Step 1: Transferring ${amount} TRUST tokens from ${fromAccountId} to treasury...`);
                const transferTx = new sdk_1.TransferTransaction()
                    .addTokenTransfer(this.trustTokenId, sdk_1.AccountId.fromString(fromAccountId), -amount)
                    .addTokenTransfer(this.trustTokenId, this.operatorId, amount)
                    .setMaxTransactionFee(new sdk_1.Hbar(10))
                    .freezeWith(this.client);
                transferTx.sign(userPrivateKey);
                const transferResponse = await transferTx.execute(this.client);
                const transferReceipt = await transferResponse.getReceipt(this.client);
                this.logger.log(`✅ Token transfer successful: ${transferResponse.transactionId.toString()}`);
                this.logger.log(`Step 2: Burning ${amount} TRUST tokens from treasury...`);
                const burnTx = new sdk_1.TokenBurnTransaction()
                    .setTokenId(this.trustTokenId)
                    .setAmount(amount)
                    .setMaxTransactionFee(new sdk_1.Hbar(5));
                const burnResponse = await burnTx.execute(this.client);
                const burnReceipt = await burnResponse.getReceipt(this.client);
                this.logger.log(`✅ Successfully burned ${amount} TRUST tokens: ${burnResponse.transactionId.toString()}`);
                this.logger.log(`Total transaction: Transfer ${transferResponse.transactionId.toString()} + Burn ${burnResponse.transactionId.toString()}`);
                return burnResponse.transactionId.toString();
            }
            else {
                this.logger.log(`No private key provided, simulating burning by minting to treasury...`);
                const mintTx = new sdk_1.TokenMintTransaction()
                    .setTokenId(this.trustTokenId)
                    .setAmount(amount)
                    .setMaxTransactionFee(new sdk_1.Hbar(5));
                const mintResponse = await mintTx.execute(this.client);
                const mintReceipt = await mintResponse.getReceipt(this.client);
                this.logger.log(`✅ Minting successful: ${mintResponse.transactionId.toString()}`);
                this.logger.log(`Step 2: Burning ${amount} TRUST tokens from treasury...`);
                const burnTx = new sdk_1.TokenBurnTransaction()
                    .setTokenId(this.trustTokenId)
                    .setAmount(amount)
                    .setMaxTransactionFee(new sdk_1.Hbar(5));
                const burnResponse = await burnTx.execute(this.client);
                const burnReceipt = await burnResponse.getReceipt(this.client);
                this.logger.log(`✅ Successfully burned ${amount} TRUST tokens: ${burnResponse.transactionId.toString()}`);
                this.logger.log(`Total transaction: Mint ${mintResponse.transactionId.toString()} + Burn ${burnResponse.transactionId.toString()}`);
                return burnResponse.transactionId.toString();
            }
        }
        catch (error) {
            this.logger.error('Failed to burn TRUST tokens:', error);
            throw error;
        }
    }
    async calculateNftCreationFee(verificationLevel, rarity) {
        try {
            if (!this.trustTokenBurnerContract) {
                this.logger.warn('Burner contract not available, using default calculation');
                return this.calculateDefaultFee(verificationLevel, rarity);
            }
            this.logger.log(`Calculating NFT creation fee for ${verificationLevel} ${rarity}...`);
            const params = new sdk_1.ContractFunctionParameters()
                .addString(verificationLevel)
                .addString(rarity);
            const query = new sdk_1.ContractCallQuery()
                .setContractId(this.trustTokenBurnerContract)
                .setGas(100000)
                .setFunction("calculateNftCreationFee", params);
            const result = await query.execute(this.client);
            const fee = result.getInt256(0).toNumber();
            this.logger.log(`✅ NFT creation fee calculated: ${fee} TRUST tokens`);
            return fee;
        }
        catch (error) {
            this.logger.error('Failed to calculate NFT creation fee via HSCS, using default:', error);
            return this.calculateDefaultFee(verificationLevel, rarity);
        }
    }
    async getExchangeInfo() {
        try {
            if (!this.trustTokenExchangeContract) {
                this.logger.warn('Exchange contract not available, using default values');
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
            const query = new sdk_1.ContractCallQuery()
                .setContractId(this.trustTokenExchangeContract)
                .setGas(100000)
                .setFunction("getExchangeInfo", new sdk_1.ContractFunctionParameters());
            const result = await query.execute(this.client);
            return {
                exchangeRate: result.getInt256(0).toNumber(),
                exchangeFeeRate: result.getInt256(1).toNumber() / 10000,
                minExchange: result.getInt256(2).toNumber() / 100000000,
                distribution: {
                    treasury: result.getInt256(3).toNumber() / 10000,
                    operations: result.getInt256(4).toNumber() / 10000,
                    staking: result.getInt256(5).toNumber() / 10000,
                    fees: result.getInt256(6).toNumber() / 10000
                }
            };
        }
        catch (error) {
            this.logger.error('Failed to get exchange info from HSCS contract:', error);
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
    }
    calculateDefaultFee(verificationLevel, rarity) {
        const baseCost = 50;
        const verificationMultiplier = verificationLevel === 'premium' ? 2 : 1;
        const rarityMultiplier = rarity === 'legendary' ? 3 :
            rarity === 'epic' ? 2 : 1;
        return baseCost * verificationMultiplier * rarityMultiplier;
    }
    async getTrustTokenBalance(accountId) {
        try {
            const balanceQuery = new (require('@hashgraph/sdk').AccountBalanceQuery)()
                .setAccountId(sdk_1.AccountId.fromString(accountId));
            const balance = await balanceQuery.execute(this.client);
            const tokenBalance = balance.tokens.get(this.trustTokenId.toString());
            return tokenBalance ? tokenBalance.toNumber() : 0;
        }
        catch (error) {
            this.logger.error('Failed to get TRUST token balance:', error);
            return 0;
        }
    }
    async stakeTrustTokens(accountId, amount, duration) {
        try {
            this.logger.log(`Staking ${amount} TRUST tokens for ${duration} days...`);
            this.logger.log(`Step 1: Minting ${amount} TRUST tokens to treasury (simulating staking)...`);
            const mintTx = new sdk_1.TokenMintTransaction()
                .setTokenId(this.trustTokenId)
                .setAmount(amount)
                .setMaxTransactionFee(new sdk_1.Hbar(5));
            const mintResponse = await mintTx.execute(this.client);
            const mintReceipt = await mintResponse.getReceipt(this.client);
            this.logger.log(`✅ Staking simulation successful: ${mintResponse.transactionId.toString()}`);
            return mintResponse.transactionId.toString();
        }
        catch (error) {
            this.logger.error('Failed to stake TRUST tokens:', error);
            throw error;
        }
    }
};
exports.HscsHybridService = HscsHybridService;
exports.HscsHybridService = HscsHybridService = HscsHybridService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], HscsHybridService);
//# sourceMappingURL=hscs-hybrid.service.js.map