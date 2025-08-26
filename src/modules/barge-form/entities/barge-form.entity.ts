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
import { Barge } from '../../barge/entities/barge.entity';
import { Sites } from '../../sites/entities/sites.entity';

@Entity('r_input_barge')
export class BargeForm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  barge_id: number;

  @Column({ type: 'int', nullable: false })
  site_id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  shipment: string;

  @Column({ type: 'timestamp', nullable: false })
  start_loading: Date;

  @Column({ type: 'timestamp', nullable: false })
  end_loading: Date;

  @Column({ type: 'float', nullable: true })
  total_vessel: number;

  @Column({ type: 'float', nullable: true })
  vol_by_survey: number;

  @Column({ type: 'float', nullable: true })
  capacity_per_dt: number;

  @Column({ type: 'float', nullable: true })
  achievment: number;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  status: string;

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
  @ManyToOne(() => Barge, { eager: true })
  @JoinColumn({ name: 'barge_id' })
  barge: Barge;

  @ManyToOne(() => Sites, { eager: true })
  @JoinColumn({ name: 'site_id' })
  site: Sites;
}
