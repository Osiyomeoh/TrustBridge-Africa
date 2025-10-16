"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoyaltiesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const royalties_controller_1 = require("./royalties.controller");
const royalties_service_1 = require("./royalties.service");
const royalty_schema_1 = require("../schemas/royalty.schema");
let RoyaltiesModule = class RoyaltiesModule {
};
exports.RoyaltiesModule = RoyaltiesModule;
exports.RoyaltiesModule = RoyaltiesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: royalty_schema_1.RoyaltyPayment.name, schema: royalty_schema_1.RoyaltyPaymentSchema },
                { name: royalty_schema_1.CreatorRoyaltyStats.name, schema: royalty_schema_1.CreatorRoyaltyStatsSchema },
            ]),
        ],
        controllers: [royalties_controller_1.RoyaltiesController],
        providers: [royalties_service_1.RoyaltiesService],
        exports: [royalties_service_1.RoyaltiesService],
    })
], RoyaltiesModule);
//# sourceMappingURL=royalties.module.js.map