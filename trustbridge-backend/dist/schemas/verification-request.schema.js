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
exports.VerificationRequestSchema = exports.VerificationRequest = exports.Scoring = exports.Attestation = exports.Evidence = exports.IPFSFile = exports.VerificationStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["SUBMITTED"] = "SUBMITTED";
    VerificationStatus["EVIDENCE_GATHERING"] = "EVIDENCE_GATHERING";
    VerificationStatus["VERIFIED"] = "VERIFIED";
    VerificationStatus["REJECTED"] = "REJECTED";
})(VerificationStatus || (exports.VerificationStatus = VerificationStatus = {}));
let IPFSFile = class IPFSFile {
};
exports.IPFSFile = IPFSFile;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], IPFSFile.prototype, "cid", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], IPFSFile.prototype, "ipfsUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], IPFSFile.prototype, "fileName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], IPFSFile.prototype, "fileType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], IPFSFile.prototype, "fileSize", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], IPFSFile.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], IPFSFile.prototype, "category", void 0);
exports.IPFSFile = IPFSFile = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], IPFSFile);
let Evidence = class Evidence {
};
exports.Evidence = Evidence;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Evidence.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Evidence.prototype, "provider", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Evidence.prototype, "confidence", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, required: true }),
    __metadata("design:type", Object)
], Evidence.prototype, "result", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [IPFSFile], default: [] }),
    __metadata("design:type", Array)
], Evidence.prototype, "files", void 0);
exports.Evidence = Evidence = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Evidence);
let Attestation = class Attestation {
};
exports.Attestation = Attestation;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Attestation.prototype, "attestorAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Attestation.prototype, "confidence", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Attestation.prototype, "evidence", void 0);
exports.Attestation = Attestation = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Attestation);
let Scoring = class Scoring {
};
exports.Scoring = Scoring;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Scoring.prototype, "automatedScore", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Scoring.prototype, "attestorScore", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Scoring.prototype, "finalScore", void 0);
exports.Scoring = Scoring = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Scoring);
let VerificationRequest = class VerificationRequest {
};
exports.VerificationRequest = VerificationRequest;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], VerificationRequest.prototype, "assetId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: VerificationStatus, default: VerificationStatus.SUBMITTED }),
    __metadata("design:type", String)
], VerificationRequest.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Evidence], default: [] }),
    __metadata("design:type", Array)
], VerificationRequest.prototype, "evidence", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Attestation], default: [] }),
    __metadata("design:type", Array)
], VerificationRequest.prototype, "attestations", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Scoring }),
    __metadata("design:type", Scoring)
], VerificationRequest.prototype, "scoring", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [IPFSFile], default: [] }),
    __metadata("design:type", Array)
], VerificationRequest.prototype, "documents", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [IPFSFile], default: [] }),
    __metadata("design:type", Array)
], VerificationRequest.prototype, "photos", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], VerificationRequest.prototype, "submittedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], VerificationRequest.prototype, "completedAt", void 0);
exports.VerificationRequest = VerificationRequest = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], VerificationRequest);
exports.VerificationRequestSchema = mongoose_1.SchemaFactory.createForClass(VerificationRequest);
//# sourceMappingURL=verification-request.schema.js.map