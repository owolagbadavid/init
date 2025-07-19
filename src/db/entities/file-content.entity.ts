import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { BaseModel } from './base.entity';
import type { FileEntity } from './file.entity';

@Entity({ name: 'file_contents' })
export class FileContent extends BaseModel {
  @Column({ name: 'language', nullable: true })
  language?: string;

  @Column({ name: 'content', type: 'text' })
  content: string;

  @JoinColumn({ name: 'file_id' })
  @OneToOne('FileEntity', 'content')
  file: FileEntity;
}
