import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

import { BaseModel } from './base.entity';
import type { FileContent } from './file-content.entity';
import type { User } from './user.entity';

@Entity({ name: 'files' })
export class FileEntity extends BaseModel {
  @Column({ name: 'file_type' })
  fileType: string;

  @Column({ name: 'file_name' })
  fileName: string;

  @OneToOne('FileContent', 'file', {
    onDelete: 'CASCADE',
    cascade: true,
    orphanedRowAction: 'delete',
  })
  content: FileContent;

  @ManyToOne('User', 'files', { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;
}
