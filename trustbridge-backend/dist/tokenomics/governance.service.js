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
var GovernanceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GovernanceService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const hedera_service_1 = require("../hedera/hedera.service");
const user_schema_1 = require("../schemas/user.schema");
const governance_model_1 = require("../models/governance.model");
let GovernanceService = GovernanceService_1 = class GovernanceService {
    constructor(proposalModel, userModel, hederaService) {
        this.proposalModel = proposalModel;
        this.userModel = userModel;
        this.hederaService = hederaService;
        this.logger = new common_1.Logger(GovernanceService_1.name);
        this.governanceConfig = {
            minProposalThreshold: 10000,
            quorumPercentage: 20,
            votingDuration: 7,
            executionDelay: 1,
        };
    }
    async createProposal(createProposalDto) {
        try {
            const proposer = await this.userModel.findOne({ walletAddress: createProposalDto.proposer });
            if (!proposer) {
                throw new Error('Proposer not found');
            }
            const tokenBalance = await this.hederaService.getTokenBalance(createProposalDto.proposer, '0');
            if (tokenBalance < this.governanceConfig.minProposalThreshold) {
                throw new Error(`Insufficient tokens to propose. Required: ${this.governanceConfig.minProposalThreshold} TRB`);
            }
            const proposalId = this.generateProposalId();
            const votingDuration = createProposalDto.votingDuration || this.governanceConfig.votingDuration;
            const votingStart = new Date();
            const votingEnd = new Date(votingStart.getTime() + votingDuration * 24 * 60 * 60 * 1000);
            const circulatingSupply = await this.getCirculatingSupply();
            const quorumRequired = (circulatingSupply * this.governanceConfig.quorumPercentage) / 100;
            const proposal = new this.proposalModel({
                id: proposalId,
                proposer: createProposalDto.proposer,
                type: createProposalDto.type,
                title: createProposalDto.title,
                description: createProposalDto.description,
                parameters: createProposalDto.parameters,
                status: governance_model_1.ProposalStatus.ACTIVE,
                votingStart,
                votingEnd,
                quorumRequired: quorumRequired.toString(),
                votesFor: '0',
                votesAgainst: '0',
                totalVotes: '0',
                execution: {
                    executed: false,
                },
                votes: [],
            });
            await proposal.save();
            this.logger.log(`Proposal created: ${proposalId} by ${createProposalDto.proposer}`);
            return proposal;
        }
        catch (error) {
            this.logger.error('Failed to create proposal:', error);
            throw error;
        }
    }
    async castVote(voteDto) {
        try {
            const proposal = await this.proposalModel.findOne({ id: voteDto.proposalId });
            if (!proposal) {
                throw new Error('Proposal not found');
            }
            if (proposal.status !== governance_model_1.ProposalStatus.ACTIVE) {
                throw new Error('Proposal is not active for voting');
            }
            if (new Date() > proposal.votingEnd) {
                throw new Error('Voting period has ended');
            }
            const existingVote = proposal.votes.find(vote => vote.voter === voteDto.voter);
            if (existingVote) {
                throw new Error('User has already voted on this proposal');
            }
            const tokenBalance = await this.hederaService.getTokenBalance(voteDto.voter, '0');
            if (tokenBalance === 0) {
                throw new Error('No tokens to vote with');
            }
            proposal.votes.push({
                voter: voteDto.voter,
                vote: voteDto.vote,
                weight: tokenBalance.toString(),
                timestamp: new Date(),
            });
            if (voteDto.vote === 'FOR') {
                proposal.votesFor = (BigInt(proposal.votesFor) + BigInt(tokenBalance)).toString();
            }
            else if (voteDto.vote === 'AGAINST') {
                proposal.votesAgainst = (BigInt(proposal.votesAgainst) + BigInt(tokenBalance)).toString();
            }
            proposal.totalVotes = (BigInt(proposal.totalVotes) + BigInt(tokenBalance)).toString();
            await proposal.save();
            this.logger.log(`Vote cast: ${voteDto.voter} voted ${voteDto.vote} on proposal ${voteDto.proposalId}`);
        }
        catch (error) {
            this.logger.error('Failed to cast vote:', error);
            throw error;
        }
    }
    async executeProposal(proposalId, executor) {
        try {
            const proposal = await this.proposalModel.findOne({ id: proposalId });
            if (!proposal) {
                throw new Error('Proposal not found');
            }
            if (proposal.status !== governance_model_1.ProposalStatus.PASSED) {
                throw new Error('Proposal has not passed');
            }
            const executionDelay = this.governanceConfig.executionDelay * 24 * 60 * 60 * 1000;
            if (new Date() < new Date(proposal.votingEnd.getTime() + executionDelay)) {
                throw new Error('Execution delay not met');
            }
            let executionTxHash;
            switch (proposal.type) {
                case governance_model_1.ProposalType.PARAMETER_CHANGE:
                    executionTxHash = await this.executeParameterChange(proposal);
                    break;
                case governance_model_1.ProposalType.ASSET_TYPE_ADDITION:
                    executionTxHash = await this.executeAssetTypeAddition(proposal);
                    break;
                case governance_model_1.ProposalType.ORACLE_CHANGE:
                    executionTxHash = await this.executeOracleChange(proposal);
                    break;
                case governance_model_1.ProposalType.TREASURY_ALLOCATION:
                    executionTxHash = await this.executeTreasuryAllocation(proposal);
                    break;
                case governance_model_1.ProposalType.PROTOCOL_UPGRADE:
                    executionTxHash = await this.executeProtocolUpgrade(proposal);
                    break;
                default:
                    throw new Error('Unknown proposal type');
            }
            proposal.status = governance_model_1.ProposalStatus.EXECUTED;
            proposal.execution.executed = true;
            proposal.execution.executionTimestamp = new Date();
            proposal.execution.executionTxHash = executionTxHash;
            await proposal.save();
            this.logger.log(`Proposal executed: ${proposalId} with tx ${executionTxHash}`);
            return executionTxHash;
        }
        catch (error) {
            this.logger.error('Failed to execute proposal:', error);
            throw error;
        }
    }
    async updateProposalStatuses() {
        try {
            const activeProposals = await this.proposalModel.find({
                status: governance_model_1.ProposalStatus.ACTIVE,
                votingEnd: { $lte: new Date() }
            });
            for (const proposal of activeProposals) {
                const result = await this.calculateProposalResult(proposal);
                proposal.status = result.passed ? governance_model_1.ProposalStatus.PASSED : governance_model_1.ProposalStatus.REJECTED;
                await proposal.save();
                this.logger.log(`Proposal ${proposal.id} ${result.passed ? 'passed' : 'rejected'}`);
            }
        }
        catch (error) {
            this.logger.error('Failed to update proposal statuses:', error);
            throw error;
        }
    }
    async getProposals(page = 1, limit = 20, status, proposer) {
        const query = {};
        if (status)
            query.status = status;
        if (proposer)
            query.proposer = proposer;
        const skip = (page - 1) * limit;
        const proposals = await this.proposalModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await this.proposalModel.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        return {
            proposals,
            total,
            page,
            totalPages,
        };
    }
    async getProposal(proposalId) {
        const proposal = await this.proposalModel.findOne({ id: proposalId });
        if (!proposal) {
            throw new Error('Proposal not found');
        }
        return proposal;
    }
    async getUserVotingPower(walletAddress) {
        const tokenBalance = await this.hederaService.getTokenBalance(walletAddress, '0');
        const user = await this.userModel.findOne({ walletAddress });
        const stakedBalance = user?.stakingBalance || 0;
        const totalVotingPower = tokenBalance + stakedBalance;
        const delegatedVotes = 0;
        return {
            tokenBalance,
            stakedBalance,
            totalVotingPower,
            delegatedVotes,
        };
    }
    async getGovernanceStats() {
        const totalProposals = await this.proposalModel.countDocuments();
        const activeProposals = await this.proposalModel.countDocuments({ status: governance_model_1.ProposalStatus.ACTIVE });
        const passedProposals = await this.proposalModel.countDocuments({ status: governance_model_1.ProposalStatus.PASSED });
        const rejectedProposals = await this.proposalModel.countDocuments({ status: governance_model_1.ProposalStatus.REJECTED });
        const proposals = await this.proposalModel.find({ status: { $in: [governance_model_1.ProposalStatus.PASSED, governance_model_1.ProposalStatus.REJECTED] } });
        const totalVotes = proposals.reduce((sum, proposal) => sum + parseInt(proposal.totalVotes), 0);
        const averageParticipation = proposals.length > 0 ? totalVotes / proposals.length : 0;
        const circulatingSupply = await this.getCirculatingSupply();
        const quorumThreshold = (circulatingSupply * this.governanceConfig.quorumPercentage) / 100;
        return {
            totalProposals,
            activeProposals,
            passedProposals,
            rejectedProposals,
            totalVotes,
            averageParticipation,
            quorumThreshold,
        };
    }
    generateProposalId() {
        return `PROP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    async getCirculatingSupply() {
        return 200000000;
    }
    async calculateProposalResult(proposal) {
        const votesFor = BigInt(proposal.votesFor);
        const votesAgainst = BigInt(proposal.votesAgainst);
        const totalVotes = BigInt(proposal.totalVotes);
        const quorumRequired = BigInt(proposal.quorumRequired);
        const quorumMet = totalVotes >= quorumRequired;
        const passed = quorumMet && votesFor > votesAgainst;
        return {
            proposalId: proposal.id,
            status: passed ? governance_model_1.ProposalStatus.PASSED : governance_model_1.ProposalStatus.REJECTED,
            votesFor: proposal.votesFor,
            votesAgainst: proposal.votesAgainst,
            totalVotes: proposal.totalVotes,
            quorumMet,
            passed,
        };
    }
    async executeParameterChange(proposal) {
        const txHash = await this.hederaService.updateContractParameters(proposal.parameters.contractAddress, proposal.parameters.parameterName, proposal.parameters.newValue);
        return txHash;
    }
    async executeAssetTypeAddition(proposal) {
        const txHash = await this.hederaService.addAssetType(proposal.parameters.assetType, proposal.parameters.minScore, proposal.parameters.ttlSeconds, proposal.parameters.requiredAttestors);
        return txHash;
    }
    async executeOracleChange(proposal) {
        const txHash = await this.hederaService.updateOracleConfig(proposal.parameters.oracleAddress, proposal.parameters.newConfig);
        return txHash;
    }
    async executeTreasuryAllocation(proposal) {
        const txHash = await this.hederaService.allocateTreasury(proposal.parameters.recipient, proposal.parameters.amount, proposal.parameters.purpose);
        return txHash;
    }
    async executeProtocolUpgrade(proposal) {
        const txHash = await this.hederaService.upgradeProtocol(proposal.parameters.newImplementation, proposal.parameters.upgradeData);
        return txHash;
    }
};
exports.GovernanceService = GovernanceService;
exports.GovernanceService = GovernanceService = GovernanceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Proposal')),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        hedera_service_1.HederaService])
], GovernanceService);
//# sourceMappingURL=governance.service.js.map