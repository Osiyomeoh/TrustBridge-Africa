import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { Asset, AssetSchema } from '../schemas/asset.schema';
import { HederaModule } from '../hedera/hedera.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Asset.name, schema: AssetSchema }]),
    HederaModule,
  ],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetsModule {}
