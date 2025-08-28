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
import { ParentBaseDataPro } from './parent-base-data-pro.entity';
import { Population } from '../../population/entities/population.entity';

export enum MaterialType {
  BIOMAS = 'biomas',
  BOULDER = 'boulder',
  OB = 'ob',
  ORE = 'ore',
  ORE_BARGE = 'ore-barge',
  QUARRY = 'quarry',
}

@Entity('r_base_data_pro')
export class BaseDataPro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'parent_base_data_pro_id' })
  parentBaseDataProId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'km_awal', nullable: true })
  kmAwal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'km_akhir', nullable: true })
  kmAkhir: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_km', nullable: true })
  totalKm: number;

  @Column({ type: 'float', name: 'hm_awal', nullable: true })
  hmAwal: number;

  @Column({ type: 'float', name: 'hm_akhir', nullable: true })
  hmAkhir: number;

  @Column({ type: 'float', name: 'total_hm', nullable: true })
  totalHm: number;

  @Column({ type: 'int', name: 'loading_point_id', nullable: true })
  loadingPointId: number;

  @Column({ type: 'int', name: 'dumping_point_id', nullable: true })
  dumpingPointId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'mround_distance', nullable: true })
  mroundDistance: number;

  @Column({ type: 'float', name: 'distance', nullable: true })
  distance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_vessel', nullable: true })
  totalVessel: number;

  @Column({ type: 'enum', enum: MaterialType, nullable: true })
  material: MaterialType;

  @Column({ type: 'int', name: 'createdBy', nullable: true })
  createdBy: number;

  @Column({ type: 'int', name: 'updatedBy', nullable: true })
  updatedBy: number;

  @Column({ type: 'int', name: 'deletedBy', nullable: true })
  deletedBy: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deletedAt' })
  deletedAt: Date;

  @ManyToOne(() => ParentBaseDataPro, (parentBaseDataPro) => parentBaseDataPro.baseDataPro)
  @JoinColumn({ name: 'parent_base_data_pro_id' })
  parentBaseDataPro: ParentBaseDataPro;
}
