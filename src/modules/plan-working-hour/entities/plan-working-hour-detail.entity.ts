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
import { PlanWorkingHour } from './plan-working-hour.entity';
import { Activities } from '../../activities/entities/activities.entity';

@Entity('r_plan_working_hour_detail')
export class PlanWorkingHourDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  plant_working_hour_id: number;

  @Column({ type: 'int', nullable: false })
  activities_id: number;

  @Column({ type: 'float', nullable: true })
  working_hour: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Relations
  @ManyToOne(() => PlanWorkingHour, { nullable: false })
  @JoinColumn({ name: 'plant_working_hour_id' })
  planWorkingHour: PlanWorkingHour;

  @ManyToOne(() => Activities, { nullable: false })
  @JoinColumn({ name: 'activities_id' })
  activities: Activities;
}
