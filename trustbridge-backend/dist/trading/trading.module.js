"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradingModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const trading_controller_1 = require("./trading.controller");
const trading_service_1 = require("./trading.service");
const trading_order_schema_1 = require("../schemas/trading-order.schema");
const trade_execution_schema_1 = require("../schemas/trade-execution.schema");
const amc_pool_schema_1 = require("../schemas/amc-pool.schema");
const hedera_module_1 = require("../hedera/hedera.module");
const auth_module_1 = require("../auth/auth.module");
const admin_module_1 = require("../admin/admin.module");
let TradingModule = class TradingModule {
};
exports.TradingModule = TradingModule;
exports.TradingModule = TradingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: trading_order_schema_1.TradingOrder.name, schema: trading_order_schema_1.TradingOrderSchema },
                { name: trade_execution_schema_1.TradeExecution.name, schema: trade_execution_schema_1.TradeExecutionSchema },
                { name: amc_pool_schema_1.AMCPool.name, schema: amc_pool_schema_1.AMCPoolSchema }
            ]),
            hedera_module_1.HederaModule,
            auth_module_1.AuthModule,
            admin_module_1.AdminModule
        ],
        controllers: [trading_controller_1.TradingController],
        providers: [trading_service_1.TradingService],
        exports: [trading_service_1.TradingService]
    })
], TradingModule);
//# sourceMappingURL=trading.module.js.map