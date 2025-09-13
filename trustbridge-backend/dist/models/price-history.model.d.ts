import mongoose, { Document } from 'mongoose';
export interface PriceHistoryDocument extends Document {
    assetId: string;
    price: number;
    timestamp: Date;
    source: string;
    volume?: number;
}
export declare const PriceHistoryModel: mongoose.Model<PriceHistoryDocument, {}, {}, {}, mongoose.Document<unknown, {}, PriceHistoryDocument, {}, {}> & PriceHistoryDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
