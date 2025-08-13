import { Expose, Exclude } from 'class-transformer';
import { Users } from '../../users/entities/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('m_role')
export class Roles {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @Column({ name: 'role_code' })
  roleCode: string;

  @Expose()
  @Column({ name: 'position_name' })
  name: string;

  @Expose()
  @Column({ name: 'role_parent' })
  role_parent: number;

  @Expose()
  @ManyToOne(() => Roles, (role) => role.children, { nullable: true })
  @JoinColumn({ name: 'role_parent' })
  parent?: Roles;

  // One role can have many children
  @OneToMany(() => Roles, (role) => role.parent)
  children?: Roles[];

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date | null;

  @DeleteDateColumn()
  deletedAt?: Date | null;

  @OneToMany(() => Users, (user) => user.roles)
  users?: Users[];
}
