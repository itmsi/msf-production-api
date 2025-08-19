import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { RoleHasPermission } from '../../role-has-permission/entities/role-has-permission.entity';
import { MenuHasPermission } from '../../menu-has-permission/entities/menu-has-permission.entity';

@Entity('m_permission')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  permission_name: string;

  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  permission_code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'int', nullable: true })
  createdBy: number;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'int', nullable: true })
  updatedBy: number;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @Column({ type: 'int', nullable: true })
  deletedBy: number;

  // Relations
  @OneToMany(
    () => RoleHasPermission,
    (roleHasPermission) => roleHasPermission.permission,
  )
  roleHasPermissions: RoleHasPermission[];

  @OneToMany(
    () => MenuHasPermission,
    (menuHasPermission) => menuHasPermission.permission,
  )
  menuHasPermissions: MenuHasPermission[];
}
