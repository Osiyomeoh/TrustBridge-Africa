import { Module } from '@nestjs/common';
import { AMCService } from './amc.service';
import { HederaModule } from '../hedera/hedera.module';

@Module({
  imports: [HederaModule],
  providers: [AMCService],
  exports: [AMCService],
})
export class AMCModule {}
