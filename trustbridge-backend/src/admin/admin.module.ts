import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Asset, AssetSchema } from '../schemas/asset.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { VerificationRequest, VerificationRequestSchema } from '../schemas/verification-request.schema';
import { Attestor, AttestorSchema } from '../schemas/attestor.schema';
import { Settlement, SettlementSchema } from '../schemas/settlement.schema';
import { Operation, OperationSchema } from '../schemas/operation.schema';
import { Analytics, AnalyticsSchema } from '../schemas/analytics.schema';
import { HederaModule } from '../hedera/hedera.module';
import { ChainlinkModule } from '../chainlink/chainlink.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Asset.name, schema: AssetSchema },
      { name: User.name, schema: UserSchema },
      { name: VerificationRequest.name, schema: VerificationRequestSchema },
      { name: Attestor.name, schema: AttestorSchema },
      { name: Settlement.name, schema: SettlementSchema },
      { name: Operation.name, schema: OperationSchema },
      { name: Analytics.name, schema: AnalyticsSchema },
    ]),
    HederaModule,
    ChainlinkModule,
    WebSocketModule,
    NotificationsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
