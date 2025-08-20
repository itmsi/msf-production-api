import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('r_plan_production')
export class DailyPlanProduction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', nullable: true })
  plan_date: Date;

  @Column({ type: 'boolean', default: true, nullable: true })
  is_calender_day: boolean;

  @Column({ type: 'boolean', default: false, nullable: true })
  is_holiday_day: boolean;

  @Column({ type: 'boolean', default: true, nullable: true })
  is_available_day: boolean;

  @Column({ type: 'float', nullable: true })
  average_day_ewh: number;

  @Column({ type: 'float', nullable: true })
  average_shift_ewh: number;

  @Column({ type: 'float', nullable: true })
  ob_target: number;

  @Column({ type: 'float', nullable: true })
  ore_target: number;

  @Column({ type: 'float', nullable: true })
  quarry: number;

  @Column({ type: 'float', nullable: true })
  sr_target: number;

  @Column({ type: 'float', nullable: true })
  ore_shipment_target: number;

  @Column({ type: 'float', nullable: true })
  daily_old_stock: number;

  @Column({ type: 'float', nullable: true })
  shift_ob_target: number;

  @Column({ type: 'float', nullable: true })
  shift_ore_target: number;

  @Column({ type: 'float', nullable: true })
  shift_quarrt: number;

  @Column({ type: 'float', nullable: true })
  shift_sr_target: number;

  @Column({ type: 'int', nullable: true })
  total_fleet: number;

  @Column({ type: 'float', nullable: true })
  remaining_stock: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
