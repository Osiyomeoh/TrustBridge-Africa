"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ActivityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let ActivityService = ActivityService_1 = class ActivityService {
    constructor() {
        this.logger = new common_1.Logger(ActivityService_1.name);
        this.mirrorNodeUrl = 'https://testnet.mirrornode.hedera.com/api/v1';
    }
    async getNFTActivity(tokenId, serialNumber, limit = 50) {
        try {
            const url = `${this.mirrorNodeUrl}/tokens/${tokenId}/nfts/${serialNumber}/transactions?limit=${limit}&order=desc`;
            this.logger.log(`Fetching NFT activity: ${url}`);
            const response = await axios_1.default.get(url);
            if (!response.data || !response.data.transactions) {
                return [];
            }
            const activities = [];
            for (const tx of response.data.transactions) {
                const activity = this.parseTransaction(tx, tokenId, serialNumber);
                if (activity) {
                    activities.push(activity);
                }
            }
            return activities;
        }
        catch (error) {
            this.logger.error('Error fetching NFT activity:', error.message);
            return [];
        }
    }
    async getUserActivity(accountId, limit = 100) {
        try {
            const nftsUrl = `${this.mirrorNodeUrl}/accounts/${accountId}/nfts?limit=100`;
            const nftsResponse = await axios_1.default.get(nftsUrl);
            if (!nftsResponse.data || !nftsResponse.data.nfts) {
                return [];
            }
            const activities = [];
            for (const nft of nftsResponse.data.nfts.slice(0, 20)) {
                const nftActivities = await this.getNFTActivity(nft.token_id, nft.serial_number, 10);
                activities.push(...nftActivities);
            }
            activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            return activities.slice(0, limit);
        }
        catch (error) {
            this.logger.error('Error fetching user activity:', error.message);
            return [];
        }
    }
    async getMarketplaceActivity(marketplaceAccount, limit = 50) {
        try {
            const url = `${this.mirrorNodeUrl}/accounts/${marketplaceAccount}/transactions?limit=${limit}&order=desc&transactiontype=cryptotransfer`;
            const response = await axios_1.default.get(url);
            if (!response.data || !response.data.transactions) {
                return [];
            }
            const activities = [];
            for (const tx of response.data.transactions) {
                if (tx.transfers && tx.transfers.length > 0) {
                    const activity = this.parseMarketplaceTransaction(tx, marketplaceAccount);
                    if (activity) {
                        activities.push(activity);
                    }
                }
            }
            return activities;
        }
        catch (error) {
            this.logger.error('Error fetching marketplace activity:', error.message);
            return [];
        }
    }
    async getCollectionActivity(tokenId, limit = 50) {
        try {
            const nftInfoUrl = `${this.mirrorNodeUrl}/tokens/${tokenId}/nfts?limit=100`;
            const nftInfoResponse = await axios_1.default.get(nftInfoUrl);
            if (!nftInfoResponse.data || !nftInfoResponse.data.nfts) {
                return [];
            }
            const activities = [];
            for (const nft of nftInfoResponse.data.nfts.slice(0, 10)) {
                const nftActivities = await this.getNFTActivity(tokenId, nft.serial_number, 5);
                activities.push(...nftActivities);
            }
            activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            return activities.slice(0, limit);
        }
        catch (error) {
            this.logger.error('Error fetching collection activity:', error.message);
            return [];
        }
    }
    parseTransaction(tx, tokenId, serialNumber) {
        try {
            const type = this.determineTransactionType(tx);
            if (!type) {
                return null;
            }
            let from = 'unknown';
            let to = 'unknown';
            if (tx.nft_transfers && tx.nft_transfers.length > 0) {
                const nftTransfer = tx.nft_transfers.find((t) => t.token_id === tokenId && t.serial_number === serialNumber);
                if (nftTransfer) {
                    from = nftTransfer.sender_account_id || 'unknown';
                    to = nftTransfer.receiver_account_id || 'unknown';
                }
            }
            let price;
            let currency;
            if (tx.token_transfers && tx.token_transfers.length > 0) {
                const trustTransfer = tx.token_transfers.find((t) => t.token_id === process.env.TRUST_TOKEN_ID);
                if (trustTransfer && trustTransfer.amount) {
                    price = Math.abs(trustTransfer.amount) / 1e8;
                    currency = 'TRUST';
                }
            }
            return {
                id: `${tx.transaction_id}_${tokenId}_${serialNumber}`,
                type,
                timestamp: tx.consensus_timestamp,
                transactionId: tx.transaction_id,
                nftContract: tokenId,
                tokenId,
                serialNumber,
                from,
                to,
                price,
                currency,
                metadata: tx,
            };
        }
        catch (error) {
            this.logger.warn('Error parsing transaction:', error.message);
            return null;
        }
    }
    determineTransactionType(tx) {
        if (tx.nft_transfers && tx.nft_transfers.length > 0) {
            const nftTransfer = tx.nft_transfers[0];
            if (!nftTransfer.sender_account_id || nftTransfer.sender_account_id === '0.0.0') {
                return 'mint';
            }
            if (tx.token_transfers && tx.token_transfers.length > 0) {
                const hasTrustTransfer = tx.token_transfers.some((t) => t.token_id === process.env.TRUST_TOKEN_ID);
                if (hasTrustTransfer) {
                    return 'sale';
                }
            }
            return 'transfer';
        }
        return null;
    }
    parseMarketplaceTransaction(tx, marketplaceAccount) {
        if (tx.nft_transfers && tx.nft_transfers.length > 0) {
            const toMarketplace = tx.nft_transfers.find((t) => t.receiver_account_id === marketplaceAccount);
            if (toMarketplace) {
                return {
                    id: `${tx.transaction_id}_listing`,
                    type: 'listing',
                    timestamp: tx.consensus_timestamp,
                    transactionId: tx.transaction_id,
                    nftContract: toMarketplace.token_id,
                    tokenId: toMarketplace.token_id,
                    serialNumber: toMarketplace.serial_number,
                    from: toMarketplace.sender_account_id,
                    to: marketplaceAccount,
                };
            }
            const fromMarketplace = tx.nft_transfers.find((t) => t.sender_account_id === marketplaceAccount);
            if (fromMarketplace) {
                let price;
                if (tx.token_transfers && tx.token_transfers.length > 0) {
                    const trustTransfer = tx.token_transfers.find((t) => t.token_id === process.env.TRUST_TOKEN_ID);
                    if (trustTransfer) {
                        price = Math.abs(trustTransfer.amount) / 1e8;
                    }
                }
                return {
                    id: `${tx.transaction_id}_sale`,
                    type: 'sale',
                    timestamp: tx.consensus_timestamp,
                    transactionId: tx.transaction_id,
                    nftContract: fromMarketplace.token_id,
                    tokenId: fromMarketplace.token_id,
                    serialNumber: fromMarketplace.serial_number,
                    from: marketplaceAccount,
                    to: fromMarketplace.receiver_account_id,
                    price,
                    currency: 'TRUST',
                };
            }
        }
        return null;
    }
    async getNFTPriceHistory(tokenId, serialNumber) {
        try {
            const activities = await this.getNFTActivity(tokenId, serialNumber, 100);
            const priceHistory = activities
                .filter(a => a.type === 'sale' && a.price)
                .map(a => ({
                timestamp: a.timestamp,
                price: a.price,
            }))
                .reverse();
            return priceHistory;
        }
        catch (error) {
            this.logger.error('Error fetching price history:', error.message);
            return [];
        }
    }
};
exports.ActivityService = ActivityService;
exports.ActivityService = ActivityService = ActivityService_1 = __decorate([
    (0, common_1.Injectable)()
], ActivityService);
//# sourceMappingURL=activity.service.js.map