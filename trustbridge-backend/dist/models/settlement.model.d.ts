import mongoose, { Document } from 'mongoose';
import { SettlementStatus } from '../types';
export interface SettlementDocument extends Document {
    id: string;
    assetId: string;
    buyer: string;
    seller: string;
    amount: number;
    status: SettlementStatus;
    deliveryDeadline: Date;
    trackingHash: string;
    confirmations: Array<{
        confirmer: string;
        timestamp: Date;
        proofHash: string;
        isValid: boolean;
    }>;
    transactionHash?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const SettlementModel: mongoose.Model<SettlementDocument, {}, {}, {}, mongoose.Document<unknown, {}, SettlementDocument, {}, {}> & SettlementDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
