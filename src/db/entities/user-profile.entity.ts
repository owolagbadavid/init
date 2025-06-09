import { Column, Entity, OneToOne, JoinColumn } from 'typeorm';
import type { User } from './user.entity';
import { BaseModel } from './base.entity';
import { Avatar } from 'src/models/user/avatar';

@Entity({ name: 'user_profiles' })
export class UserProfile extends BaseModel {
  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'avatar', type: 'jsonb', nullable: true })
  avatar?: Avatar;

  @OneToOne('User', 'profile')
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
