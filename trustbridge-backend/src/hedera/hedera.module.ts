import { Module } from '@nestjs/common';
import { HederaController } from './hedera.controller';
import { HederaService } from './hedera.service';

@Module({
  controllers: [HederaController],
  providers: [HederaService],
  exports: [HederaService],
})
export class HederaModule {}
