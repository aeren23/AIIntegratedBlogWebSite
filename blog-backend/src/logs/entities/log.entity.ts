import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { User } from '../../users/entities/user.entity';
import { LogAction } from '../../common/enums/log-action.enum';

@Entity('logs')
export class Log extends BaseEntity {
  @Column({ nullable: true })
  userId: string;

  @Column()
  action: LogAction;

  @Column()
  entityType: string;

  @Column()
  entityId: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => User, (user) => user.logs)
  @JoinColumn({ name: 'userId' })
  user: User;
}
