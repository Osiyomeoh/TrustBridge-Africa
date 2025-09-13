import mongoose, { Document } from 'mongoose';
export interface ValidatorDocument extends Document {
    walletAddress: string;
    stakedAmount: string;
    reputation: number;
    verificationsCount: number;
    accuracyScore: number;
    isActive: boolean;
    specialties: string[];
    location?: {
        country: string;
        region: string;
    };
    performance: {
        totalVerifications: number;
        correctVerifications: number;
        falsePositives: number;
        falseNegatives: number;
        averageResponseTime: number;
    };
    penalties: Array<{
        reason: string;
        amount: string;
        timestamp: Date;
    }>;
    rewards: Array<{
        amount: number;
        reason: string;
        timestamp: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ValidatorModel: mongoose.Model<ValidatorDocument, {}, {}, {}, mongoose.Document<unknown, {}, ValidatorDocument, {}, {}> & ValidatorDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
