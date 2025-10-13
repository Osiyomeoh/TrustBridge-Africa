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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HederaController = exports.TokenAssociationRequestDto = exports.FreezeRequestDto = exports.KYCRequestDto = exports.SettlementRequestDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const hedera_service_1 = require("./hedera.service");
const trust_token_service_1 = require("./trust-token.service");
const hscs_contract_service_1 = require("./hscs-contract.service");
const hscs_hybrid_service_1 = require("./hscs-hybrid.service");
const marketplace_service_1 = require("./marketplace.service");
const hcs_service_1 = require("./hcs.service");
const tokenization_request_dto_1 = require("./dto/tokenization-request.dto");
class SettlementRequestDto {
}
exports.SettlementRequestDto = SettlementRequestDto;
class KYCRequestDto {
}
exports.KYCRequestDto = KYCRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0.0.1234567' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], KYCRequestDto.prototype, "accountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0.0.9876543' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], KYCRequestDto.prototype, "tokenId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'GRANT', enum: ['GRANT', 'REVOKE'] }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], KYCRequestDto.prototype, "kycStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'KYC verification completed', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], KYCRequestDto.prototype, "reason", void 0);
class FreezeRequestDto {
}
exports.FreezeRequestDto = FreezeRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0.0.1234567' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FreezeRequestDto.prototype, "accountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0.0.9876543' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FreezeRequestDto.prototype, "tokenId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'FREEZE', enum: ['FREEZE', 'UNFREEZE'] }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FreezeRequestDto.prototype, "freezeStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Compliance violation', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FreezeRequestDto.prototype, "reason", void 0);
class TokenAssociationRequestDto {
}
exports.TokenAssociationRequestDto = TokenAssociationRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0.0.1234567' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TokenAssociationRequestDto.prototype, "accountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0.0.9876543' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TokenAssociationRequestDto.prototype, "tokenId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ASSOCIATE', enum: ['ASSOCIATE', 'DISSOCIATE'] }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TokenAssociationRequestDto.prototype, "action", void 0);
let HederaController = class HederaController {
    constructor(hederaService, trustTokenService, hscsContractService, hscsHybridService, marketplaceService, hcsService) {
        this.hederaService = hederaService;
        this.trustTokenService = trustTokenService;
        this.hscsContractService = hscsContractService;
        this.hscsHybridService = hscsHybridService;
        this.marketplaceService = marketplaceService;
        this.hcsService = hcsService;
    }
    async getHederaOverview() {
        return {
            success: true,
            data: {
                status: 'Hedera services are running',
                availableEndpoints: [
                    'GET /api/hedera/status - Get network status',
                    'POST /api/hedera/tokenize - Create asset token',
                    'POST /api/hedera/mint/:tokenId - Mint tokens',
                    'POST /api/hedera/transfer - Transfer tokens',
                    'GET /api/hedera/balance/:accountId - Get account balance',
                    'GET /api/hedera/token-balance/:accountId/:tokenId - Get token balance',
                    'POST /api/hedera/kyc/grant - Grant KYC status',
                    'POST /api/hedera/kyc/revoke - Revoke KYC status',
                    'POST /api/hedera/freeze - Freeze account',
                    'POST /api/hedera/unfreeze - Unfreeze account'
                ]
            },
            message: 'Hedera services are operational'
        };
    }
    async getStatus() {
        const status = await this.hederaService.getNetworkStatus();
        return {
            success: true,
            data: status,
            message: 'Hedera services status'
        };
    }
    async tokenizeAsset(tokenizationRequest) {
        const result = await this.hederaService.createAssetToken(tokenizationRequest);
        return {
            success: true,
            data: result,
            message: 'Asset tokenized successfully'
        };
    }
    async mintTokens(tokenId, body) {
        const transactionId = await this.hederaService.mintTokens(tokenId, body.amount, body.recipient);
        return {
            success: true,
            data: { transactionId },
            message: 'Tokens minted successfully'
        };
    }
    async transferTokens(body) {
        const transactionId = await this.hederaService.transferTokens(body.tokenId, body.from, body.to, body.amount);
        return {
            success: true,
            data: { transactionId },
            message: 'Tokens transferred successfully'
        };
    }
    async createSettlement(settlementRequest) {
        const transactionId = await this.hederaService.createSettlement(settlementRequest);
        return {
            success: true,
            data: { transactionId },
            message: 'Settlement created successfully'
        };
    }
    async getAccountBalance(accountId) {
        const balance = await this.hederaService.getAccountBalance(accountId);
        return {
            success: true,
            data: { accountId, balance },
            message: 'Account balance retrieved'
        };
    }
    async getTokenBalance(accountId, tokenId) {
        const balance = await this.hederaService.getTokenBalance(accountId, tokenId);
        return {
            success: true,
            data: { accountId, tokenId, balance },
            message: 'Token balance retrieved'
        };
    }
    async submitHCSMessage(body) {
        const transactionId = await this.hederaService.createHCSMessage(body.topicId, body.message);
        return {
            success: true,
            data: { transactionId },
            message: 'HCS message submitted successfully'
        };
    }
    async uploadFile(body) {
        const contentBuffer = Buffer.from(body.content, 'base64');
        const fileId = await this.hederaService.storeFileOnHFS(contentBuffer, body.fileName);
        return {
            success: true,
            data: { fileId },
            message: 'File uploaded successfully'
        };
    }
    async createDualTokenization(body) {
        const result = await this.hederaService.createDualTokenization(body);
        return {
            success: true,
            data: result,
            message: 'Dual tokenization created successfully'
        };
    }
    async getUserAssets(userAddress) {
        const result = await this.hederaService.getUserAssets(userAddress);
        return {
            success: true,
            data: result,
            message: 'User assets retrieved successfully'
        };
    }
    async getMarketplaceData() {
        const result = await this.hederaService.getMarketplaceData();
        return {
            success: true,
            data: result,
            message: 'Marketplace data retrieved successfully'
        };
    }
    async updateDualTokenization(body) {
        const result = await this.hederaService.updateDualTokenization(body);
        return {
            success: true,
            data: result,
            message: 'Dual tokenization updated successfully'
        };
    }
    async healthCheck() {
        const isHealthy = await this.hederaService.healthCheck();
        return {
            success: true,
            data: { healthy: isHealthy },
            message: isHealthy ? 'Hedera services are healthy' : 'Hedera services are not responding'
        };
    }
    async testHTSSimple() {
        try {
            const result = await this.hederaService.testSimpleHTSToken();
            return {
                success: true,
                data: result,
                message: 'Simple HTS test completed successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Simple HTS test failed'
            };
        }
    }
    async testHFSHCS() {
        try {
            const result = await this.hederaService.testHFSHCSIntegration();
            return {
                success: true,
                data: result,
                message: 'HFS + HCS test completed successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'HFS + HCS test failed'
            };
        }
    }
    async grantKYC(kycRequest) {
        const transactionId = await this.hederaService.grantKYC(kycRequest);
        return {
            success: true,
            data: { transactionId },
            message: 'KYC granted successfully'
        };
    }
    async revokeKYC(kycRequest) {
        const transactionId = await this.hederaService.revokeKYC(kycRequest);
        return {
            success: true,
            data: { transactionId },
            message: 'KYC revoked successfully'
        };
    }
    async freezeAccount(freezeRequest) {
        const transactionId = await this.hederaService.freezeAccount(freezeRequest);
        return {
            success: true,
            data: { transactionId },
            message: 'Account frozen successfully'
        };
    }
    async unfreezeAccount(freezeRequest) {
        const transactionId = await this.hederaService.unfreezeAccount(freezeRequest);
        return {
            success: true,
            data: { transactionId },
            message: 'Account unfrozen successfully'
        };
    }
    async freezeToken(freezeRequest) {
        const transactionId = await this.hederaService.freezeToken(freezeRequest);
        return {
            success: true,
            data: { transactionId },
            message: `Token ${freezeRequest.freezeStatus === 'FREEZE' ? 'frozen' : 'unfrozen'} successfully`
        };
    }
    async associateToken(associationRequest) {
        const transactionId = await this.hederaService.associateToken(associationRequest);
        return {
            success: true,
            data: { transactionId },
            message: 'Token associated successfully'
        };
    }
    async dissociateToken(associationRequest) {
        const transactionId = await this.hederaService.dissociateToken(associationRequest);
        return {
            success: true,
            data: { transactionId },
            message: 'Token dissociated successfully'
        };
    }
    async getTokenInfo(tokenId) {
        const tokenInfo = await this.hederaService.getTokenInfo(tokenId);
        return {
            success: true,
            data: tokenInfo,
            message: 'Token information retrieved'
        };
    }
    async getAccountInfo(accountId) {
        const accountInfo = await this.hederaService.getAccountInfo(accountId);
        return {
            success: true,
            data: accountInfo,
            message: 'Account information retrieved'
        };
    }
    async completeKYCWorkflow(body) {
        const result = await this.hederaService.completeKYCWorkflow(body.accountId, body.tokenId, body.kycStatus);
        return {
            success: true,
            data: result,
            message: 'KYC workflow completed successfully'
        };
    }
    async completeFreezeWorkflow(body) {
        const result = await this.hederaService.completeFreezeWorkflow(body.accountId, body.tokenId, body.freezeStatus);
        return {
            success: true,
            data: result,
            message: 'Freeze workflow completed successfully'
        };
    }
    async initializeTrustToken() {
        const tokenId = await this.trustTokenService.initializeTrustToken();
        return {
            success: true,
            data: { tokenId },
            message: 'TRUST token initialized successfully'
        };
    }
    async mintTrustTokens(body) {
        const transactionId = await this.trustTokenService.mintTrustTokens(body.toAccountId, body.amount);
        return {
            success: true,
            data: { transactionId },
            message: `${body.amount} TRUST tokens minted to ${body.toAccountId}`
        };
    }
    async getTrustTokenBalance(accountId) {
        const balance = await this.trustTokenService.getTrustTokenBalance(accountId);
        return {
            success: true,
            data: { balance },
            message: `TRUST token balance for ${accountId}: ${balance}`
        };
    }
    async getTrustTokenInfo() {
        const tokenId = this.trustTokenService.getTrustTokenId();
        return {
            success: true,
            data: { tokenId },
            message: tokenId ? `TRUST token ID: ${tokenId}` : 'TRUST token not initialized'
        };
    }
    async exchangeHbarForTrust(exchangeRequest) {
        try {
            const result = await this.hscsContractService.exchangeHbarForTrust(exchangeRequest.accountId, exchangeRequest.hbarAmount, exchangeRequest.treasuryAccountId, exchangeRequest.operationsAccountId, exchangeRequest.stakingAccountId);
            return {
                success: true,
                data: result,
                message: 'HBAR exchanged for TRUST tokens successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to exchange HBAR for TRUST tokens'
            };
        }
    }
    async burnTrustTokens(burnRequest) {
        try {
            const transactionId = await this.hscsContractService.burnTrustTokens(burnRequest.accountId, burnRequest.amount, burnRequest.reason || 'NFT_CREATION');
            return {
                success: true,
                data: { transactionId },
                message: 'TRUST tokens burned successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to burn TRUST tokens'
            };
        }
    }
    async getExchangeInfo() {
        try {
            const info = await this.hscsContractService.getExchangeInfo();
            return {
                success: true,
                data: info,
                message: 'Exchange information retrieved successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to get exchange information'
            };
        }
    }
    async calculateNftCreationFee(feeRequest) {
        try {
            const fee = await this.hscsContractService.calculateNftCreationFee(feeRequest.verificationLevel, feeRequest.rarity);
            return {
                success: true,
                data: { fee },
                message: 'NFT creation fee calculated successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to calculate NFT creation fee'
            };
        }
    }
    async stakeTrustTokens(stakeRequest) {
        try {
            const transactionId = await this.hscsContractService.stakeTrustTokens(stakeRequest.accountId, stakeRequest.amount, stakeRequest.duration);
            return {
                success: true,
                data: { transactionId },
                message: 'TRUST tokens staked successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to stake TRUST tokens'
            };
        }
    }
    async hybridExchangeHbarForTrust(exchangeRequest) {
        try {
            const result = await this.hscsHybridService.exchangeHbarForTrust(exchangeRequest.accountId, exchangeRequest.hbarAmount, exchangeRequest.treasuryAccountId, exchangeRequest.operationsAccountId, exchangeRequest.stakingAccountId, exchangeRequest.fromAccountPrivateKey);
            return {
                success: true,
                data: result,
                message: 'HBAR exchanged for TRUST tokens successfully via hybrid approach'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to exchange HBAR for TRUST tokens via hybrid approach'
            };
        }
    }
    async hybridBurnTrustTokens(burnRequest) {
        try {
            const transactionId = await this.hscsHybridService.burnTrustTokens(burnRequest.accountId, burnRequest.amount, burnRequest.reason || 'NFT_CREATION', burnRequest.fromAccountPrivateKey);
            return {
                success: true,
                data: { transactionId },
                message: 'TRUST tokens burned successfully via hybrid approach'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to burn TRUST tokens via hybrid approach'
            };
        }
    }
    async hybridCalculateNftCreationFee(feeRequest) {
        try {
            const fee = await this.hscsHybridService.calculateNftCreationFee(feeRequest.verificationLevel, feeRequest.rarity);
            return {
                success: true,
                data: { fee },
                message: 'NFT creation fee calculated successfully via hybrid approach'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to calculate NFT creation fee via hybrid approach'
            };
        }
    }
    async hybridGetTrustTokenBalance(accountId) {
        try {
            const balance = await this.hscsHybridService.getTrustTokenBalance(accountId);
            return {
                success: true,
                data: { balance },
                message: 'TRUST token balance retrieved successfully via hybrid approach'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to get TRUST token balance via hybrid approach'
            };
        }
    }
    async hybridStakeTrustTokens(stakeRequest) {
        try {
            const transactionId = await this.hscsHybridService.stakeTrustTokens(stakeRequest.accountId, stakeRequest.amount, stakeRequest.duration);
            return {
                success: true,
                data: { transactionId },
                message: 'TRUST tokens staked successfully via hybrid approach'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to stake TRUST tokens via hybrid approach'
            };
        }
    }
    async marketplaceListNFT(listingData) {
        try {
            const result = await this.marketplaceService.listNFT(listingData.nftTokenId, listingData.serialNumber, listingData.price, listingData.sellerAccountId);
            return {
                success: true,
                data: result,
                message: 'NFT listed on marketplace successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to list NFT on marketplace'
            };
        }
    }
    async marketplaceBuyNFT(listingId, buyData) {
        try {
            const result = await this.marketplaceService.buyNFT(listingId, buyData.buyerAccountId, buyData.buyerPrivateKey);
            return {
                success: true,
                data: result,
                message: 'NFT purchased successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to buy NFT'
            };
        }
    }
    async marketplaceCancelListing(listingId) {
        try {
            const result = await this.marketplaceService.cancelListing(listingId);
            return {
                success: true,
                data: result,
                message: 'Listing cancelled successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to cancel listing'
            };
        }
    }
    async marketplaceUpdatePrice(priceData) {
        try {
            const result = await this.marketplaceService.updatePrice(priceData.listingId, priceData.newPrice);
            return {
                success: true,
                data: result,
                message: 'Listing price updated successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to update listing price'
            };
        }
    }
    async marketplaceGetListing(listingId) {
        try {
            const result = await this.marketplaceService.getListing(listingId);
            return {
                success: true,
                data: result,
                message: 'Listing details retrieved successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to get listing details'
            };
        }
    }
    async marketplaceCheckListing(nftTokenId, serialNumber) {
        try {
            const result = await this.marketplaceService.isNFTListed(nftTokenId, serialNumber);
            return {
                success: true,
                data: result,
                message: 'NFT listing status retrieved successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to check NFT listing status'
            };
        }
    }
    async marketplaceGetConfig() {
        try {
            const result = await this.marketplaceService.getMarketplaceConfig();
            return {
                success: true,
                data: result,
                message: 'Marketplace configuration retrieved successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to get marketplace configuration'
            };
        }
    }
    async marketplaceTransferNFT(transferData) {
        try {
            const result = await this.marketplaceService.transferNFTFromEscrow(transferData.nftTokenId, transferData.serialNumber, transferData.buyerAccountId);
            return {
                success: true,
                data: result,
                message: 'NFT transferred from marketplace escrow to buyer'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to transfer NFT from escrow'
            };
        }
    }
    async marketplaceReturnNFT(returnData) {
        try {
            const result = await this.marketplaceService.transferNFTFromEscrow(returnData.nftTokenId, returnData.serialNumber, returnData.sellerAccountId);
            return {
                success: true,
                data: result,
                message: 'NFT returned from marketplace escrow to seller'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to return NFT from escrow'
            };
        }
    }
    async submitMarketplaceEvent(event) {
        try {
            const transactionId = await this.hcsService.submitMarketplaceEvent(event);
            return {
                success: true,
                data: {
                    transactionId,
                    topicId: this.hcsService.getMarketplaceTopicId(),
                },
                message: 'Marketplace event submitted to HCS'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to submit marketplace event'
            };
        }
    }
    async getMarketplaceEvents(limit, assetTokenId) {
        try {
            const events = await this.hcsService.queryMarketplaceEvents(limit || 100, assetTokenId);
            return {
                success: true,
                data: {
                    events,
                    topicId: this.hcsService.getMarketplaceTopicId(),
                    count: events.length,
                },
                message: 'Marketplace events retrieved from HCS'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to query marketplace events'
            };
        }
    }
    async getAssetEvents(assetTokenId) {
        try {
            const events = await this.hcsService.queryMarketplaceEvents(1000, assetTokenId);
            return {
                success: true,
                data: {
                    events,
                    assetTokenId,
                    count: events.length,
                },
                message: `Retrieved ${events.length} events for asset ${assetTokenId}`
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to query asset events'
            };
        }
    }
    async submitOfferMessage(message) {
        try {
            const transactionId = await this.hcsService.submitOfferMessage(message);
            return {
                success: true,
                data: {
                    transactionId,
                    topicId: this.hcsService.getOfferTopicId(),
                },
                message: 'Offer message submitted to HCS'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to submit offer message'
            };
        }
    }
    async getOfferMessages(assetTokenId) {
        try {
            const messages = await this.hcsService.queryOfferMessages(assetTokenId);
            return {
                success: true,
                data: {
                    messages,
                    assetTokenId,
                    count: messages.length,
                },
                message: `Retrieved ${messages.length} offer messages for asset ${assetTokenId}`
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to query offer messages'
            };
        }
    }
    async getTopicsInfo() {
        try {
            const marketplaceTopicId = this.hcsService.getMarketplaceTopicId();
            const offerTopicId = this.hcsService.getOfferTopicId();
            const marketplaceInfo = marketplaceTopicId
                ? await this.hcsService.getTopicInfo(marketplaceTopicId)
                : null;
            const offerInfo = offerTopicId
                ? await this.hcsService.getTopicInfo(offerTopicId)
                : null;
            return {
                success: true,
                data: {
                    marketplaceTopic: marketplaceInfo,
                    offerTopic: offerInfo,
                },
                message: 'HCS topic information retrieved'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to get topic information'
            };
        }
    }
};
exports.HederaController = HederaController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get Hedera services overview' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Hedera services overview' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "getHederaOverview", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Hedera services status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Hedera services status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('tokenize'),
    (0, swagger_1.ApiOperation)({ summary: 'Create asset token on Hedera' }),
    (0, swagger_1.ApiBody)({ type: tokenization_request_dto_1.TokenizationRequestDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Asset tokenized successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tokenization_request_dto_1.TokenizationRequestDto]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "tokenizeAsset", null);
