import { Expose, Exclude } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Sites } from '../../sites/entities/sites.entity';
import { UserRole } from '../../users/entities/user-role.entity';
import { RoleHasPermission } from '../../role-has-permission/entities/role-has-permission.entity';

@Entity('m_role')
export class Roles {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @Column({ type: 'int', nullable: false })
  sites_id: number;

  @Expose()
  @Column({ type: 'varchar', length: 100, nullable: false })
  role_code: string;

  @Expose()
  @Column({ type: 'varchar', length: 100, nullable: false })
  position_name: string;

  @Expose()
  @Column({ type: 'varchar', length: 100, nullable: true })
  role_parent: string;

  @Expose()
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Exclude()
  @Column({ type: 'int', nullable: true })
  createdBy: number;

  @Expose()
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Exclude()
  @Column({ type: 'int', nullable: true })
  updatedBy: number;

  @Exclude()
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @Exclude()
  @Column({ type: 'int', nullable: true })
  deletedBy: number;

  // Relations
  @Expose()
  @ManyToOne(() => Sites, (sites) => sites.roles)
  @JoinColumn({ name: 'sites_id' })
  sites: Sites;

  @Expose()
  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: UserRole[];

  @Expose()
  @OneToMany(
    () => RoleHasPermission,
    (roleHasPermission) => roleHasPermission.role,
  )
  roleHasPermissions: RoleHasPermission[];
}
