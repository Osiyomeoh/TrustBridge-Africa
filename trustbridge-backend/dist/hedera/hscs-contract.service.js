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
var HscsContractService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HscsContractService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sdk_1 = require("@hashgraph/sdk");
let HscsContractService = HscsContractService_1 = class HscsContractService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(HscsContractService_1.name);
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
            if (!accountId || !privateKey) {
                throw new Error('Hedera credentials are required for HSCS contract service');
            }
            this.operatorId = sdk_1.AccountId.fromString(accountId);
            try {
                this.operatorKey = sdk_1.PrivateKey.fromStringECDSA(privateKey);
                this.logger.log('Using ECDSA key format for HSCS contract service');
            }
            catch (ecdsaError) {
                this.logger.warn('ECDSA parsing failed, trying regular format:', ecdsaError.message);
                this.operatorKey = sdk_1.PrivateKey.fromString(privateKey);
                this.logger.log('Using regular key format for HSCS contract service');
            }
            this.client = sdk_1.Client.forName(network);
            this.client.setOperator(this.operatorId, this.operatorKey);
            this.loadContractAddresses();
            this.logger.log(`HSCS contract service initialized for ${network} with account ${accountId}`);
        }
        catch (error) {
            this.logger.error('Failed to initialize HSCS contract service:', error);
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
    async exchangeHbarForTrust(fromAccountId, hbarAmount, treasuryAccountId, operationsAccountId, stakingAccountId) {
        try {
            if (!this.trustTokenExchangeContract) {
                throw new Error('Exchange contract not deployed or configured');
            }
            this.logger.log(`Exchanging ${hbarAmount} HBAR for TRUST tokens via HSCS contract...`);
            const contractCall = new sdk_1.ContractExecuteTransaction()
                .setContractId(this.trustTokenExchangeContract)
                .setGas(500000)
                .setPayableAmount(sdk_1.Hbar.fromTinybars(hbarAmount * 100000000))
                .setFunction("exchangeHbarForTrust");
            const contractResponse = await contractCall.execute(this.client);
            const contractReceipt = await contractResponse.getReceipt(this.client);
            const exchangeInfo = await this.getExchangeInfo();
            const trustAmount = exchangeInfo.calculateTrustAmount(hbarAmount);
            const distribution = {
                treasury: hbarAmount * 0.6,
                operations: hbarAmount * 0.25,
                staking: hbarAmount * 0.1,
                fees: hbarAmount * 0.05
            };
            this.logger.log(`✅ Exchanged ${hbarAmount} HBAR for ${trustAmount} TRUST tokens via HSCS`);
            return {
                transactionId: contractResponse.transactionId.toString(),
                trustAmount,
                distribution
            };
        }
        catch (error) {
            this.logger.error('Failed to exchange HBAR for TRUST tokens via HSCS:', error);
            throw error;
        }
    }
    async burnTrustTokens(fromAccountId, amount, reason = "NFT_CREATION") {
        try {
            if (!this.trustTokenBurnerContract) {
                throw new Error('Burner contract not deployed or configured');
            }
            this.logger.log(`Burning ${amount} TRUST tokens via HSCS contract...`);
            const contractCall = new sdk_1.ContractExecuteTransaction()
                .setContractId(this.trustTokenBurnerContract)
                .setGas(300000)
                .setFunction("burnForNftCreation", new sdk_1.ContractFunctionParameters()
                .addUint256(amount)
                .addString(reason));
            const contractResponse = await contractCall.execute(this.client);
            const contractReceipt = await contractResponse.getReceipt(this.client);
            this.logger.log(`✅ Burned ${amount} TRUST tokens via HSCS`);
            return contractResponse.transactionId.toString();
        }
        catch (error) {
            this.logger.error('Failed to burn TRUST tokens via HSCS:', error);
            throw error;
        }
    }
    async calculateNftCreationFee(verificationLevel, rarity) {
        try {
            if (!this.trustTokenBurnerContract) {
                throw new Error('Burner contract not deployed or configured');
            }
            const contractCall = new sdk_1.ContractCallQuery()
                .setContractId(this.trustTokenBurnerContract)
                .setGas(100000)
                .setFunction("calculateNftCreationFee", new sdk_1.ContractFunctionParameters()
                .addString(verificationLevel)
                .addString(rarity));
            const contractResponse = await contractCall.execute(this.client);
            const fee = contractResponse.getUint256(0);
            return Number(fee);
        }
        catch (error) {
            this.logger.error('Failed to calculate NFT creation fee via HSCS:', error);
            return this.getDefaultFee(verificationLevel, rarity);
        }
    }
    async getExchangeInfo() {
        try {
            if (!this.trustTokenExchangeContract) {
                return this.getDefaultExchangeInfo();
            }
            const contractCall = new sdk_1.ContractCallQuery()
                .setContractId(this.trustTokenExchangeContract)
                .setGas(100000)
                .setFunction("getExchangeStats");
            const contractResponse = await contractCall.execute(this.client);
            return {
                totalHbarReceived: Number(contractResponse.getUint256(0)),
                totalTrustMinted: Number(contractResponse.getUint256(1)),
                totalExchanges: Number(contractResponse.getUint256(2)),
                contractBalance: Number(contractResponse.getUint256(3)),
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
        catch (error) {
            this.logger.error('Failed to get exchange info via HSCS:', error);
            return this.getDefaultExchangeInfo();
        }
    }
    async stakeTrustTokens(fromAccountId, amount, duration) {
        try {
            if (!this.trustTokenStakingContract) {
                throw new Error('Staking contract not deployed or configured');
            }
            this.logger.log(`Staking ${amount} TRUST tokens for ${duration} seconds via HSCS contract...`);
            const contractCall = new sdk_1.ContractExecuteTransaction()
                .setContractId(this.trustTokenStakingContract)
                .setGas(400000)
                .setFunction("stake", new sdk_1.ContractFunctionParameters()
                .addUint256(amount)
                .addUint256(duration));
            const contractResponse = await contractCall.execute(this.client);
            const contractReceipt = await contractResponse.getReceipt(this.client);
            this.logger.log(`✅ Staked ${amount} TRUST tokens via HSCS`);
            return contractResponse.transactionId.toString();
        }
        catch (error) {
            this.logger.error('Failed to stake TRUST tokens via HSCS:', error);
            throw error;
        }
    }
    getDefaultExchangeInfo() {
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
    getDefaultFee(verificationLevel, rarity) {
        const baseFee = 50;
        const verificationMultiplier = verificationLevel === 'premium' ? 2 : 1;
        const rarityMultiplier = rarity === 'legendary' ? 3 :
            rarity === 'epic' ? 2 : 1;
        return baseFee * verificationMultiplier * rarityMultiplier;
    }
    setContractAddresses(exchangeContractId, burnerContractId, stakingContractId) {
        this.trustTokenExchangeContract = sdk_1.ContractId.fromString(exchangeContractId);
        this.trustTokenBurnerContract = sdk_1.ContractId.fromString(burnerContractId);
        this.trustTokenStakingContract = sdk_1.ContractId.fromString(stakingContractId);
        this.logger.log('Contract addresses updated:', {
            exchange: exchangeContractId,
            burner: burnerContractId,
            staking: stakingContractId
        });
    }
};
exports.HscsContractService = HscsContractService;
exports.HscsContractService = HscsContractService = HscsContractService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], HscsContractService);
//# sourceMappingURL=hscs-contract.service.js.map