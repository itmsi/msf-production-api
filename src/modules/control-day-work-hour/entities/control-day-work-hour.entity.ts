import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('control_day_work_hour')
export class ControlDayWorkHour {
  @ApiProperty({
    description: 'ID unik control day work hour',
    example: 1,
    type: 'number',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Unit dari data master population',
    example: 'Unit-001',
    type: 'string',
  })
  @Column({ type: 'varchar', length: 100 })
  unit: string;

  @ApiProperty({
    description: 'Shift dari Production[Shift]',
    example: 'DS',
    type: 'string',
  })
  @Column({ type: 'varchar', length: 10 })
  shift: string;

  @ApiProperty({
    description: 'Tanggal filter',
    example: '2024-01-15',
    type: 'string',
    format: 'date',
  })
  @Column({ type: 'date' })
  filterDate: string;

  @ApiProperty({
    description: 'Data P5M dari Effective Working Hours',
    example: 120.5,
    type: 'number',
    nullable: true,
  })
  @Column({ type: 'float', nullable: true })
  p5m: number;

  @ApiProperty({
    description: 'Data Perg. Shift dari Effective Working Hours',
    example: 45.0,
    type: 'number',
    nullable: true,
  })
  @Column({ type: 'float', nullable: true })
  pergShift: number;

  @ApiProperty({
    description: 'Data Rest Time dari Effective Working Hours',
    example: 30.0,
    type: 'number',
    nullable: true,
  })
  @Column({ type: 'float', nullable: true })
  restTime: number;

  @ApiProperty({
    description: 'Data GST dari Effective Working Hours',
    example: 15.0,
    type: 'number',
    nullable: true,
  })
  @Column({ type: 'float', nullable: true })
  gst: number;

  @ApiProperty({
    description: 'Data Travelling dari Effective Working Hours',
    example: 60.0,
    type: 'number',
    nullable: true,
  })
  @Column({ type: 'float', nullable: true })
  travelling: number;

  @ApiProperty({
    description: 'Data Perbaikan Front Loading dari Effective Working Hours',
    example: 90.0,
    type: 'number',
    nullable: true,
  })
  @Column({ type: 'float', nullable: true })
  perbaikanFrontLoading: number;

  @ApiProperty({
    description: 'Data Cek Elevasi dari Effective Working Hours',
    example: 20.0,
    type: 'number',
    nullable: true,
  })
  @Column({ type: 'float', nullable: true })
  cekElevasi: number;

  @ApiProperty({
    description: 'Data Refuelling dari Effective Working Hours',
    example: 25.0,
    type: 'number',
    nullable: true,
  })
  @Column({ type: 'float', nullable: true })
  refuelling: number;

  @ApiProperty({
    description: 'Data Slippery dari Effective Working Hours',
    example: 40.0,
    type: 'number',
    nullable: true,
  })
  @Column({ type: 'float', nullable: true })
  slippery: number;

  @ApiProperty({
    description: 'Data Travelling Equipment dari Effective Working Hours',
    example: 35.0,
    type: 'number',
    nullable: true,
  })
  @Column({ type: 'float', nullable: true })
  travellingEquipment: number;

  @ApiProperty({
    description: 'Data Fogging dari Effective Working Hours',
    example: 10.0,
    type: 'number',
    nullable: true,
  })
  @Column({ type: 'float', nullable: true })
  fogging: number;

  @ApiProperty({
    description: 'Data Safety Talk dari Effective Working Hours',
    example: 15.0,
    type: 'number',
    nullable: true,
  })
  @Column({ type: 'float', nullable: true })
  safetyTalk: number;

  @ApiProperty({
    description: 'Data P2H dari Effective Working Hours',
    example: 50.0,
    type: 'number',
    nullable: true,
  })
  @Column({ type: 'float', nullable: true })
  p2h: number;

  @ApiProperty({
    description: 'Waktu pembuatan record',
    type: 'string',
    format: 'date-time',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Waktu terakhir update record',
    type: 'string',
    format: 'date-time',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    description: 'Waktu soft delete record',
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  @DeleteDateColumn()
  deletedAt: Date;
}
