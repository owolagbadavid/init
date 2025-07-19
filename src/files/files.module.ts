import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from 'src/db/entities';
import { SecurityService } from 'src/security/security.service';

@Module({
  controllers: [FilesController],
  providers: [FilesService, SecurityService],
  imports: [TypeOrmModule.forFeature([FileEntity])],
})
export class FilesModule {}
