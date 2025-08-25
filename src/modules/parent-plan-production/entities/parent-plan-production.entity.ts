import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { PlanProduction } from '../../plan-production/entities/plan-production.entity';

@Entity('r_parent_plan_production')
export class ParentPlanProduction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', nullable: false })
  plan_date: Date;

  @Column({
    type: 'int',
    nullable: false,
    comment: 'Calculated from total days on month',
  })
  total_calender_day: number;

  @Column({
    type: 'int',
    nullable: false,
    comment: 'Calculated from total sunday on month',
  })
  total_holiday_day: number;

  @Column({
    type: 'int',
    nullable: false,
    comment: 'Calculated from total days on month',
  })
  total_available_day: number;

  @Column({ type: 'float', nullable: false })
  total_average_month_ewh: number;

  @Column({ type: 'float', nullable: false })
  total_average_day_ewh: number;

  @Column({ type: 'float', nullable: false })
  total_ob_target: number;

  @Column({ type: 'float', nullable: false })
  total_ore_target: number;

  @Column({ type: 'float', nullable: false })
  total_quarry_target: number;

  @Column({ type: 'float', nullable: false, default: 2.0 })
  total_sr_target: number;

  @Column({ type: 'float', nullable: false })
  total_ore_shipment_target: number;

  @Column({ type: 'float', nullable: false, default: 0 })
  total_remaining_stock: number;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
    comment: 'Total sisa stock yang tersedia',
  })
  total_sisa_stock: number;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
    comment: 'Total fleet yang tersedia',
  })
  total_fleet: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  // Relationship with PlanProduction
  @OneToMany(
    () => PlanProduction,
    (planProduction) => planProduction.parentPlanProduction,
  )
  planProductions: PlanProduction[];
}
