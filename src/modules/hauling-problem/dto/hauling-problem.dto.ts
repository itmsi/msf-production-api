import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, Validate } from 'class-validator';
import { IsNotEmptyString } from '../../../common/validators';
import { ApiProperty } from '@nestjs/swagger';

export enum ShiftType {
  DS = 'ds',
  NS = 'ns',
}

export class CreateHaulingProblemDto {
  @ApiProperty({
    description: 'Tanggal aktivitas',
    example: '2024-01-01T00:00:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty({ message: 'activity_date tidak boleh kosong' })
  @IsDateString({}, { message: 'activity_date harus berupa format tanggal yang valid' })
  activity_date: string;

  @ApiProperty({
    description: 'Shift kerja',
    enum: ShiftType,
    example: 'ds',
  })
  @IsNotEmpty({ message: 'shift tidak boleh kosong' })
  @IsEnum(ShiftType, { message: 'shift harus berupa ds atau ns' })
  shift: ShiftType;

  @ApiProperty({
    description: 'ID aktivitas dari tabel m_activities',
    example: 1,
    type: 'number',
  })
  @IsNotEmpty({ message: 'activities_id tidak boleh kosong' })
  @IsNumber({}, { message: 'activities_id harus berupa angka' })
  activities_id: number;

  @ApiProperty({
    description: 'Waktu mulai',
    example: '2024-01-01T08:00:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty({ message: 'start tidak boleh kosong' })
  @IsDateString({}, { message: 'start harus berupa format tanggal yang valid' })
  start: string;

  @ApiProperty({
    description: 'Waktu selesai',
    example: '2024-01-01T16:00:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty({ message: 'finish tidak boleh kosong' })
  @IsDateString({}, { message: 'finish harus berupa format tanggal yang valid' })
  finish: string;

  @ApiProperty({
    description: 'ID site dari tabel m_sites',
    example: 1,
    type: 'number',
  })
  @IsNotEmpty({ message: 'site_id tidak boleh kosong' })
  @IsNumber({}, { message: 'site_id harus berupa angka' })
  site_id: number;

  @ApiProperty({
    description: 'Catatan tambahan',
    example: 'Problem pada unit excavator',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'remark harus berupa string' })
  @Validate(IsNotEmptyString, { message: 'remark tidak boleh kosong atau hanya berisi whitespace' })
  remark?: string;
}

export class UpdateHaulingProblemDto {
  @ApiProperty({
    description: 'Tanggal aktivitas',
    example: '2024-01-01T00:00:00.000Z',
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'activity_date harus berupa format tanggal yang valid' })
  activity_date?: string;

  @ApiProperty({
    description: 'Shift kerja',
    enum: ShiftType,
    example: 'ds',
    required: false,
  })
  @IsOptional()
  @IsEnum(ShiftType, { message: 'shift harus berupa ds atau ns' })
  shift?: ShiftType;

  @ApiProperty({
    description: 'ID aktivitas dari tabel m_activities',
    example: 1,
    type: 'number',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'activities_id harus berupa angka' })
  activities_id?: number;

  @ApiProperty({
    description: 'Waktu mulai',
    example: '2024-01-01T08:00:00.000Z',
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'start harus berupa format tanggal yang valid' })
  start?: string;

  @ApiProperty({
    description: 'Waktu selesai',
    example: '2024-01-01T16:00:00.000Z',
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'finish harus berupa format tanggal yang valid' })
  finish?: string;

  @ApiProperty({
    description: 'ID site dari tabel m_sites',
    example: 1,
    type: 'number',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'site_id harus berupa angka' })
  site_id?: number;

  @ApiProperty({
    description: 'Catatan tambahan',
    example: 'Problem pada unit excavator',
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'remark harus berupa string' })
  @Validate(IsNotEmptyString, { message: 'remark tidak boleh kosong atau hanya berisi whitespace' })
  remark?: string;
}

export class HaulingProblemResponseDto {
  @ApiProperty({
    description: 'ID hauling problem',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Tanggal aktivitas',
    example: '2024-01-01T00:00:00.000Z',
  })
  activity_date: Date;

  @ApiProperty({
    description: 'Shift kerja',
    example: 'ds',
  })
  shift: string;

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
    description: 'Waktu mulai',
    example: '2024-01-01T08:00:00.000Z',
  })
  start: Date;

  @ApiProperty({
    description: 'Waktu selesai',
    example: '2024-01-01T16:00:00.000Z',
  })
  finish: Date;

  @ApiProperty({
    description: 'Durasi dalam jam',
    example: 8.0,
  })
  duration: number;

  @ApiProperty({
    description: 'ID site',
    example: 1,
  })
  site_id: number;

  @ApiProperty({
    description: 'Nama site',
    example: 'Site Jakarta',
  })
  site_name: string;

  @ApiProperty({
    description: 'Catatan tambahan',
    example: 'Problem pada unit excavator',
  })
  remark: string;

  @ApiProperty({
    description: 'Waktu pembuatan',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Waktu update terakhir',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class GetHaulingProblemQueryDto {
  @ApiProperty({
    description: 'Nomor halaman',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'page harus berupa angka' })
  page?: number;

  @ApiProperty({
    description: 'Jumlah data per halaman',
    example: 10,
    required: false,
    default: 10,
  })
  @IsOptional()
  @IsNumber({}, { message: 'limit harus berupa angka' })
  limit?: number;

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
    enum: ShiftType,
    example: 'ds',
    required: false,
  })
  @IsOptional()
  @IsEnum(ShiftType, { message: 'shift harus berupa ds atau ns' })
  shift?: ShiftType;

  @ApiProperty({
    description: 'Filter berdasarkan ID aktivitas',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'activities_id harus berupa angka' })
  activities_id?: number;

  @ApiProperty({
    description: 'Filter berdasarkan ID site',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'site_id harus berupa angka' })
  site_id?: number;

  @ApiProperty({
    description: 'Pencarian umum',
    example: 'excavator',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'search harus berupa string' })
  search?: string;

  @ApiProperty({
    description: 'Field untuk sorting',
    example: 'id',
    required: false,
    default: 'id',
  })
  @IsOptional()
  @IsString({ message: 'sortBy harus berupa string' })
  sortBy?: string;

  @ApiProperty({
    description: 'Urutan sorting',
    example: 'DESC',
    required: false,
    default: 'DESC',
  })
  @IsOptional()
  @IsString({ message: 'sortOrder harus berupa string' })
  sortOrder?: string;
}
