"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const analytics_controller_1 = require("./analytics.controller");
const analytics_service_1 = require("./analytics.service");
const asset_schema_1 = require("../schemas/asset.schema");
const investment_schema_1 = require("../schemas/investment.schema");
const user_schema_1 = require("../schemas/user.schema");
const hedera_module_1 = require("../hedera/hedera.module");
let AnalyticsModule = class AnalyticsModule {
};
exports.AnalyticsModule = AnalyticsModule;
exports.AnalyticsModule = AnalyticsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: asset_schema_1.Asset.name, schema: asset_schema_1.AssetSchema },
                { name: investment_schema_1.Investment.name, schema: investment_schema_1.InvestmentSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
            ]),
            hedera_module_1.HederaModule,
        ],
        controllers: [analytics_controller_1.AnalyticsController],
        providers: [analytics_service_1.AnalyticsService],
        exports: [analytics_service_1.AnalyticsService],
    })
], AnalyticsModule);
//# sourceMappingURL=analytics.module.js.map