import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { Population } from '../../population/entities/population.entity';
import { Sites } from '../../sites/entities/sites.entity';
import { OperationPoints } from '../../operation-points/entities/operation-points.entity';
import { Barge } from '../../barge/entities/barge.entity';

@Entity('r_ccr_hauling')
export class HaulingList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', name: 'activity_date' })
  activityDate: Date;

  @Column({ type: 'enum', enum: ['ds', 'ns'], name: 'shift' })
  shift: string;

  @Column({ type: 'timestamp', name: 'time' })
  time: Date;

  @Column({ name: 'unit_loading_id' })
  unitLoadingId: number;

  @Column({ name: 'unit_hauler_id' })
  unitHaulerId: number;

  @Column({ type: 'enum', enum: ['biomas', 'boulder', 'ob', 'ore', 'ore-barge', 'quarry'], name: 'material' })
  material: string;

  @Column({ name: 'loading_point_id' })
  loadingPointId: number;

  @Column({ name: 'dumping_point_op_id', nullable: true })
  dumpingPointOpId: number;

  @Column({ name: 'dumping_point_barge_id', nullable: true })
  dumpingPointBargeId: number;

  @Column({ type: 'int', name: 'vessel', nullable: true })
  vessel: number;

  @Column({ type: 'float', name: 'total_tonnage', nullable: true })
  totalTonnage: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deletedAt' })
  deletedAt: Date;

  // Relations
  @ManyToOne(() => Population, { eager: true })
  @JoinColumn({ name: 'unit_loading_id' })
  unitLoading: Population;

  @ManyToOne(() => Population, { eager: true })
  @JoinColumn({ name: 'unit_hauler_id' })
  unitHauler: Population;

  @ManyToOne(() => OperationPoints, { eager: true })
  @JoinColumn({ name: 'loading_point_id' })
  loadingPoint: OperationPoints;

  @ManyToOne(() => OperationPoints, { eager: true })
  @JoinColumn({ name: 'dumping_point_op_id' })
  dumpingPointOp: OperationPoints;

  @ManyToOne(() => Barge, { eager: true })
  @JoinColumn({ name: 'dumping_point_barge_id' })
  dumpingPointBarge: Barge;
}
