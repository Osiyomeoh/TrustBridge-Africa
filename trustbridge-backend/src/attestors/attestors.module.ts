import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AttestorsController } from './attestors.controller';
import { AttestorsService } from './attestors.service';
import { Attestor, AttestorSchema } from '../schemas/attestor.schema';
import { HederaModule } from '../hedera/hedera.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Attestor.name, schema: AttestorSchema }]),
    HederaModule,
    EventEmitterModule,
  ],
  controllers: [AttestorsController],
  providers: [AttestorsService],
  exports: [AttestorsService],
})
export class AttestorsModule {}
