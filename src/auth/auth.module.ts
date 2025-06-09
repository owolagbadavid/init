import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MailModule } from 'src/mail/mail.module';
import { SecurityModule } from 'src/security/security.module';
import { User } from 'src/db/entities';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [MailModule, SecurityModule, TypeOrmModule.forFeature([User])],
  exports: [SecurityModule],
})
export class AuthModule {}
