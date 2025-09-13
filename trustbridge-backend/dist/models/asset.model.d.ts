import mongoose, { Document } from 'mongoose';
import { AssetType, AssetStatus, Location, Operation, Investment } from '../types';
export interface AssetDocument extends Document {
    assetId: string;
    owner: string;
    type: AssetType;
    name: string;
    description?: string;
    location: Location;
    totalValue: number;
    tokenSupply: number;
    tokenizedAmount: number;
    maturityDate: Date;
    expectedAPY: number;
    verificationScore: number;
    status: AssetStatus;
    tokenContract: string;
    transactionHash?: string;
    verificationData?: any;
    operations: Operation[];
    investments: Investment[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const AssetModel: mongoose.Model<AssetDocument, {}, {}, {}, mongoose.Document<unknown, {}, AssetDocument, {}, {}> & AssetDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
