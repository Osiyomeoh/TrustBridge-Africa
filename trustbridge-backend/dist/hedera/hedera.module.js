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
const mongoose_1 = require("@nestjs/mongoose");
const hedera_controller_1 = require("./hedera.controller");
const hedera_service_1 = require("./hedera.service");
const trust_token_service_1 = require("./trust-token.service");
const hscs_contract_service_1 = require("./hscs-contract.service");
const hscs_hybrid_service_1 = require("./hscs-hybrid.service");
const marketplace_service_1 = require("./marketplace.service");
const hcs_service_1 = require("./hcs.service");
const user_schema_1 = require("../schemas/user.schema");
let HederaModule = class HederaModule {
};
exports.HederaModule = HederaModule;
exports.HederaModule = HederaModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: user_schema_1.User.name, schema: user_schema_1.UserSchema }])
        ],
        controllers: [hedera_controller_1.HederaController],
        providers: [hedera_service_1.HederaService, trust_token_service_1.TrustTokenService, hscs_contract_service_1.HscsContractService, hscs_hybrid_service_1.HscsHybridService, marketplace_service_1.MarketplaceService, hcs_service_1.HcsService],
        exports: [hedera_service_1.HederaService, trust_token_service_1.TrustTokenService, hscs_contract_service_1.HscsContractService, hscs_hybrid_service_1.HscsHybridService, marketplace_service_1.MarketplaceService, hcs_service_1.HcsService],
    })
], HederaModule);
//# sourceMappingURL=hedera.module.js.map