"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HederaModule = void 0;
const common_1 = require("@nestjs/common");
const hedera_controller_1 = require("./hedera.controller");
const hedera_service_1 = require("./hedera.service");
let HederaModule = class HederaModule {
};
exports.HederaModule = HederaModule;
exports.HederaModule = HederaModule = __decorate([
    (0, common_1.Module)({
        controllers: [hedera_controller_1.HederaController],
        providers: [hedera_service_1.HederaService],
        exports: [hedera_service_1.HederaService],
    })
], HederaModule);
//# sourceMappingURL=hedera.module.js.map