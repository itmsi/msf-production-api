import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Users } from './users.entity';
import { Roles } from '../../roles/entities/roles.entity';

@Entity('r_user_role')
export class UserRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  role_id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Users, (user) => user.userRoles)
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @ManyToOne(() => Roles, (role) => role.userRoles)
  @JoinColumn({ name: 'role_id' })
  role: Roles;
}
