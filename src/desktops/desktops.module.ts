import { Module } from '@nestjs/common';
import { DesktopsService } from './desktops.service';
import { DesktopsController } from './desktops.controller';
import { CloudStorageService } from 'src/services/cloud-storage.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Desktop,
  DesktopFile,
  DesktopIcon,
  DesktopIconFile,
  FileRecord,
  User,
  Widget,
  WidgetType,
} from 'src/db/entities';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [DesktopsController],
  providers: [DesktopsService, CloudStorageService],
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      Desktop,
      DesktopIcon,
      DesktopFile,
      DesktopIconFile,
      Widget,
      WidgetType,
      User,
      FileRecord,
    ]),
  ],
})
export class DesktopsModule {}
