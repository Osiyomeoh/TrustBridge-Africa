"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobileModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mobile_controller_1 = require("./mobile.controller");
const mobile_service_1 = require("./mobile.service");
const asset_schema_1 = require("../schemas/asset.schema");
const user_schema_1 = require("../schemas/user.schema");
const verification_request_schema_1 = require("../schemas/verification-request.schema");
const settlement_schema_1 = require("../schemas/settlement.schema");
const operation_schema_1 = require("../schemas/operation.schema");
const hedera_module_1 = require("../hedera/hedera.module");
const chainlink_module_1 = require("../chainlink/chainlink.module");
const websocket_module_1 = require("../websocket/websocket.module");
const notifications_module_1 = require("../notifications/notifications.module");
let MobileModule = class MobileModule {
};
exports.MobileModule = MobileModule;
exports.MobileModule = MobileModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: asset_schema_1.Asset.name, schema: asset_schema_1.AssetSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: verification_request_schema_1.VerificationRequest.name, schema: verification_request_schema_1.VerificationRequestSchema },
                { name: settlement_schema_1.Settlement.name, schema: settlement_schema_1.SettlementSchema },
                { name: operation_schema_1.Operation.name, schema: operation_schema_1.OperationSchema },
            ]),
            hedera_module_1.HederaModule,
            chainlink_module_1.ChainlinkModule,
            websocket_module_1.WebSocketModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [mobile_controller_1.MobileController],
        providers: [mobile_service_1.MobileService],
        exports: [mobile_service_1.MobileService],
    })
], MobileModule);
//# sourceMappingURL=mobile.module.js.map