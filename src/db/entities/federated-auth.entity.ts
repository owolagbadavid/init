import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import type { User } from './user.entity';
import { BaseModel } from './base.entity';
import { AuthProviderEnum } from 'src/models/enums/auth-provider.enum';

@Entity({ name: 'federated_auths' })
@Unique(['provider', 'subject'])
export class FederatedAuth extends BaseModel {
  @Column({ type: 'enum', enum: AuthProviderEnum })
  provider: AuthProviderEnum;

  @Column()
  subject: string;

  @ManyToOne('User', 'federatedAuths')
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;
}
