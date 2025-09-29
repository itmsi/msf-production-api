import { Exclude, Expose } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('m_setting_dashboard')
export class SettingDashboard {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @Column({ type: 'float', nullable: true })
  cycle_time: number;

  @Expose()
  @Column({ type: 'float', nullable: true })
  fuel_ratio: number;

  @Expose()
  @Column({ type: 'float', nullable: true })
  speed: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt?: Date | null;

  @DeleteDateColumn()
  deletedAt?: Date | null;
}
