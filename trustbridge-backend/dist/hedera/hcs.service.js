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
var HcsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HcsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sdk_1 = require("@hashgraph/sdk");
let HcsService = HcsService_1 = class HcsService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(HcsService_1.name);
        this.marketplaceEventsTopic = null;
        this.offerMessagesTopic = null;
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
            this.client.setDefaultMaxTransactionFee(new sdk_1.Hbar(2));
            this.logger.log(`✅ HCS Service initialized for ${network}`);
            const marketplaceTopicId = this.configService.get('HCS_MARKETPLACE_TOPIC_ID');
            const offerTopicId = this.configService.get('HCS_OFFER_TOPIC_ID');
            if (marketplaceTopicId) {
                this.marketplaceEventsTopic = sdk_1.TopicId.fromString(marketplaceTopicId);
                this.logger.log(`📋 Loaded marketplace topic: ${marketplaceTopicId}`);
            }
            if (offerTopicId) {
                this.offerMessagesTopic = sdk_1.TopicId.fromString(offerTopicId);
                this.logger.log(`💬 Loaded offer topic: ${offerTopicId}`);
            }
        }
        catch (error) {
            this.logger.error('Failed to initialize HCS client:', error);
            throw error;
        }
    }
    async createMarketplaceTopics() {
        try {
            this.logger.log('📋 Creating HCS topics for marketplace...');
            const marketplaceTx = new sdk_1.TopicCreateTransaction()
                .setTopicMemo('TrustBridge Marketplace Events - Immutable Audit Trail')
                .setAdminKey(this.operatorKey)
                .setSubmitKey(this.operatorKey)
                .setMaxTransactionFee(new sdk_1.Hbar(5));
            const marketplaceResponse = await marketplaceTx.execute(this.client);
            const marketplaceReceipt = await marketplaceResponse.getReceipt(this.client);
            this.marketplaceEventsTopic = marketplaceReceipt.topicId;
            this.logger.log(`✅ Marketplace events topic created: ${this.marketplaceEventsTopic.toString()}`);
            const offerTx = new sdk_1.TopicCreateTransaction()
                .setTopicMemo('TrustBridge Offer Messages - Decentralized Communication')
                .setAdminKey(this.operatorKey)
                .setSubmitKey(this.operatorKey)
                .setMaxTransactionFee(new sdk_1.Hbar(5));
            const offerResponse = await offerTx.execute(this.client);
            const offerReceipt = await offerResponse.getReceipt(this.client);
            this.offerMessagesTopic = offerReceipt.topicId;
            this.logger.log(`✅ Offer messages topic created: ${this.offerMessagesTopic.toString()}`);
            return {
                marketplaceTopicId: this.marketplaceEventsTopic.toString(),
                offerTopicId: this.offerMessagesTopic.toString(),
            };
        }
        catch (error) {
            this.logger.error('Failed to create HCS topics:', error);
            throw error;
        }
    }
    async submitMarketplaceEvent(event) {
        try {
            if (!this.marketplaceEventsTopic) {
                throw new Error('Marketplace topic not initialized');
            }
            if (!event.timestamp) {
                event.timestamp = new Date().toISOString();
            }
            const message = JSON.stringify(event);
            this.logger.log(`📤 Submitting ${event.type} event to HCS:`, event.assetName);
            const submitTx = new sdk_1.TopicMessageSubmitTransaction()
                .setTopicId(this.marketplaceEventsTopic)
                .setMessage(message)
                .setMaxTransactionFee(new sdk_1.Hbar(2));
            const response = await submitTx.execute(this.client);
            const receipt = await response.getReceipt(this.client);
            const sequenceNumber = receipt.topicSequenceNumber.toString();
            const transactionId = response.transactionId.toString();
            this.logger.log(`✅ Event submitted to HCS: ${transactionId} (sequence: ${sequenceNumber})`);
            return transactionId;
        }
        catch (error) {
            this.logger.error('Failed to submit marketplace event:', error);
            return null;
        }
    }
    async submitOfferMessage(message) {
        try {
            if (!this.offerMessagesTopic) {
                throw new Error('Offer topic not initialized');
            }
            if (!message.timestamp) {
                message.timestamp = new Date().toISOString();
            }
            const messageContent = JSON.stringify(message);
            this.logger.log(`💬 Submitting offer message to HCS:`, message.type);
            const submitTx = new sdk_1.TopicMessageSubmitTransaction()
                .setTopicId(this.offerMessagesTopic)
                .setMessage(messageContent)
                .setMaxTransactionFee(new sdk_1.Hbar(2));
            const response = await submitTx.execute(this.client);
            const receipt = await response.getReceipt(this.client);
            const sequenceNumber = receipt.topicSequenceNumber.toString();
            const transactionId = response.transactionId.toString();
            this.logger.log(`✅ Offer message submitted: ${transactionId} (sequence: ${sequenceNumber})`);
            return transactionId;
        }
        catch (error) {
            this.logger.error('Failed to submit offer message:', error);
            return null;
        }
    }
    async getTopicInfo(topicId) {
        try {
            const query = new sdk_1.TopicInfoQuery()
                .setTopicId(sdk_1.TopicId.fromString(topicId));
            const info = await query.execute(this.client);
            return {
                topicId: info.topicId.toString(),
                memo: info.topicMemo,
                sequenceNumber: info.sequenceNumber.toString(),
                adminKey: info.adminKey?.toString(),
                submitKey: info.submitKey?.toString(),
            };
        }
        catch (error) {
            this.logger.error('Failed to get topic info:', error);
            throw error;
        }
    }
    async queryMarketplaceEvents(limit = 100, assetTokenId) {
        try {
            if (!this.marketplaceEventsTopic) {
                throw new Error('Marketplace topic not initialized');
            }
            const network = this.configService.get('HEDERA_NETWORK', 'testnet');
            const mirrorNodeUrl = network === 'mainnet'
                ? 'https://mainnet-public.mirrornode.hedera.com'
                : 'https://testnet.mirrornode.hedera.com';
            const url = `${mirrorNodeUrl}/api/v1/topics/${this.marketplaceEventsTopic.toString()}/messages?limit=${limit}&order=desc`;
            const response = await fetch(url);
            const data = await response.json();
            if (!data.messages) {
                return [];
            }
            const events = data.messages
                .map((msg) => {
                try {
                    const messageBase64 = msg.message;
                    const messageString = Buffer.from(messageBase64, 'base64').toString('utf-8');
                    const event = JSON.parse(messageString);
                    event.consensusTimestamp = msg.consensus_timestamp;
                    event.sequenceNumber = msg.sequence_number;
                    return event;
                }
                catch (err) {
                    this.logger.warn('Failed to parse HCS message:', err);
                    return null;
                }
            })
                .filter(Boolean);
            if (assetTokenId) {
                return events.filter(e => e.assetTokenId === assetTokenId);
            }
            return events;
        }
        catch (error) {
            this.logger.error('Failed to query marketplace events:', error);
            return [];
        }
    }
    async queryOfferMessages(assetTokenId, accountId, limit = 50) {
        try {
            if (!this.offerMessagesTopic) {
                throw new Error('Offer topic not initialized');
            }
            const network = this.configService.get('HEDERA_NETWORK', 'testnet');
            const mirrorNodeUrl = network === 'mainnet'
                ? 'https://mainnet-public.mirrornode.hedera.com'
                : 'https://testnet.mirrornode.hedera.com';
            const url = `${mirrorNodeUrl}/api/v1/topics/${this.offerMessagesTopic.toString()}/messages?limit=${limit}&order=desc`;
            const response = await fetch(url);
            const data = await response.json();
            if (!data.messages) {
                return [];
            }
            const messages = data.messages
                .map((msg) => {
                try {
                    const messageBase64 = msg.message;
                    const messageString = Buffer.from(messageBase64, 'base64').toString('utf-8');
                    const message = JSON.parse(messageString);
                    message.consensusTimestamp = msg.consensus_timestamp;
                    message.sequenceNumber = msg.sequence_number;
                    return message;
                }
                catch (err) {
                    this.logger.warn('Failed to parse HCS message:', err);
                    return null;
                }
            })
                .filter(Boolean);
            let filteredMessages = messages;
            if (assetTokenId) {
                filteredMessages = filteredMessages.filter(m => m.assetTokenId === assetTokenId);
            }
            if (accountId) {
                filteredMessages = filteredMessages.filter(m => m.from === accountId || m.to === accountId);
            }
            return filteredMessages;
        }
        catch (error) {
            this.logger.error('Failed to query offer messages:', error);
            return [];
        }
    }
    getMarketplaceTopicId() {
        return this.marketplaceEventsTopic?.toString() || null;
    }
    getOfferTopicId() {
        return this.offerMessagesTopic?.toString() || null;
    }
    async trackListing(assetTokenId, assetName, seller, price, transactionId) {
        await this.submitMarketplaceEvent({
            type: 'listing',
            assetTokenId,
            assetName,
            from: seller,
            price,
            timestamp: new Date().toISOString(),
            transactionId,
        });
    }
    async trackSale(assetTokenId, assetName, seller, buyer, price, transactionId) {
        await this.submitMarketplaceEvent({
            type: 'sale',
            assetTokenId,
            assetName,
            from: seller,
            to: buyer,
            price,
            timestamp: new Date().toISOString(),
            transactionId,
        });
    }
    async trackUnlisting(assetTokenId, assetName, seller, transactionId) {
        await this.submitMarketplaceEvent({
            type: 'unlisting',
            assetTokenId,
            assetName,
            from: seller,
            timestamp: new Date().toISOString(),
            transactionId,
        });
    }
    async trackPriceUpdate(assetTokenId, assetName, seller, oldPrice, newPrice, transactionId) {
        await this.submitMarketplaceEvent({
            type: 'price_update',
            assetTokenId,
            assetName,
            from: seller,
            oldPrice,
            newPrice,
            timestamp: new Date().toISOString(),
            transactionId,
        });
    }
    async trackOffer(assetTokenId, assetName, buyer, seller, offerPrice) {
        await this.submitMarketplaceEvent({
            type: 'offer',
            assetTokenId,
            assetName,
            from: buyer,
            to: seller,
            price: offerPrice,
            timestamp: new Date().toISOString(),
        });
    }
    async trackOfferAccepted(assetTokenId, assetName, seller, buyer, price, transactionId) {
        await this.submitMarketplaceEvent({
            type: 'offer_accepted',
            assetTokenId,
            assetName,
            from: seller,
            to: buyer,
            price,
            timestamp: new Date().toISOString(),
            transactionId,
        });
    }
    async trackOfferRejected(assetTokenId, assetName, seller, buyer, price) {
        await this.submitMarketplaceEvent({
            type: 'offer_rejected',
            assetTokenId,
            assetName,
            from: seller,
            to: buyer,
            price,
            timestamp: new Date().toISOString(),
        });
    }
};
exports.HcsService = HcsService;
exports.HcsService = HcsService = HcsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], HcsService);
//# sourceMappingURL=hcs.service.js.map