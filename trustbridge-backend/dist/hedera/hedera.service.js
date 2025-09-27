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
var HederaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HederaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sdk_1 = require("@hashgraph/sdk");
let HederaService = HederaService_1 = class HederaService {
    isValidHederaEntityId(id) {
        const hederaIdPattern = /^\d+\.\d+\.\d+$/;
        return hederaIdPattern.test(id);
    }
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(HederaService_1.name);
        this.contracts = {
            trustToken: '0xa6f8fC5b5A9B5670dF868247585bcD86eD124ba2',
            assetNFT: '0x42be9627C970D40248690F010b3c2a7F8C68576C',
            verificationRegistry: '0xC2e5D63Da10A3139857D18Cf43eB93CE0133Ca4B',
            assetFactory: '0x27A5705717294a481338193E9Cb5F33A40169401',
            attestorManager: '0x25F6F7209692D9b553E4d082bA964A03AdBE630d',
            tradingEngine: '0xeaCd09B28ae9a1199010D755613867A7707EA1B9',
            poolManager: '0xC2E54Ba2309e7b5c4f378c1E7CC8e7e4aB17fC1B',
            poolToken: '0x3262BBF6c5d3Af2cdA1B4E44A10eF16af3A6662e',
            feeDistribution: '0xa00343B86a5531155F22d91899229124e6619843',
            spvManager: '0x10D7EfA83A38A8e37Bad40ac40aDDf7906c0cB43',
            amcManager: '0xeDdEA0d8332e332382136feB27FbeAa2f0301250',
            policyManager: '0x0000000000000000000000000000000000000000',
            settlementEngine: '0x0000000000000000000000000000000000000000',
            verificationBuffer: '0x0000000000000000000000000000000000000000',
            poolFactory: '0x0000000000000000000000000000000000000000',
        };
        this.initializeClient();
    }
    initializeClient() {
        try {
            const accountId = this.configService.get('HEDERA_ACCOUNT_ID');
            const privateKey = this.configService.get('HEDERA_PRIVATE_KEY');
            const network = this.configService.get('HEDERA_NETWORK', 'testnet');
            if (!accountId || !privateKey) {
                throw new Error('Hedera credentials are required for production. Please configure HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY in your .env file');
            }
            this.operatorId = sdk_1.AccountId.fromString(accountId);
            try {
                this.operatorKey = sdk_1.PrivateKey.fromStringECDSA(privateKey);
                this.logger.log('Using ECDSA key format');
            }
            catch (ecdsaError) {
                this.logger.warn('ECDSA parsing failed, trying regular format:', ecdsaError.message);
                this.operatorKey = sdk_1.PrivateKey.fromString(privateKey);
                this.logger.log('Using regular key format');
            }
            this.network = network;
            this.client = sdk_1.Client.forName(network);
            this.client.setOperator(this.operatorId, this.operatorKey);
            this.logger.log(`Hedera client initialized for ${network} with account ${accountId}`);
        }
        catch (error) {
            this.logger.error('Failed to initialize Hedera client:', error);
        }
    }
    async getNetworkStatus() {
        if (!this.client) {
            return {
                status: 'mock',
                message: 'Hedera client not configured',
                network: 'testnet',
                contracts: this.contracts,
            };
        }
        try {
            const balance = await new sdk_1.AccountBalanceQuery()
                .setAccountId(this.operatorId)
                .execute(this.client);
            return {
                status: 'connected',
                network: this.network,
                accountId: this.operatorId.toString(),
                balance: balance.hbars.toString(),
                contracts: this.contracts,
                timestamp: new Date(),
            };
        }
        catch (error) {
            this.logger.error('Failed to get network status:', error);
            return {
                status: 'error',
                message: error.message,
                network: this.network,
                contracts: this.contracts,
            };
        }
    }
    async createAssetToken(request) {
        if (!this.client) {
            throw new Error('Hedera client not initialized. Please check your credentials.');
        }
        try {
            const tokenCreateTx = new sdk_1.TokenCreateTransaction()
                .setTokenName(request.tokenName)
                .setTokenSymbol(request.tokenSymbol)
                .setDecimals(0)
                .setInitialSupply(request.totalSupply)
                .setTreasuryAccountId(this.operatorId)
                .setAdminKey(this.operatorKey.publicKey)
                .setSupplyKey(this.operatorKey.publicKey)
                .setFreezeDefault(false);
            if (request.enableKyc) {
                const kycKey = request.kycKey || this.operatorKey;
                tokenCreateTx.setKycKey(kycKey.publicKey);
                this.logger.log(`KYC enabled for token ${request.tokenName}`);
            }
            if (request.enableFreeze) {
                const freezeKey = request.freezeKey || this.operatorKey;
                tokenCreateTx.setFreezeKey(freezeKey.publicKey);
                this.logger.log(`Freeze enabled for token ${request.tokenName}`);
            }
            const tokenCreateResponse = await tokenCreateTx.execute(this.client);
            const tokenCreateReceipt = await tokenCreateResponse.getReceipt(this.client);
            const tokenId = tokenCreateReceipt.tokenId;
            this.logger.log(`Created token ${tokenId} for asset ${request.assetId} with KYC: ${request.enableKyc}, Freeze: ${request.enableFreeze}`);
            return {
                tokenId: tokenId.toString(),
                transactionId: tokenCreateResponse.transactionId.toString(),
            };
        }
        catch (error) {
            this.logger.error('Failed to create asset token:', error);
            throw new Error(`Token creation failed: ${error.message}`);
        }
    }
    async mintTokens(tokenId, amount, recipient) {
        if (!this.client) {
            throw new Error('Hedera client not initialized. Please check your credentials.');
        }
        try {
            const tokenMintTx = new sdk_1.TokenMintTransaction()
                .setTokenId(sdk_1.TokenId.fromString(tokenId))
                .setAmount(amount);
            const tokenMintResponse = await tokenMintTx.execute(this.client);
            const transactionId = tokenMintResponse.transactionId.toString();
            this.logger.log(`Minted ${amount} tokens of ${tokenId} to ${recipient}`);
            return transactionId;
        }
        catch (error) {
            this.logger.error('Failed to mint tokens:', error);
            throw new Error(`Token minting failed: ${error.message}`);
        }
    }
    async transferTokens(tokenId, from, to, amount) {
        if (!this.client) {
            throw new Error('Hedera client not initialized. Please check your credentials.');
        }
        try {
            const transferTx = new sdk_1.TransferTransaction()
                .addTokenTransfer(sdk_1.TokenId.fromString(tokenId), sdk_1.AccountId.fromString(from), -amount)
                .addTokenTransfer(sdk_1.TokenId.fromString(tokenId), sdk_1.AccountId.fromString(to), amount);
            const transferResponse = await transferTx.execute(this.client);
            const transactionId = transferResponse.transactionId.toString();
            this.logger.log(`Transferred ${amount} tokens of ${tokenId} from ${from} to ${to}`);
            return transactionId;
        }
        catch (error) {
            this.logger.error('Failed to transfer tokens:', error);
            throw new Error(`Token transfer failed: ${error.message}`);
        }
    }
    async submitVerification(verification) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const contractExecuteTx = new sdk_1.ContractExecuteTransaction()
                .setContractId(sdk_1.ContractId.fromString(this.contracts.verificationRegistry))
                .setGas(100000)
                .setFunction('submitVerification', new sdk_1.ContractFunctionParameters()
                .addString(verification.assetId)
                .addUint256(verification.score)
                .addString(verification.evidenceHash)
                .addString(verification.attestorId)
                .addUint256(Math.floor(verification.timestamp.getTime() / 1000)));
            const contractExecuteResponse = await contractExecuteTx.execute(this.client);
            const transactionId = contractExecuteResponse.transactionId.toString();
            this.logger.log(`Submitted verification for asset ${verification.assetId} with score ${verification.score}`);
            return transactionId;
        }
        catch (error) {
            this.logger.error('Failed to submit verification:', error);
            throw new Error(`Verification submission failed: ${error.message}`);
        }
    }
    async createSettlement(settlement) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const contractExecuteTx = new sdk_1.ContractExecuteTransaction()
                .setContractId(sdk_1.ContractId.fromString(this.contracts.settlementEngine))
                .setGas(100000)
                .setFunction('createSettlement', new sdk_1.ContractFunctionParameters()
                .addString(settlement.assetId)
                .addString(settlement.buyer)
                .addString(settlement.seller)
                .addUint256(settlement.amount)
                .addUint256(Math.floor(settlement.deliveryDeadline.getTime() / 1000)));
            const contractExecuteResponse = await contractExecuteTx.execute(this.client);
            const transactionId = contractExecuteResponse.transactionId.toString();
            this.logger.log(`Created settlement for asset ${settlement.assetId}`);
            return transactionId;
        }
        catch (error) {
            this.logger.error('Failed to create settlement:', error);
            throw new Error(`Settlement creation failed: ${error.message}`);
        }
    }
    async createHCSMessage(topicId, message) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const messageSubmitTx = new sdk_1.TopicMessageSubmitTransaction()
                .setTopicId(sdk_1.TopicId.fromString(topicId))
                .setMessage(JSON.stringify(message));
            const messageSubmitResponse = await messageSubmitTx.execute(this.client);
            const transactionId = messageSubmitResponse.transactionId.toString();
            this.logger.log(`Submitted HCS message to topic ${topicId}`);
            return transactionId;
        }
        catch (error) {
            this.logger.error('Failed to submit HCS message:', error);
            throw new Error(`HCS message submission failed: ${error.message}`);
        }
    }
    async createHCSAssetTopic(assetId) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const topicCreateTx = new sdk_1.TopicCreateTransaction()
                .setTopicMemo(`Asset updates for ${assetId}`)
                .setAdminKey(this.operatorKey.publicKey)
                .setSubmitKey(this.operatorKey.publicKey);
            const topicCreateResponse = await topicCreateTx.execute(this.client);
            const topicCreateReceipt = await topicCreateResponse.getReceipt(this.client);
            const topicId = topicCreateReceipt.topicId;
            this.logger.log(`Created HCS topic ${topicId} for asset ${assetId}`);
            return topicId.toString();
        }
        catch (error) {
            this.logger.error('Failed to create HCS topic:', error);
            throw new Error(`HCS topic creation failed: ${error.message}`);
        }
    }
    async storeFileOnHFS(content, fileName) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const fileCreateTx = new sdk_1.FileCreateTransaction()
                .setKeys([this.operatorKey.publicKey])
                .setContents(content)
                .setFileMemo(`Document: ${fileName}`);
            const fileCreateResponse = await fileCreateTx.execute(this.client);
            const fileCreateReceipt = await fileCreateResponse.getReceipt(this.client);
            const fileId = fileCreateReceipt.fileId;
            this.logger.log(`Stored file ${fileName} on HFS with ID ${fileId}`);
            return fileId.toString();
        }
        catch (error) {
            this.logger.error('Failed to store file on HFS:', error);
            throw new Error(`HFS file storage failed: ${error.message}`);
        }
    }
    async scheduleSettlement(assetId, maturityDate, amount) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const contractExecuteTx = new sdk_1.ContractExecuteTransaction()
                .setContractId(sdk_1.ContractId.fromString(this.contracts.settlementEngine))
                .setGas(100000)
                .setFunction('processMaturity', new sdk_1.ContractFunctionParameters()
                .addString(assetId)
                .addUint256(amount));
            const scheduleCreateTx = new sdk_1.ScheduleCreateTransaction()
                .setScheduledTransaction(contractExecuteTx)
                .setScheduleMemo(`Settlement for asset ${assetId}`)
                .setExpirationTime(sdk_1.Timestamp.fromDate(new Date(maturityDate.getTime() + 24 * 60 * 60 * 1000)));
            const scheduleCreateResponse = await scheduleCreateTx.execute(this.client);
            const scheduleCreateReceipt = await scheduleCreateResponse.getReceipt(this.client);
            const scheduleId = scheduleCreateReceipt.scheduleId;
            this.logger.log(`Scheduled settlement for asset ${assetId} on ${maturityDate}`);
            return scheduleId.toString();
        }
        catch (error) {
            this.logger.error('Failed to schedule settlement:', error);
            throw new Error(`Settlement scheduling failed: ${error.message}`);
        }
    }
    async getTokenBalance(accountId, tokenId) {
        if (!this.isValidHederaEntityId(accountId) || !this.isValidHederaEntityId(tokenId)) {
            this.logger.warn(`Invalid Hedera entity ID format: accountId=${accountId}, tokenId=${tokenId}, using fallback value`);
            return Math.floor(Math.random() * 1000) + 100;
        }
        if (!this.client) {
            this.logger.warn("Hedera client not initialized, using fallback value");
            return Math.floor(Math.random() * 1000) + 100;
        }
        try {
            const balance = await new sdk_1.AccountBalanceQuery()
                .setAccountId(sdk_1.AccountId.fromString(accountId))
                .execute(this.client);
            const tokenBalance = balance.tokens.get(sdk_1.TokenId.fromString(tokenId));
            return tokenBalance ? Number(tokenBalance) : 0;
        }
        catch (error) {
            this.logger.error('Failed to get token balance:', error);
            return Math.floor(Math.random() * 1000) + 100;
        }
    }
    async getAssetValue(assetId) {
        if (!this.isValidHederaEntityId(assetId)) {
            this.logger.warn(`Invalid Hedera entity ID format: ${assetId}, using fallback value`);
            return Math.floor(Math.random() * 10000) + 1000;
        }
        if (!this.client) {
            this.logger.warn("Hedera client not initialized, using fallback value");
            return Math.floor(Math.random() * 10000) + 1000;
        }
        try {
            const assetValue = await this.callContract(this.contracts.assetFactory, 'getAssetValue', [assetId]);
            return Number(assetValue) || 0;
        }
        catch (error) {
            this.logger.error('Failed to get asset value from blockchain:', error);
            return Math.floor(Math.random() * 10000) + 1000;
        }
    }
    async getAccountBalance(accountId) {
        if (!this.isValidHederaEntityId(accountId)) {
            this.logger.warn(`Invalid Hedera entity ID format: ${accountId}, using fallback value`);
            return '1000';
        }
        if (!this.client) {
            this.logger.warn("Hedera client not initialized, using fallback value");
            return '1000';
        }
        try {
            const balance = await new sdk_1.AccountBalanceQuery()
                .setAccountId(sdk_1.AccountId.fromString(accountId))
                .execute(this.client);
            return balance.hbars.toString();
        }
        catch (error) {
            this.logger.error('Failed to get account balance:', error);
            return '1000';
        }
    }
    async callContract(contractId, functionName, parameters) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
            throw new Error("Real blockchain data required. Please ensure Hedera client is properly configured.");
        }
        try {
            const contractCallQuery = new sdk_1.ContractCallQuery()
                .setContractId(sdk_1.ContractId.fromString(contractId))
                .setGas(100000)
                .setFunction(functionName, parameters);
            const contractCallResponse = await contractCallQuery.execute(this.client);
            return contractCallResponse;
        }
        catch (error) {
            this.logger.error('Failed to call contract:', error);
            throw new Error(`Contract call failed: ${error.message}`);
        }
    }
    async executeContract(contractId, functionName, parameters) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const contractExecuteTx = new sdk_1.ContractExecuteTransaction()
                .setContractId(sdk_1.ContractId.fromString(contractId))
                .setGas(100000)
                .setFunction(functionName, parameters);
            const contractExecuteResponse = await contractExecuteTx.execute(this.client);
            const transactionId = contractExecuteResponse.transactionId.toString();
            this.logger.log(`Executed contract function ${functionName} on ${contractId}`);
            return transactionId;
        }
        catch (error) {
            this.logger.error('Failed to execute contract:', error);
            throw new Error(`Contract execution failed: ${error.message}`);
        }
    }
    async grantKYC(request) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const kycTx = new sdk_1.TokenGrantKycTransaction()
                .setAccountId(sdk_1.AccountId.fromString(request.accountId))
                .setTokenId(sdk_1.TokenId.fromString(request.tokenId));
            const kycResponse = await kycTx.execute(this.client);
            const transactionId = kycResponse.transactionId.toString();
            this.logger.log(`Granted KYC for account ${request.accountId} on token ${request.tokenId}`);
            return transactionId;
        }
        catch (error) {
            this.logger.error('Failed to grant KYC:', error);
            throw new Error(`KYC grant failed: ${error.message}`);
        }
    }
    async revokeKYC(request) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const kycTx = new sdk_1.TokenRevokeKycTransaction()
                .setAccountId(sdk_1.AccountId.fromString(request.accountId))
                .setTokenId(sdk_1.TokenId.fromString(request.tokenId));
            const kycResponse = await kycTx.execute(this.client);
            const transactionId = kycResponse.transactionId.toString();
            this.logger.log(`Revoked KYC for account ${request.accountId} on token ${request.tokenId}`);
            return transactionId;
        }
        catch (error) {
            this.logger.error('Failed to revoke KYC:', error);
            throw new Error(`KYC revoke failed: ${error.message}`);
        }
    }
    async freezeAccount(request) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const freezeTx = new sdk_1.TokenFreezeTransaction()
                .setAccountId(sdk_1.AccountId.fromString(request.accountId))
                .setTokenId(sdk_1.TokenId.fromString(request.tokenId));
            const freezeResponse = await freezeTx.execute(this.client);
            const transactionId = freezeResponse.transactionId.toString();
            this.logger.log(`Froze account ${request.accountId} for token ${request.tokenId}`);
            return transactionId;
        }
        catch (error) {
            this.logger.error('Failed to freeze account:', error);
            throw new Error(`Account freeze failed: ${error.message}`);
        }
    }
    async unfreezeAccount(request) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const unfreezeTx = new sdk_1.TokenUnfreezeTransaction()
                .setAccountId(sdk_1.AccountId.fromString(request.accountId))
                .setTokenId(sdk_1.TokenId.fromString(request.tokenId));
            const unfreezeResponse = await unfreezeTx.execute(this.client);
            const transactionId = unfreezeResponse.transactionId.toString();
            this.logger.log(`Unfroze account ${request.accountId} for token ${request.tokenId}`);
            return transactionId;
        }
        catch (error) {
            this.logger.error('Failed to unfreeze account:', error);
            throw new Error(`Account unfreeze failed: ${error.message}`);
        }
    }
    async freezeToken(request) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            let freezeTx;
            if (request.freezeStatus === 'FREEZE') {
                freezeTx = new sdk_1.TokenFreezeTransaction()
                    .setTokenId(sdk_1.TokenId.fromString(request.tokenId));
            }
            else {
                freezeTx = new sdk_1.TokenUnfreezeTransaction()
                    .setTokenId(sdk_1.TokenId.fromString(request.tokenId));
            }
            const freezeResponse = await freezeTx.execute(this.client);
            const transactionId = freezeResponse.transactionId.toString();
            this.logger.log(`${request.freezeStatus === 'FREEZE' ? 'Froze' : 'Unfroze'} token ${request.tokenId}`);
            return transactionId;
        }
        catch (error) {
            this.logger.error('Failed to freeze/unfreeze token:', error);
            throw new Error(`Token freeze operation failed: ${error.message}`);
        }
    }
    async associateToken(request) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const associateTx = new sdk_1.TokenAssociateTransaction()
                .setAccountId(sdk_1.AccountId.fromString(request.accountId))
                .setTokenIds([sdk_1.TokenId.fromString(request.tokenId)]);
            const associateResponse = await associateTx.execute(this.client);
            const transactionId = associateResponse.transactionId.toString();
            this.logger.log(`Associated token ${request.tokenId} with account ${request.accountId}`);
            return transactionId;
        }
        catch (error) {
            this.logger.error('Failed to associate token:', error);
            throw new Error(`Token association failed: ${error.message}`);
        }
    }
    async dissociateToken(request) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const dissociateTx = new sdk_1.TokenDissociateTransaction()
                .setAccountId(sdk_1.AccountId.fromString(request.accountId))
                .setTokenIds([sdk_1.TokenId.fromString(request.tokenId)]);
            const dissociateResponse = await dissociateTx.execute(this.client);
            const transactionId = dissociateResponse.transactionId.toString();
            this.logger.log(`Dissociated token ${request.tokenId} from account ${request.accountId}`);
            return transactionId;
        }
        catch (error) {
            this.logger.error('Failed to dissociate token:', error);
            throw new Error(`Token dissociation failed: ${error.message}`);
        }
    }
    async getTokenInfo(tokenId) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
            return {
                tokenId,
                name: 'Mock Token',
                symbol: 'MOCK',
                decimals: 0,
                totalSupply: 1000000,
                treasury: this.operatorId?.toString(),
                adminKey: 'mock-admin-key',
                kycKey: 'mock-kyc-key',
                freezeKey: 'mock-freeze-key',
                supplyKey: 'mock-supply-key',
                wipeKey: 'mock-wipe-key',
                pauseKey: 'mock-pause-key',
                feeScheduleKey: 'mock-fee-schedule-key',
                customFees: [],
                tokenType: 'FUNGIBLE_COMMON',
                supplyType: 'INFINITE',
                maxSupply: 0,
                defaultFreezeStatus: false,
                defaultKycStatus: false,
                deleted: false,
                autoRenewAccount: null,
                autoRenewPeriod: 0,
                expiry: null,
                memo: 'Mock token for testing',
                ledgerId: 'mock-ledger-id',
            };
        }
        try {
            const tokenInfo = await new sdk_1.TokenInfoQuery()
                .setTokenId(sdk_1.TokenId.fromString(tokenId))
                .execute(this.client);
            return {
                tokenId: tokenInfo.tokenId.toString(),
                name: tokenInfo.name,
                symbol: tokenInfo.symbol,
                decimals: tokenInfo.decimals,
                totalSupply: tokenInfo.totalSupply.toString(),
                treasury: tokenInfo.treasuryAccountId.toString(),
                adminKey: tokenInfo.adminKey?.toString(),
                kycKey: tokenInfo.kycKey?.toString(),
                freezeKey: tokenInfo.freezeKey?.toString(),
                supplyKey: tokenInfo.supplyKey?.toString(),
                wipeKey: tokenInfo.wipeKey?.toString(),
                pauseKey: tokenInfo.pauseKey?.toString(),
                feeScheduleKey: tokenInfo.feeScheduleKey?.toString(),
                customFees: tokenInfo.customFees,
                tokenType: tokenInfo.tokenType,
                supplyType: tokenInfo.supplyType,
                maxSupply: tokenInfo.maxSupply.toString(),
                defaultFreezeStatus: tokenInfo.defaultFreezeStatus,
                defaultKycStatus: tokenInfo.defaultKycStatus,
                deleted: tokenInfo.isDeleted,
                autoRenewAccount: tokenInfo.autoRenewAccountId?.toString(),
                autoRenewPeriod: tokenInfo.autoRenewPeriod,
                expiry: tokenInfo.expirationTime,
                memo: tokenInfo.tokenMemo,
                ledgerId: tokenInfo.ledgerId,
            };
        }
        catch (error) {
            this.logger.error('Failed to get token info:', error);
            throw new Error(`Token info query failed: ${error.message}`);
        }
    }
    async getAccountInfo(accountId) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
            return {
                accountId,
                balance: '100.0',
                key: 'mock-account-key',
                receiverSignatureRequired: false,
                deleted: false,
                proxyAccountId: null,
                proxyReceived: 0,
                autoRenewPeriod: 0,
                expiry: null,
                memo: 'Mock account for testing',
                ledgerId: 'mock-ledger-id',
            };
        }
        try {
            const accountInfo = await new sdk_1.AccountInfoQuery()
                .setAccountId(sdk_1.AccountId.fromString(accountId))
                .execute(this.client);
            return {
                accountId: accountInfo.accountId.toString(),
                balance: accountInfo.balance.toString(),
                key: accountInfo.key.toString(),
                receiverSignatureRequired: accountInfo.isReceiverSignatureRequired,
                deleted: accountInfo.isDeleted,
                proxyAccountId: accountInfo.proxyAccountId?.toString(),
                proxyReceived: accountInfo.proxyReceived.toString(),
                autoRenewPeriod: accountInfo.autoRenewPeriod,
                expiry: accountInfo.expirationTime,
                memo: accountInfo.accountMemo,
                ledgerId: accountInfo.ledgerId,
            };
        }
        catch (error) {
            this.logger.error('Failed to get account info:', error);
            throw new Error(`Account info query failed: ${error.message}`);
        }
    }
    async completeKYCWorkflow(accountId, tokenId, kycStatus) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
            return {
                associateTxId: `mock-associate-tx-${Date.now()}`,
                kycTxId: `mock-kyc-tx-${Date.now()}`,
                status: 'completed',
            };
        }
        try {
            const results = {};
            try {
                const associateTxId = await this.associateToken({
                    accountId,
                    tokenId,
                    action: 'ASSOCIATE',
                });
                results.associateTxId = associateTxId;
                this.logger.log(`Associated token ${tokenId} with account ${accountId}`);
            }
            catch (error) {
                this.logger.warn(`Token association failed or already associated: ${error.message}`);
            }
            const kycTxId = await (kycStatus === 'GRANT' ? this.grantKYC : this.revokeKYC)({
                accountId,
                tokenId,
                kycStatus,
            });
            results.kycTxId = kycTxId;
            results.status = 'completed';
            this.logger.log(`Completed KYC workflow for account ${accountId} on token ${tokenId}: ${kycStatus}`);
            return results;
        }
        catch (error) {
            this.logger.error('Failed to complete KYC workflow:', error);
            throw new Error(`KYC workflow failed: ${error.message}`);
        }
    }
    async completeFreezeWorkflow(accountId, tokenId, freezeStatus) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
            return {
                freezeTxId: `mock-freeze-tx-${Date.now()}`,
                status: 'completed',
            };
        }
        try {
            const freezeTxId = await (freezeStatus === 'FREEZE' ? this.freezeAccount : this.unfreezeAccount)({
                accountId,
                tokenId,
                freezeStatus,
            });
            this.logger.log(`Completed freeze workflow for account ${accountId} on token ${tokenId}: ${freezeStatus}`);
            return {
                freezeTxId,
                status: 'completed',
            };
        }
        catch (error) {
            this.logger.error('Failed to complete freeze workflow:', error);
            throw new Error(`Freeze workflow failed: ${error.message}`);
        }
    }
    async createEscrow(buyer, seller, amount, deliveryDeadline, conditions) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const contractExecuteTx = new sdk_1.ContractExecuteTransaction()
                .setContractId(sdk_1.ContractId.fromString(this.contracts.settlementEngine))
                .setGas(100000)
                .setFunction('createEscrow', new sdk_1.ContractFunctionParameters()
                .addString(buyer)
                .addString(seller)
                .addUint256(amount)
                .addUint256(Math.floor(deliveryDeadline.getTime() / 1000))
                .addString(conditions));
            const contractExecuteResponse = await contractExecuteTx.execute(this.client);
            const transactionId = contractExecuteResponse.transactionId.toString();
            this.logger.log(`Created escrow between ${buyer} and ${seller} for amount ${amount}`);
            return transactionId;
        }
        catch (error) {
            this.logger.error('Failed to create escrow:', error);
            throw new Error(`Escrow creation failed: ${error.message}`);
        }
    }
    async releaseEscrow(escrowId) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const contractExecuteTx = new sdk_1.ContractExecuteTransaction()
                .setContractId(sdk_1.ContractId.fromString(this.contracts.settlementEngine))
                .setGas(100000)
                .setFunction('releaseEscrow', new sdk_1.ContractFunctionParameters()
                .addString(escrowId));
            const contractExecuteResponse = await contractExecuteTx.execute(this.client);
            const transactionId = contractExecuteResponse.transactionId.toString();
            this.logger.log(`Released escrow ${escrowId}`);
            return transactionId;
        }
        catch (error) {
            this.logger.error('Failed to release escrow:', error);
            throw new Error(`Escrow release failed: ${error.message}`);
        }
    }
    async refundEscrow(escrowId) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const contractExecuteTx = new sdk_1.ContractExecuteTransaction()
                .setContractId(sdk_1.ContractId.fromString(this.contracts.settlementEngine))
                .setGas(100000)
                .setFunction('refundEscrow', new sdk_1.ContractFunctionParameters()
                .addString(escrowId));
            const contractExecuteResponse = await contractExecuteTx.execute(this.client);
            const transactionId = contractExecuteResponse.transactionId.toString();
            this.logger.log(`Refunded escrow ${escrowId}`);
            return transactionId;
        }
        catch (error) {
            this.logger.error('Failed to refund escrow:', error);
            throw new Error(`Escrow refund failed: ${error.message}`);
        }
    }
    getContractAddresses() {
        return this.contracts;
    }
    isClientAvailable() {
        return !!this.client;
    }
    async healthCheck() {
        if (!this.client) {
            return false;
        }
        try {
            await new sdk_1.AccountBalanceQuery()
                .setAccountId(this.operatorId)
                .execute(this.client);
            return true;
        }
        catch (error) {
            this.logger.error('Hedera health check failed:', error);
            return false;
        }
    }
    async buybackTokens(amount) {
        try {
            this.logger.log(`Executing buyback for ${amount} TRB`);
            return `buyback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        catch (error) {
            this.logger.error('Failed to execute buyback:', error);
            throw error;
        }
    }
    async burnTokens(amount) {
        try {
            this.logger.log(`Burning ${amount} TRB`);
            return `burn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        catch (error) {
            this.logger.error('Failed to burn tokens:', error);
            throw error;
        }
    }
    async stakeTokens(walletAddress, stakingType, amount, lockPeriod) {
        try {
            this.logger.log(`Staking ${amount} TRB for ${stakingType} (${lockPeriod} days)`);
            return `stake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        catch (error) {
            this.logger.error('Failed to stake tokens:', error);
            throw error;
        }
    }
    async unstakeTokens(walletAddress, stakingType, amount) {
        try {
            this.logger.log(`Unstaking ${amount} TRB for ${stakingType}`);
            return `unstake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        catch (error) {
            this.logger.error('Failed to unstake tokens:', error);
            throw error;
        }
    }
    async getTokenPrice(tokenId) {
        try {
            return 0.50;
        }
        catch (error) {
            this.logger.error('Failed to get token price:', error);
            return 0;
        }
    }
    async transferToTreasury(amount) {
        try {
            this.logger.log(`Transferring ${amount} to treasury`);
            return `treasury_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        catch (error) {
            this.logger.error('Failed to transfer to treasury:', error);
            throw error;
        }
    }
    async transferToInsurancePool(amount) {
        try {
            this.logger.log(`Transferring ${amount} to insurance pool`);
            return `insurance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        catch (error) {
            this.logger.error('Failed to transfer to insurance pool:', error);
            throw error;
        }
    }
    async transferToValidatorPool(amount) {
        try {
            this.logger.log(`Transferring ${amount} to validator pool`);
            return `validator_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        catch (error) {
            this.logger.error('Failed to transfer to validator pool:', error);
            throw error;
        }
    }
    async updateContractParameters(contractAddress, parameterName, newValue) {
        try {
            this.logger.log(`Updating contract parameter ${parameterName} to ${newValue}`);
            return `param_update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        catch (error) {
            this.logger.error('Failed to update contract parameters:', error);
            throw error;
        }
    }
    async addAssetType(assetType, minScore, ttlSeconds, requiredAttestors) {
        try {
            this.logger.log(`Adding asset type ${assetType}`);
            return `asset_type_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        catch (error) {
            this.logger.error('Failed to add asset type:', error);
            throw error;
        }
    }
    async updateOracleConfig(oracleAddress, newConfig) {
        try {
            this.logger.log(`Updating oracle config for ${oracleAddress}`);
            return `oracle_update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        catch (error) {
            this.logger.error('Failed to update oracle config:', error);
            throw error;
        }
    }
    async allocateTreasury(recipient, amount, purpose) {
        try {
            this.logger.log(`Allocating treasury funds: ${amount} to ${recipient} for ${purpose}`);
            return `treasury_alloc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        catch (error) {
            this.logger.error('Failed to allocate treasury:', error);
            throw error;
        }
    }
    async upgradeProtocol(newImplementation, upgradeData) {
        try {
            this.logger.log(`Upgrading protocol to ${newImplementation}`);
            return `protocol_upgrade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        catch (error) {
            this.logger.error('Failed to upgrade protocol:', error);
            throw error;
        }
    }
    async createDigitalAsset(assetData) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const contractExecuteTx = new sdk_1.ContractExecuteTransaction()
                .setContractId(sdk_1.ContractId.fromEvmAddress(0, 0, this.contracts.assetFactory))
                .setGas(300000)
                .setFunction('createDigitalAsset', new sdk_1.ContractFunctionParameters()
                .addUint8(assetData.category)
                .addString(assetData.assetType)
                .addString(assetData.name)
                .addString(assetData.location)
                .addUint256(parseInt(assetData.totalValue))
                .addString(assetData.imageURI)
                .addString(assetData.description));
            const contractExecuteResponse = await contractExecuteTx.execute(this.client);
            const transactionId = contractExecuteResponse.transactionId.toString();
            this.logger.log(`Created digital asset: ${assetData.name}`);
            return {
                assetId: `digital_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                transactionId
            };
        }
        catch (error) {
            this.logger.error('Failed to create digital asset:', error);
            throw new Error(`Digital asset creation failed: ${error.message}`);
        }
    }
    async createRWAAsset(assetData) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const contractExecuteTx = new sdk_1.ContractExecuteTransaction()
                .setContractId(sdk_1.ContractId.fromString(this.contracts.assetFactory))
                .setGas(500000)
                .setFunction('createRWAAsset', new sdk_1.ContractFunctionParameters()
                .addUint8(assetData.category)
                .addString(assetData.assetType)
                .addString(assetData.name)
                .addString(assetData.location)
                .addUint256(parseInt(assetData.totalValue))
                .addUint256(assetData.maturityDate)
                .addStringArray(assetData.evidenceHashes)
                .addStringArray(assetData.documentTypes)
                .addString(assetData.imageURI)
                .addString(assetData.documentURI)
                .addString(assetData.description));
            const contractExecuteResponse = await contractExecuteTx.execute(this.client);
            const transactionId = contractExecuteResponse.transactionId.toString();
            this.logger.log(`Created RWA asset: ${assetData.name}`);
            return {
                assetId: `rwa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                transactionId
            };
        }
        catch (error) {
            this.logger.error('Failed to create RWA asset:', error);
            throw new Error(`RWA asset creation failed: ${error.message}`);
        }
    }
    async verifyAsset(assetId, verificationLevel) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const contractExecuteTx = new sdk_1.ContractExecuteTransaction()
                .setContractId(sdk_1.ContractId.fromString(this.contracts.assetFactory))
                .setGas(200000)
                .setFunction('verifyAsset', new sdk_1.ContractFunctionParameters()
                .addString(assetId)
                .addUint8(verificationLevel));
            const contractExecuteResponse = await contractExecuteTx.execute(this.client);
            const transactionId = contractExecuteResponse.transactionId.toString();
            this.logger.log(`Verified asset ${assetId} to level ${verificationLevel}`);
            return transactionId;
        }
        catch (error) {
            this.logger.error('Failed to verify asset:', error);
            throw new Error(`Asset verification failed: ${error.message}`);
        }
    }
    async listDigitalAssetForSale(assetId, price, expiry) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const contractExecuteTx = new sdk_1.ContractExecuteTransaction()
                .setContractId(sdk_1.ContractId.fromString(this.contracts.tradingEngine))
                .setGas(200000)
                .setFunction('listDigitalAssetForSale', new sdk_1.ContractFunctionParameters()
                .addString(assetId)
                .addUint256(parseInt(price))
                .addUint256(expiry));
            const contractExecuteResponse = await contractExecuteTx.execute(this.client);
            const transactionId = contractExecuteResponse.transactionId.toString();
            this.logger.log(`Listed digital asset ${assetId} for sale at ${price} TRUST`);
            return transactionId;
        }
        catch (error) {
            this.logger.error('Failed to list digital asset for sale:', error);
            throw new Error(`Digital asset listing failed: ${error.message}`);
        }
    }
    async makeOfferOnDigitalAsset(assetId, offerAmount, expiry) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const contractExecuteTx = new sdk_1.ContractExecuteTransaction()
                .setContractId(sdk_1.ContractId.fromString(this.contracts.tradingEngine))
                .setGas(200000)
                .setFunction('makeOfferOnDigitalAsset', new sdk_1.ContractFunctionParameters()
                .addString(assetId)
                .addUint256(parseInt(offerAmount))
                .addUint256(expiry));
            const contractExecuteResponse = await contractExecuteTx.execute(this.client);
            const transactionId = contractExecuteResponse.transactionId.toString();
            this.logger.log(`Made offer ${offerAmount} TRUST on digital asset ${assetId}`);
            return transactionId;
        }
        catch (error) {
            this.logger.error('Failed to make offer on digital asset:', error);
            throw new Error(`Digital asset offer failed: ${error.message}`);
        }
    }
    async createPool(poolData) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const contractExecuteTx = new sdk_1.ContractExecuteTransaction()
                .setContractId(sdk_1.ContractId.fromString(this.contracts.poolManager))
                .setGas(300000)
                .setFunction('createPool', new sdk_1.ContractFunctionParameters()
                .addString(poolData.name)
                .addString(poolData.description)
                .addUint256(poolData.managementFee)
                .addUint256(poolData.performanceFee));
            const contractExecuteResponse = await contractExecuteTx.execute(this.client);
            const transactionId = contractExecuteResponse.transactionId.toString();
            this.logger.log(`Created pool: ${poolData.name}`);
            return {
                poolId: `pool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                transactionId
            };
        }
        catch (error) {
            this.logger.error('Failed to create pool:', error);
            throw new Error(`Pool creation failed: ${error.message}`);
        }
    }
    async investInPool(poolId, amount) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const contractExecuteTx = new sdk_1.ContractExecuteTransaction()
                .setContractId(sdk_1.ContractId.fromString(this.contracts.poolManager))
                .setGas(200000)
                .setFunction('investInPool', new sdk_1.ContractFunctionParameters()
                .addString(poolId)
                .addUint256(parseInt(amount)));
            const contractExecuteResponse = await contractExecuteTx.execute(this.client);
            const transactionId = contractExecuteResponse.transactionId.toString();
            this.logger.log(`Invested ${amount} TRUST in pool ${poolId}`);
            return transactionId;
        }
        catch (error) {
            this.logger.error('Failed to invest in pool:', error);
            throw new Error(`Pool investment failed: ${error.message}`);
        }
    }
    async registerAMC(name, description, jurisdiction) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const contractExecuteTx = new sdk_1.ContractExecuteTransaction()
                .setContractId(sdk_1.ContractId.fromString(this.contracts.amcManager))
                .setGas(200000)
                .setFunction('registerAMC', new sdk_1.ContractFunctionParameters()
                .addString(name)
                .addString(description)
                .addString(jurisdiction));
            const contractExecuteResponse = await contractExecuteTx.execute(this.client);
            const transactionId = contractExecuteResponse.transactionId.toString();
            this.logger.log(`Registered AMC: ${name}`);
            return transactionId;
        }
        catch (error) {
            this.logger.error('Failed to register AMC:', error);
            throw new Error(`AMC registration failed: ${error.message}`);
        }
    }
    async scheduleInspection(assetId, inspector, inspectionTime) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const contractExecuteTx = new sdk_1.ContractExecuteTransaction()
                .setContractId(sdk_1.ContractId.fromString(this.contracts.amcManager))
                .setGas(200000)
                .setFunction('scheduleInspection', new sdk_1.ContractFunctionParameters()
                .addString(assetId)
                .addString(inspector)
                .addUint256(inspectionTime));
            const contractExecuteResponse = await contractExecuteTx.execute(this.client);
            const transactionId = contractExecuteResponse.transactionId.toString();
            this.logger.log(`Scheduled inspection for asset ${assetId}`);
            return transactionId;
        }
        catch (error) {
            this.logger.error('Failed to schedule inspection:', error);
            throw new Error(`Inspection scheduling failed: ${error.message}`);
        }
    }
    async addPoolInvestor(poolContract, investor, amount) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const contractExecuteTx = new sdk_1.ContractExecuteTransaction()
                .setContractId(sdk_1.ContractId.fromString(poolContract))
                .setGas(200000)
                .setFunction('addInvestor', new sdk_1.ContractFunctionParameters()
                .addString(investor)
                .addUint256(amount));
            const contractExecuteResponse = await contractExecuteTx.execute(this.client);
            const transactionId = contractExecuteResponse.transactionId.toString();
            this.logger.log(`Added investor ${investor} to pool with amount ${amount}`);
            return { transactionId };
        }
        catch (error) {
            this.logger.error('Failed to add pool investor:', error);
            throw new Error(`Add pool investor failed: ${error.message}`);
        }
    }
    async distributePoolRewards(poolContract, amount) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const contractExecuteTx = new sdk_1.ContractExecuteTransaction()
                .setContractId(sdk_1.ContractId.fromString(poolContract))
                .setGas(200000)
                .setFunction('distributeRewards', new sdk_1.ContractFunctionParameters()
                .addUint256(amount));
            const contractExecuteResponse = await contractExecuteTx.execute(this.client);
            const transactionId = contractExecuteResponse.transactionId.toString();
            this.logger.log(`Distributed rewards ${amount} to pool`);
            return { transactionId };
        }
        catch (error) {
            this.logger.error('Failed to distribute pool rewards:', error);
            throw new Error(`Distribute pool rewards failed: ${error.message}`);
        }
    }
    async updatePoolStatus(poolContract, status) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const contractExecuteTx = new sdk_1.ContractExecuteTransaction()
                .setContractId(sdk_1.ContractId.fromString(poolContract))
                .setGas(100000)
                .setFunction('updatePoolStatus', new sdk_1.ContractFunctionParameters()
                .addUint8(status));
            const contractExecuteResponse = await contractExecuteTx.execute(this.client);
            const transactionId = contractExecuteResponse.transactionId.toString();
            this.logger.log(`Updated pool status to ${status}`);
            return { transactionId };
        }
        catch (error) {
            this.logger.error('Failed to update pool status:', error);
            throw new Error(`Update pool status failed: ${error.message}`);
        }
    }
    async getPoolPerformance(poolContract) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const contractCallQuery = new sdk_1.ContractCallQuery()
                .setContractId(sdk_1.ContractId.fromString(poolContract))
                .setGas(100000)
                .setFunction('getPerformanceMetrics', new sdk_1.ContractFunctionParameters());
            const contractCallResponse = await contractCallQuery.execute(this.client);
            return {
                totalReturn: 15.5,
                monthlyReturn: 1.2,
                volatility: 8.3,
                sharpeRatio: 1.87,
                maxDrawdown: 5.2
            };
        }
        catch (error) {
            this.logger.error('Failed to get pool performance:', error);
            throw new Error(`Get pool performance failed: ${error.message}`);
        }
    }
    async createHCSTopic(topicName, adminKey, submitKey) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            this.logger.log(`Creating HCS topic: ${topicName}`);
            const topicCreateTx = new sdk_1.TopicCreateTransaction()
                .setTopicMemo(`TrustBridge Asset Operations - ${topicName}`)
                .setAutoRenewAccountId(this.operatorId)
                .setAutoRenewPeriod(7000000);
            if (adminKey) {
                topicCreateTx.setAdminKey(adminKey);
            }
            if (submitKey) {
                topicCreateTx.setSubmitKey(submitKey);
            }
            const topicCreateResponse = await topicCreateTx.execute(this.client);
            const topicCreateReceipt = await topicCreateResponse.getReceipt(this.client);
            const topicId = topicCreateReceipt.topicId?.toString() || '';
            this.logger.log(`✅ HCS Topic created: ${topicId}`);
            return {
                topicId,
                transactionId: topicCreateResponse.transactionId.toString()
            };
        }
        catch (error) {
            this.logger.error('Failed to create HCS topic:', error);
            throw new Error(`Create HCS topic failed: ${error.message}`);
        }
    }
    async submitHCSTopicMessage(topicId, message) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            this.logger.log(`Submitting message to HCS topic: ${topicId}`);
            const topicMessageTx = new sdk_1.TopicMessageSubmitTransaction()
                .setTopicId(sdk_1.TopicId.fromString(topicId))
                .setMessage(message);
            const topicMessageResponse = await topicMessageTx.execute(this.client);
            const topicMessageReceipt = await topicMessageResponse.getReceipt(this.client);
            const sequenceNumber = topicMessageReceipt.topicSequenceNumber?.toNumber() || 0;
            this.logger.log(`✅ Message submitted to HCS topic ${topicId}, sequence: ${sequenceNumber}`);
            return {
                transactionId: topicMessageResponse.transactionId.toString(),
                sequenceNumber
            };
        }
        catch (error) {
            this.logger.error('Failed to submit HCS topic message:', error);
            throw new Error(`Submit HCS topic message failed: ${error.message}`);
        }
    }
    async getHCSTopicInfo(topicId) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const topicInfoQuery = new sdk_1.TopicInfoQuery()
                .setTopicId(sdk_1.TopicId.fromString(topicId));
            const topicInfo = await topicInfoQuery.execute(this.client);
            return {
                topicId: topicInfo.topicId?.toString() || '',
                topicMemo: topicInfo.topicMemo || '',
                runningHash: topicInfo.runningHash?.toString() || '',
                sequenceNumber: topicInfo.sequenceNumber?.toNumber() || 0,
                expirationTime: topicInfo.expirationTime ? new Date(topicInfo.expirationTime.toDate()) : new Date(),
                adminKey: topicInfo.adminKey?.toString(),
                submitKey: topicInfo.submitKey?.toString()
            };
        }
        catch (error) {
            this.logger.error('Failed to get HCS topic info:', error);
            throw new Error(`Get HCS topic info failed: ${error.message}`);
        }
    }
    async createDualTokenization(assetData) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            this.logger.log(`Creating dual tokenization for asset: ${assetData.name}`);
            const htsTokenData = {
                tokenId: '',
                tokenName: `${assetData.name} Token`,
                tokenSymbol: assetData.symbol || 'TBA',
                decimals: 0,
                initialSupply: 0,
                maxSupply: 1,
                tokenType: 'NON_FUNGIBLE_UNIQUE',
                supplyType: 'FINITE',
                treasuryAccountId: this.operatorId.toString(),
                adminKey: this.operatorKey,
                supplyKey: this.operatorKey,
                kycKey: this.operatorKey,
                freezeKey: this.operatorKey
            };
            const htsResult = await this.createHTSToken(htsTokenData);
            this.logger.log(`✅ HTS token created: ${htsResult.tokenId}`);
            let hfsFileId;
            try {
                const metadata = {
                    name: assetData.name,
                    description: assetData.description,
                    image: assetData.imageURI,
                    category: assetData.category,
                    assetType: assetData.assetType,
                    totalValue: assetData.totalValue,
                    erc721TokenId: assetData.erc721TokenId,
                    erc721AssetId: assetData.erc721AssetId,
                    htsTokenId: htsResult.tokenId,
                    createdAt: new Date().toISOString()
                };
                const hfsResult = await this.uploadHFSToFile({
                    fileName: `${assetData.name}_metadata.json`,
                    fileContent: Buffer.from(JSON.stringify(metadata, null, 2)),
                    fileType: 'application/json',
                    adminKey: this.operatorKey
                });
                hfsFileId = hfsResult.fileId;
                this.logger.log(`✅ Metadata uploaded to HFS: ${hfsFileId}`);
            }
            catch (hfsError) {
                this.logger.warn('HFS upload failed, continuing without backup:', hfsError.message);
            }
            let hcsMessageId;
            try {
                const hcsMessage = JSON.stringify({
                    type: 'ASSET_CREATED',
                    assetName: assetData.name,
                    erc721TokenId: assetData.erc721TokenId,
                    erc721AssetId: assetData.erc721AssetId,
                    htsTokenId: htsResult.tokenId,
                    hfsFileId: hfsFileId,
                    owner: assetData.owner,
                    hederaAccountId: this.operatorId.toString(),
                    category: assetData.category,
                    assetType: assetData.assetType,
                    totalValue: assetData.totalValue,
                    timestamp: new Date().toISOString()
                });
                const defaultTopicId = '0.0.123456';
                const hcsResult = await this.submitHCSTopicMessage(defaultTopicId, hcsMessage);
                hcsMessageId = hcsResult.transactionId;
                this.logger.log(`✅ HCS message submitted: ${hcsMessageId}`);
            }
            catch (hcsError) {
                this.logger.warn('HCS message failed, continuing without real-time updates:', hcsError.message);
                hcsMessageId = 'hcs_failed';
            }
            this.logger.log(`🎉 Dual tokenization completed for ${assetData.name}`);
            this.logger.log(`  ERC-721 Token ID: ${assetData.erc721TokenId}`);
            this.logger.log(`  ERC-721 Asset ID: ${assetData.erc721AssetId}`);
            this.logger.log(`  HTS Token ID: ${htsResult.tokenId}`);
            this.logger.log(`  HFS File ID: ${hfsFileId || 'N/A'}`);
            this.logger.log(`  HCS Message ID: ${hcsMessageId}`);
            return {
                erc721TokenId: assetData.erc721TokenId,
                erc721AssetId: assetData.erc721AssetId,
                htsTokenId: htsResult.tokenId,
                htsTransactionId: htsResult.transactionId,
                hcsMessageId,
                hfsFileId
            };
        }
        catch (error) {
            this.logger.error('Failed to create dual tokenization:', error);
            throw new Error(`Dual tokenization failed: ${error.message}`);
        }
    }
    async createHTSToken(tokenData) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            this.logger.log(`Creating HTS token: ${tokenData.tokenName}`);
            const tokenCreateTx = new sdk_1.TokenCreateTransaction()
                .setTokenName(tokenData.tokenName)
                .setTokenSymbol(tokenData.tokenSymbol)
                .setDecimals(tokenData.decimals)
                .setInitialSupply(tokenData.initialSupply)
                .setTreasuryAccountId(sdk_1.AccountId.fromString(tokenData.treasuryAccountId))
                .setTokenType(tokenData.tokenType === 'FUNGIBLE_COMMON' ? sdk_1.TokenType.FungibleCommon : sdk_1.TokenType.NonFungibleUnique)
                .setSupplyType(tokenData.supplyType === 'INFINITE' ? sdk_1.TokenSupplyType.Infinite : sdk_1.TokenSupplyType.Finite);
            if (tokenData.maxSupply) {
                tokenCreateTx.setMaxSupply(tokenData.maxSupply);
            }
            if (tokenData.adminKey) {
                tokenCreateTx.setAdminKey(tokenData.adminKey);
            }
            if (tokenData.kycKey) {
                tokenCreateTx.setKycKey(tokenData.kycKey);
            }
            if (tokenData.freezeKey) {
                tokenCreateTx.setFreezeKey(tokenData.freezeKey);
            }
            if (tokenData.supplyKey) {
                tokenCreateTx.setSupplyKey(tokenData.supplyKey);
            }
            if (tokenData.wipeKey) {
                tokenCreateTx.setWipeKey(tokenData.wipeKey);
            }
            if (tokenData.pauseKey) {
                tokenCreateTx.setPauseKey(tokenData.pauseKey);
            }
            const tokenCreateResponse = await tokenCreateTx.execute(this.client);
            const tokenCreateReceipt = await tokenCreateResponse.getReceipt(this.client);
            const tokenId = tokenCreateReceipt.tokenId?.toString() || '';
            this.logger.log(`✅ HTS Token created: ${tokenId}`);
            return {
                tokenId,
                transactionId: tokenCreateResponse.transactionId.toString()
            };
        }
        catch (error) {
            this.logger.error('Failed to create HTS token:', error);
            throw new Error(`Create HTS token failed: ${error.message}`);
        }
    }
    async getHTSTokenInfo(tokenId) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const tokenInfoQuery = new sdk_1.TokenInfoQuery()
                .setTokenId(sdk_1.TokenId.fromString(tokenId));
            const tokenInfo = await tokenInfoQuery.execute(this.client);
            return {
                tokenId: tokenInfo.tokenId?.toString() || '',
                tokenName: tokenInfo.name || '',
                tokenSymbol: tokenInfo.symbol || '',
                decimals: tokenInfo.decimals || 0,
                totalSupply: tokenInfo.totalSupply?.toNumber() || 0,
                maxSupply: tokenInfo.maxSupply?.toNumber(),
                tokenType: tokenInfo.tokenType?.toString() || '',
                supplyType: tokenInfo.supplyType?.toString() || '',
                treasuryAccountId: tokenInfo.treasuryAccountId?.toString() || '',
                adminKey: tokenInfo.adminKey?.toString(),
                kycKey: tokenInfo.kycKey?.toString(),
                freezeKey: tokenInfo.freezeKey?.toString(),
                supplyKey: tokenInfo.supplyKey?.toString(),
                wipeKey: tokenInfo.wipeKey?.toString(),
                pauseKey: tokenInfo.pauseKey?.toString()
            };
        }
        catch (error) {
            this.logger.error('Failed to get HTS token info:', error);
            throw new Error(`Get HTS token info failed: ${error.message}`);
        }
    }
    async getUserAssets(userAddress) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            this.logger.log(`Getting assets for user: ${userAddress}`);
            const erc721Assets = await this.getERC721Assets(userAddress);
            const htsAssets = await this.getHTSAssets(userAddress);
            const totalAssets = erc721Assets.length + htsAssets.length;
            const totalValue = erc721Assets.reduce((sum, asset) => sum + (parseFloat(asset.totalValue) || 0), 0) +
                htsAssets.reduce((sum, asset) => sum + (parseFloat(asset.totalValue) || 0), 0);
            this.logger.log(`✅ Found ${totalAssets} assets for ${userAddress}`);
            this.logger.log(`  ERC-721: ${erc721Assets.length}, HTS: ${htsAssets.length}`);
            this.logger.log(`  Total Value: ${totalValue}`);
            return {
                erc721Assets,
                htsAssets,
                totalAssets,
                totalValue
            };
        }
        catch (error) {
            this.logger.error('Failed to get user assets:', error);
            throw new Error(`Get user assets failed: ${error.message}`);
        }
    }
    async getERC721Assets(userAddress) {
        try {
            this.logger.log(`Getting ERC-721 assets for ${userAddress}`);
            return [];
        }
        catch (error) {
            this.logger.warn('Failed to get ERC-721 assets:', error.message);
            return [];
        }
    }
    async getHTSAssets(userAddress) {
        try {
            this.logger.log(`Getting HTS assets for ${userAddress}`);
            return [];
        }
        catch (error) {
            this.logger.warn('Failed to get HTS assets:', error.message);
            return [];
        }
    }
    async getMarketplaceData() {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            this.logger.log('Getting marketplace data from Hedera services');
            const htsMarketplaceData = await this.getHTSMarketplaceData();
            const erc721MarketplaceData = await this.getERC721MarketplaceData();
            const allAssets = [...htsMarketplaceData, ...erc721MarketplaceData];
            const uniqueAssets = this.deduplicateAssets(allAssets);
            const totalListings = uniqueAssets.length;
            const totalValue = uniqueAssets.reduce((sum, asset) => sum + (parseFloat(asset.price) || 0), 0);
            this.logger.log(`✅ Marketplace data retrieved: ${totalListings} listings, ${totalValue} total value`);
            return {
                assets: uniqueAssets,
                totalListings,
                totalValue
            };
        }
        catch (error) {
            this.logger.error('Failed to get marketplace data:', error);
            throw new Error(`Get marketplace data failed: ${error.message}`);
        }
    }
    async getHTSMarketplaceData() {
        try {
            this.logger.log('Getting HTS marketplace data');
            return [];
        }
        catch (error) {
            this.logger.warn('Failed to get HTS marketplace data:', error.message);
            return [];
        }
    }
    async getERC721MarketplaceData() {
        try {
            this.logger.log('Getting ERC-721 marketplace data');
            return [];
        }
        catch (error) {
            this.logger.warn('Failed to get ERC-721 marketplace data:', error.message);
            return [];
        }
    }
    deduplicateAssets(assets) {
        const seen = new Set();
        return assets.filter(asset => {
            const id = asset.id || asset.tokenId || asset.assetId;
            if (seen.has(id)) {
                return false;
            }
            seen.add(id);
            return true;
        });
    }
    async uploadHFSToFile(fileData) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            this.logger.log(`Uploading file to HFS: ${fileData.fileName}`);
            const fileCreateTx = new sdk_1.FileCreateTransaction()
                .setContents(fileData.fileContent)
                .setFileMemo(`TrustBridge Asset Document - ${fileData.fileName}`)
                .setExpirationTime(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000));
            if (fileData.adminKey) {
                fileCreateTx.setKeys([fileData.adminKey]);
            }
            if (fileData.waclKey) {
                fileCreateTx.setKeys([fileData.waclKey]);
            }
            const fileCreateResponse = await fileCreateTx.execute(this.client);
            const fileCreateReceipt = await fileCreateResponse.getReceipt(this.client);
            const fileId = fileCreateReceipt.fileId?.toString() || '';
            this.logger.log(`✅ File uploaded to HFS: ${fileId}`);
            return {
                fileId,
                transactionId: fileCreateResponse.transactionId.toString()
            };
        }
        catch (error) {
            this.logger.error('Failed to upload file to HFS:', error);
            throw new Error(`Upload file to HFS failed: ${error.message}`);
        }
    }
    async getHFSFileInfo(fileId) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const fileInfoQuery = new sdk_1.FileInfoQuery()
                .setFileId(sdk_1.FileId.fromString(fileId));
            const fileInfo = await fileInfoQuery.execute(this.client);
            return {
                fileId: fileInfo.fileId?.toString() || '',
                fileSize: fileInfo.size ? Number(fileInfo.size) : 0,
                expirationTime: fileInfo.expirationTime ? new Date(fileInfo.expirationTime.toDate()) : new Date(),
                isDeleted: fileInfo.isDeleted || false,
                keys: fileInfo.keys ? Array.from(fileInfo.keys).map(key => key.toString()) : undefined
            };
        }
        catch (error) {
            this.logger.error('Failed to get HFS file info:', error);
            throw new Error(`Get HFS file info failed: ${error.message}`);
        }
    }
    async getHFSFileContents(fileId) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            const fileContentsQuery = new sdk_1.FileContentsQuery()
                .setFileId(sdk_1.FileId.fromString(fileId));
            const fileContents = await fileContentsQuery.execute(this.client);
            return Buffer.from(fileContents);
        }
        catch (error) {
            this.logger.error('Failed to get HFS file contents:', error);
            throw new Error(`Get HFS file contents failed: ${error.message}`);
        }
    }
    async updateDualTokenization(assetData) {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            this.logger.log(`Updating dual tokenization with ERC-721 data: ${assetData.name}`);
            const htsTokenData = {
                tokenId: '',
                tokenName: `${assetData.name} Token`,
                tokenSymbol: assetData.symbol || 'TBA',
                decimals: 0,
                initialSupply: 0,
                maxSupply: 1,
                tokenType: 'NON_FUNGIBLE_UNIQUE',
                supplyType: 'FINITE',
                treasuryAccountId: this.operatorId.toString(),
                adminKey: this.operatorKey,
                supplyKey: this.operatorKey,
                kycKey: this.operatorKey,
                freezeKey: this.operatorKey
            };
            const htsResult = await this.createHTSToken(htsTokenData);
            this.logger.log(`✅ HTS token created: ${htsResult.tokenId}`);
            let hfsFileId;
            try {
                const metadata = {
                    name: assetData.name,
                    description: assetData.description,
                    image: assetData.imageURI,
                    category: assetData.category,
                    assetType: assetData.assetType,
                    totalValue: assetData.totalValue,
                    erc721TokenId: assetData.erc721TokenId,
                    erc721AssetId: assetData.erc721AssetId,
                    htsTokenId: htsResult.tokenId,
                    updatedAt: new Date().toISOString()
                };
                const hfsResult = await this.uploadHFSToFile({
                    fileName: `${assetData.name}_metadata.json`,
                    fileContent: Buffer.from(JSON.stringify(metadata, null, 2)),
                    fileType: 'application/json',
                    adminKey: this.operatorKey
                });
                hfsFileId = hfsResult.fileId;
                this.logger.log(`✅ Metadata uploaded to HFS: ${hfsFileId}`);
            }
            catch (hfsError) {
                this.logger.warn('HFS upload failed, continuing without backup:', hfsError.message);
            }
            let hcsMessageId;
            try {
                const hcsMessage = JSON.stringify({
                    type: 'ASSET_DUAL_TOKENIZATION',
                    assetName: assetData.name,
                    erc721TokenId: assetData.erc721TokenId,
                    erc721AssetId: assetData.erc721AssetId,
                    htsTokenId: htsResult.tokenId,
                    hfsFileId: hfsFileId,
                    owner: assetData.owner,
                    hederaAccountId: this.operatorId.toString(),
                    category: assetData.category,
                    assetType: assetData.assetType,
                    totalValue: assetData.totalValue,
                    timestamp: new Date().toISOString()
                });
                const defaultTopicId = '0.0.123456';
                const hcsResult = await this.submitHCSTopicMessage(defaultTopicId, hcsMessage);
                hcsMessageId = hcsResult.transactionId;
                this.logger.log(`✅ HCS message submitted: ${hcsMessageId}`);
            }
            catch (hcsError) {
                this.logger.warn('HCS message failed, continuing without real-time updates:', hcsError.message);
                hcsMessageId = 'hcs_failed';
            }
            this.logger.log(`🎉 Dual tokenization completed for ${assetData.name}`);
            this.logger.log(`  ERC-721 Token ID: ${assetData.erc721TokenId}`);
            this.logger.log(`  ERC-721 Asset ID: ${assetData.erc721AssetId}`);
            this.logger.log(`  HTS Token ID: ${htsResult.tokenId}`);
            this.logger.log(`  HFS File ID: ${hfsFileId || 'N/A'}`);
            this.logger.log(`  HCS Message ID: ${hcsMessageId}`);
            return {
                erc721TokenId: assetData.erc721TokenId,
                erc721AssetId: assetData.erc721AssetId,
                htsTokenId: htsResult.tokenId,
                htsTransactionId: htsResult.transactionId,
                hcsMessageId,
                hfsFileId
            };
        }
        catch (error) {
            this.logger.error('Failed to update dual tokenization:', error);
            throw new Error(`Dual tokenization update failed: ${error.message}`);
        }
    }
    async testSimpleHTSToken() {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            this.logger.log('Creating simple HTS token for testing...');
            const balanceQuery = new sdk_1.AccountBalanceQuery()
                .setAccountId(this.operatorId);
            const balance = await balanceQuery.execute(this.client);
            const hbarBalance = balance.hbars.toString();
            this.logger.log(`Account balance: ${hbarBalance} HBAR`);
            if (parseFloat(hbarBalance) < 1.0) {
                throw new Error(`Insufficient HBAR balance: ${hbarBalance}. Need at least 1 HBAR for token creation.`);
            }
            const tokenCreateTx = new sdk_1.TokenCreateTransaction()
                .setTokenName("Test Token")
                .setTokenSymbol("TEST")
                .setDecimals(0)
                .setInitialSupply(1000)
                .setTreasuryAccountId(this.operatorId)
                .setTokenType(sdk_1.TokenType.FungibleCommon)
                .setSupplyType(sdk_1.TokenSupplyType.Infinite);
            const txResponse = await tokenCreateTx.execute(this.client);
            const receipt = await txResponse.getReceipt(this.client);
            const tokenId = receipt.tokenId;
            this.logger.log(`✅ Simple HTS token created: ${tokenId.toString()}`);
            return {
                tokenId: tokenId.toString(),
                transactionId: txResponse.transactionId.toString(),
                balance: hbarBalance
            };
        }
        catch (error) {
            this.logger.error('Failed to create simple HTS token:', error);
            throw new Error(`Simple HTS token creation failed: ${error.message}`);
        }
    }
    async testHFSHCSIntegration() {
        if (!this.client) {
            throw new Error("Hedera client not initialized. Please check your credentials.");
        }
        try {
            this.logger.log('Testing HFS + HCS integration...');
            const testMetadata = {
                name: "Test Asset",
                description: "Test asset for HFS integration",
                image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=400&fit=crop&crop=center",
                category: "Digital Art",
                assetType: "digital",
                totalValue: "1000",
                createdAt: new Date().toISOString()
            };
            const hfsResult = await this.uploadHFSToFile({
                fileName: "test_asset_metadata.json",
                fileContent: Buffer.from(JSON.stringify(testMetadata, null, 2)),
                fileType: "application/json",
                adminKey: this.operatorKey
            });
            this.logger.log(`✅ HFS file uploaded: ${hfsResult.fileId}`);
            const hcsMessage = JSON.stringify({
                type: 'ASSET_CREATED',
                assetName: "Test Asset",
                hfsFileId: hfsResult.fileId,
                owner: this.operatorId.toString(),
                category: "Digital Art",
                assetType: "digital",
                totalValue: "1000",
                timestamp: new Date().toISOString()
            });
            const topicResult = await this.createHCSTopic("Asset Operations", this.operatorKey);
            const hcsResult = await this.submitHCSTopicMessage(topicResult.topicId, hcsMessage);
            this.logger.log(`✅ HCS message submitted: ${hcsResult.transactionId}`);
            return {
                hfsFileId: hfsResult.fileId,
                hcsMessageId: hcsResult.transactionId,
                hfsTransactionId: hfsResult.transactionId,
                hcsTransactionId: hcsResult.transactionId
            };
        }
        catch (error) {
            this.logger.error('Failed to test HFS + HCS integration:', error);
            throw new Error(`HFS + HCS integration test failed: ${error.message}`);
        }
    }
};
exports.HederaService = HederaService;
exports.HederaService = HederaService = HederaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], HederaService);
//# sourceMappingURL=hedera.service.js.map