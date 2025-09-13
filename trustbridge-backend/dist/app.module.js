"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const throttler_1 = require("@nestjs/throttler");
const schedule_1 = require("@nestjs/schedule");
const event_emitter_1 = require("@nestjs/event-emitter");
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./auth/auth.module");
const assets_module_1 = require("./assets/assets.module");
const investments_module_1 = require("./investments/investments.module");
const verification_module_1 = require("./verification/verification.module");
const attestors_module_1 = require("./attestors/attestors.module");
const portfolio_module_1 = require("./portfolio/portfolio.module");
const analytics_module_1 = require("./analytics/analytics.module");
const hedera_module_1 = require("./hedera/hedera.module");
const chainlink_module_1 = require("./chainlink/chainlink.module");
const users_module_1 = require("./users/users.module");
const file_upload_module_1 = require("./file-upload/file-upload.module");
const notifications_module_1 = require("./notifications/notifications.module");
const websocket_module_1 = require("./websocket/websocket.module");
const admin_module_1 = require("./admin/admin.module");
const mobile_module_1 = require("./mobile/mobile.module");
const payments_module_1 = require("./payments/payments.module");
const external_apis_module_1 = require("./external-apis/external-apis.module");
const tokenomics_module_1 = require("./tokenomics/tokenomics.module");
const ipfs_module_1 = require("./ipfs/ipfs.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            mongoose_1.MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/trustbridge', {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                bufferCommands: false,
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            schedule_1.ScheduleModule.forRoot(),
            event_emitter_1.EventEmitterModule.forRoot(),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            assets_module_1.AssetsModule,
            investments_module_1.InvestmentsModule,
            verification_module_1.VerificationModule,
            attestors_module_1.AttestorsModule,
            portfolio_module_1.PortfolioModule,
            analytics_module_1.AnalyticsModule,
            hedera_module_1.HederaModule,
            chainlink_module_1.ChainlinkModule,
            users_module_1.UsersModule,
            file_upload_module_1.FileUploadModule,
            notifications_module_1.NotificationsModule,
            websocket_module_1.WebSocketModule,
            admin_module_1.AdminModule,
            mobile_module_1.MobileModule,
            payments_module_1.PaymentsModule,
            external_apis_module_1.ExternalApisModule,
            tokenomics_module_1.TokenomicsModule,
            ipfs_module_1.IPFSModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map