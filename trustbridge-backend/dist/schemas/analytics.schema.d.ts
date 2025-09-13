import { Document } from 'mongoose';
export type AnalyticsDocument = Analytics & Document;
export declare class Analytics {
    date: Date;
    type: string;
    data: any;
    assetId?: string;
    userId?: string;
}
export declare const AnalyticsSchema: import("mongoose").Schema<Analytics, import("mongoose").Model<Analytics, any, any, any, Document<unknown, any, Analytics, any, {}> & Analytics & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Analytics, Document<unknown, {}, import("mongoose").FlatRecord<Analytics>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Analytics> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
