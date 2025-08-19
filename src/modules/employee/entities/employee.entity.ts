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
} from 'typeorm';

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
  @Column()
  department: string;

  @Expose()
  @Column()
  position: string;

  @Expose()
  @Column()
  nip: number;

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

  // Virtual property untuk nama lengkap
  @Expose()
  get name(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
