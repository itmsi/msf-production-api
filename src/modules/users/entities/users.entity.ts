import { Exclude, Expose } from 'class-transformer';
import { Roles } from '../../roles/entities/roles.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Employee } from '../../employee/entities/employee.entity';
import { Sites } from '../../sites/entities/sites.entity';
import { UserRole } from './user-role.entity';

@Entity('m_user')
export class Users {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @Column({ unique: true })
  username: string;

  @Exclude()
  @Column()
  password: string;

  @Expose()
  @Column()
  email: string;

  @Expose()
  @Column()
  isActive: boolean;

  @Expose()
  @Column()
  employee_id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt?: Date | null;

  @DeleteDateColumn()
  deletedAt?: Date | null;

  @Expose()
  @ManyToOne(() => Employee, (employee) => employee.users)
  @JoinColumn({ name: 'employee_id' })
  employees?: Employee;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles?: UserRole[];
}
