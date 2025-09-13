import mongoose, { Document } from 'mongoose';
import { OperationType, OperationStatus, Location } from '../types';
export interface OperationDocument extends Document {
    id: string;
    assetId: string;
    type: OperationType;
    status: OperationStatus;
    operator: string;
    location?: Location;
    timestamp: Date;
    proofHash?: string;
    verified: boolean;
    metadata?: string;
    transactionHash?: string;
    hcsSequenceNumber?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const OperationModel: mongoose.Model<OperationDocument, {}, {}, {}, mongoose.Document<unknown, {}, OperationDocument, {}, {}> & OperationDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
