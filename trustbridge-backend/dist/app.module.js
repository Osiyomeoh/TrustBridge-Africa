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
const portfolio_module_1 = require("./portfolio/portfolio.module");
const analytics_module_1 = require("./analytics/analytics.module");
const trading_module_1 = require("./trading/trading.module");
const amc_module_1 = require("./amc/amc.module");
const amc_pools_module_1 = require("./amc-pools/amc-pools.module");
const pool_tokens_module_1 = require("./pool-tokens/pool-tokens.module");
const dividends_module_1 = require("./dividends/dividends.module");
const rwa_module_1 = require("./rwa/rwa.module");
const collections_module_1 = require("./collections/collections.module");
const royalties_module_1 = require("./royalties/royalties.module");
const hedera_module_1 = require("./hedera/hedera.module");
const chainlink_module_1 = require("./chainlink/chainlink.module");
const users_module_1 = require("./users/users.module");
const file_upload_module_1 = require("./file-upload/file-upload.module");
const notifications_module_1 = require("./notifications/notifications.module");
const websocket_module_1 = require("./websocket/websocket.module");
const admin_module_1 = require("./admin/admin.module");
const public_module_1 = require("./public/public.module");
const mobile_module_1 = require("./mobile/mobile.module");
const payments_module_1 = require("./payments/payments.module");
const external_apis_module_1 = require("./external-apis/external-apis.module");
const tokenomics_module_1 = require("./tokenomics/tokenomics.module");
const ipfs_module_1 = require("./ipfs/ipfs.module");
const pools_module_1 = require("./pools/pools.module");
const health_module_1 = require("./health/health.module");
const api_module_1 = require("./api/api.module");
const activity_module_1 = require("./activity/activity.module");
const kyc_module_1 = require("./kyc/kyc.module");
const app_controller_1 = require("./app.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        controllers: [app_controller_1.AppController],
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            mongoose_1.MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/trustbridge', {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 15000,
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
            portfolio_module_1.PortfolioModule,
            analytics_module_1.AnalyticsModule,
            trading_module_1.TradingModule,
            amc_module_1.AMCModule,
            amc_pools_module_1.AMCPoolsModule,
            pool_tokens_module_1.PoolTokensModule,
            dividends_module_1.DividendsModule,
            rwa_module_1.RWAModule,
            collections_module_1.CollectionsModule,
            royalties_module_1.RoyaltiesModule,
            hedera_module_1.HederaModule,
            chainlink_module_1.ChainlinkModule,
            users_module_1.UsersModule,
            file_upload_module_1.FileUploadModule,
            notifications_module_1.NotificationsModule,
            websocket_module_1.WebSocketModule,
            admin_module_1.AdminModule,
            public_module_1.PublicModule,
            mobile_module_1.MobileModule,
            payments_module_1.PaymentsModule,
            external_apis_module_1.ExternalApisModule,
            tokenomics_module_1.TokenomicsModule,
            ipfs_module_1.IPFSModule,
            pools_module_1.PoolsModule,
            health_module_1.HealthModule,
            api_module_1.ApiModule,
            activity_module_1.ActivityModule,
            kyc_module_1.KycModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map