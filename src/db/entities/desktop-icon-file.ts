import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import type { DesktopIcon } from './desktop-icon.entity';
import type { FileRecord } from './file-record.entity';
import { DesktopIconFileEnum } from 'src/models/enums';

@Unique(['desktopIconId', 'desktopIconFileType'])
@Entity('desktop_icon_files')
export class DesktopIconFile {
  @Column({
    name: 'desktop_icon_file_type',
    type: 'enum',
    enum: DesktopIconFileEnum,
  })
  desktopIconFileType: DesktopIconFileEnum;

  @ManyToOne('DesktopIcon', 'files')
  @JoinColumn({ name: 'desktop_icon_id' })
  desktopIcon: DesktopIcon;

  @PrimaryColumn({ name: 'desktop_icon_id' })
  desktopIconId: string;

  @ManyToOne('FileRecord')
  @JoinColumn({ name: 'file_record_id' })
  fileRecord: FileRecord;

  @PrimaryColumn({ name: 'file_record_id' })
  fileRecordId: string;
}
