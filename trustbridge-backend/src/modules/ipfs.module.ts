import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { IPFSService } from '../services/ipfs.service';
import { IPFSController } from '../controllers/ipfs.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({}),
    AuthModule,
  ],
  providers: [IPFSService],
  controllers: [IPFSController],
  exports: [IPFSService],
})
export class IPFSModule {}
