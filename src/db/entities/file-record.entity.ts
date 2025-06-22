import { Column, Entity } from 'typeorm';

import { BaseModel } from './base.entity';
// import { TableNameEnum } from '../constants';

@Entity({ name: 'file_records' })
export class FileRecord extends BaseModel {
  @Column({ name: 'file_name', type: 'text' })
  fileName: string;

  @Column({ name: 'file_url', type: 'text' })
  fileUrl: string;

  @Column({ name: 'file_size', type: 'bigint' })
  fileSize: number;

  @Column({ name: 'mime_type', type: 'text' })
  mimeType: string;

  // @VirtualColumn({
  //   query: (alias) => `
  //     SELECT EXISTS(
  //       SELECT 1 FROM ${TableNameEnum.DESKTOP_FILES}
  //       WHERE file_record_id = ${alias}.file_record_id
  //     ) OR EXISTS(
  //       SELECT 1 FROM ${TableNameEnum.DESKTOP_ICON_FILES}
  //       WHERE file_record_id = ${alias}.file_record_id
  //     )
  //   `,
  // })
  // isUsed?: boolean;
}
