import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';
import { UserRole } from './user-role.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @Index()
  @Column({ unique: true })
  name: string;

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: UserRole[];
}
