import { Model } from 'mongoose';
import { HederaService } from '../hedera/hedera.service';
import { UserDocument } from '../schemas/user.schema';
import { ProposalDocument, ProposalType, ProposalStatus } from '../models/governance.model';
export interface CreateProposalDto {
    proposer: string;
    type: ProposalType;
    title: string;
    description: string;
    parameters?: any;
    votingDuration?: number;
}
export interface VoteDto {
    voter: string;
    proposalId: string;
    vote: 'FOR' | 'AGAINST' | 'ABSTAIN';
    signature?: string;
}
export interface ProposalResult {
    proposalId: string;
    status: ProposalStatus;
    votesFor: string;
    votesAgainst: string;
    totalVotes: string;
    quorumMet: boolean;
    passed: boolean;
    executionTxHash?: string;
}
export declare class GovernanceService {
    private proposalModel;
    private userModel;
    private readonly hederaService;
    private readonly logger;
    private readonly governanceConfig;
    constructor(proposalModel: Model<ProposalDocument>, userModel: Model<UserDocument>, hederaService: HederaService);
    createProposal(createProposalDto: CreateProposalDto): Promise<ProposalDocument>;
    castVote(voteDto: VoteDto): Promise<void>;
    executeProposal(proposalId: string, executor: string): Promise<string>;
    updateProposalStatuses(): Promise<void>;
    getProposals(page?: number, limit?: number, status?: ProposalStatus, proposer?: string): Promise<{
        proposals: ProposalDocument[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getProposal(proposalId: string): Promise<ProposalDocument>;
    getUserVotingPower(walletAddress: string): Promise<{
        tokenBalance: number;
        stakedBalance: number;
        totalVotingPower: number;
        delegatedVotes: number;
    }>;
    getGovernanceStats(): Promise<{
        totalProposals: number;
        activeProposals: number;
        passedProposals: number;
        rejectedProposals: number;
        totalVotes: number;
        averageParticipation: number;
        quorumThreshold: number;
    }>;
    private generateProposalId;
    private getCirculatingSupply;
    private calculateProposalResult;
    private executeParameterChange;
    private executeAssetTypeAddition;
    private executeOracleChange;
    private executeTreasuryAllocation;
    private executeProtocolUpgrade;
}
