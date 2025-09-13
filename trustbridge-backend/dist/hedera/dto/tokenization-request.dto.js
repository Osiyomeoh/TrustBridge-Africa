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
exports.TokenizationRequestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class TokenizationRequestDto {
}
exports.TokenizationRequestDto = TokenizationRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'AGRICULTURAL_1756990208031_bf3qrljet' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TokenizationRequestDto.prototype, "assetId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0x1234567890123456789012345678901234567890' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TokenizationRequestDto.prototype, "owner", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1000 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TokenizationRequestDto.prototype, "totalSupply", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Coffee Farm Token' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TokenizationRequestDto.prototype, "tokenName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'CFT' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TokenizationRequestDto.prototype, "tokenSymbol", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: { description: 'Test coffee farm token' }, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], TokenizationRequestDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TokenizationRequestDto.prototype, "enableKyc", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TokenizationRequestDto.prototype, "enableFreeze", void 0);
//# sourceMappingURL=tokenization-request.dto.js.map