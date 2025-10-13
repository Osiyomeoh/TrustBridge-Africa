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
var TradingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradingService = void 0;
const common_1 = require("@nestjs/common");
const hedera_service_1 = require("../hedera/hedera.service");
let TradingService = TradingService_1 = class TradingService {
    constructor(hederaService) {
        this.hederaService = hederaService;
        this.logger = new common_1.Logger(TradingService_1.name);
    }
    async listDigitalAssetForSale(listingDto) {
        try {
            const transactionId = await this.hederaService.listDigitalAssetForSale(listingDto.assetId, listingDto.price, listingDto.expiry);
            this.logger.log(`Listed digital asset ${listingDto.assetId} for sale at ${listingDto.price} TRUST`);
            return { transactionId };
        }
        catch (error) {
            this.logger.error(`Failed to list digital asset for sale: ${error.message}`);
            throw new Error(`Digital asset listing failed: ${error.message}`);
        }
    }
    async makeOfferOnDigitalAsset(offerDto) {
        try {
            const transactionId = await this.hederaService.makeOfferOnDigitalAsset(offerDto.assetId, offerDto.offerAmount, offerDto.expiry);
            this.logger.log(`Made offer ${offerDto.offerAmount} TRUST on digital asset ${offerDto.assetId}`);
            return { transactionId };
        }
        catch (error) {
            this.logger.error(`Failed to make offer on digital asset: ${error.message}`);
            throw new Error(`Digital asset offer failed: ${error.message}`);
        }
    }
    async getDigitalAssetOffers(assetId) {
        try {
            return [
                {
                    offerId: `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    assetId,
                    buyer: '0x1234567890123456789012345678901234567890',
                    offerAmount: '100',
                    expiry: Math.floor(Date.now() / 1000) + (3 * 24 * 60 * 60),
                    isActive: true,
                    createdAt: new Date()
                }
            ];
        }
        catch (error) {
            this.logger.error(`Failed to get digital asset offers: ${error.message}`);
            throw new Error(`Failed to get offers: ${error.message}`);
        }
    }
    async acceptOfferOnDigitalAsset(acceptDto) {
        try {
            const transactionId = `accept_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.logger.log(`Accepted offer ${acceptDto.offerId} for digital asset`);
            return { transactionId };
        }
        catch (error) {
            this.logger.error(`Failed to accept offer: ${error.message}`);
            throw new Error(`Offer acceptance failed: ${error.message}`);
        }
    }
    async getTradingStats() {
        try {
            return {
                totalVolume: 50000,
                totalTrades: 150,
                averagePrice: 333.33,
                activeListings: 25,
                activeOffers: 40
            };
        }
        catch (error) {
            this.logger.error(`Failed to get trading stats: ${error.message}`);
            throw new Error(`Failed to get trading statistics: ${error.message}`);
        }
    }
    async getAssetTradingHistory(assetId) {
        try {
            return {
                listings: [],
                offers: [],
                trades: []
            };
        }
        catch (error) {
            this.logger.error(`Failed to get asset trading history: ${error.message}`);
            throw new Error(`Failed to get trading history: ${error.message}`);
        }
    }
    async getAllListings() {
        this.logger.log('Getting all listings');
        return {
            success: true,
            data: {
                listings: [],
                total: 0
            }
        };
    }
    async createListing(listingData) {
        this.logger.log('Creating listing:', listingData);
        return {
            success: true,
            data: {
                id: Date.now().toString(),
                ...listingData,
                createdAt: new Date().toISOString()
            }
        };
    }
    async purchaseListing(id, purchaseData) {
        this.logger.log(`Processing purchase for listing ${id}:`, purchaseData);
        return {
            success: true,
            data: {
                purchaseId: Date.now().toString(),
                listingId: id,
                ...purchaseData,
                completedAt: new Date().toISOString()
            }
        };
    }
};
exports.TradingService = TradingService;
exports.TradingService = TradingService = TradingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hedera_service_1.HederaService])
], TradingService);
//# sourceMappingURL=trading.service.js.map