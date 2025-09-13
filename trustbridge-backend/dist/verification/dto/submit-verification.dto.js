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
exports.SubmitVerificationDto = exports.EvidenceDto = exports.PhotoDto = exports.DocumentDto = exports.LocationDto = exports.CoordinatesDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CoordinatesDto {
}
exports.CoordinatesDto = CoordinatesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 6.5244 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CoordinatesDto.prototype, "lat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3.3792 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CoordinatesDto.prototype, "lng", void 0);
class LocationDto {
}
exports.LocationDto = LocationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: CoordinatesDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CoordinatesDto),
    __metadata("design:type", CoordinatesDto)
], LocationDto.prototype, "coordinates", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Lagos, Nigeria' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LocationDto.prototype, "address", void 0);
class DocumentDto {
}
exports.DocumentDto = DocumentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DocumentDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'image/png' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DocumentDto.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'land_certificate.pdf' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DocumentDto.prototype, "fileName", void 0);
class PhotoDto {
}
exports.PhotoDto = PhotoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PhotoDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'image/jpeg' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PhotoDto.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: CoordinatesDto, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CoordinatesDto),
    __metadata("design:type", CoordinatesDto)
], PhotoDto.prototype, "gps", void 0);
class EvidenceDto {
}
exports.EvidenceDto = EvidenceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [DocumentDto], required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DocumentDto),
    __metadata("design:type", Array)
], EvidenceDto.prototype, "documents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [PhotoDto], required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PhotoDto),
    __metadata("design:type", Array)
], EvidenceDto.prototype, "photos", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: LocationDto, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => LocationDto),
    __metadata("design:type", LocationDto)
], EvidenceDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], EvidenceDto.prototype, "additionalInfo", void 0);
class SubmitVerificationDto {
}
exports.SubmitVerificationDto = SubmitVerificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'AGRICULTURAL_1756990208031_bf3qrljet' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitVerificationDto.prototype, "assetId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: EvidenceDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => EvidenceDto),
    __metadata("design:type", EvidenceDto)
], SubmitVerificationDto.prototype, "evidence", void 0);
//# sourceMappingURL=submit-verification.dto.js.map