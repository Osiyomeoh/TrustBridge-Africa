import mongoose, { Schema, Document } from 'mongoose';

export interface PriceHistoryDocument extends Document {
  assetId: string;
  price: number;
  timestamp: Date;
  source: string;
  volume?: number;
}

const PriceHistorySchema = new Schema({
  assetId: { type: String, required: true, index: true },
  price: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  source: { type: String, required: true }, // oracle, market, manual
  volume: { type: Number }
}, {
  collection: 'price_history'
});

PriceHistorySchema.index({ assetId: 1, timestamp: -1 });
PriceHistorySchema.index({ timestamp: -1 });

export const PriceHistoryModel = mongoose.model<PriceHistoryDocument>('PriceHistory', PriceHistorySchema);
