import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { VerificationRequest, VerificationRequestSchema } from '../schemas/verification-request.schema';
import { Asset, AssetSchema } from '../schemas/asset.schema';
import { Attestor, AttestorSchema } from '../schemas/attestor.schema';
import { HederaModule } from '../hedera/hedera.module';
import { ChainlinkModule } from '../chainlink/chainlink.module';
import { AttestorsModule } from '../attestors/attestors.module';
import { ExternalApisModule } from '../external-apis/external-apis.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { IPFSService } from '../services/ipfs.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VerificationRequest.name, schema: VerificationRequestSchema },
      { name: Asset.name, schema: AssetSchema },
      { name: Attestor.name, schema: AttestorSchema },
    ]),
    JwtModule.register({}),
    AuthModule,
    HederaModule,
    ChainlinkModule,
    AttestorsModule,
    ExternalApisModule,
    EventEmitterModule,
  ],
  controllers: [VerificationController],
  providers: [VerificationService, IPFSService],
  exports: [VerificationService],
})
export class VerificationModule {}
