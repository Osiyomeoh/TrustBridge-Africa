"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const pools_controller_1 = require("./pools.controller");
const pools_service_1 = require("./pools.service");
const pool_schema_1 = require("../schemas/pool.schema");
const asset_schema_1 = require("../schemas/asset.schema");
const hedera_module_1 = require("../hedera/hedera.module");
const auth_module_1 = require("../auth/auth.module");
let PoolsModule = class PoolsModule {
};
exports.PoolsModule = PoolsModule;
exports.PoolsModule = PoolsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: pool_schema_1.Pool.name, schema: pool_schema_1.PoolSchema },
                { name: asset_schema_1.Asset.name, schema: asset_schema_1.AssetSchema }
            ]),
            hedera_module_1.HederaModule,
            auth_module_1.AuthModule
        ],
        controllers: [pools_controller_1.PoolsController],
        providers: [pools_service_1.PoolsService],
        exports: [pools_service_1.PoolsService]
    })
], PoolsModule);
//# sourceMappingURL=pools.module.js.map