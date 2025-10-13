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
var ScheduledTransactionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduledTransactionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sdk_1 = require("@hashgraph/sdk");
let ScheduledTransactionService = ScheduledTransactionService_1 = class ScheduledTransactionService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(ScheduledTransactionService_1.name);
        this.initializeClient();
    }
    initializeClient() {
        try {
            const network = this.configService.get('HEDERA_NETWORK', 'testnet');
            this.operatorId = this.configService.get('HEDERA_OPERATOR_ID') || this.configService.get('HEDERA_ACCOUNT_ID');
            const operatorKeyString = this.configService.get('HEDERA_OPERATOR_KEY') || this.configService.get('HEDERA_PRIVATE_KEY');
            if (!this.operatorId || !operatorKeyString) {
                throw new Error('Hedera operator credentials not configured');
            }
            this.operatorKey = sdk_1.PrivateKey.fromStringECDSA(operatorKeyString);
            if (network === 'mainnet') {
                this.client = sdk_1.Client.forMainnet();
            }
            else {
                this.client = sdk_1.Client.forTestnet();
            }
            this.client.setOperator(sdk_1.AccountId.fromString(this.operatorId), this.operatorKey);
            this.client.setDefaultMaxTransactionFee(new sdk_1.Hbar(5));
            this.logger.log(`✅ Scheduled Transaction Service initialized for ${network}`);
        }
        catch (error) {
            this.logger.error('Failed to initialize Scheduled Transaction client:', error);
            throw error;
        }
    }
    async createScheduledAuctionEnd(assetTokenId, seller, highestBidder, bidAmount, endTime) {
        try {
            this.logger.log(`⏰ Creating scheduled auction end for ${assetTokenId}...`);
            const trustTokenId = sdk_1.TokenId.fromString(this.configService.get('TRUST_TOKEN_ID'));
            const transferTx = new sdk_1.TransferTransaction()
                .addTokenTransfer(trustTokenId, sdk_1.AccountId.fromString(highestBidder), -bidAmount)
                .addTokenTransfer(trustTokenId, sdk_1.AccountId.fromString(seller), bidAmount);
            const scheduleTx = new sdk_1.ScheduleCreateTransaction()
                .setScheduledTransaction(transferTx)
                .setScheduleMemo(`Auction end - ${assetTokenId}`)
                .setExpirationTime(sdk_1.Timestamp.fromDate(endTime))
                .setWaitForExpiry(false)
                .setMaxTransactionFee(new sdk_1.Hbar(5));
            const response = await scheduleTx.execute(this.client);
            const receipt = await response.getReceipt(this.client);
            const scheduleId = receipt.scheduleId;
            this.logger.log(`✅ Scheduled transaction created: ${scheduleId.toString()}`);
            this.logger.log(`   Will execute at: ${endTime.toISOString()}`);
            this.logger.log(`   Transaction ID: ${response.transactionId.toString()}`);
            return {
                scheduleId: scheduleId.toString(),
                transactionId: response.transactionId.toString(),
            };
        }
        catch (error) {
            this.logger.error('Failed to create scheduled auction end:', error);
            throw error;
        }
    }
    async signScheduledTransaction(scheduleId, signerKey) {
        try {
            this.logger.log(`✍️ Signing scheduled transaction: ${scheduleId}`);
            const signTx = new sdk_1.ScheduleSignTransaction()
                .setScheduleId(sdk_1.ScheduleId.fromString(scheduleId))
                .freezeWith(this.client);
            const signedTx = await signTx.sign(signerKey);
            const response = await signedTx.execute(this.client);
            this.logger.log(`✅ Scheduled transaction signed: ${response.transactionId.toString()}`);
            return response.transactionId.toString();
        }
        catch (error) {
            this.logger.error('Failed to sign scheduled transaction:', error);
            throw error;
        }
    }
    async getScheduleInfo(scheduleId) {
        try {
            const query = new sdk_1.ScheduleInfoQuery()
                .setScheduleId(sdk_1.ScheduleId.fromString(scheduleId));
            const info = await query.execute(this.client);
            return {
                scheduleId: info.scheduleId.toString(),
                memo: info.scheduleMemo,
                creatorAccountId: info.creatorAccountId.toString(),
                payerAccountId: info.payerAccountId?.toString(),
                expirationTime: info.expirationTime?.toDate(),
                executed: info.executed,
                deleted: info.deleted,
            };
        }
        catch (error) {
            this.logger.error('Failed to get schedule info:', error);
            throw error;
        }
    }
    async createScheduledListing(assetTokenId, listingTime) {
        try {
            this.logger.log(`📅 Creating scheduled listing for ${assetTokenId} at ${listingTime.toISOString()}...`);
            const scheduleTx = new sdk_1.ScheduleCreateTransaction()
                .setScheduleMemo(`Scheduled listing for ${assetTokenId}`)
                .setExpirationTime(sdk_1.Timestamp.fromDate(listingTime))
                .setWaitForExpiry(true)
                .setMaxTransactionFee(new sdk_1.Hbar(5));
            const response = await scheduleTx.execute(this.client);
            const receipt = await response.getReceipt(this.client);
            const scheduleId = receipt.scheduleId;
            this.logger.log(`✅ Scheduled listing created: ${scheduleId.toString()}`);
            this.logger.log(`   Will execute at: ${listingTime.toISOString()}`);
            return {
                scheduleId: scheduleId.toString(),
                transactionId: response.transactionId.toString(),
            };
        }
        catch (error) {
            this.logger.error('Failed to create scheduled listing:', error);
            throw error;
        }
    }
};
exports.ScheduledTransactionService = ScheduledTransactionService;
exports.ScheduledTransactionService = ScheduledTransactionService = ScheduledTransactionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ScheduledTransactionService);
exports.default = ScheduledTransactionService;
//# sourceMappingURL=scheduled-transaction.service.js.map