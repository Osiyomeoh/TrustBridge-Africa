import { Module } from '@nestjs/common';
import { TradingService } from './trading.service';
import { HederaModule } from '../hedera/hedera.module';

@Module({
  imports: [HederaModule],
  providers: [TradingService],
  exports: [TradingService],
})
export class TradingModule {}
