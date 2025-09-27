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
var AMCService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AMCService = void 0;
const common_1 = require("@nestjs/common");
const hedera_service_1 = require("../hedera/hedera.service");
let AMCService = AMCService_1 = class AMCService {
    constructor(hederaService) {
        this.hederaService = hederaService;
        this.logger = new common_1.Logger(AMCService_1.name);
    }
    async registerAMC(registerDto) {
        try {
            const transactionId = await this.hederaService.registerAMC(registerDto.name, registerDto.description, registerDto.jurisdiction);
            const amcId = `amc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.logger.log(`Registered AMC: ${registerDto.name} (${amcId})`);
            return { amcId, transactionId };
        }
        catch (error) {
            this.logger.error(`Failed to register AMC: ${error.message}`);
            throw new Error(`AMC registration failed: ${error.message}`);
        }
    }
    async scheduleInspection(scheduleDto) {
        try {
            const transactionId = await this.hederaService.scheduleInspection(scheduleDto.assetId, scheduleDto.inspector, scheduleDto.inspectionTime);
            this.logger.log(`Scheduled inspection for asset ${scheduleDto.assetId}`);
            return { transactionId };
        }
        catch (error) {
            this.logger.error(`Failed to schedule inspection: ${error.message}`);
            throw new Error(`Inspection scheduling failed: ${error.message}`);
        }
    }
    async completeInspection(completeDto) {
        try {
            const transactionId = `inspection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.logger.log(`Completed inspection for asset ${completeDto.assetId}`);
            return { transactionId };
        }
        catch (error) {
            this.logger.error(`Failed to complete inspection: ${error.message}`);
            throw new Error(`Inspection completion failed: ${error.message}`);
        }
    }
    async initiateLegalTransfer(transferDto) {
        try {
            const transactionId = `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.logger.log(`Initiated legal transfer for asset ${transferDto.assetId}`);
            return { transactionId };
        }
        catch (error) {
            this.logger.error(`Failed to initiate legal transfer: ${error.message}`);
            throw new Error(`Legal transfer initiation failed: ${error.message}`);
        }
    }
    async completeLegalTransfer(assetId, manager) {
        try {
            const transactionId = `complete_transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.logger.log(`Completed legal transfer for asset ${assetId}`);
            return { transactionId };
        }
        catch (error) {
            this.logger.error(`Failed to complete legal transfer: ${error.message}`);
            throw new Error(`Legal transfer completion failed: ${error.message}`);
        }
    }
    async getInspectionRecord(assetId) {
        try {
            return {
                assetId,
                inspector: '0x1234567890123456789012345678901234567890',
                scheduledTime: Math.floor(Date.now() / 1000) + (2 * 24 * 60 * 60),
                status: 1,
                report: '',
                evidenceHash: '',
                completedAt: undefined
            };
        }
        catch (error) {
            this.logger.error(`Failed to get inspection record: ${error.message}`);
            throw new Error(`Failed to get inspection record: ${error.message}`);
        }
    }
    async getLegalTransferRecord(assetId) {
        try {
            return {
                assetId,
                assetOwner: '0x1234567890123456789012345678901234567890',
                amcAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
                status: 1,
                legalDocuments: 'ipfs://legal-documents-hash',
                initiatedAt: new Date(),
                completedAt: undefined
            };
        }
        catch (error) {
            this.logger.error(`Failed to get legal transfer record: ${error.message}`);
            throw new Error(`Failed to get legal transfer record: ${error.message}`);
        }
    }
    async getAMCStats() {
        try {
            return {
                totalAMCs: 5,
                activeAMCs: 4,
                totalInspections: 25,
                completedInspections: 20,
                totalTransfers: 15,
                completedTransfers: 12
            };
        }
        catch (error) {
            this.logger.error(`Failed to get AMC stats: ${error.message}`);
            throw new Error(`Failed to get AMC statistics: ${error.message}`);
        }
    }
};
exports.AMCService = AMCService;
exports.AMCService = AMCService = AMCService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hedera_service_1.HederaService])
], AMCService);
//# sourceMappingURL=amc.service.js.map