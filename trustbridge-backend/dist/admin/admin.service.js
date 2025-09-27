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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../schemas/user.schema");
const attestor_schema_1 = require("../schemas/attestor.schema");
const verification_request_schema_1 = require("../schemas/verification-request.schema");
let AdminService = class AdminService {
    constructor(userModel, attestorModel, verificationRequestModel) {
        this.userModel = userModel;
        this.attestorModel = attestorModel;
        this.verificationRequestModel = verificationRequestModel;
    }
    async getAdminStats() {
        try {
            const totalAttestors = await this.attestorModel.countDocuments();
            const pendingApplications = await this.attestorModel.countDocuments({
                status: 'pending_review'
            });
            const approvedAttestors = await this.attestorModel.countDocuments({
                status: 'approved'
            });
            const rejectedAttestors = await this.attestorModel.countDocuments({
                status: 'rejected'
            });
            const totalVerifications = await this.verificationRequestModel.countDocuments();
            const activeVerifications = await this.verificationRequestModel.countDocuments({
                status: 'pending'
            });
            return {
                totalAttestors,
                pendingApplications,
                approvedAttestors,
                rejectedAttestors,
                totalVerifications,
                activeVerifications
            };
        }
        catch (error) {
            console.error('Failed to get admin stats:', error);
            throw new Error('Failed to retrieve admin statistics');
        }
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(attestor_schema_1.Attestor.name)),
    __param(2, (0, mongoose_1.InjectModel)(verification_request_schema_1.VerificationRequest.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], AdminService);
//# sourceMappingURL=admin.service.js.map