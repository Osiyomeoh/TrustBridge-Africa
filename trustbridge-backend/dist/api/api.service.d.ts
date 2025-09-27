export declare class ApiService {
    private readonly logger;
    createDigitalAsset(assetData: {
        category: number;
        assetType: string;
        name: string;
        location: string;
        totalValue: string;
        imageURI: string;
        description: string;
        owner: string;
        assetId?: string;
        transactionId?: string;
    }): Promise<{
        assetId: string;
        transactionId: string;
    }>;
    createRWAAsset(assetData: {
        category: number;
        assetType: string;
        name: string;
        location: string;
        totalValue: string;
        maturityDate: number;
        evidenceHashes: string[];
        documentTypes: string[];
        imageURI: string;
        documentURI: string;
        description: string;
        owner: string;
        assetId?: string;
        transactionId?: string;
    }): Promise<{
        assetId: string;
        transactionId: string;
    }>;
    verifyAsset(assetId: string, verificationLevel: number): Promise<{
        transactionId: string;
    }>;
    listDigitalAssetForSale(assetId: string, price: string, expiry: number): Promise<{
        transactionId: string;
    }>;
    makeOfferOnDigitalAsset(assetId: string, offerAmount: string, expiry: number): Promise<{
        transactionId: string;
    }>;
    createPool(poolData: {
        name: string;
        description: string;
        managementFee: number;
        performanceFee: number;
        poolId?: string;
        transactionId?: string;
    }): Promise<{
        poolId: string;
        transactionId: string;
    }>;
    investInPool(poolId: string, amount: string): Promise<{
        transactionId: string;
    }>;
    registerAMC(amcData: {
        name: string;
        description: string;
        jurisdiction: string;
        amcId?: string;
        transactionId?: string;
    }): Promise<{
        amcId: string;
        transactionId: string;
    }>;
    scheduleInspection(assetId: string, inspector: string, inspectionTime: number): Promise<{
        transactionId: string;
    }>;
    getAssetById(assetId: string): Promise<any>;
    getPoolById(poolId: string): Promise<any>;
}
