import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('mtd_work_hour')
export class MtdWorkHour {
  @ApiProperty({
    description: 'ID unik MTD Work Hour',
    example: 1,
    type: 'number',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Unit/No Unit',
    example: 'DT-001',
    type: 'string',
  })
  @Column({ type: 'varchar', length: 100 })
  unit: string;

  @ApiProperty({
    description: 'Tanggal aktivitas',
    example: '2024-01-15',
    type: 'string',
    format: 'date',
  })
  @Column({ type: 'date' })
  activityDate: string;

  @ApiProperty({
    description: 'Jenis problem',
    example: 'P5M',
    type: 'string',
  })
  @Column({ type: 'varchar', length: 100 })
  problemType: string;

  @ApiProperty({
    description: 'Durasi dalam jam',
    example: 2.5,
    type: 'number',
  })
  @Column({ type: 'float' })
  duration: number;

  @ApiProperty({
    description: 'Deskripsi',
    example: 'P5M - Preventive Maintenance',
    type: 'string',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
