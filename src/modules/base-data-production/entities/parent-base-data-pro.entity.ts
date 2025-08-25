import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { BaseDataPro } from './base-data-pro.entity';

export enum ShiftType {
  DS = 'ds',
  NS = 'ns',
}

@Entity('r_parent_base_data_pro')
export class ParentBaseDataPro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'unit_id' })
  unitId: number;

  @Column({ type: 'timestamp', name: 'activity_date' })
  activityDate: Date;

  @Column({ type: 'varchar', length: 2, name: 'shift' })
  shift: ShiftType;

  @Column({ type: 'int', name: 'driver_id' })
  driverId: number;

  @Column({ type: 'timestamp', name: 'start_shift', nullable: true })
  startShift: Date | null;

  @Column({ type: 'timestamp', name: 'end_shift', nullable: true })
  endShift: Date | null;

  @OneToMany(() => BaseDataPro, (baseDataPro) => baseDataPro.parentBaseDataPro)
  baseDataPro: BaseDataPro[];
}
