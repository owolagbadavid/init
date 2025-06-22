import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  VirtualColumn,
} from 'typeorm';

import { BaseModel } from './base.entity';
import type { Widget } from './widget.entity';
import type { DesktopIcon } from './desktop-icon.entity';
import { DesktopFile } from './desktop-file';
import { User } from './user.entity';
import { DesktopFileEnum } from 'src/models/enums';

@Entity({ name: 'desktops' })
export class Desktop extends BaseModel {
  @OneToMany('Widget', 'desktop')
  widgets: Widget[];

  @OneToMany('DesktopIcon', 'desktop')
  icons: DesktopIcon[];

  @OneToMany('DesktopFile', 'desktop', { cascade: true })
  files: DesktopFile[];

  @OneToOne('User', 'desktop', { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @VirtualColumn({
    query(alias) {
      return `SELECT fr.file_url FROM desktop_files df JOIN file_records fr ON df.file_record_id = fr.id WHERE df.desktop_id = ${alias}.id AND df.desktop_file_type  = '${DesktopFileEnum.CUSTOMBACKGROUND}' LIMIT 1`;
    },
  })
  customBackground?: string;
}
