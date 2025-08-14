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
} from 'typeorm';
import { Employee } from '../../employee/entities/employee.entity';
import { Sites } from '../../sites/entities/sites.entity';

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

  // roleId removed - using junction table r_user_role instead

  @Expose()
  @Column()
  email: string;

  @Expose()
  @Column()
  isActive: boolean;

  @Expose()
  @Column()
  employee_id: number;

  // sites_id removed - not needed in user entity

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt?: Date | null;

  @DeleteDateColumn()
  deletedAt?: Date | null;

  // roles relationship removed - using junction table r_user_role instead

  @Expose()
  @ManyToOne(() => Employee, (employee) => employee.users)
  @JoinColumn({ name: 'employee_id' })
  employees?: Employee;

  // sites relationship removed - not needed in user entity
}
