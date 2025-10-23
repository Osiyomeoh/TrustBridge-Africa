"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RWAModule = void 0;
const common_1 = require("@nestjs/common");
const rwa_controller_1 = require("./rwa.controller");
const rwa_service_1 = require("./rwa.service");
const chainlink_rwa_service_1 = require("./chainlink-rwa.service");
const chainlink_module_1 = require("../chainlink/chainlink.module");
const auth_module_1 = require("../auth/auth.module");
const admin_module_1 = require("../admin/admin.module");
let RWAModule = class RWAModule {
};
exports.RWAModule = RWAModule;
exports.RWAModule = RWAModule = __decorate([
    (0, common_1.Module)({
        imports: [chainlink_module_1.ChainlinkModule, auth_module_1.AuthModule, admin_module_1.AdminModule],
        controllers: [rwa_controller_1.RWAController],
        providers: [rwa_service_1.RWAService, chainlink_rwa_service_1.ChainlinkRWAService],
        exports: [rwa_service_1.RWAService, chainlink_rwa_service_1.ChainlinkRWAService],
    })
], RWAModule);
//# sourceMappingURL=rwa.module.js.map