__decorate([
    (0, common_1.Post)('mint/:tokenId'),
    (0, swagger_1.ApiOperation)({ summary: 'Mint tokens for asset' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tokens minted successfully' }),
    __param(0, (0, common_1.Param)('tokenId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "mintTokens", null);
__decorate([
    (0, common_1.Post)('transfer'),
    (0, swagger_1.ApiOperation)({ summary: 'Transfer tokens between accounts' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tokens transferred successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "transferTokens", null);
__decorate([
    (0, common_1.Post)('settlement'),
    (0, swagger_1.ApiOperation)({ summary: 'Create settlement on Hedera' }),
    (0, swagger_1.ApiBody)({ type: SettlementRequestDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Settlement created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SettlementRequestDto]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "createSettlement", null);
__decorate([
    (0, common_1.Get)('balance/:accountId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get account balance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account balance retrieved' }),
    __param(0, (0, common_1.Param)('accountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "getAccountBalance", null);
__decorate([
    (0, common_1.Get)('token-balance/:accountId/:tokenId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get token balance for account' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token balance retrieved' }),
    __param(0, (0, common_1.Param)('accountId')),
    __param(1, (0, common_1.Param)('tokenId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "getTokenBalance", null);
__decorate([
    (0, common_1.Post)('hcs/message'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit message to HCS topic' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Message submitted successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "submitHCSMessage", null);
__decorate([
    (0, common_1.Post)('hfs/upload'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload file to HFS' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'File uploaded successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('create-dual-tokenization'),
    (0, swagger_1.ApiOperation)({ summary: 'Create dual tokenization (ERC-721 + HTS) for an asset' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Dual tokenization created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "createDualTokenization", null);
__decorate([
    (0, common_1.Get)('user-assets/:userAddress'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all assets for a user using Hedera services' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User assets retrieved successfully' }),
    __param(0, (0, common_1.Param)('userAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "getUserAssets", null);
__decorate([
    (0, common_1.Get)('marketplace-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Get marketplace data using Hedera services' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Marketplace data retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "getMarketplaceData", null);
__decorate([
    (0, common_1.Post)('update-dual-tokenization'),
    (0, swagger_1.ApiOperation)({ summary: 'Update dual tokenization with ERC-721 data' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dual tokenization updated successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "updateDualTokenization", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Health check for Hedera services' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Health status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Post)('test-hts-simple'),
    (0, swagger_1.ApiOperation)({ summary: 'Test simple HTS token creation' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'HTS test completed' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "testHTSSimple", null);
__decorate([
    (0, common_1.Post)('test-hfs-hcs'),
    (0, swagger_1.ApiOperation)({ summary: 'Test HFS + HCS integration (simplest flow)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'HFS + HCS test completed' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "testHFSHCS", null);
__decorate([
    (0, common_1.Post)('kyc/grant'),
    (0, swagger_1.ApiOperation)({ summary: 'Grant KYC status for account on token' }),
    (0, swagger_1.ApiBody)({ type: KYCRequestDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KYC granted successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [KYCRequestDto]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "grantKYC", null);
__decorate([
    (0, common_1.Post)('kyc/revoke'),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke KYC status for account on token' }),
    (0, swagger_1.ApiBody)({ type: KYCRequestDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KYC revoked successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [KYCRequestDto]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "revokeKYC", null);
__decorate([
    (0, common_1.Post)('freeze'),
    (0, swagger_1.ApiOperation)({ summary: 'Freeze account for token' }),
    (0, swagger_1.ApiBody)({ type: FreezeRequestDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account frozen successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [FreezeRequestDto]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "freezeAccount", null);
__decorate([
    (0, common_1.Post)('unfreeze'),
    (0, swagger_1.ApiOperation)({ summary: 'Unfreeze account for token' }),
    (0, swagger_1.ApiBody)({ type: FreezeRequestDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account unfrozen successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [FreezeRequestDto]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "unfreezeAccount", null);
__decorate([
    (0, common_1.Post)('freeze/token'),
    (0, swagger_1.ApiOperation)({ summary: 'Freeze or unfreeze token' }),
    (0, swagger_1.ApiBody)({ type: FreezeRequestDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token freeze status updated successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [FreezeRequestDto]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "freezeToken", null);
__decorate([
    (0, common_1.Post)('associate'),
    (0, swagger_1.ApiOperation)({ summary: 'Associate token with account' }),
    (0, swagger_1.ApiBody)({ type: TokenAssociationRequestDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token associated successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [TokenAssociationRequestDto]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "associateToken", null);
__decorate([
    (0, common_1.Post)('dissociate'),
    (0, swagger_1.ApiOperation)({ summary: 'Dissociate token from account' }),
    (0, swagger_1.ApiBody)({ type: TokenAssociationRequestDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token dissociated successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [TokenAssociationRequestDto]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "dissociateToken", null);
__decorate([
    (0, common_1.Get)('token-info/:tokenId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get token information' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token information retrieved' }),
    __param(0, (0, common_1.Param)('tokenId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "getTokenInfo", null);
__decorate([
    (0, common_1.Get)('account-info/:accountId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get account information' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account information retrieved' }),
    __param(0, (0, common_1.Param)('accountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "getAccountInfo", null);
__decorate([
    (0, common_1.Post)('compliance/kyc-workflow'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete KYC workflow (associate + grant/revoke KYC)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KYC workflow completed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "completeKYCWorkflow", null);
__decorate([
    (0, common_1.Post)('compliance/freeze-workflow'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete freeze workflow (freeze/unfreeze account)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Freeze workflow completed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "completeFreezeWorkflow", null);
__decorate([
    (0, common_1.Post)('trust-token/initialize'),
    (0, swagger_1.ApiOperation)({ summary: 'Initialize TRUST token on Hedera' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'TRUST token initialized successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "initializeTrustToken", null);
__decorate([
    (0, common_1.Post)('trust-token/mint'),
    (0, swagger_1.ApiOperation)({ summary: 'Mint TRUST tokens to an account' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                toAccountId: { type: 'string', example: '0.0.1234567' },
                amount: { type: 'number', example: 1000 }
            },
            required: ['toAccountId', 'amount']
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'TRUST tokens minted successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "mintTrustTokens", null);
__decorate([
    (0, common_1.Get)('trust-token/balance/:accountId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get TRUST token balance for an account' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'TRUST token balance retrieved' }),
    __param(0, (0, common_1.Param)('accountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "getTrustTokenBalance", null);
__decorate([
    (0, common_1.Get)('trust-token/info'),
    (0, swagger_1.ApiOperation)({ summary: 'Get TRUST token information' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'TRUST token information retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "getTrustTokenInfo", null);
__decorate([
    (0, common_1.Post)('trust-token/exchange'),
    (0, swagger_1.ApiOperation)({ summary: 'Exchange HBAR for TRUST tokens via HSCS contract' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Exchange successful' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "exchangeHbarForTrust", null);
__decorate([
    (0, common_1.Post)('trust-token/burn'),
    (0, swagger_1.ApiOperation)({ summary: 'Burn TRUST tokens via HSCS contract' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Burn successful' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "burnTrustTokens", null);
__decorate([
    (0, common_1.Get)('trust-token/exchange-info'),
    (0, swagger_1.ApiOperation)({ summary: 'Get exchange information from HSCS contract' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Exchange information' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "getExchangeInfo", null);
__decorate([
    (0, common_1.Post)('trust-token/calculate-fee'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate NFT creation fee via HSCS contract' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fee calculated' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "calculateNftCreationFee", null);
__decorate([
    (0, common_1.Post)('trust-token/stake'),
    (0, swagger_1.ApiOperation)({ summary: 'Stake TRUST tokens via HSCS contract' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Staking successful' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "stakeTrustTokens", null);
__decorate([
    (0, common_1.Post)('trust-token/hybrid/exchange'),
    (0, swagger_1.ApiOperation)({ summary: 'Exchange HBAR for TRUST tokens using hybrid HSCS + HTS approach' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Exchange successful' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "hybridExchangeHbarForTrust", null);
__decorate([
    (0, common_1.Post)('trust-token/hybrid/burn'),
    (0, swagger_1.ApiOperation)({ summary: 'Burn TRUST tokens using hybrid HSCS + HTS approach' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Burn successful' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "hybridBurnTrustTokens", null);
__decorate([
    (0, common_1.Post)('trust-token/hybrid/calculate-fee'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate NFT creation fee using hybrid HSCS + HTS approach' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fee calculated' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "hybridCalculateNftCreationFee", null);
__decorate([
    (0, common_1.Get)('trust-token/hybrid/balance/:accountId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get TRUST token balance using hybrid HSCS + HTS approach' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Balance retrieved' }),
    __param(0, (0, common_1.Param)('accountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "hybridGetTrustTokenBalance", null);
__decorate([
    (0, common_1.Post)('trust-token/hybrid/stake'),
    (0, swagger_1.ApiOperation)({ summary: 'Stake TRUST tokens using hybrid HSCS + HTS approach' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Staking successful' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "hybridStakeTrustTokens", null);
__decorate([
    (0, common_1.Post)('marketplace/list'),
    (0, swagger_1.ApiOperation)({ summary: 'List NFT on marketplace' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'NFT listed successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "marketplaceListNFT", null);
__decorate([
    (0, common_1.Post)('marketplace/buy/:listingId'),
    (0, swagger_1.ApiOperation)({ summary: 'Buy NFT from marketplace' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'NFT purchased successfully' }),
    __param(0, (0, common_1.Param)('listingId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "marketplaceBuyNFT", null);
__decorate([
    (0, common_1.Post)('marketplace/cancel/:listingId'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel marketplace listing' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Listing cancelled successfully' }),
    __param(0, (0, common_1.Param)('listingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "marketplaceCancelListing", null);
__decorate([
    (0, common_1.Post)('marketplace/update-price'),
    (0, swagger_1.ApiOperation)({ summary: 'Update marketplace listing price' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Price updated successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "marketplaceUpdatePrice", null);
__decorate([
    (0, common_1.Get)('marketplace/listing/:listingId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get marketplace listing details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Listing details retrieved' }),
    __param(0, (0, common_1.Param)('listingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "marketplaceGetListing", null);
__decorate([
    (0, common_1.Get)('marketplace/check-listing/:nftTokenId/:serialNumber'),
    (0, swagger_1.ApiOperation)({ summary: 'Check if NFT is listed' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'NFT listing status checked' }),
    __param(0, (0, common_1.Param)('nftTokenId')),
    __param(1, (0, common_1.Param)('serialNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "marketplaceCheckListing", null);
__decorate([
    (0, common_1.Get)('marketplace/config'),
    (0, swagger_1.ApiOperation)({ summary: 'Get marketplace configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Marketplace config retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "marketplaceGetConfig", null);
__decorate([
    (0, common_1.Post)('marketplace/transfer-nft'),
    (0, swagger_1.ApiOperation)({ summary: 'Transfer NFT from marketplace escrow to buyer' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'NFT transferred successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "marketplaceTransferNFT", null);
__decorate([
    (0, common_1.Post)('marketplace/return-nft'),
    (0, swagger_1.ApiOperation)({ summary: 'Return NFT from marketplace escrow to seller (unlist)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'NFT returned successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "marketplaceReturnNFT", null);
__decorate([
    (0, common_1.Post)('hcs/marketplace/event'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit marketplace event to HCS (immutable audit trail)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Event submitted successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "submitMarketplaceEvent", null);
__decorate([
    (0, common_1.Get)('hcs/marketplace/events'),
    (0, swagger_1.ApiOperation)({ summary: 'Query marketplace events from HCS' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Events retrieved successfully' }),
    __param(0, (0, common_1.Param)('limit')),
    __param(1, (0, common_1.Param)('assetTokenId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "getMarketplaceEvents", null);
__decorate([
    (0, common_1.Get)('hcs/marketplace/events/:assetTokenId'),
    (0, swagger_1.ApiOperation)({ summary: 'Query marketplace events for specific asset from HCS' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asset events retrieved successfully' }),
    __param(0, (0, common_1.Param)('assetTokenId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "getAssetEvents", null);
__decorate([
    (0, common_1.Post)('hcs/offers/message'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit offer message to HCS (decentralized communication)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Message submitted successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "submitOfferMessage", null);
__decorate([
    (0, common_1.Get)('hcs/offers/messages/:assetTokenId'),
    (0, swagger_1.ApiOperation)({ summary: 'Query offer messages for specific asset from HCS' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Offer messages retrieved successfully' }),
    __param(0, (0, common_1.Param)('assetTokenId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "getOfferMessages", null);
__decorate([
    (0, common_1.Get)('hcs/topics/info'),
    (0, swagger_1.ApiOperation)({ summary: 'Get HCS topic information' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Topic info retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "getTopicsInfo", null);
exports.HederaController = HederaController = __decorate([
    (0, swagger_1.ApiTags)('Hedera'),
    (0, common_1.Controller)('hedera'),
    __metadata("design:paramtypes", [hedera_service_1.HederaService,
        trust_token_service_1.TrustTokenService,
        hscs_contract_service_1.HscsContractService,
        hscs_hybrid_service_1.HscsHybridService,
        marketplace_service_1.MarketplaceService,
        hcs_service_1.HcsService])
], HederaController);
//# sourceMappingURL=hedera.controller.js.map