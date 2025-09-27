export declare class PublicController {
    private readonly HEDERA_RPC_URL;
    private readonly UNIVERSAL_ASSET_FACTORY_ADDRESS;
    private readonly PROFESSIONAL_ATTESTOR_ADDRESS;
    private readonly UNIVERSAL_ASSET_FACTORY_ABI;
    private readonly PROFESSIONAL_ATTESTOR_ABI;
    getPublicAssetData(assetId: string): Promise<{
        success: boolean;
        data: {
            asset: {
                id: any;
                assetId: string;
                owner: any;
                category: any;
                assetType: any;
                name: any;
                location: {
                    address: any;
                    city: string;
                    state: string;
                    country: string;
                };
                totalValue: any;
                maturityDate: any;
                verificationScore: number;
                isActive: any;
                createdAt: any;
                nftContract: any;
                tokenId: any;
                verificationLevel: number;
                evidenceHashes: any;
                documentTypes: any;
                createdAtDate: string;
                valueInHbar: number;
            };
            verification: any;
            evidence: any;
            documentTypes: any;
        };
    }>;
    getAssetVerificationStatus(assetId: string): Promise<{
        success: boolean;
        data: {
            assetId: string;
            verification: any;
            isVerified: boolean;
        };
    }>;
}
