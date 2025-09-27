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
exports.AttestorsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const attestors_service_1 = require("./attestors.service");
let AttestorsController = class AttestorsController {
    constructor(attestorsService) {
        this.attestorsService = attestorsService;
    }
    async getAttestors() {
        try {
            const attestors = await this.attestorsService.getAllAttestors();
            return {
                success: true,
                data: attestors,
                message: `Found ${attestors.length} attestors`
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to get attestors'
            };
        }
    }
    async registerExternalParty(partyData) {
        try {
            const attestor = await this.attestorsService.registerExternalParty(partyData);
            return {
                success: true,
                data: attestor,
                message: 'External party registered successfully and pending approval'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to register external party'
            };
        }
    }
    async applyAsAttestor(applicationData) {
        try {
            if (applicationData.verificationType === 'manual_verification') {
                const result = await this.attestorsService.processManualAttestorApplication(applicationData);
                return {
                    success: true,
                    data: result.data,
                    message: result.message
                };
            }
            else {
                const result = await this.attestorsService.processAttestorApplication(applicationData);
                return {
                    success: true,
                    data: result,
                    message: 'Attestor application submitted successfully and pending verification'
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to submit attestor application'
            };
        }
    }
    async getAttestorApplications() {
        try {
            const applications = await this.attestorsService.getAllAttestorApplications();
            return {
                success: true,
                data: applications,
                message: `Found ${applications.length} attestor applications`
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to get attestor applications'
            };
        }
    }
    async approveAttestorApplication(id, body) {
        try {
            const result = await this.attestorsService.approveAttestorApplication(id, body.reviewerNotes);
            return {
                success: true,
                data: result,
                message: 'Attestor application approved successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to approve application'
            };
        }
    }
    async rejectAttestorApplication(id, body) {
        try {
            const result = await this.attestorsService.rejectAttestorApplication(id, body.reviewerNotes);
            return {
                success: true,
                data: result,
                message: 'Attestor application rejected'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to reject application'
            };
        }
    }
    async getAttestorsByLocation(country, region) {
        try {
            const attestors = await this.attestorsService.getAttestorsByLocation(country, region);
            return {
                success: true,
                data: attestors,
                message: `Found ${attestors.length} attestors in ${country}${region ? `, ${region}` : ''}`
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to get attestors by location'
            };
        }
    }
    async getAttestorsBySpecialty(specialty) {
        try {
            const attestors = await this.attestorsService.getAttestorsBySpecialty(specialty);
            return {
                success: true,
                data: attestors,
                message: `Found ${attestors.length} attestors with ${specialty} specialty`
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to get attestors by specialty'
            };
        }
    }
    async getAttestor(id) {
        try {
            const attestor = await this.attestorsService.getAttestor(id);
            return {
                success: true,
                data: attestor,
                message: 'Attestor details retrieved successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to get attestor details'
            };
        }
    }
    async submitAttestation(attestorId, attestationData) {
        try {
            await this.attestorsService.submitAttestation(attestorId, attestationData);
            return {
                success: true,
                message: 'Attestation submitted successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to submit attestation'
            };
        }
    }
    async updateReputation(attestorId, performance) {
        try {
            await this.attestorsService.updateReputation(attestorId, performance);
            return {
                success: true,
                message: 'Reputation updated successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to update reputation'
            };
        }
    }
    async approveAttestor(attestorId) {
        try {
            await this.attestorsService.approveAttestor(attestorId);
            return {
                success: true,
                message: 'Attestor approved successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to approve attestor'
            };
        }
    }
    async rejectAttestor(attestorId, body) {
        try {
            await this.attestorsService.rejectAttestor(attestorId, body.reason);
            return {
                success: true,
                message: 'Attestor rejected successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to reject attestor'
            };
        }
    }
};
exports.AttestorsController = AttestorsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all attestors' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of attestors' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AttestorsController.prototype, "getAttestors", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register new external party as attestor' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'External party registered successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AttestorsController.prototype, "registerExternalParty", null);
__decorate([
    (0, common_1.Post)('apply'),
    (0, swagger_1.ApiOperation)({ summary: 'Apply to become an attestor (manual or automated verification)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Attestor application submitted successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AttestorsController.prototype, "applyAsAttestor", null);
__decorate([
    (0, common_1.Get)('applications'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all attestor applications for admin review' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of attestor applications' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AttestorsController.prototype, "getAttestorApplications", null);
__decorate([
    (0, common_1.Put)('applications/:id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve attestor application' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Application ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Application approved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AttestorsController.prototype, "approveAttestorApplication", null);
__decorate([
    (0, common_1.Put)('applications/:id/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject attestor application' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Application ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Application rejected successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AttestorsController.prototype, "rejectAttestorApplication", null);
__decorate([
    (0, common_1.Get)('location/:country'),
    (0, swagger_1.ApiOperation)({ summary: 'Get attestors by location' }),
    (0, swagger_1.ApiParam)({ name: 'country', description: 'Country code' }),
    (0, swagger_1.ApiQuery)({ name: 'region', required: false, description: 'Region/state' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of attestors in location' }),
    __param(0, (0, common_1.Param)('country')),
    __param(1, (0, common_1.Query)('region')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AttestorsController.prototype, "getAttestorsByLocation", null);
__decorate([
    (0, common_1.Get)('specialty/:specialty'),
    (0, swagger_1.ApiOperation)({ summary: 'Get attestors by specialty' }),
    (0, swagger_1.ApiParam)({ name: 'specialty', description: 'Specialty type' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of attestors with specialty' }),
    __param(0, (0, common_1.Param)('specialty')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttestorsController.prototype, "getAttestorsBySpecialty", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get attestor by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Attestor ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Attestor details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttestorsController.prototype, "getAttestor", null);
__decorate([
    (0, common_1.Post)(':id/attestation'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit attestation for asset' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Attestor ID' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Attestation submitted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AttestorsController.prototype, "submitAttestation", null);
__decorate([
    (0, common_1.Put)(':id/reputation'),
    (0, swagger_1.ApiOperation)({ summary: 'Update attestor reputation' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Attestor ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reputation updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AttestorsController.prototype, "updateReputation", null);
__decorate([
    (0, common_1.Put)(':id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve attestor (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Attestor ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Attestor approved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttestorsController.prototype, "approveAttestor", null);
__decorate([
    (0, common_1.Put)(':id/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject attestor (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Attestor ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Attestor rejected successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AttestorsController.prototype, "rejectAttestor", null);
exports.AttestorsController = AttestorsController = __decorate([
    (0, swagger_1.ApiTags)('Attestors'),
    (0, common_1.Controller)('attestors'),
    __metadata("design:paramtypes", [attestors_service_1.AttestorsService])
], AttestorsController);
//# sourceMappingURL=attestors.controller.js.map