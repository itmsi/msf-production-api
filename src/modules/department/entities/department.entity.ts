import { Expose, Exclude } from 'class-transformer';
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
import { Employee } from '../../employee/entities/employee.entity';

@Entity('m_departments')
export class Department {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @Column({ name: 'name' })
  name: string;

  @Expose()
  @Column({ name: 'description', nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @Column({ name: 'createdBy', nullable: true })
  createdBy?: number;

  @UpdateDateColumn()
  updatedAt?: Date | null;

  @Column({ name: 'updatedBy', nullable: true })
  updatedBy?: number;

  @DeleteDateColumn()
  deletedAt?: Date | null;

  @Column({ name: 'deletedBy', nullable: true })
  deletedBy?: number;

  // Relations
  @OneToMany(() => Employee, (employee) => employee.department)
  employees?: Employee[];
}
