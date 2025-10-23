import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AMCPoolsController } from './amc-pools.controller';
import { AMCPoolsService } from './amc-pools.service';
import { AMCPool, AMCPoolSchema } from '../schemas/amc-pool.schema';
import { HederaModule } from '../hedera/hedera.module';
import { AdminModule } from '../admin/admin.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AMCPool.name, schema: AMCPoolSchema }]),
    HederaModule,
    AuthModule,
    AdminModule
  ],
  controllers: [AMCPoolsController],
  providers: [AMCPoolsService],
  exports: [AMCPoolsService]
})
export class AMCPoolsModule {}
