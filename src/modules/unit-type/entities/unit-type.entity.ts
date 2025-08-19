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
import { Brand } from '../../brand/entities/brand.entity';

@Entity('m_unit_type')
export class UnitType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  brand_id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  unit_name: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  type_name: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  model_name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Brand, { eager: true })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;
}
