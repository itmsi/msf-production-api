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
import { MenuHasPermission } from '../../menu-has-permission/entities/menu-has-permission.entity';

export enum MenuStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum MenuModuleType {
  SPARE_PART = 'spare-part',
  PRODUCTION = 'production',
}

@Entity('m_menu')
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  parent_id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  menu_name: string;

  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  menu_code: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icon: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  url: string;

  @Column({ type: 'boolean', default: false, nullable: false })
  is_parent: boolean;

  @Column({ type: 'int', default: 0, nullable: false })
  sort_order: number;

  @Column({
    type: 'enum',
    enum: MenuStatus,
    default: MenuStatus.ACTIVE,
  })
  status: MenuStatus;

  @Column({
    type: 'enum',
    enum: MenuModuleType,
    default: MenuModuleType.PRODUCTION,
    nullable: true,
  })
  module: MenuModuleType;

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
  @ManyToOne(() => Menu, (menu) => menu.children)
  @JoinColumn({ name: 'parent_id' })
  parent: Menu;

  @OneToMany(() => Menu, (menu) => menu.parent)
  children: Menu[];

  @OneToMany(
    () => MenuHasPermission,
    (menuHasPermission) => menuHasPermission.menu,
  )
  menuHasPermissions: MenuHasPermission[];
}
