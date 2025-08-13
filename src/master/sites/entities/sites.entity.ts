import { Expose, Exclude } from 'class-transformer';
import { Users } from '../../../modules/users/entities/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('m_sites')
export class Sites {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @Column({ nullable: true })
  name: string;

  @Expose()
  @Column({ nullable: true })
  location: string;

  @Expose()
  @Column({ type: 'float', nullable: true })
  longitude: number;

  @Expose()
  @Column({ type: 'float', nullable: true })
  latitude: number;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date | null;

  @DeleteDateColumn()
  deletedAt?: Date | null;

  @OneToMany(() => Users, (user) => user.sites)
  users?: Users[];
}
