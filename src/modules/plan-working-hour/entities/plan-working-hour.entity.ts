import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PlanWorkingHourDetail } from './plan-working-hour-detail.entity';
import { ParentPlanWorkingHour } from './parent-plan-working-hour.entity';

@Entity('r_plan_working_hour')
export class PlanWorkingHour {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', nullable: true })
  plan_date: Date;

  @Column({ type: 'boolean', default: true, nullable: true })
  is_calender_day: boolean;

  @Column({ type: 'boolean', default: false, nullable: true })
  is_holiday_day: boolean;

  @Column({ type: 'boolean', default: true, nullable: true })
  is_schedule_day: boolean;

  @Column({ type: 'float', nullable: true })
  working_hour: number;

  @Column({ type: 'int', nullable: true })
  working_day_longshift: number;

  @Column({ type: 'int', nullable: true })
  working_hour_longshift: number;

  @Column({ type: 'float', nullable: true })
  mohh_per_month: number;

  @Column({ type: 'int', nullable: true })
  parent_plan_working_hour_id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Relations
  @ManyToOne(() => ParentPlanWorkingHour, (parent) => parent.planWorkingHours)
  @JoinColumn({ name: 'parent_plan_working_hour_id' })
  parentPlanWorkingHour: ParentPlanWorkingHour;

  @OneToMany(() => PlanWorkingHourDetail, (detail) => detail.planWorkingHour)
  details: PlanWorkingHourDetail[];
}
