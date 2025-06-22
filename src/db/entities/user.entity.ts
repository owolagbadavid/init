// Base User Entity

import {
  Entity,
  Column,
  OneToOne,
  OneToMany,

  // ManyToOne,
  // JoinColumn,
  // OneToMany,
  // ManyToMany,
} from 'typeorm';

import { BaseModel } from './base.entity';
import { RoleEnum, StatusEnum } from 'src/models/enums';
import { UserProfile } from './user-profile.entity';
import { FederatedAuth } from './federated-auth.entity';
import { UserStatus } from 'src/models/user/user-status';
import { UserRole } from 'src/models/user/user-role';
import { PasswordHasher } from 'src/security/security.service';
import type { Desktop } from './desktop.entity';

@Entity({ name: 'users' })
export class User extends BaseModel {
  @Column({ unique: true, name: 'email_address' })
  emailAddress: string;

  @Column({ unique: true, nullable: true, name: 'username' })
  username?: string;

  @Column({ nullable: true, name: 'phone_number' })
  phoneNumber?: string;

  @Column({ name: 'password_hash', nullable: true })
  passwordHash: string;

  // setter for passwordHash
  set password(password: string) {
    this.passwordHash = PasswordHasher.hashPassword(password);
  }

  @Column({ default: StatusEnum.PENDING, type: 'enum', enum: StatusEnum })
  status: UserStatus;

  @Column({
    nullable: true,
    type: 'timestamp with time zone',
    name: 'date_activated',
  })
  dateActivated: Date | null;

  @Column({ enum: RoleEnum, type: 'enum', default: RoleEnum.USER })
  role: UserRole = RoleEnum.USER;

  @OneToOne('UserProfile', 'user')
  profile?: UserProfile;

  @OneToMany('FederatedAuth', 'user')
  federatedAuths?: FederatedAuth[];

  @OneToOne('Desktop', 'user', { nullable: true })
  desktop?: Desktop;
}
