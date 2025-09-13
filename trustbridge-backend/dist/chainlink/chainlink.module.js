"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainlinkModule = void 0;
const common_1 = require("@nestjs/common");
const chainlink_controller_1 = require("./chainlink.controller");
const chainlink_service_1 = require("./chainlink.service");
const chainlink_hedera_service_1 = require("./chainlink-hedera.service");
const chainlink_external_service_1 = require("./chainlink-external.service");
let ChainlinkModule = class ChainlinkModule {
};
exports.ChainlinkModule = ChainlinkModule;
exports.ChainlinkModule = ChainlinkModule = __decorate([
    (0, common_1.Module)({
        controllers: [chainlink_controller_1.ChainlinkController],
        providers: [chainlink_service_1.ChainlinkService, chainlink_hedera_service_1.ChainlinkHederaService, chainlink_external_service_1.ChainlinkExternalService],
        exports: [chainlink_service_1.ChainlinkService, chainlink_hedera_service_1.ChainlinkHederaService, chainlink_external_service_1.ChainlinkExternalService],
    })
], ChainlinkModule);
//# sourceMappingURL=chainlink.module.js.map