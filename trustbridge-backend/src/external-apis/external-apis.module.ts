import { Module } from '@nestjs/common';
import { ExternalApisController } from './external-apis.controller';
import { ExternalApisService } from './external-apis.service';

@Module({
  controllers: [ExternalApisController],
  providers: [ExternalApisService],
  exports: [ExternalApisService],
})
export class ExternalApisModule {}
