"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const jwt_1 = require("@nestjs/jwt");
const verification_controller_1 = require("./verification.controller");
const verification_service_1 = require("./verification.service");
const verification_request_schema_1 = require("../schemas/verification-request.schema");
const asset_schema_1 = require("../schemas/asset.schema");
const hedera_module_1 = require("../hedera/hedera.module");
const chainlink_module_1 = require("../chainlink/chainlink.module");
const external_apis_module_1 = require("../external-apis/external-apis.module");
const event_emitter_1 = require("@nestjs/event-emitter");
const ipfs_service_1 = require("../services/ipfs.service");
const auth_module_1 = require("../auth/auth.module");
let VerificationModule = class VerificationModule {
};
exports.VerificationModule = VerificationModule;
exports.VerificationModule = VerificationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: verification_request_schema_1.VerificationRequest.name, schema: verification_request_schema_1.VerificationRequestSchema },
                { name: asset_schema_1.Asset.name, schema: asset_schema_1.AssetSchema },
            ]),
            jwt_1.JwtModule.register({}),
            auth_module_1.AuthModule,
            hedera_module_1.HederaModule,
            chainlink_module_1.ChainlinkModule,
            external_apis_module_1.ExternalApisModule,
            event_emitter_1.EventEmitterModule,
        ],
        controllers: [verification_controller_1.VerificationController],
        providers: [verification_service_1.VerificationService, ipfs_service_1.IPFSService],
        exports: [verification_service_1.VerificationService],
    })
], VerificationModule);
//# sourceMappingURL=verification.module.js.map