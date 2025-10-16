import { CollectionsService } from './collections.service';
export declare class CollectionsController {
    private readonly collectionsService;
    constructor(collectionsService: CollectionsService);
    createCollection(body: any, req: any): Promise<{
        success: boolean;
        data: import("../schemas/collection.schema").Collection;
        message: string;
    }>;
    getCollection(id: string): Promise<{
        success: boolean;
        data: import("../schemas/collection.schema").Collection;
    }>;
    getCollections(creator?: string, verified?: string, category?: string, sortBy?: 'volume' | 'floor' | 'items' | 'created', sortOrder?: 'asc' | 'desc', limit?: string, skip?: string): Promise<{
        success: boolean;
        data: import("../schemas/collection.schema").Collection[];
        total: number;
    }>;
    addNFTToCollection(collectionId: string, body: {
        tokenId: string;
    }): Promise<{
        success: boolean;
        data: import("../schemas/collection.schema").Collection;
        message: string;
    }>;
    updateCollectionStats(collectionId: string, stats: any): Promise<{
        success: boolean;
        data: import("../schemas/collection.schema").Collection;
        message: string;
    }>;
    searchCollections(query: string, limit?: string): Promise<{
        success: boolean;
        data: import("../schemas/collection.schema").Collection[];
    }>;
    getTrendingCollections(limit?: string): Promise<{
        success: boolean;
        data: import("../schemas/collection.schema").Collection[];
    }>;
    getCollectionsByCreator(address: string): Promise<{
        success: boolean;
        data: import("../schemas/collection.schema").Collection[];
    }>;
}
