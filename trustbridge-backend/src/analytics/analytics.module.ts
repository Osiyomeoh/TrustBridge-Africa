import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Asset, AssetSchema } from '../schemas/asset.schema';
import { Investment, InvestmentSchema } from '../schemas/investment.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { HederaModule } from '../hedera/hedera.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Asset.name, schema: AssetSchema },
      { name: Investment.name, schema: InvestmentSchema },
      { name: User.name, schema: UserSchema },
    ]),
    HederaModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
