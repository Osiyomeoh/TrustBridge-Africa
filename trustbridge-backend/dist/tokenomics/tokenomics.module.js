"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenomicsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const tokenomics_controller_1 = require("./tokenomics.controller");
const tokenomics_service_1 = require("./tokenomics.service");
const governance_service_1 = require("./governance.service");
const staking_service_1 = require("./staking.service");
const revenue_service_1 = require("./revenue.service");
const hedera_module_1 = require("../hedera/hedera.module");
const auth_module_1 = require("../auth/auth.module");
const payment_schema_1 = require("../schemas/payment.schema");
const user_schema_1 = require("../schemas/user.schema");
const governance_model_1 = require("../models/governance.model");
let TokenomicsModule = class TokenomicsModule {
};
exports.TokenomicsModule = TokenomicsModule;
exports.TokenomicsModule = TokenomicsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: payment_schema_1.Payment.name, schema: payment_schema_1.PaymentSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: 'Proposal', schema: governance_model_1.ProposalModel.schema },
            ]),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET') || 'your-secret-key',
                    signOptions: { expiresIn: '24h' },
                }),
                inject: [config_1.ConfigService],
            }),
            hedera_module_1.HederaModule,
            auth_module_1.AuthModule,
        ],
        controllers: [tokenomics_controller_1.TokenomicsController],
        providers: [
            tokenomics_service_1.TokenomicsService,
            governance_service_1.GovernanceService,
            staking_service_1.StakingService,
            revenue_service_1.RevenueService,
        ],
        exports: [
            tokenomics_service_1.TokenomicsService,
            governance_service_1.GovernanceService,
            staking_service_1.StakingService,
            revenue_service_1.RevenueService,
        ],
    })
], TokenomicsModule);
//# sourceMappingURL=tokenomics.module.js.map