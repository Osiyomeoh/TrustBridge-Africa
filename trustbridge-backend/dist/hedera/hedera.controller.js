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
    constructor(hederaService) {
        this.hederaService = hederaService;
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
    async healthCheck() {
        const isHealthy = await this.hederaService.healthCheck();
        return {
            success: true,
            data: { healthy: isHealthy },
            message: isHealthy ? 'Hedera services are healthy' : 'Hedera services are not responding'
        };
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
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Health check for Hedera services' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Health status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HederaController.prototype, "healthCheck", null);
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
exports.HederaController = HederaController = __decorate([
    (0, swagger_1.ApiTags)('Hedera'),
    (0, common_1.Controller)('api/hedera'),
    __metadata("design:paramtypes", [hedera_service_1.HederaService])
], HederaController);
//# sourceMappingURL=hedera.controller.js.map