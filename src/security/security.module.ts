import { Module } from '@nestjs/common';
import { SecurityService } from './security.service';

@Module({
  controllers: [],
  providers: [SecurityService],
  exports: [SecurityService],
})
export class SecurityModule {}
