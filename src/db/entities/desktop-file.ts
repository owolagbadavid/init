import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import type { FileRecord } from './file-record.entity';
import type { Desktop } from './desktop.entity';
import { DesktopFileEnum } from 'src/models/enums';

@Unique(['desktopId', 'desktopFileType'])
@Entity('desktop_files')
export class DesktopFile {
  @Column({
    name: 'desktop_file_type',
    type: 'enum',
    enum: DesktopFileEnum,
  })
  desktopFileType: DesktopFileEnum;

  @ManyToOne('Desktop', 'files')
  @JoinColumn({ name: 'desktop_id' })
  desktop: Desktop;

  @PrimaryColumn({ name: 'desktop_id' })
  desktopId: string;

  @ManyToOne('FileRecord')
  @JoinColumn({ name: 'file_record_id' })
  fileRecord: FileRecord;

  @PrimaryColumn({ name: 'file_record_id' })
  fileRecordId: string;
}
