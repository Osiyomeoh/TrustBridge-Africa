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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RWAAssetQueryDto = exports.UpdateRWAAssetDto = exports.CreateRWAAssetDto = exports.LocationDto = exports.LiquidityLevel = exports.RiskLevel = exports.RWAStatus = exports.RWACategory = void 0;
const class_validator_1 = require("class-validator");
var RWACategory;
(function (RWACategory) {
    RWACategory["REAL_ESTATE"] = "Real Estate";
    RWACategory["FARMLAND"] = "Farmland";
    RWACategory["EQUIPMENT"] = "Equipment";
    RWACategory["COMMODITIES"] = "Commodities";
    RWACategory["VEHICLES"] = "Vehicles";
    RWACategory["FARM_PRODUCE"] = "Farm Produce";
})(RWACategory || (exports.RWACategory = RWACategory = {}));
var RWAStatus;
(function (RWAStatus) {
    RWAStatus["PENDING_AMC_ASSIGNMENT"] = "PENDING_AMC_ASSIGNMENT";
    RWAStatus["ASSIGNED"] = "ASSIGNED";
    RWAStatus["INSPECTION_SCHEDULED"] = "INSPECTION_SCHEDULED";
    RWAStatus["INSPECTION_COMPLETED"] = "INSPECTION_COMPLETED";
    RWAStatus["LEGAL_TRANSFER_PENDING"] = "LEGAL_TRANSFER_PENDING";
    RWAStatus["LEGAL_TRANSFER_COMPLETED"] = "LEGAL_TRANSFER_COMPLETED";
    RWAStatus["ACTIVE"] = "ACTIVE";
    RWAStatus["REJECTED"] = "REJECTED";
    RWAStatus["SUSPENDED"] = "SUSPENDED";
})(RWAStatus || (exports.RWAStatus = RWAStatus = {}));
var RiskLevel;
(function (RiskLevel) {
    RiskLevel["LOW"] = "LOW";
    RiskLevel["MEDIUM"] = "MEDIUM";
    RiskLevel["HIGH"] = "HIGH";
})(RiskLevel || (exports.RiskLevel = RiskLevel = {}));
var LiquidityLevel;
(function (LiquidityLevel) {
    LiquidityLevel["HIGH"] = "HIGH";
    LiquidityLevel["MEDIUM"] = "MEDIUM";
    LiquidityLevel["LOW"] = "LOW";
})(LiquidityLevel || (exports.LiquidityLevel = LiquidityLevel = {}));
class LocationDto {
}
exports.LocationDto = LocationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LocationDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LocationDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LocationDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LocationDto.prototype, "country", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LocationDto.prototype, "coordinates", void 0);
class CreateRWAAssetDto {
}
exports.CreateRWAAssetDto = CreateRWAAssetDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRWAAssetDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRWAAssetDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(RWACategory),
    __metadata("design:type", String)
], CreateRWAAssetDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRWAAssetDto.prototype, "assetType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRWAAssetDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateRWAAssetDto.prototype, "totalValue", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateRWAAssetDto.prototype, "tokenSupply", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateRWAAssetDto.prototype, "expectedAPY", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateRWAAssetDto.prototype, "maturityDate", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateRWAAssetDto.prototype, "evidenceFiles", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateRWAAssetDto.prototype, "legalDocuments", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateRWAAssetDto.prototype, "inspectionPhotos", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRWAAssetDto.prototype, "valuationReport", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateRWAAssetDto.prototype, "ownershipDocuments", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateRWAAssetDto.prototype, "insuranceDocuments", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateRWAAssetDto.prototype, "maintenanceRecords", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRWAAssetDto.prototype, "owner", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(RWAStatus),
    __metadata("design:type", String)
], CreateRWAAssetDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateRWAAssetDto.prototype, "requiresAMC", void 0);
class UpdateRWAAssetDto {
}
exports.UpdateRWAAssetDto = UpdateRWAAssetDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRWAAssetDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRWAAssetDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(RWACategory),
    __metadata("design:type", String)
], UpdateRWAAssetDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRWAAssetDto.prototype, "assetType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRWAAssetDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateRWAAssetDto.prototype, "totalValue", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateRWAAssetDto.prototype, "tokenSupply", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpdateRWAAssetDto.prototype, "expectedAPY", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateRWAAssetDto.prototype, "maturityDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(RWAStatus),
    __metadata("design:type", String)
], UpdateRWAAssetDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRWAAssetDto.prototype, "amcId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRWAAssetDto.prototype, "inspectionReport", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRWAAssetDto.prototype, "legalTransferStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(RiskLevel),
    __metadata("design:type", String)
], UpdateRWAAssetDto.prototype, "riskLevel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(LiquidityLevel),
    __metadata("design:type", String)
], UpdateRWAAssetDto.prototype, "liquidity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateRWAAssetDto.prototype, "currentValue", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateRWAAssetDto.prototype, "totalReturn", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpdateRWAAssetDto.prototype, "totalReturnPercent", void 0);
class RWAAssetQueryDto {
}
exports.RWAAssetQueryDto = RWAAssetQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RWAAssetQueryDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(RWACategory),
    __metadata("design:type", String)
], RWAAssetQueryDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(RWAStatus),
    __metadata("design:type", String)
], RWAAssetQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(RiskLevel),
    __metadata("design:type", String)
], RWAAssetQueryDto.prototype, "riskLevel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(LiquidityLevel),
    __metadata("design:type", String)
], RWAAssetQueryDto.prototype, "liquidity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], RWAAssetQueryDto.prototype, "minAPY", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], RWAAssetQueryDto.prototype, "maxAPY", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], RWAAssetQueryDto.prototype, "minValue", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], RWAAssetQueryDto.prototype, "maxValue", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], RWAAssetQueryDto.prototype, "amcVerified", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RWAAssetQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RWAAssetQueryDto.prototype, "sortOrder", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], RWAAssetQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], RWAAssetQueryDto.prototype, "limit", void 0);
//# sourceMappingURL=rwa.dto.js.map