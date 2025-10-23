"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionSchema = exports.Collection = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Collection = class Collection {
};
exports.Collection = Collection;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Collection.prototype, "collectionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Collection.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Collection.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Collection.prototype, "symbol", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Collection.prototype, "creator", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Collection.prototype, "bannerImage", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Collection.prototype, "profileImage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Collection.prototype, "verified", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Collection.prototype, "nftTokenIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Collection.prototype, "totalVolume", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Collection.prototype, "floorPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Collection.prototype, "itemCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Collection.prototype, "ownerCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Collection.prototype, "listedCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            sales24h: { type: Number, default: 0 },
            volume24h: { type: Number, default: 0 },
            sales7d: { type: Number, default: 0 },
            volume7d: { type: Number, default: 0 },
            sales30d: { type: Number, default: 0 },
            volume30d: { type: Number, default: 0 },
            avgPrice: { type: Number, default: 0 },
            highestSale: { type: Number, default: 0 }
        },
        default: {}
    }),
    __metadata("design:type", Object)
], Collection.prototype, "stats", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            percentage: { type: Number, default: 0 },
            receiver: { type: String, default: '' }
        },
        default: {}
    }),
    __metadata("design:type", Object)
], Collection.prototype, "royalty", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Collection.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            twitter: { type: String, default: '' },
            discord: { type: String, default: '' },
            website: { type: String, default: '' },
            instagram: { type: String, default: '' }
        },
        default: {}
    }),
    __metadata("design:type", Object)
], Collection.prototype, "socialLinks", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Collection.prototype, "metadata", void 0);
exports.Collection = Collection = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Collection);
exports.CollectionSchema = mongoose_1.SchemaFactory.createForClass(Collection);
exports.CollectionSchema.index({ creator: 1 });
exports.CollectionSchema.index({ verified: 1, totalVolume: -1 });
exports.CollectionSchema.index({ floorPrice: 1 });
exports.CollectionSchema.index({ name: 'text', description: 'text' });
//# sourceMappingURL=collection.schema.js.map