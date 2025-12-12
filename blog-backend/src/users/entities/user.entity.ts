import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { UserRole } from '../../roles/entities/user-role.entity';
import { Article } from '../../articles/entities/article.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Log } from '../../logs/entities/log.entity';

@Entity('users')
export class User extends BaseEntity {
  @Index()
  @Column({ unique: true })
  username: string;

  @Index()
  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  @OneToMany(() => Article, (article) => article.author)
  articles: Article[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Log, (log) => log.user)
  logs: Log[];
}
