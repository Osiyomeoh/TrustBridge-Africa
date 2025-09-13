"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttestorsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const attestors_controller_1 = require("./attestors.controller");
const attestors_service_1 = require("./attestors.service");
const attestor_schema_1 = require("../schemas/attestor.schema");
const hedera_module_1 = require("../hedera/hedera.module");
const event_emitter_1 = require("@nestjs/event-emitter");
let AttestorsModule = class AttestorsModule {
};
exports.AttestorsModule = AttestorsModule;
exports.AttestorsModule = AttestorsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: attestor_schema_1.Attestor.name, schema: attestor_schema_1.AttestorSchema }]),
            hedera_module_1.HederaModule,
            event_emitter_1.EventEmitterModule,
        ],
        controllers: [attestors_controller_1.AttestorsController],
        providers: [attestors_service_1.AttestorsService],
        exports: [attestors_service_1.AttestorsService],
    })
], AttestorsModule);
//# sourceMappingURL=attestors.module.js.map