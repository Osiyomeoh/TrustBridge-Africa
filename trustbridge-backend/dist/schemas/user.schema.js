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
exports.UserSchema = exports.User = exports.EmailVerificationStatus = exports.KycStatus = exports.UserRole = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var UserRole;
(function (UserRole) {
    UserRole["INVESTOR"] = "INVESTOR";
    UserRole["ASSET_OWNER"] = "ASSET_OWNER";
    UserRole["VERIFIER"] = "VERIFIER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["PLATFORM_ADMIN"] = "PLATFORM_ADMIN";
    UserRole["AMC_ADMIN"] = "AMC_ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
var KycStatus;
(function (KycStatus) {
    KycStatus["PENDING"] = "pending";
    KycStatus["IN_PROGRESS"] = "in_progress";
    KycStatus["VERIFIED"] = "approved";
    KycStatus["REJECTED"] = "rejected";
    KycStatus["NOT_STARTED"] = "not_started";
})(KycStatus || (exports.KycStatus = KycStatus = {}));
var EmailVerificationStatus;
(function (EmailVerificationStatus) {
    EmailVerificationStatus["PENDING"] = "PENDING";
    EmailVerificationStatus["VERIFIED"] = "VERIFIED";
    EmailVerificationStatus["NOT_VERIFIED"] = "NOT_VERIFIED";
})(EmailVerificationStatus || (exports.EmailVerificationStatus = EmailVerificationStatus = {}));
let User = class User {
};
exports.User = User;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], User.prototype, "walletAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ unique: true, sparse: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "country", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: UserRole, default: UserRole.INVESTOR }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: KycStatus, default: KycStatus.NOT_STARTED }),
    __metadata("design:type", String)
], User.prototype, "kycStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "kycInquiryId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "kycProvider", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: EmailVerificationStatus, default: EmailVerificationStatus.NOT_VERIFIED }),
    __metadata("design:type", String)
], User.prototype, "emailVerificationStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "reputation", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "stakingBalance", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "stakingRewards", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "totalInvested", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "investmentCount", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], User.prototype, "lastInvestmentDate", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], User.prototype, "lastActivity", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "region", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], User.prototype, "lastLoginAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "resetPasswordToken", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], User.prototype, "resetPasswordExpires", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "emailVerificationToken", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], User.prototype, "emailVerificationExpires", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], User.prototype, "profile", void 0);
exports.User = User = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], User);
exports.UserSchema = mongoose_1.SchemaFactory.createForClass(User);
//# sourceMappingURL=user.schema.js.map