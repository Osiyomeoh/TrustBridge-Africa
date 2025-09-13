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
exports.TokenomicsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const tokenomics_service_1 = require("./tokenomics.service");
const governance_service_1 = require("./governance.service");
const staking_service_1 = require("./staking.service");
const revenue_service_1 = require("./revenue.service");
let TokenomicsController = class TokenomicsController {
    constructor(tokenomicsService, governanceService, stakingService, revenueService) {
        this.tokenomicsService = tokenomicsService;
        this.governanceService = governanceService;
        this.stakingService = stakingService;
        this.revenueService = revenueService;
    }
    async getTokenomicsOverview() {
        const config = this.tokenomicsService.getTokenomicsConfig();
        const distribution = this.tokenomicsService.calculateTokenDistribution();
        const metrics = await this.tokenomicsService.getTokenomicsMetrics();
        return {
            config,
            distribution,
            metrics,
        };
    }
    async getTokenomicsMetrics() {
        return this.tokenomicsService.getTokenomicsMetrics();
    }
    async getTokenDistributionAnalytics() {
        return this.tokenomicsService.getTokenDistributionAnalytics();
    }
    async executeBuybackAndBurn() {
        return this.tokenomicsService.executeBuybackAndBurn();
    }
    async getProposals(page = 1, limit = 20, status, proposer) {
        return this.governanceService.getProposals(page, limit, status, proposer);
    }
    async getProposal(id) {
        return this.governanceService.getProposal(id);
    }
    async createProposal(createProposalDto) {
        return this.governanceService.createProposal(createProposalDto);
    }
    async castVote(voteDto) {
        return this.governanceService.castVote(voteDto);
    }
    async executeProposal(id, executor) {
        return this.governanceService.executeProposal(id, executor);
    }
    async getGovernanceStats() {
        return this.governanceService.getGovernanceStats();
    }
    async getUserVotingPower(address) {
        return this.governanceService.getUserVotingPower(address);
    }
    async getStakingStats() {
        return this.stakingService.getStakingStats();
    }
    async getStakingLeaderboard(limit = 50) {
        return this.stakingService.getStakingLeaderboard(limit);
    }
    async getUserStakingPositions(userId) {
        return this.stakingService.getUserStakingPositions(userId);
    }
    async stakeTokens(userId, stakingType, amount, lockPeriod) {
        return this.stakingService.stakeTokens(userId, stakingType, amount, lockPeriod);
    }
    async unstakeTokens(userId, stakingType) {
        return this.stakingService.unstakeTokens(userId, stakingType);
    }
    async calculateStakingRewards(userId, stakingType) {
        return this.stakingService.calculateStakingRewards(userId, stakingType);
    }
    async getStakingConfig() {
        return this.stakingService.getStakingConfig();
    }
    async getRevenueMetrics() {
        return this.revenueService.getRevenueMetrics();
    }
    async getRevenueStreams(timeframe = 'monthly') {
        return this.revenueService.getRevenueStreams(timeframe);
    }
    async getRevenueAnalytics(days = 30) {
        return this.revenueService.getRevenueAnalytics(days);
    }
    async getTreasuryBalance() {
        return this.revenueService.getTreasuryBalance();
    }
    async distributeFees(totalFees) {
        return this.revenueService.distributeFees(totalFees);
    }
    async getFeeConfiguration() {
        return this.revenueService.getFeeConfiguration();
    }
    async updateFeeConfiguration(updates) {
        return this.revenueService.updateFeeConfiguration(updates);
    }
    async updateTokenomicsParameters(updates) {
        return this.tokenomicsService.updateTokenomicsParameters(updates);
    }
    async getLeaderboard(limit = 50) {
        return this.tokenomicsService.getStakingLeaderboard(limit);
    }
    async calculateRevenue(timeframe) {
        return this.revenueService.calculateRevenue(timeframe);
    }
};
exports.TokenomicsController = TokenomicsController;
__decorate([
    (0, common_1.Get)('overview'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tokenomics overview' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tokenomics overview retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TokenomicsController.prototype, "getTokenomicsOverview", null);
__decorate([
    (0, common_1.Get)('metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tokenomics metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tokenomics metrics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TokenomicsController.prototype, "getTokenomicsMetrics", null);
__decorate([
    (0, common_1.Get)('distribution'),
    (0, swagger_1.ApiOperation)({ summary: 'Get token distribution analytics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token distribution analytics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TokenomicsController.prototype, "getTokenDistributionAnalytics", null);
__decorate([
    (0, common_1.Post)('buyback-burn'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Execute buyback and burn mechanism' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Buyback and burn executed successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TokenomicsController.prototype, "executeBuybackAndBurn", null);
__decorate([
    (0, common_1.Get)('governance/proposals'),
    (0, swagger_1.ApiOperation)({ summary: 'Get governance proposals' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Proposals retrieved successfully' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('proposer')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], TokenomicsController.prototype, "getProposals", null);
__decorate([
    (0, common_1.Get)('governance/proposals/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get proposal details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Proposal details retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TokenomicsController.prototype, "getProposal", null);
__decorate([
    (0, common_1.Post)('governance/proposals'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new proposal' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Proposal created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TokenomicsController.prototype, "createProposal", null);
__decorate([
    (0, common_1.Post)('governance/vote'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Cast a vote on a proposal' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vote cast successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TokenomicsController.prototype, "castVote", null);
__decorate([
    (0, common_1.Post)('governance/proposals/:id/execute'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Execute a passed proposal' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Proposal executed successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('executor')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TokenomicsController.prototype, "executeProposal", null);
__decorate([
    (0, common_1.Get)('governance/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get governance statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Governance statistics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TokenomicsController.prototype, "getGovernanceStats", null);
__decorate([
    (0, common_1.Get)('governance/voting-power/:address'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user voting power' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Voting power retrieved successfully' }),
    __param(0, (0, common_1.Param)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TokenomicsController.prototype, "getUserVotingPower", null);
__decorate([
    (0, common_1.Get)('staking/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get staking statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Staking statistics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TokenomicsController.prototype, "getStakingStats", null);
__decorate([
    (0, common_1.Get)('staking/leaderboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get staking leaderboard' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Staking leaderboard retrieved successfully' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TokenomicsController.prototype, "getStakingLeaderboard", null);
__decorate([
    (0, common_1.Get)('staking/positions/:userId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user staking positions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Staking positions retrieved successfully' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TokenomicsController.prototype, "getUserStakingPositions", null);
__decorate([
    (0, common_1.Post)('staking/stake'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Stake tokens' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Tokens staked successfully' }),
    __param(0, (0, common_1.Body)('userId')),
    __param(1, (0, common_1.Body)('stakingType')),
    __param(2, (0, common_1.Body)('amount')),
    __param(3, (0, common_1.Body)('lockPeriod')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], TokenomicsController.prototype, "stakeTokens", null);
__decorate([
    (0, common_1.Post)('staking/unstake'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Unstake tokens' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tokens unstaked successfully' }),
    __param(0, (0, common_1.Body)('userId')),
    __param(1, (0, common_1.Body)('stakingType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TokenomicsController.prototype, "unstakeTokens", null);
__decorate([
    (0, common_1.Get)('staking/rewards/:userId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate staking rewards' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Staking rewards calculated successfully' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('stakingType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TokenomicsController.prototype, "calculateStakingRewards", null);
__decorate([
    (0, common_1.Get)('staking/config'),
    (0, swagger_1.ApiOperation)({ summary: 'Get staking configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Staking configuration retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TokenomicsController.prototype, "getStakingConfig", null);
__decorate([
    (0, common_1.Get)('revenue/metrics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get revenue metrics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Revenue metrics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TokenomicsController.prototype, "getRevenueMetrics", null);
__decorate([
    (0, common_1.Get)('revenue/streams'),
    (0, swagger_1.ApiOperation)({ summary: 'Get revenue streams' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Revenue streams retrieved successfully' }),
    __param(0, (0, common_1.Query)('timeframe')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TokenomicsController.prototype, "getRevenueStreams", null);
__decorate([
    (0, common_1.Get)('revenue/analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get revenue analytics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Revenue analytics retrieved successfully' }),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TokenomicsController.prototype, "getRevenueAnalytics", null);
__decorate([
    (0, common_1.Get)('revenue/treasury'),
    (0, swagger_1.ApiOperation)({ summary: 'Get treasury balance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Treasury balance retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TokenomicsController.prototype, "getTreasuryBalance", null);
__decorate([
    (0, common_1.Post)('revenue/distribute'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Distribute fees' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fees distributed successfully' }),
    __param(0, (0, common_1.Body)('totalFees')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TokenomicsController.prototype, "distributeFees", null);
__decorate([
    (0, common_1.Get)('revenue/fee-config'),
    (0, swagger_1.ApiOperation)({ summary: 'Get fee configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fee configuration retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TokenomicsController.prototype, "getFeeConfiguration", null);
__decorate([
    (0, common_1.Put)('revenue/fee-config'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update fee configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fee configuration updated successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TokenomicsController.prototype, "updateFeeConfiguration", null);
__decorate([
    (0, common_1.Put)('parameters'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update tokenomics parameters' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tokenomics parameters updated successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TokenomicsController.prototype, "updateTokenomicsParameters", null);
__decorate([
    (0, common_1.Get)('leaderboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tokenomics leaderboard' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Leaderboard retrieved successfully' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TokenomicsController.prototype, "getLeaderboard", null);
__decorate([
    (0, common_1.Get)('revenue/:timeframe'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate revenue for specific timeframe' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Revenue calculated successfully' }),
    __param(0, (0, common_1.Param)('timeframe')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TokenomicsController.prototype, "calculateRevenue", null);
exports.TokenomicsController = TokenomicsController = __decorate([
    (0, swagger_1.ApiTags)('Tokenomics'),
    (0, common_1.Controller)('api/tokenomics'),
    __metadata("design:paramtypes", [tokenomics_service_1.TokenomicsService,
        governance_service_1.GovernanceService,
        staking_service_1.StakingService,
        revenue_service_1.RevenueService])
], TokenomicsController);
//# sourceMappingURL=tokenomics.controller.js.map