"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DividendsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const dividends_controller_1 = require("./dividends.controller");
const dividends_service_1 = require("./dividends.service");
const dividend_distribution_schema_1 = require("../schemas/dividend-distribution.schema");
const pool_token_holdings_schema_1 = require("../schemas/pool-token-holdings.schema");
const amc_pool_schema_1 = require("../schemas/amc-pool.schema");
const hedera_module_1 = require("../hedera/hedera.module");
const admin_module_1 = require("../admin/admin.module");
const auth_module_1 = require("../auth/auth.module");
let DividendsModule = class DividendsModule {
};
exports.DividendsModule = DividendsModule;
exports.DividendsModule = DividendsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: dividend_distribution_schema_1.DividendDistribution.name, schema: dividend_distribution_schema_1.DividendDistributionSchema },
                { name: pool_token_holdings_schema_1.PoolTokenHoldings.name, schema: pool_token_holdings_schema_1.PoolTokenHoldingsSchema },
                { name: amc_pool_schema_1.AMCPool.name, schema: amc_pool_schema_1.AMCPoolSchema }
            ]),
            hedera_module_1.HederaModule,
            auth_module_1.AuthModule,
            admin_module_1.AdminModule
        ],
        controllers: [dividends_controller_1.DividendsController],
        providers: [dividends_service_1.DividendsService],
        exports: [dividends_service_1.DividendsService]
    })
], DividendsModule);
//# sourceMappingURL=dividends.module.js.map