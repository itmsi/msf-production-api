import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { IsNotEmptyString } from '../../../common/validators';

export class CreateBargingProblemDto {
  @ApiProperty({
    description: 'Tanggal aktivitas barging problem',
    example: '2024-01-01T00:00:00.000Z',
    required: true,
  })
  @IsNotEmpty({ message: 'activity_date tidak boleh kosong' })
  @IsDateString({}, { message: 'activity_date harus dalam format tanggal yang valid' })
  activity_date: string;

  @ApiProperty({
    description: 'Shift kerja (ds = day shift, ns = night shift)',
    example: 'ds',
    enum: ['ds', 'ns'],
    required: true,
  })
  @IsNotEmpty({ message: 'shift tidak boleh kosong' })
  @IsEnum(['ds', 'ns'], { message: 'shift harus berupa ds atau ns' })
  shift: string;

  @ApiProperty({
    description: 'ID barge yang mengalami problem',
    example: 1,
    minimum: 1,
    required: true,
  })
  @IsNotEmpty({ message: 'barge_id tidak boleh kosong' })
  @IsNumber({}, { message: 'barge_id harus berupa angka' })
  @Min(1, { message: 'barge_id harus lebih dari 0' })
  barge_id: number;

  @ApiProperty({
    description: 'ID aktivitas yang mengalami problem',
    example: 1,
    minimum: 1,
    required: true,
  })
  @IsNotEmpty({ message: 'activities_id tidak boleh kosong' })
  @IsNumber({}, { message: 'activities_id harus berupa angka' })
  @Min(1, { message: 'activities_id harus lebih dari 0' })
  activities_id: number;

  @ApiProperty({
    description: 'ID site tempat problem terjadi (nullable)',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'site_id harus berupa angka' })
  @Min(1, { message: 'site_id harus lebih dari 0' })
  site_id?: number;

  @ApiProperty({
    description: 'Waktu mulai problem',
    example: '2024-01-01T08:00:00.000Z',
    required: true,
  })
  @IsNotEmpty({ message: 'start tidak boleh kosong' })
  @IsDateString({}, { message: 'start harus dalam format tanggal yang valid' })
  start: string;

  @ApiProperty({
    description: 'Waktu selesai problem',
    example: '2024-01-01T16:00:00.000Z',
    required: true,
  })
  @IsNotEmpty({ message: 'finish tidak boleh kosong' })
  @IsDateString({}, { message: 'finish harus dalam format tanggal yang valid' })
  finish: string;

