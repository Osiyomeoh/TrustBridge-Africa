"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AMCModule = void 0;
const common_1 = require("@nestjs/common");
const amc_service_1 = require("./amc.service");
const hedera_module_1 = require("../hedera/hedera.module");
let AMCModule = class AMCModule {
};
exports.AMCModule = AMCModule;
exports.AMCModule = AMCModule = __decorate([
    (0, common_1.Module)({
        imports: [hedera_module_1.HederaModule],
        providers: [amc_service_1.AMCService],
        exports: [amc_service_1.AMCService],
    })
], AMCModule);
//# sourceMappingURL=amc.module.js.map