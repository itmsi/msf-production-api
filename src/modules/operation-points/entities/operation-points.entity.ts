import { Expose } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Sites } from '../../sites/entities/sites.entity';

@Entity('m_operation_points')
export class OperationPoints {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @Column({ type: 'int', nullable: false })
  sites_id: number;

  @Expose()
  @Column({ type: 'varchar', length: 100, nullable: true })
  type: string;

  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Expose()
  @Column({ type: 'float', nullable: true })
  longitude: number;

  @Expose()
  @Column({ type: 'float', nullable: true })
  latitude: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Sites, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'sites_id' })
  site: Sites;
}
