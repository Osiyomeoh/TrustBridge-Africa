"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProposalModel = exports.ProposalStatus = exports.ProposalType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var ProposalType;
(function (ProposalType) {
    ProposalType["PARAMETER_CHANGE"] = "PARAMETER_CHANGE";
    ProposalType["ASSET_TYPE_ADDITION"] = "ASSET_TYPE_ADDITION";
    ProposalType["ORACLE_CHANGE"] = "ORACLE_CHANGE";
    ProposalType["TREASURY_ALLOCATION"] = "TREASURY_ALLOCATION";
    ProposalType["PROTOCOL_UPGRADE"] = "PROTOCOL_UPGRADE";
})(ProposalType || (exports.ProposalType = ProposalType = {}));
var ProposalStatus;
(function (ProposalStatus) {
    ProposalStatus["DRAFT"] = "DRAFT";
    ProposalStatus["ACTIVE"] = "ACTIVE";
    ProposalStatus["PASSED"] = "PASSED";
    ProposalStatus["REJECTED"] = "REJECTED";
    ProposalStatus["EXECUTED"] = "EXECUTED";
    ProposalStatus["EXPIRED"] = "EXPIRED";
})(ProposalStatus || (exports.ProposalStatus = ProposalStatus = {}));
const VoteSchema = new mongoose_1.Schema({
    voter: { type: String, required: true },
    vote: {
        type: String,
        enum: ['FOR', 'AGAINST', 'ABSTAIN'],
        required: true
    },
    weight: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});
const ExecutionSchema = new mongoose_1.Schema({
    executed: { type: Boolean, default: false },
    executionTimestamp: { type: Date },
    executionTxHash: { type: String }
});
const ProposalSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true, index: true },
    proposer: { type: String, required: true, index: true },
    type: {
        type: String,
        enum: Object.values(ProposalType),
        required: true,
        index: true
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    parameters: { type: mongoose_1.Schema.Types.Mixed },
    status: {
        type: String,
        enum: Object.values(ProposalStatus),
        default: ProposalStatus.DRAFT,
        index: true
    },
    votingStart: { type: Date, required: true, index: true },
    votingEnd: { type: Date, required: true, index: true },
    quorumRequired: { type: String, required: true },
    votesFor: { type: String, default: '0' },
    votesAgainst: { type: String, default: '0' },
    totalVotes: { type: String, default: '0' },
    execution: ExecutionSchema,
    votes: [VoteSchema]
}, {
    timestamps: true,
    collection: 'proposals'
});
ProposalSchema.index({ status: 1, votingEnd: 1 });
ProposalSchema.index({ proposer: 1, createdAt: -1 });
exports.ProposalModel = mongoose_1.default.model('Proposal', ProposalSchema);
//# sourceMappingURL=governance.model.js.map