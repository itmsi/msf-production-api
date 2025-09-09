import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('analysis_hauling_barging')
export class AnalysisHaulingBarging {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', name: 'date' })
  date: Date;

  @Column({ type: 'int', name: 'barge_vessel', nullable: true })
  bargeVessel: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'barge_bcm', nullable: true })
  bargeBCM: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'barge_tonnage', nullable: true })
  bargeTonnage: number;

  @Column({ type: 'int', name: 'ore_hauling_vessel', nullable: true })
  oreHaulingVessel: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'ore_hauling_bcm', nullable: true })
  oreHaulingBCM: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'ore_hauling_tonnage', nullable: true })
  oreHaulingTonnage: number;

  @Column({ type: 'int', name: 'ob_vessel', nullable: true })
  obVessel: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'ob_bcm', nullable: true })
  obBCM: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'ob_tonnage', nullable: true })
  obTonnage: number;

  @Column({ type: 'int', name: 'tmm_vessel', nullable: true })
  tmmVessel: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'tmm_bcm', nullable: true })
  tmmBCM: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'tmm_tonnage', nullable: true })
  tmmTonnage: number;
}
