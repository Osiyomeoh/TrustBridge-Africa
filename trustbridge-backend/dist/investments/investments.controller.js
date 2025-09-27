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
exports.InvestmentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const investments_service_1 = require("./investments.service");
let InvestmentsController = class InvestmentsController {
    constructor(investmentsService) {
        this.investmentsService = investmentsService;
    }
    async getInvestments() {
        try {
            const investments = await this.investmentsService.getAllInvestments();
            return {
                success: true,
                data: investments,
                message: `Found ${investments.length} investments`
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to get investments'
            };
        }
    }
    async createInvestment(createInvestmentDto) {
        try {
            const investment = await this.investmentsService.createInvestment(createInvestmentDto);
            return {
                success: true,
                data: investment,
                message: 'Investment created successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Failed to create investment'
            };
        }
    }
};
exports.InvestmentsController = InvestmentsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all investments' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of investments' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InvestmentsController.prototype, "getInvestments", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new investment' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Investment created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvestmentsController.prototype, "createInvestment", null);
exports.InvestmentsController = InvestmentsController = __decorate([
    (0, swagger_1.ApiTags)('Investments'),
    (0, common_1.Controller)('investments'),
    __metadata("design:paramtypes", [investments_service_1.InvestmentsService])
], InvestmentsController);
//# sourceMappingURL=investments.controller.js.map