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
import { Employee } from '../../../master/employee/entities/employee.entity';
import { Sites } from '../../../master/sites/entities/sites.entity';

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
  roleId: number;

  @Expose()
  @Column()
  email: string;

  @Expose()
  @Column()
  isActive: boolean;

  @Expose()
  @Column()
  employee_id: number;

  @Expose()
  @Column()
  sites_id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt?: Date | null;

  @DeleteDateColumn()
  deletedAt?: Date | null;

  @Expose()
  @ManyToOne(() => Roles, (role) => role.users)
  @JoinColumn({ name: 'roleId' })
  roles?: Roles;

  @Expose()
  @ManyToOne(() => Employee, (employee) => employee.users)
  @JoinColumn({ name: 'employee_id' })
  employees?: Employee;

  @Expose()
  @ManyToOne(() => Sites, (sites) => sites.users)
  @JoinColumn({ name: 'sites_id' })
  sites?: Sites;
}
