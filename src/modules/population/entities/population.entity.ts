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
import { UnitType } from '../../unit-type/entities/unit-type.entity';
import { Activities } from '../../activities/entities/activities.entity';
import { Sites } from '../../sites/entities/sites.entity';

@Entity('m_population')
export class Population {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  no_unit: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  vin_number: string;

  @Column({ type: 'timestamp', nullable: true })
  date_arrive: Date;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @Column({ type: 'int', nullable: true })
  unit_type_id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  no_unit_system: string;

  @Column({ type: 'enum', enum: ['cummins', 'weichai'], nullable: true })
  engine_brand: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  serial_engine: string;

  @Column({ type: 'int', nullable: true })
  activities_id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  site_origin: string;

  @Column({ type: 'enum', enum: ['RFU', 'BD'], nullable: true })
  remarks: string;

  @Column({ type: 'int', nullable: true })
  site_id: number;

  @Column({ type: 'enum', enum: ['6x4', '8x4'], nullable: true })
  tyre_type: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  company: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  last_unit_number: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => UnitType, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'unit_type_id' })
  unitType: UnitType;

  @ManyToOne(() => Activities, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'activities_id' })
  activities: Activities;

  @ManyToOne(() => Sites, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'site_id' })
  site: Sites;
}
