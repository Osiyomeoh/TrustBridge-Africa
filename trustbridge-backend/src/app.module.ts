import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
// GraphQL disabled for now - focusing on REST API
// import { GraphQLModule } from '@nestjs/graphql';
// import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Core modules
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';

// Feature modules
import { AssetsModule } from './assets/assets.module';
import { InvestmentsModule } from './investments/investments.module';
import { VerificationModule } from './verification/verification.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { AnalyticsModule } from './analytics/analytics.module';

// Service modules
import { HederaModule } from './hedera/hedera.module';
import { ChainlinkModule } from './chainlink/chainlink.module';
import { UsersModule } from './users/users.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WebSocketModule } from './websocket/websocket.module';
import { AdminModule } from './admin/admin.module';
import { PublicModule } from './public/public.module';
import { MobileModule } from './mobile/mobile.module';
import { PaymentsModule } from './payments/payments.module';
import { ExternalApisModule } from './external-apis/external-apis.module';
import { TokenomicsModule } from './tokenomics/tokenomics.module';
import { IPFSModule } from './ipfs/ipfs.module';
import { PoolsModule } from './pools/pools.module';
import { HealthModule } from './health/health.module';
import { TradingModule } from './trading/trading.module';
import { AMCModule } from './amc/amc.module';
import { ApiModule } from './api/api.module';
import { CollectionsModule } from './collections/collections.module';
import { RoyaltiesModule } from './royalties/royalties.module';
import { ActivityModule } from './activity/activity.module';
import { RWAModule } from './rwa/rwa.module';
import { KycModule } from './kyc/kyc.module';
import { AMCPoolsModule } from './amc-pools/amc-pools.module';
import { PoolTokensModule } from './pool-tokens/pool-tokens.module';
import { DividendsModule } from './dividends/dividends.module';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/trustbridge',
      {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
      }
    ),

    // GraphQL - Disabled for now, focusing on REST API
    // GraphQLModule.forRoot<ApolloDriverConfig>({
    //   driver: ApolloDriver,
    //   autoSchemaFile: true,
    //   playground: true,
    //   introspection: true,
    //   context: ({ req }) => ({ req }),
    //   subscriptions: {
    //     'graphql-ws': true,
    //     'subscriptions-transport-ws': true,
    //   },
    // }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Scheduling
    ScheduleModule.forRoot(),

    // Event emitter
    EventEmitterModule.forRoot(),

    // Core modules
    DatabaseModule,
    AuthModule,

    // Feature modules
    AssetsModule,
    InvestmentsModule,
    VerificationModule,
    PortfolioModule,
    AnalyticsModule,

    // Service modules
    HederaModule,
    ChainlinkModule,
    UsersModule,
    FileUploadModule,
    NotificationsModule,
    WebSocketModule,
    AdminModule,
    PublicModule,
    MobileModule,
    PaymentsModule,
    ExternalApisModule,
    TokenomicsModule,
    IPFSModule,
    PoolsModule,
    HealthModule,
    TradingModule,
    AMCModule,
    ApiModule,
    CollectionsModule,
    RoyaltiesModule,
    ActivityModule,
    RWAModule,
    KycModule,
    AMCPoolsModule,
    TradingModule,
    PoolTokensModule,
    DividendsModule,
  ],
})
export class AppModule {}
