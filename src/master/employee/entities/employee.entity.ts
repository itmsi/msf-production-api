import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Users } from '../../../modules/users/entities/users.entity';

@Entity()
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  employeeNumber: string;

  @Column()
  position: string;

  @Column()
  department: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Users, (user) => user.employees)
  users: Users[];
}
