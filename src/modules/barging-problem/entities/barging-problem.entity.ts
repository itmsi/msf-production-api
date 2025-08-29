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
import { Activities } from '../../activities/entities/activities.entity';
import { Sites } from '../../sites/entities/sites.entity';
import { Barge } from '../../barge/entities/barge.entity';

@Entity('r_ccr_barging_problem')
export class BargingProblem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', name: 'activity_date' })
  activityDate: Date;

  @Column({ type: 'enum', enum: ['ds', 'ns'], name: 'shift' })
  shift: string;

  @Column({ name: 'barge_id' })
  bargeId: number;

  @Column({ name: 'activities_id' })
  activitiesId: number;

  @Column({ name: 'site_id', nullable: true })
  siteId: number;

  @Column({ type: 'timestamp', name: 'start' })
  start: Date;

  @Column({ type: 'timestamp', name: 'finish' })
  finish: Date;

  @Column({ type: 'float', name: 'duration', nullable: true })
  duration: number;

  @Column({ type: 'text', name: 'remark', nullable: true })
  remark: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @Column({ name: 'createdBy', nullable: true })
  createdBy: number;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  @Column({ name: 'updatedBy', nullable: true })
  updatedBy: number;

  @DeleteDateColumn({ name: 'deletedAt' })
  deletedAt: Date;

  @Column({ name: 'deletedBy', nullable: true })
  deletedBy: number;

  // Relations
  @ManyToOne(() => Activities, { eager: true })
  @JoinColumn({ name: 'activities_id' })
  activities: Activities;

  @ManyToOne(() => Sites, { eager: true })
  @JoinColumn({ name: 'site_id' })
  site: Sites;

  @ManyToOne(() => Barge, { eager: true })
  @JoinColumn({ name: 'barge_id' })
  barge: Barge;
}
