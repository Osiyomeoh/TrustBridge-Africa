import { Module } from '@nestjs/common';
import { ChainlinkController } from './chainlink.controller';
import { ChainlinkService } from './chainlink.service';
import { ChainlinkHederaService } from './chainlink-hedera.service';
import { ChainlinkExternalService } from './chainlink-external.service';

@Module({
  controllers: [ChainlinkController],
  providers: [ChainlinkService, ChainlinkHederaService, ChainlinkExternalService],
  exports: [ChainlinkService, ChainlinkHederaService, ChainlinkExternalService],
})
export class ChainlinkModule {}
