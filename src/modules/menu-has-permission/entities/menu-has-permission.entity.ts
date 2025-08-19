import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Menu } from '../../menu/entities/menu.entity';
import { Permission } from '../../permission/entities/permission.entity';
import { RoleHasPermission } from '../../role-has-permission/entities/role-has-permission.entity';

@Entity('r_menu_has_permission')
export class MenuHasPermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  menu_id: number;

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
  @ManyToOne(() => Menu, (menu) => menu.menuHasPermissions)
  @JoinColumn({ name: 'menu_id' })
  menu: Menu;

  @ManyToOne(() => Permission, (permission) => permission.menuHasPermissions)
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;

  @OneToMany(
    () => RoleHasPermission,
    (roleHasPermission) => roleHasPermission.menuHasPermission,
  )
  roleHasPermissions: RoleHasPermission[];
}
