import { Expose, Exclude } from 'class-transformer';
// import { Users } from '../../users/entities/users.entity';
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
import { Department } from '../../department/entities/department.entity';

@Entity('m_employee')
export class Employee {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @Column({ name: 'first_name' })
  firstName: string;

  @Expose()
  @Column({ name: 'last_name' })
  lastName: string;

  @Expose()
  @Column({ name: 'department_id', nullable: true })
  departmentId?: number;

  @Expose()
  @Column()
  position: string;

  @Expose()
  @Column({ type: 'varchar', length: 255 })
  nip: string;

  @Expose()
  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'resign', 'on-leave'],
    default: 'active',
  })
  status: string;

  @Expose()
  @Column({ nullable: true })
  salary: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date | null;

  @DeleteDateColumn()
  deletedAt?: Date | null;

  @OneToMany('Users', (user: any) => user.employees)
  users?: any[];

  @ManyToOne(() => Department, (department) => department.employees)
  @JoinColumn({ name: 'department_id' })
  department?: Department;

  // Virtual property untuk nama lengkap
  @Expose()
  get name(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
