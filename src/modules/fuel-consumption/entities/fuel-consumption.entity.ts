import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Population } from '../../population/entities/population.entity';
import { Users } from '../../users/entities/users.entity';

@Entity('r_fuel')
export class FuelConsumption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  unit_id: number;

  @Column({ 
    type: 'enum', 
    enum: ['DS', 'NS'], 
    nullable: false,
    default: 'DS'
  })
  shift: string;

  @Column({ type: 'date', nullable: false })
  activity_date: Date;

  @Column({ type: 'varchar', length: 255, nullable: false })
  part_name: string;

  @Column({ type: 'int', nullable: true })
  operator_id: number;

  @Column({ type: 'float', nullable: false })
  last_refueling_hm: number;

  @Column({ type: 'float', nullable: false })
  now_refueling_hm: number;

  @Column({ 
    type: 'float', 
    nullable: false,
    comment: 'Calculated: (now - last)'
  })
  running_refueling_hm: number;

  @Column({ type: 'float', nullable: false })
  last_refueling_km: number;

  @Column({ type: 'float', nullable: false })
  now_refueling_km: number;

  @Column({ 
    type: 'float', 
    nullable: false,
    comment: 'Calculated: (now - last)'
  })
  running_refueling_km: number;

  @Column({ type: 'float', nullable: true })
  qty_supply: number;

  @Column({ 
    type: 'enum', 
    enum: ['none', 'liter'], 
    nullable: false,
    default: 'liter'
  })
  uom: string;

  @Column({ 
    type: 'float', 
    nullable: true,
    comment: 'Calculated: qty_supply / running_refueling_km'
  })
  l_per_km: number;

  @Column({ 
    type: 'float', 
    nullable: true,
    comment: 'Calculated: qty_supply / running_refueling_hm'
  })
  l_per_hm: number;

  @Column({ type: 'timestamp', nullable: true })
  start_refueling_time: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_refueling_time: Date;

  @Column({ 
    type: 'float', 
    nullable: true,
    comment: 'Calculated: start - end refueling time'
  })
  lead_time_refueling_time: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'int', nullable: true })
  createdBy: number;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'int', nullable: true })
  updatedBy: number;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ type: 'int', nullable: true })
  deletedBy: number;

  // Relations
  @ManyToOne(() => Population, { eager: true })
  @JoinColumn({ name: 'unit_id' })
  unit: Population;

  @ManyToOne(() => Users, { eager: true })
  @JoinColumn({ name: 'operator_id' })
  operator: Users;
}
