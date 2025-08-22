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
import { ParentPlanProduction } from '../../parent-plan-production/entities/parent-plan-production.entity';

@Entity('r_plan_production')
export class PlanProduction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', nullable: false })
  plan_date: Date;

  @Column({ type: 'boolean', nullable: false })
  is_calender_day: boolean;

  @Column({ type: 'boolean', nullable: false })
  is_holiday_day: boolean;

  @Column({ type: 'boolean', nullable: false, comment: 'is_available_day == is_scheduled_day' })
  is_available_day: boolean;

  @Column({ type: 'float', nullable: false })
  average_day_ewh: number;

  @Column({ type: 'float', nullable: false })
  average_shift_ewh: number;

  @Column({ type: 'float', nullable: false })
  ob_target: number;

  @Column({ type: 'float', nullable: false })
  ore_target: number;

  @Column({ type: 'float', nullable: false })
  quarry: number;

  @Column({ type: 'float', nullable: false })
  remaining_stock: number;

  @Column({ type: 'float', nullable: false, comment: 'Calculated: (ore_target / ob_target)' })
  sr_target: number;

  @Column({ type: 'float', nullable: false })
  ore_shipment_target: number;

  @Column({ type: 'int', nullable: false })
  total_fleet: number;

  @Column({ type: 'float', nullable: false, comment: 'Calculated: (old stock global - ore shipment + ore target)' })
  daily_old_stock: number;

  @Column({ type: 'float', nullable: false, comment: 'Calculated: (ob target / 2)' })
  shift_ob_target: number;

  @Column({ type: 'float', nullable: false, comment: 'Calculated: (ore target / 2)' })
  shift_ore_target: number;

  @Column({ type: 'float', nullable: false, comment: 'Calculated: (quarry / 2)' })
  shift_quarry: number;

  @Column({ type: 'float', nullable: false, comment: 'Calculated: (shift ob target / shift ore target)' })
  shift_sr_target: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: 'Average month EWH (Equivalent Working Hours)' })
  average_moth_ewh: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Foreign Key to ParentPlanProduction
  @Column({ type: 'int', nullable: false })
  parent_plan_production_id: number;

  @ManyToOne(() => ParentPlanProduction, (parentPlanProduction) => parentPlanProduction.planProductions)
  @JoinColumn({ name: 'parent_plan_production_id' })
  parentPlanProduction: ParentPlanProduction;
}
