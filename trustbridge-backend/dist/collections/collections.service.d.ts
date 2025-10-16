import { Model } from 'mongoose';
import { Collection, CollectionDocument } from '../schemas/collection.schema';
export declare class CollectionsService {
    private collectionModel;
    private readonly logger;
    constructor(collectionModel: Model<CollectionDocument>);
    createCollection(data: {
        name: string;
        description?: string;
        symbol?: string;
        creator: string;
        bannerImage?: string;
        profileImage?: string;
        category?: string[];
        royaltyPercentage?: number;
        socialLinks?: any;
    }): Promise<Collection>;
    getCollection(collectionId: string): Promise<Collection | null>;
    getCollections(filters?: {
        creator?: string;
        verified?: boolean;
        category?: string;
        sortBy?: 'volume' | 'floor' | 'items' | 'created';
        sortOrder?: 'asc' | 'desc';
        limit?: number;
        skip?: number;
    }): Promise<{
        collections: Collection[];
        total: number;
    }>;
    addNFTToCollection(collectionId: string, tokenId: string): Promise<Collection | null>;
    updateCollectionStats(collectionId: string, stats: {
        floorPrice?: number;
        totalVolume?: number;
        listedCount?: number;
        ownerCount?: number;
        sales24h?: number;
        volume24h?: number;
    }): Promise<Collection | null>;
    searchCollections(searchTerm: string, limit?: number): Promise<Collection[]>;
    getTrendingCollections(limit?: number): Promise<Collection[]>;
    getCollectionsByCreator(creator: string): Promise<Collection[]>;
    verifyCollection(collectionId: string, verified?: boolean): Promise<Collection | null>;
}
