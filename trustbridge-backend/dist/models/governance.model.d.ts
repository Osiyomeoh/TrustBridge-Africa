import mongoose, { Document } from 'mongoose';
export declare enum ProposalType {
    PARAMETER_CHANGE = "PARAMETER_CHANGE",
    ASSET_TYPE_ADDITION = "ASSET_TYPE_ADDITION",
    ORACLE_CHANGE = "ORACLE_CHANGE",
    TREASURY_ALLOCATION = "TREASURY_ALLOCATION",
    PROTOCOL_UPGRADE = "PROTOCOL_UPGRADE"
}
export declare enum ProposalStatus {
    DRAFT = "DRAFT",
    ACTIVE = "ACTIVE",
    PASSED = "PASSED",
    REJECTED = "REJECTED",
    EXECUTED = "EXECUTED",
    EXPIRED = "EXPIRED"
}
export interface ProposalDocument extends Document {
    id: string;
    proposer: string;
    type: ProposalType;
    title: string;
    description: string;
    parameters?: any;
    status: ProposalStatus;
    votingStart: Date;
    votingEnd: Date;
    quorumRequired: string;
    votesFor: string;
    votesAgainst: string;
    totalVotes: string;
    execution: {
        executed: boolean;
        executionTimestamp?: Date;
        executionTxHash?: string;
    };
    votes: Array<{
        voter: string;
        vote: 'FOR' | 'AGAINST' | 'ABSTAIN';
        weight: string;
        timestamp: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ProposalModel: mongoose.Model<ProposalDocument, {}, {}, {}, mongoose.Document<unknown, {}, ProposalDocument, {}, {}> & ProposalDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
