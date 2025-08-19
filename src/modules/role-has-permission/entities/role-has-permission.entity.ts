import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Roles } from '../../roles/entities/roles.entity';
import { MenuHasPermission } from '../../menu-has-permission/entities/menu-has-permission.entity';
import { Permission } from '../../permission/entities/permission.entity';

@Entity('r_role_has_permission')
export class RoleHasPermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  role_id: number;

  @Column({ type: 'int', nullable: false })
  mhp_id: number;

  @Column({ type: 'int', nullable: false })
  permission_id: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'int', nullable: true })
  createdBy: number;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'int', nullable: true })
  updatedBy: number;

  // Relations
  @ManyToOne(() => Roles, (role) => role.roleHasPermissions)
  @JoinColumn({ name: 'role_id' })
  role: Roles;

  @ManyToOne(
    () => MenuHasPermission,
    (menuHasPermission) => menuHasPermission.roleHasPermissions,
  )
  @JoinColumn({ name: 'mhp_id' })
  menuHasPermission: MenuHasPermission;

  @ManyToOne(() => Permission, (permission) => permission.roleHasPermissions)
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}
