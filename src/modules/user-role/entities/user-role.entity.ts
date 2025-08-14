import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Users } from '../../users/entities/users.entity';
import { Roles } from '../../roles/entities/roles.entity';

@Entity('r_user_role')
export class UserRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  user_id: number;

  @Column({ type: 'int', nullable: false })
  role_id: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'int', nullable: true })
  createdBy: number;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'int', nullable: true })
  updatedBy: number;

  @ManyToOne(() => Users, (user) => user.userRoles)
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @ManyToOne(() => Roles, (role) => role.userRoles)
  @JoinColumn({ name: 'role_id' })
  role: Roles;
}
