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
var RWAService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RWAService = void 0;
const common_1 = require("@nestjs/common");
const rwa_dto_1 = require("./dto/rwa.dto");
const chainlink_rwa_service_1 = require("./chainlink-rwa.service");
let RWAService = RWAService_1 = class RWAService {
    constructor(chainlinkRWAService) {
        this.chainlinkRWAService = chainlinkRWAService;
        this.logger = new common_1.Logger(RWAService_1.name);
        this.rwaAssets = [];
        this.initializeMockData();
    }
    initializeMockData() {
        const mockAssets = [
            {
                id: '1',
                name: 'Victoria Island Commercial Complex',
                description: 'Premium commercial complex in the heart of Victoria Island with high rental yields.',
                category: 'Real Estate',
                assetType: 'Commercial Building',
                location: 'Victoria Island, Lagos, Nigeria',
                totalValue: 2500000,
                tokenSupply: 25000,
                tokenPrice: 100,
                availableTokens: 15000,
                expectedAPY: 12.5,
                maturityDate: '2026-12-31',
                status: rwa_dto_1.RWAStatus.ACTIVE,
                owner: '0x1234567890123456789012345678901234567890',
                amcId: 'amc_001',
                amcName: 'Lagos Asset Management Co.',
                amcRating: 4.8,
                inspectionReport: 'ipfs://inspection-report-001',
                legalTransferStatus: 'COMPLETED',
                riskLevel: rwa_dto_1.RiskLevel.LOW,
                liquidity: rwa_dto_1.LiquidityLevel.HIGH,
                currentValue: 2650000,
                totalReturn: 300000,
                totalReturnPercent: 12.0,
                evidenceFiles: ['deed.pdf', 'valuation.pdf'],
                legalDocuments: ['deed.pdf', 'valuation.pdf', 'insurance.pdf'],
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-15')
            },
            {
                id: '2',
                name: 'Lekki Farmland Development',
                description: 'Prime agricultural land suitable for various crops with excellent growth potential.',
                category: 'Farmland',
                assetType: 'Agricultural Land',
                location: 'Lekki, Lagos, Nigeria',
                totalValue: 500000,
                tokenSupply: 20000,
                tokenPrice: 25,
                availableTokens: 8000,
                expectedAPY: 18.0,
                maturityDate: '2025-06-30',
                status: rwa_dto_1.RWAStatus.ACTIVE,
                owner: '0x9876543210987654321098765432109876543210',
                amcId: 'amc_002',
                amcName: 'AgriVest Management',
                amcRating: 4.6,
                inspectionReport: 'ipfs://inspection-report-002',
                legalTransferStatus: 'COMPLETED',
                riskLevel: rwa_dto_1.RiskLevel.MEDIUM,
                liquidity: rwa_dto_1.LiquidityLevel.MEDIUM,
                currentValue: 520000,
                totalReturn: 80000,
                totalReturnPercent: 16.0,
                evidenceFiles: ['land-title.pdf', 'survey.pdf'],
                legalDocuments: ['land-title.pdf', 'survey.pdf'],
                createdAt: new Date('2024-01-05'),
                updatedAt: new Date('2024-01-14')
            },
            {
                id: '3',
                name: 'Port Harcourt Mining Equipment',
                description: 'High-performance mining equipment with proven track record and regular maintenance.',
                category: 'Equipment',
                assetType: 'Mining Equipment',
                location: 'Port Harcourt, Rivers, Nigeria',
                totalValue: 750000,
                tokenSupply: 10000,
                tokenPrice: 75,
                availableTokens: 2500,
                expectedAPY: 15.0,
                maturityDate: '2024-12-31',
                status: rwa_dto_1.RWAStatus.ACTIVE,
                owner: '0x5555555555555555555555555555555555555555',
                amcId: 'amc_003',
                amcName: 'Industrial Asset Partners',
                amcRating: 4.4,
                inspectionReport: 'ipfs://inspection-report-003',
                legalTransferStatus: 'COMPLETED',
                riskLevel: rwa_dto_1.RiskLevel.HIGH,
                liquidity: rwa_dto_1.LiquidityLevel.LOW,
                currentValue: 780000,
                totalReturn: 90000,
                totalReturnPercent: 12.0,
                evidenceFiles: ['equipment-cert.pdf', 'maintenance.pdf'],
                legalDocuments: ['equipment-cert.pdf', 'maintenance.pdf'],
                createdAt: new Date('2024-01-10'),
                updatedAt: new Date('2024-01-13')
            }
        ];
        this.rwaAssets = mockAssets;
    }
    async createRWAAsset(createDto) {
        try {
            const rwaAsset = {
                id: `rwa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: createDto.name,
                description: createDto.description,
                category: createDto.category,
                assetType: createDto.assetType,
                location: createDto.location,
                totalValue: createDto.totalValue,
                tokenSupply: createDto.tokenSupply,
                tokenPrice: createDto.totalValue / createDto.tokenSupply,
                availableTokens: createDto.tokenSupply,
                expectedAPY: createDto.expectedAPY,
                maturityDate: createDto.maturityDate,
                status: createDto.status,
                owner: createDto.owner,
                riskLevel: this.calculateRiskLevel(createDto.expectedAPY, createDto.category),
                liquidity: this.calculateLiquidityLevel(createDto.category),
                evidenceFiles: createDto.evidenceFiles,
                legalDocuments: createDto.legalDocuments,
                inspectionPhotos: createDto.inspectionPhotos || [],
                valuationReport: createDto.valuationReport,
                ownershipDocuments: createDto.ownershipDocuments || [],
                insuranceDocuments: createDto.insuranceDocuments || [],
                maintenanceRecords: createDto.maintenanceRecords || [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            this.rwaAssets.push(rwaAsset);
            this.logger.log(`Created RWA asset: ${rwaAsset.name} (${rwaAsset.id})`);
            return rwaAsset;
        }
        catch (error) {
            this.logger.error(`Failed to create RWA asset: ${error.message}`);
            throw new Error(`RWA asset creation failed: ${error.message}`);
        }
    }
    async getRWAAssets(query) {
        try {
            let filteredAssets = [...this.rwaAssets];
            if (query.search) {
                const searchTerm = query.search.toLowerCase();
                filteredAssets = filteredAssets.filter(asset => asset.name.toLowerCase().includes(searchTerm) ||
                    asset.description.toLowerCase().includes(searchTerm) ||
                    asset.assetType.toLowerCase().includes(searchTerm) ||
                    asset.location.toLowerCase().includes(searchTerm));
            }
            if (query.category) {
                filteredAssets = filteredAssets.filter(asset => asset.category === query.category);
            }
            if (query.status) {
                filteredAssets = filteredAssets.filter(asset => asset.status === query.status);
            }
            if (query.riskLevel) {
                filteredAssets = filteredAssets.filter(asset => asset.riskLevel === query.riskLevel);
            }
            if (query.liquidity) {
                filteredAssets = filteredAssets.filter(asset => asset.liquidity === query.liquidity);
            }
            if (query.minAPY !== undefined) {
                filteredAssets = filteredAssets.filter(asset => asset.expectedAPY >= query.minAPY);
            }
            if (query.maxAPY !== undefined) {
                filteredAssets = filteredAssets.filter(asset => asset.expectedAPY <= query.maxAPY);
            }
            if (query.minValue !== undefined) {
                filteredAssets = filteredAssets.filter(asset => asset.totalValue >= query.minValue);
            }
            if (query.maxValue !== undefined) {
                filteredAssets = filteredAssets.filter(asset => asset.totalValue <= query.maxValue);
            }
            if (query.amcVerified !== undefined) {
                filteredAssets = filteredAssets.filter(asset => query.amcVerified ? !!asset.amcId : !asset.amcId);
            }
            if (query.sortBy) {
                filteredAssets.sort((a, b) => {
                    let aValue, bValue;
                    switch (query.sortBy) {
                        case 'name':
                            aValue = a.name;
                            bValue = b.name;
                            break;
                        case 'price':
                            aValue = a.tokenPrice;
                            bValue = b.tokenPrice;
                            break;
                        case 'apy':
                            aValue = a.expectedAPY;
                            bValue = b.expectedAPY;
                            break;
                        case 'value':
                            aValue = a.totalValue;
                            bValue = b.totalValue;
                            break;
                        case 'performance':
                            aValue = a.totalReturnPercent || 0;
                            bValue = b.totalReturnPercent || 0;
                            break;
                        case 'createdAt':
                            aValue = a.createdAt;
                            bValue = b.createdAt;
                            break;
                        default:
                            aValue = a.name;
                            bValue = b.name;
                    }
                    if (query.sortOrder === 'desc') {
                        return aValue > bValue ? -1 : 1;
                    }
                    else {
                        return aValue < bValue ? -1 : 1;
                    }
                });
            }
            const page = query.page || 1;
            const limit = query.limit || 20;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedAssets = filteredAssets.slice(startIndex, endIndex);
            return {
                assets: paginatedAssets,
                total: filteredAssets.length,
                page,
                limit
            };
        }
        catch (error) {
            this.logger.error(`Failed to get RWA assets: ${error.message}`);
            throw new Error(`Failed to get RWA assets: ${error.message}`);
        }
    }
    async getRWAAsset(id) {
        try {
            const asset = this.rwaAssets.find(a => a.id === id);
            if (!asset) {
                throw new common_1.NotFoundException(`RWA asset with ID ${id} not found`);
            }
            return asset;
        }
        catch (error) {
            this.logger.error(`Failed to get RWA asset ${id}: ${error.message}`);
            throw error;
        }
    }
    async updateRWAAsset(id, updateDto) {
        try {
            const assetIndex = this.rwaAssets.findIndex(a => a.id === id);
            if (assetIndex === -1) {
                throw new common_1.NotFoundException(`RWA asset with ID ${id} not found`);
            }
            const updatedAsset = {
                ...this.rwaAssets[assetIndex],
                ...updateDto,
                updatedAt: new Date()
            };
            this.rwaAssets[assetIndex] = updatedAsset;
            this.logger.log(`Updated RWA asset: ${updatedAsset.name} (${id})`);
            return updatedAsset;
        }
        catch (error) {
            this.logger.error(`Failed to update RWA asset ${id}: ${error.message}`);
            throw error;
        }
    }
    async getRWAAssetsByCategory(category) {
        try {
            return this.rwaAssets.filter(asset => asset.category === category);
        }
        catch (error) {
            this.logger.error(`Failed to get RWA assets by category ${category}: ${error.message}`);
            throw new Error(`Failed to get RWA assets by category: ${error.message}`);
        }
    }
    async getRWAAssetsByStatus(status) {
        try {
            return this.rwaAssets.filter(asset => asset.status === status);
        }
        catch (error) {
            this.logger.error(`Failed to get RWA assets by status ${status}: ${error.message}`);
            throw new Error(`Failed to get RWA assets by status: ${error.message}`);
        }
    }
    async getRWAAssetWithChainlinkData(id) {
        try {
            const asset = await this.getRWAAsset(id);
            const priceData = await this.chainlinkRWAService.getRWAAssetPrice(asset.id, asset.assetType, asset.category, asset.location);
            const riskData = await this.chainlinkRWAService.getRWARiskAssessment(asset.id, asset.category, asset.location, asset.expectedAPY);
            const marketData = await this.chainlinkRWAService.getRWAMarketData(asset.category, asset.location.split(',').pop()?.trim() || 'Nigeria');
            return {
                ...asset,
                chainlinkData: {
                    priceData,
                    riskData,
                    marketData,
                    lastUpdated: new Date()
                }
            };
        }
        catch (error) {
            this.logger.error(`Failed to get Chainlink data for RWA asset ${id}:`, error);
            throw error;
        }
    }
    async updateAssetWithChainlinkData(id) {
        try {
            const asset = await this.getRWAAsset(id);
            const priceData = await this.chainlinkRWAService.getRWAAssetPrice(asset.id, asset.assetType, asset.category, asset.location);
            const riskData = await this.chainlinkRWAService.getRWARiskAssessment(asset.id, asset.category, asset.location, asset.expectedAPY);
            const updatedAsset = {
                ...asset,
                currentValue: priceData?.currentValue || asset.currentValue,
                totalReturn: priceData ? (priceData.currentValue - asset.totalValue) : asset.totalReturn,
                totalReturnPercent: priceData ? ((priceData.currentValue - asset.totalValue) / asset.totalValue) * 100 : asset.totalReturnPercent,
                riskLevel: riskData?.riskLevel || asset.riskLevel,
                updatedAt: new Date()
            };
            const assetIndex = this.rwaAssets.findIndex(a => a.id === id);
            if (assetIndex !== -1) {
                this.rwaAssets[assetIndex] = updatedAsset;
            }
            this.logger.log(`Updated RWA asset ${id} with Chainlink data`);
            return updatedAsset;
        }
        catch (error) {
            this.logger.error(`Failed to update asset with Chainlink data:`, error);
            throw error;
        }
    }
    async assignAMCWithChainlinkVRF(assetId) {
        try {
            const asset = await this.getRWAAsset(assetId);
            const availableAMCs = [
                'amc_001_lagos_asset_management',
                'amc_002_agrivest_management',
                'amc_003_industrial_asset_partners',
                'amc_004_global_property_services',
                'amc_005_equipment_specialists'
            ];
            const assignmentData = await this.chainlinkRWAService.assignAMCWithVRF(assetId, availableAMCs);
            const updatedAsset = {
                ...asset,
                amcId: assignmentData.selectedAMC,
                status: rwa_dto_1.RWAStatus.ASSIGNED,
                updatedAt: new Date()
            };
            const assetIndex = this.rwaAssets.findIndex(a => a.id === assetId);
            if (assetIndex !== -1) {
                this.rwaAssets[assetIndex] = updatedAsset;
            }
            this.logger.log(`Assigned AMC ${assignmentData.selectedAMC} to asset ${assetId} using Chainlink VRF`);
            return {
                amcId: assignmentData.selectedAMC,
                assignmentReason: assignmentData.assignmentReason,
                transactionId: `vrf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
        }
        catch (error) {
            this.logger.error(`Failed to assign AMC with Chainlink VRF:`, error);
            throw error;
        }
    }
    async getChainlinkMarketData(category, region) {
        try {
            if (category && region) {
                return await this.chainlinkRWAService.getRWAMarketData(category, region);
            }
            const categories = ['Real Estate', 'Farmland', 'Equipment', 'Commodities', 'Vehicles', 'Farm Produce'];
            const regions = ['Nigeria', 'USA', 'UK', 'UAE', 'Singapore'];
            const marketData = [];
            for (const cat of categories) {
                for (const reg of regions) {
                    try {
                        const data = await this.chainlinkRWAService.getRWAMarketData(cat, reg);
                        marketData.push(data);
                    }
                    catch (error) {
                        this.logger.warn(`Failed to get market data for ${cat} in ${reg}: ${error.message}`);
                    }
                }
            }
            return marketData;
        }
        catch (error) {
            this.logger.error(`Failed to get Chainlink market data:`, error);
            throw error;
        }
    }
    async refreshAllAssetsWithChainlinkData() {
        try {
            this.logger.log('Refreshing all RWA assets with Chainlink data...');
            const updatePromises = this.rwaAssets.map(asset => this.updateAssetWithChainlinkData(asset.id).catch(error => {
                this.logger.warn(`Failed to update asset ${asset.id}: ${error.message}`);
            }));
            await Promise.all(updatePromises);
            this.logger.log('Completed refreshing all assets with Chainlink data');
        }
        catch (error) {
            this.logger.error(`Failed to refresh assets with Chainlink data:`, error);
            throw error;
        }
    }
    calculateRiskLevel(apy, category) {
        if (apy <= 8)
            return rwa_dto_1.RiskLevel.LOW;
        if (apy <= 15)
            return rwa_dto_1.RiskLevel.MEDIUM;
        return rwa_dto_1.RiskLevel.HIGH;
    }
    calculateLiquidityLevel(category) {
        switch (category) {
            case 'Real Estate':
                return rwa_dto_1.LiquidityLevel.HIGH;
            case 'Farmland':
                return rwa_dto_1.LiquidityLevel.MEDIUM;
            case 'Equipment':
                return rwa_dto_1.LiquidityLevel.LOW;
            case 'Commodities':
                return rwa_dto_1.LiquidityLevel.HIGH;
            case 'Vehicles':
                return rwa_dto_1.LiquidityLevel.MEDIUM;
            case 'Farm Produce':
                return rwa_dto_1.LiquidityLevel.MEDIUM;
            default:
                return rwa_dto_1.LiquidityLevel.MEDIUM;
        }
    }
};
exports.RWAService = RWAService;
exports.RWAService = RWAService = RWAService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [chainlink_rwa_service_1.ChainlinkRWAService])
], RWAService);
//# sourceMappingURL=rwa.service.js.map