import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { HederaModule } from '../hedera/hedera.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    HederaModule,
    AuthModule,
    JwtModule.register({}), // Add JWT module for JwtService
  ],
  providers: [AdminService],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}