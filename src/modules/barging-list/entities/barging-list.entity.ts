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
import { Barge } from '../../barge/entities/barge.entity';

@Entity('r_ccr_barging')
export class BargingList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', name: 'activity_date' })
  activityDate: Date;

  @Column({ type: 'enum', enum: ['ds', 'ns'], name: 'shift' })
  shift: string;

  @Column({ type: 'timestamp', name: 'time' })
  time: Date;

  @Column({ name: 'unit_hauler_id' })
  unitHaulerId: number;

  @Column({ name: 'barge_id' })
  bargeId: number;

  @Column({ type: 'int', name: 'vessel' })
  vessel: number;

  @Column({ type: 'float', name: 'total_tonnage', nullable: true })
  totalTonnage: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @Column({ type: 'int', name: 'createdBy', nullable: true })
  createdBy: number;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  @Column({ type: 'int', name: 'updatedBy', nullable: true })
  updatedBy: number;

  @DeleteDateColumn({ name: 'deletedAt' })
  deletedAt: Date;

  @Column({ type: 'int', name: 'deletedBy', nullable: true })
  deletedBy: number;

  // Relations
  @ManyToOne(() => Population, { eager: true })
  @JoinColumn({ name: 'unit_hauler_id' })
  unitHauler: Population;

  @ManyToOne(() => Barge, { eager: true })
  @JoinColumn({ name: 'barge_id' })
  barge: Barge;
}
