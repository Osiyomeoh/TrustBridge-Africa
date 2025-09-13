import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
export type InvestmentDocument = Investment & Document;
export declare class Investment {
    investmentId: string;
    userId: string;
    assetId: string;
    amount: number;
    tokens: number;
    status: 'ACTIVE' | 'MATURED' | 'CANCELLED';
    transactionHash?: string;
}
export declare const InvestmentModelName = "Investment";
export declare const InvestmentSchema: mongoose.Schema<Investment, mongoose.Model<Investment, any, any, any, Document<unknown, any, Investment, any, {}> & Investment & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Investment, Document<unknown, {}, mongoose.FlatRecord<Investment>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<Investment> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export declare const InvestmentModel: mongoose.Model<Investment, {}, {}, {}, Document<unknown, {}, Investment, {}, {}> & Investment & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>;
