export declare enum RWACategory {
    REAL_ESTATE = "Real Estate",
    FARMLAND = "Farmland",
    EQUIPMENT = "Equipment",
    COMMODITIES = "Commodities",
    VEHICLES = "Vehicles",
    FARM_PRODUCE = "Farm Produce"
}
export declare enum RWAStatus {
    PENDING_AMC_ASSIGNMENT = "PENDING_AMC_ASSIGNMENT",
    ASSIGNED = "ASSIGNED",
    INSPECTION_SCHEDULED = "INSPECTION_SCHEDULED",
    INSPECTION_COMPLETED = "INSPECTION_COMPLETED",
    LEGAL_TRANSFER_PENDING = "LEGAL_TRANSFER_PENDING",
    LEGAL_TRANSFER_COMPLETED = "LEGAL_TRANSFER_COMPLETED",
    ACTIVE = "ACTIVE",
    REJECTED = "REJECTED",
    SUSPENDED = "SUSPENDED"
}
export declare enum RiskLevel {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH"
}
export declare enum LiquidityLevel {
    HIGH = "HIGH",
    MEDIUM = "MEDIUM",
    LOW = "LOW"
}
export declare class LocationDto {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: string;
}
export declare class CreateRWAAssetDto {
    name: string;
    description: string;
    category: RWACategory;
    assetType: string;
    location: string;
    totalValue: number;
    tokenSupply: number;
    expectedAPY: number;
    maturityDate: string;
    evidenceFiles: string[];
    legalDocuments: string[];
    inspectionPhotos?: string[];
    valuationReport?: string;
    ownershipDocuments?: string[];
    insuranceDocuments?: string[];
    maintenanceRecords?: string[];
    owner: string;
    status: RWAStatus;
    requiresAMC: boolean;
}
export declare class UpdateRWAAssetDto {
    name?: string;
    description?: string;
    category?: RWACategory;
    assetType?: string;
    location?: string;
    totalValue?: number;
    tokenSupply?: number;
    expectedAPY?: number;
    maturityDate?: string;
    status?: RWAStatus;
    amcId?: string;
    inspectionReport?: string;
    legalTransferStatus?: string;
    riskLevel?: RiskLevel;
    liquidity?: LiquidityLevel;
    currentValue?: number;
    totalReturn?: number;
    totalReturnPercent?: number;
}
export declare class RWAAssetQueryDto {
    search?: string;
    category?: RWACategory;
    status?: RWAStatus;
    riskLevel?: RiskLevel;
    liquidity?: LiquidityLevel;
    minAPY?: number;
    maxAPY?: number;
    minValue?: number;
    maxValue?: number;
    amcVerified?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}
