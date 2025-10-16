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
var CollectionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const collection_schema_1 = require("../schemas/collection.schema");
let CollectionsService = CollectionsService_1 = class CollectionsService {
    constructor(collectionModel) {
        this.collectionModel = collectionModel;
        this.logger = new common_1.Logger(CollectionsService_1.name);
    }
    async createCollection(data) {
        try {
            const collectionId = `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const collection = new this.collectionModel({
                collectionId,
                name: data.name,
                description: data.description,
                symbol: data.symbol,
                creator: data.creator,
                bannerImage: data.bannerImage,
                profileImage: data.profileImage,
                category: data.category || [],
                royalty: {
                    percentage: data.royaltyPercentage || 0,
                    receiver: data.creator,
                },
                socialLinks: data.socialLinks || {},
                verified: false,
                nftTokenIds: [],
                itemCount: 0,
                ownerCount: 0,
                listedCount: 0,
                totalVolume: 0,
                floorPrice: 0,
            });
            const saved = await collection.save();
            this.logger.log(`Created collection: ${saved.collectionId}`);
            return saved;
        }
        catch (error) {
            this.logger.error('Error creating collection:', error);
            throw error;
        }
    }
    async getCollection(collectionId) {
        return this.collectionModel.findOne({ collectionId }).exec();
    }
    async getCollections(filters) {
        try {
            const query = {};
            if (filters?.creator) {
                query.creator = filters.creator;
            }
            if (filters?.verified !== undefined) {
                query.verified = filters.verified;
            }
            if (filters?.category) {
                query.category = filters.category;
            }
            let sort = { createdAt: -1 };
            if (filters?.sortBy === 'volume') {
                sort = { totalVolume: filters.sortOrder === 'asc' ? 1 : -1 };
            }
            else if (filters?.sortBy === 'floor') {
                sort = { floorPrice: filters.sortOrder === 'asc' ? 1 : -1 };
            }
            else if (filters?.sortBy === 'items') {
                sort = { itemCount: filters.sortOrder === 'asc' ? 1 : -1 };
            }
            const limit = filters?.limit || 50;
            const skip = filters?.skip || 0;
            const [collections, total] = await Promise.all([
                this.collectionModel.find(query).sort(sort).limit(limit).skip(skip).exec(),
                this.collectionModel.countDocuments(query).exec(),
            ]);
            return { collections, total };
        }
        catch (error) {
            this.logger.error('Error fetching collections:', error);
            throw error;
        }
    }
    async addNFTToCollection(collectionId, tokenId) {
        try {
            const collection = await this.collectionModel.findOne({ collectionId }).exec();
            if (!collection) {
                this.logger.warn(`Collection not found: ${collectionId}`);
                return null;
            }
            if (!collection.nftTokenIds.includes(tokenId)) {
                collection.nftTokenIds.push(tokenId);
                collection.itemCount = collection.nftTokenIds.length;
                await collection.save();
                this.logger.log(`Added NFT ${tokenId} to collection ${collectionId}`);
            }
            return collection;
        }
        catch (error) {
            this.logger.error('Error adding NFT to collection:', error);
            throw error;
        }
    }
    async updateCollectionStats(collectionId, stats) {
        try {
            const update = {};
            if (stats.floorPrice !== undefined) {
                update.floorPrice = stats.floorPrice;
            }
            if (stats.totalVolume !== undefined) {
                update.totalVolume = stats.totalVolume;
            }
            if (stats.listedCount !== undefined) {
                update.listedCount = stats.listedCount;
            }
            if (stats.ownerCount !== undefined) {
                update.ownerCount = stats.ownerCount;
            }
            if (stats.sales24h !== undefined || stats.volume24h !== undefined) {
                update['stats.sales24h'] = stats.sales24h;
                update['stats.volume24h'] = stats.volume24h;
            }
            const collection = await this.collectionModel
                .findOneAndUpdate({ collectionId }, { $set: update }, { new: true })
                .exec();
            if (collection) {
                this.logger.log(`Updated stats for collection: ${collectionId}`);
            }
            return collection;
        }
        catch (error) {
            this.logger.error('Error updating collection stats:', error);
            throw error;
        }
    }
    async searchCollections(searchTerm, limit = 20) {
        try {
            return this.collectionModel
                .find({
                $text: { $search: searchTerm },
            })
                .limit(limit)
                .exec();
        }
        catch (error) {
            this.logger.error('Error searching collections:', error);
            throw error;
        }
    }
    async getTrendingCollections(limit = 10) {
        try {
            return this.collectionModel
                .find({ 'stats.volume24h': { $gt: 0 } })
                .sort({ 'stats.volume24h': -1 })
                .limit(limit)
                .exec();
        }
        catch (error) {
            this.logger.error('Error fetching trending collections:', error);
            throw error;
        }
    }
    async getCollectionsByCreator(creator) {
        try {
            return this.collectionModel
                .find({ creator })
                .sort({ createdAt: -1 })
                .exec();
        }
        catch (error) {
            this.logger.error('Error fetching collections by creator:', error);
            throw error;
        }
    }
    async verifyCollection(collectionId, verified = true) {
        try {
            const collection = await this.collectionModel
                .findOneAndUpdate({ collectionId }, { $set: { verified } }, { new: true })
                .exec();
            if (collection) {
                this.logger.log(`Collection ${collectionId} verification set to: ${verified}`);
            }
            return collection;
        }
        catch (error) {
            this.logger.error('Error verifying collection:', error);
            throw error;
        }
    }
};
exports.CollectionsService = CollectionsService;
exports.CollectionsService = CollectionsService = CollectionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(collection_schema_1.Collection.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], CollectionsService);
//# sourceMappingURL=collections.service.js.map