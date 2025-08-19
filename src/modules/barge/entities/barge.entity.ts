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
import { Sites } from '../../sites/entities/sites.entity';

@Entity('m_barge')
export class Barge {
  @PrimaryGeneratedColumn()
  id: number;

  // sites_id removed - not in migration

  @Column({ type: 'varchar', length: 255, nullable: true })
  shipment: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  remarks: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // site relationship removed - not in migration
}
