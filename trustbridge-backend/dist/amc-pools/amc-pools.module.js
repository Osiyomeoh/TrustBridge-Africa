"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AMCPoolsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const amc_pools_controller_1 = require("./amc-pools.controller");
const amc_pools_service_1 = require("./amc-pools.service");
const amc_pool_schema_1 = require("../schemas/amc-pool.schema");
const hedera_module_1 = require("../hedera/hedera.module");
const admin_module_1 = require("../admin/admin.module");
const auth_module_1 = require("../auth/auth.module");
let AMCPoolsModule = class AMCPoolsModule {
};
exports.AMCPoolsModule = AMCPoolsModule;
exports.AMCPoolsModule = AMCPoolsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: amc_pool_schema_1.AMCPool.name, schema: amc_pool_schema_1.AMCPoolSchema }]),
            hedera_module_1.HederaModule,
            auth_module_1.AuthModule,
            admin_module_1.AdminModule
        ],
        controllers: [amc_pools_controller_1.AMCPoolsController],
        providers: [amc_pools_service_1.AMCPoolsService],
        exports: [amc_pools_service_1.AMCPoolsService]
    })
], AMCPoolsModule);
//# sourceMappingURL=amc-pools.module.js.map