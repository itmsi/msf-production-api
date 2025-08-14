import { Expose, Exclude } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { OperationPoints } from '../../operation-points/entities/operation-points.entity';
import { Roles } from '../../roles/entities/roles.entity';

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

  @OneToMany(() => OperationPoints, (op) => op.site)
  operator_points?: OperationPoints[];

  @OneToMany(() => Roles, (role) => role.sites)
  roles?: Roles[];
}
