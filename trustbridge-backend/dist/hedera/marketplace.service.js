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
var MarketplaceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sdk_1 = require("@hashgraph/sdk");
let MarketplaceService = MarketplaceService_1 = class MarketplaceService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(MarketplaceService_1.name);
        this.initializeClient();
    }
    initializeClient() {
        try {
            const accountId = this.configService.get('HEDERA_ACCOUNT_ID');
            const privateKey = this.configService.get('HEDERA_PRIVATE_KEY');
            const network = this.configService.get('HEDERA_NETWORK', 'testnet');
            this.marketplaceContractId = this.configService.get('MARKETPLACE_CONTRACT_ID');
            this.trustTokenId = this.configService.get('TRUST_TOKEN_ID');
            if (!accountId || !privateKey) {
                throw new Error('Missing HEDERA_ACCOUNT_ID or HEDERA_PRIVATE_KEY');
            }
            if (!this.marketplaceContractId) {
                throw new Error('Missing MARKETPLACE_CONTRACT_ID');
            }
            this.client = network === 'mainnet' ? sdk_1.Client.forMainnet() : sdk_1.Client.forTestnet();
            this.operatorId = sdk_1.AccountId.fromString(accountId);
            try {
                this.operatorKey = sdk_1.PrivateKey.fromStringECDSA(privateKey);
            }
            catch {
                this.operatorKey = sdk_1.PrivateKey.fromString(privateKey);
            }
            this.client.setOperator(this.operatorId, this.operatorKey);
            this.logger.log('Marketplace service initialized');
            this.logger.log(`Marketplace Contract: ${this.marketplaceContractId}`);
            this.logger.log(`TRUST Token: ${this.trustTokenId}`);
        }
        catch (error) {
            this.logger.error('Failed to initialize marketplace service', error);
            throw error;
        }
    }
    async listNFT(nftTokenId, serialNumber, price, sellerAccountId) {
        try {
            this.logger.log(`Listing NFT ${nftTokenId}#${serialNumber} for ${price} TRUST`);
            const nftAddress = sdk_1.AccountId.fromString(nftTokenId).toSolidityAddress();
            const params = new sdk_1.ContractFunctionParameters()
                .addAddress(nftAddress)
                .addUint256(serialNumber)
                .addUint256(price);
            const contractExecTx = new sdk_1.ContractExecuteTransaction()
                .setContractId(this.marketplaceContractId)
                .setGas(300000)
                .setFunction('listNFT', params)
                .setMaxTransactionFee(new sdk_1.Hbar(5));
            const response = await contractExecTx.execute(this.client);
            const receipt = await response.getReceipt(this.client);
            this.logger.log(`NFT listed successfully: ${response.transactionId.toString()}`);
            return {
                listingId: 0,
                transactionId: response.transactionId.toString()
            };
        }
        catch (error) {
            this.logger.error(`Failed to list NFT: ${error.message}`, error.stack);
            throw new Error(`Failed to list NFT: ${error.message}`);
        }
    }
    async buyNFT(listingId, buyerAccountId, buyerPrivateKey) {
        try {
            this.logger.log(`Buying NFT listing ${listingId}`);
            const listing = await this.getListing(listingId);
            if (!listing.isActive) {
                throw new Error('Listing is not active');
            }
            const platformFee = await this.calculatePlatformFee(listing.price);
            await this.transferTrustForPurchase(buyerAccountId, listing.seller, listing.price, platformFee, buyerPrivateKey);
            const params = new sdk_1.ContractFunctionParameters()
                .addUint256(listingId);
            const contractExecTx = new sdk_1.ContractExecuteTransaction()
                .setContractId(this.marketplaceContractId)
                .setGas(300000)
                .setFunction('buyNFT', params)
                .setMaxTransactionFee(new sdk_1.Hbar(5));
            const response = await contractExecTx.execute(this.client);
            await response.getReceipt(this.client);
            this.logger.log(`NFT purchased successfully: ${response.transactionId.toString()}`);
            return {
                transactionId: response.transactionId.toString(),
                seller: listing.seller,
                price: listing.price,
                platformFee: platformFee
            };
        }
        catch (error) {
            this.logger.error(`Failed to buy NFT: ${error.message}`, error.stack);
            throw new Error(`Failed to buy NFT: ${error.message}`);
        }
    }
    async transferTrustForPurchase(buyerAccountId, sellerAccountId, totalPrice, platformFee, buyerPrivateKey) {
        try {
            const sellerAmount = totalPrice - platformFee;
            const platformTreasury = this.operatorId.toString();
            const transferTx = new sdk_1.TransferTransaction()
                .addTokenTransfer(sdk_1.TokenId.fromString(this.trustTokenId), sdk_1.AccountId.fromString(buyerAccountId), -totalPrice)
                .addTokenTransfer(sdk_1.TokenId.fromString(this.trustTokenId), sdk_1.AccountId.fromString(sellerAccountId), sellerAmount)
                .addTokenTransfer(sdk_1.TokenId.fromString(this.trustTokenId), sdk_1.AccountId.fromString(platformTreasury), platformFee)
                .setMaxTransactionFee(new sdk_1.Hbar(5));
            if (buyerPrivateKey) {
                const buyerKey = sdk_1.PrivateKey.fromStringECDSA(buyerPrivateKey);
                const signedTx = await transferTx.sign(buyerKey);
                const response = await signedTx.execute(this.client);
                await response.getReceipt(this.client);
                return response.transactionId.toString();
            }
            else {
                const response = await transferTx.execute(this.client);
                await response.getReceipt(this.client);
                return response.transactionId.toString();
            }
        }
        catch (error) {
            this.logger.error('TRUST token transfer failed', error);
            throw error;
        }
    }
    async cancelListing(listingId) {
        try {
            this.logger.log(`Cancelling listing ${listingId}`);
            const params = new sdk_1.ContractFunctionParameters()
                .addUint256(listingId);
            const contractExecTx = new sdk_1.ContractExecuteTransaction()
                .setContractId(this.marketplaceContractId)
                .setGas(200000)
                .setFunction('cancelListing', params)
                .setMaxTransactionFee(new sdk_1.Hbar(3));
            const response = await contractExecTx.execute(this.client);
            await response.getReceipt(this.client);
            this.logger.log(`Listing cancelled: ${response.transactionId.toString()}`);
            return {
                transactionId: response.transactionId.toString()
            };
        }
        catch (error) {
            this.logger.error(`Failed to cancel listing: ${error.message}`, error.stack);
            throw new Error(`Failed to cancel listing: ${error.message}`);
        }
    }
    async updatePrice(listingId, newPrice) {
        try {
            this.logger.log(`Updating listing ${listingId} price to ${newPrice}`);
            const params = new sdk_1.ContractFunctionParameters()
                .addUint256(listingId)
                .addUint256(newPrice);
            const contractExecTx = new sdk_1.ContractExecuteTransaction()
                .setContractId(this.marketplaceContractId)
                .setGas(200000)
                .setFunction('updatePrice', params)
                .setMaxTransactionFee(new sdk_1.Hbar(3));
            const response = await contractExecTx.execute(this.client);
            await response.getReceipt(this.client);
            this.logger.log(`Price updated: ${response.transactionId.toString()}`);
            return {
                transactionId: response.transactionId.toString()
            };
        }
        catch (error) {
            this.logger.error(`Failed to update price: ${error.message}`, error.stack);
            throw new Error(`Failed to update price: ${error.message}`);
        }
    }
    async getListing(listingId) {
        try {
            const params = new sdk_1.ContractFunctionParameters()
                .addUint256(listingId);
            const query = new sdk_1.ContractCallQuery()
                .setContractId(this.marketplaceContractId)
                .setGas(100000)
                .setFunction('getListing', params);
            const result = await query.execute(this.client);
            const seller = result.getAddress(0);
            const nftAddress = result.getAddress(1);
            const serialNumber = result.getUint256(2).toNumber();
            const price = result.getUint256(3).toNumber();
            const isActive = result.getBool(4);
            const listedAt = result.getUint256(5).toNumber();
            return {
                seller: sdk_1.AccountId.fromSolidityAddress(seller).toString(),
                nftAddress: sdk_1.AccountId.fromSolidityAddress(nftAddress).toString(),
                serialNumber,
                price,
                isActive,
                listedAt
            };
        }
        catch (error) {
            this.logger.error(`Failed to get listing: ${error.message}`, error.stack);
            throw new Error(`Failed to get listing: ${error.message}`);
        }
    }
    async isNFTListed(nftTokenId, serialNumber) {
        try {
            const nftAddress = sdk_1.AccountId.fromString(nftTokenId).toSolidityAddress();
            const params = new sdk_1.ContractFunctionParameters()
                .addAddress(nftAddress)
                .addUint256(serialNumber);
            const query = new sdk_1.ContractCallQuery()
                .setContractId(this.marketplaceContractId)
                .setGas(100000)
                .setFunction('isNFTListed', params);
            const result = await query.execute(this.client);
            const isListed = result.getBool(0);
            const listingId = result.getUint256(1).toNumber();
            return { isListed, listingId };
        }
        catch (error) {
            this.logger.error(`Failed to check NFT listing: ${error.message}`, error.stack);
            throw new Error(`Failed to check NFT listing: ${error.message}`);
        }
    }
    async calculatePlatformFee(price) {
        try {
            const params = new sdk_1.ContractFunctionParameters()
                .addUint256(price);
            const query = new sdk_1.ContractCallQuery()
                .setContractId(this.marketplaceContractId)
                .setGas(100000)
                .setFunction('calculateFees', params);
            const result = await query.execute(this.client);
            const platformFee = result.getUint256(0).toNumber();
            return platformFee;
        }
        catch (error) {
            this.logger.error(`Failed to calculate fee: ${error.message}`, error.stack);
            return Math.floor(price * 250 / 10000);
        }
    }
    async getMarketplaceConfig() {
        try {
            const query = new sdk_1.ContractCallQuery()
                .setContractId(this.marketplaceContractId)
                .setGas(100000)
                .setFunction('getConfig');
            const result = await query.execute(this.client);
            const trustToken = sdk_1.AccountId.fromSolidityAddress(result.getAddress(0)).toString();
            const treasury = sdk_1.AccountId.fromSolidityAddress(result.getAddress(1)).toString();
            const feeBps = result.getUint256(2).toNumber();
            const owner = sdk_1.AccountId.fromSolidityAddress(result.getAddress(3)).toString();
            const activeListings = result.getUint256(4).toNumber();
            return {
                trustToken,
                treasury,
                feeBps,
                owner,
                activeListings
            };
        }
        catch (error) {
            this.logger.error(`Failed to get marketplace config: ${error.message}`, error.stack);
            throw new Error(`Failed to get marketplace config: ${error.message}`);
        }
    }
    async transferNFTFromEscrow(nftTokenId, serialNumber, buyerAccountId) {
        try {
            this.logger.log(`Transferring NFT from escrow: ${nftTokenId}#${serialNumber} → ${buyerAccountId}`);
            const { TransferTransaction, TokenId, AccountId } = await Promise.resolve().then(() => __importStar(require('@hashgraph/sdk')));
            const transferTx = await new TransferTransaction()
                .addNftTransfer(TokenId.fromString(nftTokenId), serialNumber, this.operatorId, AccountId.fromString(buyerAccountId))
                .setTransactionMemo(`Marketplace sale: ${nftTokenId}`)
                .freezeWith(this.client)
                .sign(this.operatorKey);
            const response = await transferTx.execute(this.client);
            const receipt = await response.getReceipt(this.client);
            this.logger.log(`✅ NFT transferred from escrow: ${response.transactionId.toString()}`);
            return {
                transactionId: response.transactionId.toString()
            };
        }
        catch (error) {
            this.logger.error(`Failed to transfer NFT from escrow: ${error.message}`, error.stack);
            throw new Error(`Failed to transfer NFT from escrow: ${error.message}`);
        }
    }
};
exports.MarketplaceService = MarketplaceService;
exports.MarketplaceService = MarketplaceService = MarketplaceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MarketplaceService);
//# sourceMappingURL=marketplace.service.js.map