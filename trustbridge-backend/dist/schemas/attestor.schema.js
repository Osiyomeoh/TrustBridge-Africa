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
exports.AttestorSchema = exports.Attestor = exports.ContactInfo = exports.Credentials = exports.AttestorType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var AttestorType;
(function (AttestorType) {
    AttestorType["COOPERATIVE"] = "COOPERATIVE";
    AttestorType["EXTENSION_OFFICER"] = "EXTENSION_OFFICER";
    AttestorType["GOVERNMENT_OFFICIAL"] = "GOVERNMENT_OFFICIAL";
    AttestorType["SURVEYOR"] = "SURVEYOR";
    AttestorType["APPRAISER"] = "APPRAISER";
    AttestorType["AUDITOR"] = "AUDITOR";
})(AttestorType || (exports.AttestorType = AttestorType = {}));
let Credentials = class Credentials {
};
exports.Credentials = Credentials;
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Credentials.prototype, "licenseNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Credentials.prototype, "certifications", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Credentials.prototype, "yearsExperience", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Credentials.prototype, "registrationProof", void 0);
exports.Credentials = Credentials = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Credentials);
let ContactInfo = class ContactInfo {
};
exports.ContactInfo = ContactInfo;
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ContactInfo.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ContactInfo.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ContactInfo.prototype, "address", void 0);
exports.ContactInfo = ContactInfo = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ContactInfo);
let Attestor = class Attestor {
};
exports.Attestor = Attestor;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Attestor.prototype, "address", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Attestor.prototype, "organizationName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: AttestorType }),
    __metadata("design:type", String)
], Attestor.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: AttestorType }),
    __metadata("design:type", String)
], Attestor.prototype, "organizationType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Attestor.prototype, "country", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Attestor.prototype, "region", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Attestor.prototype, "specialties", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Credentials, required: true }),
    __metadata("design:type", Credentials)
], Attestor.prototype, "credentials", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: ContactInfo, required: true }),
    __metadata("design:type", ContactInfo)
], Attestor.prototype, "contactInfo", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Attestor.prototype, "contactEmail", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Attestor.prototype, "contactPhone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Attestor.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Attestor.prototype, "reputation", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Attestor.prototype, "totalStaked", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Attestor.prototype, "stakeAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Attestor.prototype, "verificationCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Attestor.prototype, "totalAttestations", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Attestor.prototype, "successfulAttestations", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Attestor.prototype, "successRate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Attestor.prototype, "averageResponseTime", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Attestor.prototype, "lastVerificationDate", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Attestor.prototype, "lastActivity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Attestor.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Attestor.prototype, "rejectionReason", void 0);
exports.Attestor = Attestor = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Attestor);
exports.AttestorSchema = mongoose_1.SchemaFactory.createForClass(Attestor);
//# sourceMappingURL=attestor.schema.js.map