import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  VirtualColumn,
} from 'typeorm';

import { BaseModel } from './base.entity';
import type { Desktop } from './desktop.entity';
import type { DesktopIconFile } from './desktop-icon-file';
import { DesktopIconFileEnum } from 'src/models/enums';

@Entity({ name: 'desktop_icons' })
export class DesktopIcon extends BaseModel {
  @Column({ name: 'code', type: 'text' })
  code: string;

  @Column({ name: 'label', type: 'text' })
  label: string;

  @Column({ name: 'x_position', type: 'integer' })
  xPosition: number;

  @Column({ name: 'y_position', type: 'integer' })
  yPosition: number;

  @Column({ name: 'is_custom_app', type: 'boolean', default: false })
  isCustomApp: boolean;

  @ManyToOne('Desktop', 'icons', { nullable: false })
  @JoinColumn({ name: 'desktop_id' })
  desktop: Desktop;

  @Column({ name: 'desktop_id' })
  desktopId: string;

  @OneToMany('DesktopIconFile', 'desktopIcon', { cascade: true })
  files: DesktopIconFile[];

  @VirtualColumn({
    query(alias) {
      return `SELECT fr.file_url FROM desktop_icon_files df JOIN file_records fr ON df.file_record_id = fr.id WHERE df.desktop_icon_id = ${alias}.id AND df.desktop_icon_file_type  = '${DesktopIconFileEnum.IMAGE}' LIMIT 1`;
    },
  })
  image?: string;
}
