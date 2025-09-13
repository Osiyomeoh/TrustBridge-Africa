import { HederaService } from './hedera.service';
import { TokenizationRequestDto } from './dto/tokenization-request.dto';
export declare class SettlementRequestDto {
    assetId: string;
    buyer: string;
    seller: string;
    amount: number;
    deliveryDeadline: Date;
}
export declare class KYCRequestDto {
    accountId: string;
    tokenId: string;
    kycStatus: 'GRANT' | 'REVOKE';
    reason?: string;
}
export declare class FreezeRequestDto {
    accountId: string;
    tokenId: string;
    freezeStatus: 'FREEZE' | 'UNFREEZE';
    reason?: string;
}
export declare class TokenAssociationRequestDto {
    accountId: string;
    tokenId: string;
    action: 'ASSOCIATE' | 'DISSOCIATE';
}
export declare class HederaController {
    private readonly hederaService;
    constructor(hederaService: HederaService);
    getHederaOverview(): Promise<{
        success: boolean;
        data: {
            status: string;
            availableEndpoints: string[];
        };
        message: string;
    }>;
    getStatus(): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    tokenizeAsset(tokenizationRequest: TokenizationRequestDto): Promise<{
        success: boolean;
        data: {
            tokenId: string;
            transactionId: string;
        };
        message: string;
    }>;
    mintTokens(tokenId: string, body: {
        amount: number;
        recipient: string;
    }): Promise<{
        success: boolean;
        data: {
            transactionId: string;
        };
        message: string;
    }>;
    transferTokens(body: {
        tokenId: string;
        from: string;
        to: string;
        amount: number;
    }): Promise<{
        success: boolean;
        data: {
            transactionId: string;
        };
        message: string;
    }>;
    createSettlement(settlementRequest: SettlementRequestDto): Promise<{
        success: boolean;
        data: {
            transactionId: string;
        };
        message: string;
    }>;
    getAccountBalance(accountId: string): Promise<{
        success: boolean;
        data: {
            accountId: string;
            balance: string;
        };
        message: string;
    }>;
    getTokenBalance(accountId: string, tokenId: string): Promise<{
        success: boolean;
        data: {
            accountId: string;
            tokenId: string;
            balance: number;
        };
        message: string;
    }>;
    submitHCSMessage(body: {
        topicId: string;
        message: any;
    }): Promise<{
        success: boolean;
        data: {
            transactionId: string;
        };
        message: string;
    }>;
    uploadFile(body: {
        content: string;
        fileName: string;
    }): Promise<{
        success: boolean;
        data: {
            fileId: string;
        };
        message: string;
    }>;
    healthCheck(): Promise<{
        success: boolean;
        data: {
            healthy: boolean;
        };
        message: string;
    }>;
    grantKYC(kycRequest: KYCRequestDto): Promise<{
        success: boolean;
        data: {
            transactionId: string;
        };
        message: string;
    }>;
    revokeKYC(kycRequest: KYCRequestDto): Promise<{
        success: boolean;
        data: {
            transactionId: string;
        };
        message: string;
    }>;
    freezeAccount(freezeRequest: FreezeRequestDto): Promise<{
        success: boolean;
        data: {
            transactionId: string;
        };
        message: string;
    }>;
    unfreezeAccount(freezeRequest: FreezeRequestDto): Promise<{
        success: boolean;
        data: {
            transactionId: string;
        };
        message: string;
    }>;
    freezeToken(freezeRequest: FreezeRequestDto): Promise<{
        success: boolean;
        data: {
            transactionId: string;
        };
        message: string;
    }>;
    associateToken(associationRequest: TokenAssociationRequestDto): Promise<{
        success: boolean;
        data: {
            transactionId: string;
        };
        message: string;
    }>;
    dissociateToken(associationRequest: TokenAssociationRequestDto): Promise<{
        success: boolean;
        data: {
            transactionId: string;
        };
        message: string;
    }>;
    getTokenInfo(tokenId: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getAccountInfo(accountId: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    completeKYCWorkflow(body: {
        accountId: string;
        tokenId: string;
        kycStatus: 'GRANT' | 'REVOKE';
    }): Promise<{
        success: boolean;
        data: {
            associateTxId?: string;
            kycTxId: string;
            status: string;
        };
        message: string;
    }>;
    completeFreezeWorkflow(body: {
        accountId: string;
        tokenId: string;
        freezeStatus: 'FREEZE' | 'UNFREEZE';
    }): Promise<{
        success: boolean;
        data: {
            freezeTxId: string;
            status: string;
        };
        message: string;
    }>;
}
