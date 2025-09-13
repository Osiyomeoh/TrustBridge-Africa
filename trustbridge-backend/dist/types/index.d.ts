export interface Asset {
    id: string;
    assetId: string;
    owner: string;
    type: AssetType;
    name: string;
    description?: string;
    location: Location;
    totalValue: number;
    tokenSupply: number;
    tokenizedAmount: number;
    maturityDate: Date;
    expectedAPY: number;
    verificationScore: number;
    status: AssetStatus;
    createdAt: Date;
    updatedAt: Date;
    tokenContract: string;
    operations: Operation[];
    investments: Investment[];
}
export interface Location {
    country: string;
    region: string;
    coordinates?: Coordinates;
    address?: string;
}
export interface Coordinates {
    lat: number;
    lng: number;
}
export interface Operation {
    id: string;
    assetId: string;
    type: OperationType;
    status: OperationStatus;
    operator: string;
    location?: Location;
    timestamp: Date;
    proofHash?: string;
    verified: boolean;
    metadata?: string;
}
export interface Investment {
    id: string;
    investor: string;
    assetId: string;
    amount: number;
    tokens: number;
    timestamp: Date;
    returns?: number;
}
export interface Settlement {
    id: string;
    assetId: string;
    buyer: string;
    seller: string;
    amount: number;
    status: SettlementStatus;
    createdAt: Date;
    deliveryDeadline: Date;
    trackingHash: string;
    confirmations: DeliveryConfirmation[];
}
export interface DeliveryConfirmation {
    confirmer: string;
    timestamp: Date;
    proofHash: string;
    isValid: boolean;
}
export declare enum AssetType {
    AGRICULTURAL = "AGRICULTURAL",
    REAL_ESTATE = "REAL_ESTATE",
    EQUIPMENT = "EQUIPMENT",
    INVENTORY = "INVENTORY",
    COMMODITY = "COMMODITY"
}
export declare enum AssetStatus {
    PENDING = "PENDING",
    VERIFIED = "VERIFIED",
    ACTIVE = "ACTIVE",
    OPERATIONAL = "OPERATIONAL",
    MATURED = "MATURED",
    SETTLED = "SETTLED"
}
export declare enum OperationType {
    CREATION = "CREATION",
    VERIFICATION = "VERIFICATION",
    TRANSFER = "TRANSFER",
    DELIVERY = "DELIVERY",
    SETTLEMENT = "SETTLEMENT"
}
export declare enum OperationStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
export declare enum SettlementStatus {
    PENDING = "PENDING",
    IN_TRANSIT = "IN_TRANSIT",
    DELIVERED = "DELIVERED",
    SETTLED = "SETTLED",
    DISPUTED = "DISPUTED"
}
