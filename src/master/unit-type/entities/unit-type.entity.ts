import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Brand } from '../../brand/entities/brand.entity';

@Entity('m_unit_type')
export class UnitType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  brand_id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  unit_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  type_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  model_name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Brand, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;
}