  @ApiProperty({
    description: 'Catatan tambahan tentang problem',
    example: 'Problem pada unit excavator',
    required: false,
  })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateBargingProblemDto {
  @ApiProperty({
    description: 'Tanggal aktivitas barging problem',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'activity_date harus dalam format tanggal yang valid' })
  activity_date?: string;

  @ApiProperty({
    description: 'Shift kerja (ds = day shift, ns = night shift)',
    example: 'ns',
    enum: ['ds', 'ns'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['ds', 'ns'], { message: 'shift harus berupa ds atau ns' })
  shift?: string;

  @ApiProperty({
    description: 'ID barge yang mengalami problem',
    example: 2,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'barge_id harus berupa angka' })
  @Min(1, { message: 'barge_id harus lebih dari 0' })
  barge_id?: number;

  @ApiProperty({
    description: 'ID aktivitas yang mengalami problem',
    example: 2,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'activities_id harus berupa angka' })
  @Min(1, { message: 'activities_id harus lebih dari 0' })
  activities_id?: number;

  @ApiProperty({
    description: 'ID site tempat problem terjadi (nullable)',
    example: 2,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'site_id harus berupa angka' })
  @Min(1, { message: 'site_id harus lebih dari 0' })
  site_id?: number;

  @ApiProperty({
    description: 'Waktu mulai problem',
    example: '2024-01-01T09:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'start harus dalam format tanggal yang valid' })
  start?: string;

  @ApiProperty({
    description: 'Waktu selesai problem',
    example: '2024-01-01T17:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'finish harus dalam format tanggal yang valid' })
  finish?: string;

  @ApiProperty({
    description: 'Catatan tambahan tentang problem',
    example: 'Problem pada unit excavator - updated',
    required: false,
  })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class BargingProblemResponseDto {
  @ApiProperty({
    description: 'ID barging problem',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Tanggal aktivitas barging problem',
    example: '2024-01-01T00:00:00.000Z',
  })
  activity_date: string;

  @ApiProperty({
    description: 'Shift kerja',
    example: 'ds',
  })
  shift: string;

  @ApiProperty({
    description: 'ID barge',
    example: 1,
  })
  barge_id: number;

  @ApiProperty({
    description: 'Nama barge',
    example: 'Barge Kalimantan',
  })
  barge_name: string;

  @ApiProperty({
    description: 'ID aktivitas',
    example: 1,
  })
  activities_id: number;

  @ApiProperty({
    description: 'Nama aktivitas',
    example: 'Excavation',
  })
  activities_name: string;

  @ApiProperty({
    description: 'ID site',
    example: 1,
    nullable: true,
  })
  site_id: number | null;

  @ApiProperty({
    description: 'Nama site',
    example: 'Site Jakarta',
    nullable: true,
  })
  site_name: string | null;

  @ApiProperty({
    description: 'Waktu mulai problem',
    example: '2024-01-01T08:00:00.000Z',
  })
  start: string;

  @ApiProperty({
    description: 'Waktu selesai problem',
    example: '2024-01-01T16:00:00.000Z',
  })
  finish: string;

  @ApiProperty({
    description: 'Durasi problem dalam jam',
    example: 8.0,
  })
  duration: number;

  @ApiProperty({
    description: 'Catatan tambahan tentang problem',
    example: 'Problem pada unit excavator',
    nullable: true,
  })
  remark: string | null;

  @ApiProperty({
    description: 'Waktu pembuatan',
    example: '2024-01-01T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Waktu update terakhir',
    example: '2024-01-01T10:00:00.000Z',
  })
  updatedAt: Date;
}

export class GetBargingProblemsQueryDto {
  @ApiProperty({
    description: 'Nomor halaman',
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'page harus berupa angka' })
  @Min(1, { message: 'page harus lebih dari 0' })
  page?: number;

  @ApiProperty({
    description: 'Jumlah data per halaman',
    example: 10,
    default: 10,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'limit harus berupa angka' })
  @Min(1, { message: 'limit harus lebih dari 0' })
  @Max(100, { message: 'limit tidak boleh lebih dari 100' })
  limit?: number;

  @ApiProperty({
    description: 'Pencarian umum di semua field',
    example: 'excavator',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter berdasarkan tanggal aktivitas',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'activity_date harus berupa string' })
  activity_date?: string;

  @ApiProperty({
    description: 'Filter berdasarkan tanggal mulai aktivitas (YYYY-MM-DD)',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'start_date harus berupa string' })
  start_date?: string;

  @ApiProperty({
    description: 'Filter berdasarkan tanggal akhir aktivitas (YYYY-MM-DD)',
    example: '2024-01-31',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'end_date harus berupa string' })
  end_date?: string;

  @ApiProperty({
    description: 'Filter berdasarkan shift',
    example: 'ds',
    enum: ['ds', 'ns'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['ds', 'ns'], { message: 'shift harus berupa ds atau ns' })
  shift?: string;

  @ApiProperty({
    description: 'Filter berdasarkan ID barge',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'barge_id harus berupa angka' })
  @Min(1, { message: 'barge_id harus lebih dari 0' })
  barge_id?: number;

  @ApiProperty({
    description: 'Filter berdasarkan ID aktivitas',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'activities_id harus berupa angka' })
  @Min(1, { message: 'activities_id harus lebih dari 0' })
  activities_id?: number;

  @ApiProperty({
    description: 'Filter berdasarkan ID site',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'site_id harus berupa angka' })
  @Min(1, { message: 'site_id harus lebih dari 0' })
  site_id?: number;

  @ApiProperty({
    description: 'Field untuk sorting',
    example: 'id',
    enum: ['id', 'activity_date', 'shift', 'barge_id', 'activities_id', 'site_id', 'start', 'finish', 'duration', 'createdAt', 'updatedAt'],
    default: 'id',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    description: 'Urutan sorting',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
    required: false,
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'], { message: 'sortOrder harus berupa ASC atau DESC' })
  sortOrder?: 'ASC' | 'DESC';
}
