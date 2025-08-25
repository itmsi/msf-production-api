import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { PlanWorkingHour } from './plan-working-hour.entity';

@Entity('r_parent_plan_working_hour')
export class ParentPlanWorkingHour {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', nullable: true })
  plan_date: Date;

  @Column({ type: 'int', nullable: true })
  total_calendar_day: number;

  @Column({ type: 'int', nullable: true })
  total_holiday_day: number;

  @Column({ type: 'int', nullable: true })
  total_available_day: number;

  @Column({ type: 'float', nullable: true })
  total_working_hour: number;

  @Column({ type: 'int', nullable: true })
  total_working_day_longshift: number;

  @Column({ type: 'int', nullable: true })
  working_hour_longshift: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  working_hour_longshift_day: number;

  @Column({ type: 'int', nullable: true })
  total_mohh_per_month: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Relations
  @OneToMany(() => PlanWorkingHour, (planWorkingHour) => planWorkingHour.parentPlanWorkingHour)
  planWorkingHours: PlanWorkingHour[];
}
