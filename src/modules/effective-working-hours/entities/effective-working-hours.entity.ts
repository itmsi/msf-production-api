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
import { ApiProperty } from '@nestjs/swagger';
import { Population } from '../../population/entities/population.entity';
import { Activities } from '../../activities/entities/activities.entity';

export enum LossType {
  STB = 'STB',
  BD = 'BD',
}

export enum Shift {
  DS = 'DS',
  NS = 'NS',
}

@Entity('r_loss_time')
export class EffectiveWorkingHours {
  @ApiProperty({
    description: 'ID unik effective working hours',
    example: 1,
    type: 'number',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Tanggal aktivitas loss time',
    example: '2024-01-15',
    type: 'string',
    format: 'date',
  })
  @Column({ type: 'date', name: 'date_activity' })
  dateActivity: string;

  @ApiProperty({
    description: 'Tipe loss time (STB = StandBy, BD = BreakDown)',
    enum: LossType,
    example: LossType.STB,
    enumName: 'LossType',
  })
  @Column({
    type: 'enum',
    enum: LossType,
    name: 'loss_type',
  })
  lossType: LossType;

  @ApiProperty({
    description: 'Shift kerja (DS = Day Shift, NS = Night Shift)',
    enum: Shift,
    example: Shift.DS,
    enumName: 'Shift',
    default: Shift.DS,
  })
  @Column({
    type: 'enum',
    enum: Shift,
    name: 'shift',
    default: Shift.DS,
  })
  shift: Shift;

  @ApiProperty({
    description: 'ID population/unit yang terkait',
    example: 1,
    type: 'number',
  })
  @Column({ name: 'population_id' })
  populationId: number;

  @ApiProperty({
    description: 'ID aktivitas yang terkait',
    example: 1,
    type: 'number',
  })
  @Column({ name: 'activities_id' })
  activitiesId: number;

  @ApiProperty({
    description: 'Deskripsi detail loss time',
    example: 'Standby karena hujan lebat',
    type: 'string',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    description: 'Waktu mulai loss time',
    example: '2024-01-15T08:00:00Z',
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  @Column({ type: 'timestamp', nullable: true })
  start: Date;

  @ApiProperty({
    description: 'Waktu selesai loss time',
    example: '2024-01-15T10:00:00Z',
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  @Column({ type: 'timestamp', nullable: true, name: 'stop' })
  stop: Date;

  @ApiProperty({
    description: 'Durasi loss time dalam menit (otomatis dihitung dari start dan end)',
    example: 120,
    type: 'number',
    nullable: true,
  })
  @Column({ type: 'float', nullable: true })
  duration: number;

  @ApiProperty({
    description: 'Catatan tambahan untuk loss time',
    example: 'Perlu perbaikan mesin',
    type: 'string',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  remarks: string;

  @ApiProperty({
    description: 'Waktu pembuatan record',
    type: 'string',
    format: 'date-time',
  })
  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @ApiProperty({
    description: 'ID user yang membuat record',
    example: 1,
    type: 'number',
    nullable: true,
  })
  @Column({ name: 'createdBy', nullable: true })
  createdBy: number;

  @ApiProperty({
    description: 'Waktu terakhir update record',
    type: 'string',
    format: 'date-time',
  })
  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  @ApiProperty({
    description: 'ID user yang terakhir update record',
    example: 1,
    type: 'number',
    nullable: true,
  })
  @Column({ name: 'updatedBy', nullable: true })
  updatedBy: number;

  @ApiProperty({
    description: 'Waktu soft delete record',
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  @DeleteDateColumn({ name: 'deletedAt' })
  deletedAt: Date;

  @ApiProperty({
    description: 'ID user yang melakukan soft delete',
    example: 1,
    type: 'number',
    nullable: true,
  })
  @Column({ name: 'deletedBy', nullable: true })
  deletedBy: number;

  // Relations
  @ApiProperty({
    description: 'Data population/unit yang terkait',
    type: () => Population,
  })
  @ManyToOne(() => Population, { eager: true })
  @JoinColumn({ name: 'population_id' })
  population: Population;

  @ApiProperty({
    description: 'Data aktivitas yang terkait',
    type: () => Activities,
  })
  @ManyToOne(() => Activities)
  @JoinColumn({ name: 'activities_id' })
  activities: Activities;
}
