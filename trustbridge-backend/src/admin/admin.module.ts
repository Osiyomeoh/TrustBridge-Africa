import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User, UserSchema } from '../schemas/user.schema';
import { Attestor, AttestorSchema } from '../schemas/attestor.schema';
import { VerificationRequest, VerificationRequestSchema } from '../schemas/verification-request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Attestor.name, schema: AttestorSchema },
      { name: VerificationRequest.name, schema: VerificationRequestSchema }
    ])
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService]
})
export class AdminModule {}