import {
  IsDateString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumberString,
  IsString,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiExtraModels } from '@nestjs/swagger';

export class ActivityDetailDto {
  @ApiProperty({ description: 'ID aktivitas', example: 1 })
  @IsNumber()
  activities_id: number;

  @ApiProperty({ description: 'Nama aktivitas', example: 'P5M' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Tipe data aktivitas', example: 'number' })
  @IsString()
  type_data: string;

  @ApiProperty({ description: 'Tipe field input', example: 'input' })
  @IsString()
  type_field: string;

  @ApiProperty({ description: 'Jam aktivitas', example: 1 })
  @IsNumber()
  activities_hour: number;
}

// DTO untuk detail activities yang sederhana (hanya activities_id dan activities_hour)
export class SimpleActivityDetailDto {
  @ApiProperty({ description: 'ID aktivitas', example: 1 })
  @IsNumber()
  activities_id: number;

  @ApiProperty({ description: 'Jam aktivitas', example: 2 })
  @IsNumber()
  activities_hour: number;
}

export class CreateParentPlanWorkingHourDto {
  @ApiProperty({
    description: 'Tanggal rencana',
    example: '2025-08-21',
    type: 'string',
    format: 'date',
    required: true,
    examples: {
      '2025-08-01': { summary: 'Agustus 2025', value: '2025-08-01' },
      '2025-09-01': { summary: 'September 2025', value: '2025-09-01' },
    },
  })
  @IsDateString()
  plan_date: string;

  @ApiProperty({
    description: 'Total hari kalender dalam bulan',
    example: 31,
    type: 'number',
    required: true,
    minimum: 28,
    maximum: 31,
  })
  @IsNumber()
  total_calendar_day: number;

  @ApiProperty({
    description: 'Total hari libur dalam bulan',
    example: 8,
    type: 'number',
    required: true,
    minimum: 0,
  })
  @IsNumber()
  total_holiday_day: number;

  @ApiProperty({
    description: 'Total hari tersedia untuk kerja',
    example: 23,
    type: 'number',
    required: true,
    minimum: 0,
  })
  @IsNumber()
  total_available_day: number;

  @ApiProperty({
    description: 'Total jam kerja dalam bulan',
    example: 184,
    type: 'number',
    required: true,
    minimum: 0,
  })
  @IsNumber()
  total_working_hour_month: number;

  @ApiProperty({
    description: 'Total hari kerja dengan long shift',
    example: 5,
    type: 'number',
    required: true,
    minimum: 0,
    examples: {
      '5': { summary: '5 hari long shift', value: 5 },
      '10': { summary: '10 hari long shift', value: 10 },
      '15': { summary: '15 hari long shift', value: 15 },
      '0': { summary: 'Tidak ada long shift', value: 0 },
    },
  })
  @IsNumber()
  total_working_day_longshift: number;

  @ApiProperty({
    description: 'Total jam kerja per hari',
    example: 8,
    type: 'number',
    required: true,
    minimum: 0,
    maximum: 24,
    examples: {
      '8': { summary: '8 jam per hari', value: 8 },
      '10': { summary: '10 jam per hari', value: 10 },
      '12': { summary: '12 jam per hari', value: 12 },
      '16': { summary: '16 jam per hari', value: 16 },
    },
  })
  @IsNumber()
  total_working_hour_day: number;

  @ApiProperty({
    description: 'Total jam kerja long shift',
    example: 12,
    required: true,
    type: 'number',
    minimum: 0,
    maximum: 24,
    examples: {
      '12': { summary: '12 jam long shift', value: 12 },
      '10': { summary: '10 jam long shift', value: 10 },
      '8': { summary: '8 jam long shift', value: 8 },
      '16': { summary: '16 jam long shift', value: 16 },
    },
  })
  @IsNumber()
  total_working_hour_longshift: number;

  @ApiProperty({
    description: 'Total MOHH (Man Operating Hour per Hour) per bulan',
    example: 1000,
    type: 'number',
    required: true,
    minimum: 0,
  })
  @IsNumber()
  total_mohh_per_month: number;

  @ApiProperty({
    description: 'Detail aktivitas per tanggal',
    type: [SimpleActivityDetailDto],
    required: true,
    example: [
      { activities_id: 1, activities_hour: 1 },
      { activities_id: 2, activities_hour: 1 },
      { activities_id: 3, activities_hour: 1 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SimpleActivityDetailDto)
  detail: SimpleActivityDetailDto[];
}

export class ParentPlanWorkingHourResponseDto {
  @ApiProperty({ description: 'ID unik parent plan working hour', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Tanggal rencana',
    example: '2025-08-21T00:00:00.000Z',
  })
  plan_date: Date;

  @ApiProperty({ description: 'Total hari kalender dalam bulan', example: 31 })
  total_calendar_day: number;

  @ApiProperty({ description: 'Total hari libur dalam bulan', example: 8 })
  total_holiday_day: number;

  @ApiProperty({ description: 'Total hari tersedia untuk kerja', example: 23 })
  total_available_day: number;

  @ApiProperty({ description: 'Total jam kerja dalam bulan', example: 184 })
  total_working_hour_month: number;

  @ApiProperty({
    description: 'Total hari kerja dengan long shift',
    example: 5,
  })
  total_working_day_longshift: number;

  @ApiProperty({ description: 'Total jam kerja per hari', example: 8 })
  total_working_hour_day: number;

  @ApiProperty({ description: 'Total jam kerja long shift', example: 12 })
  total_working_hour_longshift: number;

  @ApiProperty({ description: 'Total MOHH per bulan', example: 1000 })
  total_mohh_per_month: number;

  @ApiProperty({
    description: 'Waktu pembuatan record',
    example: '2025-08-22T10:15:04.945Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Waktu terakhir update record',
    example: '2025-08-22T10:15:04.945Z',
  })
  updatedAt: Date;

  @ApiProperty({ description: 'Waktu soft delete record', example: null })
  deletedAt: Date;
}

export class ParentPlanWorkingHourSummaryResponseDto {
  @ApiProperty({
    example: 1,
    description: 'ID dari tabel r_parent_plan_working_hour',
  })
  parent_id: number;

  @ApiProperty({
    example: '2025-08',
    description: 'Bulan dan tahun dari kolom plan_date',
  })
  month_year: string;

  @ApiProperty({
    example: 27,
    description: 'Jumlah kolom is_schedule_day yang bernilai true',
  })
  schedule_day: number;

  @ApiProperty({
    example: 4,
    description: 'Jumlah kolom is_holiday_day yang bernilai true',
  })
  holiday_day: number;

  @ApiProperty({
    example: 216,
    description: 'Jumlah value di kolom working_hour_month',
  })
  working_hour_month: number;

  @ApiProperty({
    example: 7.2,
    description: 'Jumlah value di kolom working_hour_day',
  })
  working_hour_day: number;

  @ApiProperty({
    example: 14.4,
    description: 'Jumlah value di kolom working_hour_longshift',
  })
  working_hour_longshift: number;

  @ApiProperty({
    example: 1.5,
    description: 'Jumlah value di kolom working_day_longshift',
  })
  working_day_longshift: number;

  @ApiProperty({
    example: 100,
    description: 'Value dari kolom mohh_per_month',
  })
  total_mohh: number;

  @ApiProperty({
    example: 10,
    description: 'Jumlah value di kolom activities_hour dengan status delay',
  })
  total_delay: number;

  @ApiProperty({
    example: 10,
    description: 'Jumlah value di kolom activities_hour dengan status idle',
  })
  total_idle: number;

  @ApiProperty({
    example: 10,
    description:
      'Jumlah value di kolom activities_hour dengan status breakdown',
  })
  total_breakdown: number;

  @ApiProperty({
    example: 80,
    description: 'Rumus: total_mohh - total_delay - total_breakdown',
  })
  ewh: number;

  @ApiProperty({
    example: 1.0,
    description: 'Rumus: (ewh + total_delay + total_idle) / total_mohh',
  })
  pa: number;

  @ApiProperty({
    example: 0.89,
    description: 'Rumus: ewh / (ewh + total_breakdown)',
  })
  ma: number;

  @ApiProperty({
    example: 0.8,
    description: 'Rumus: ewh / (ewh + total_delay + total_idle)',
  })
  ua: number;

  @ApiProperty({
    example: 0.73,
    description:
      'Rumus: ewh / (ewh + total_delay + total_idle + total_breakdown)',
  })
  eu: number;

  @ApiProperty({
    example: true,
    description: 'Status edit: true jika plan_date lebih dari hari ini',
  })
  is_available_to_edit: boolean;

  @ApiProperty({
    example: true,
    description: 'Status delete: true jika plan_date lebih dari hari ini',
  })
  is_available_to_delete: boolean;
}

export class GetParentPlanWorkingHourQueryDto {
  @ApiProperty({
    required: false,
    example: '1',
    description: 'Nomor halaman (default: 1)',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiProperty({
    required: false,
    example: '10',
    description: 'Jumlah data per halaman (default: 10, max: 100)',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiProperty({
    required: false,
    example: '8',
    description: 'Filter berdasarkan bulan (1-12)',
    minimum: 1,
    maximum: 12,
  })
  @IsOptional()
  @IsNumberString()
  month?: string;

  @ApiProperty({
    required: false,
    example: 'id',
    description: 'Field untuk sorting',
    enum: ['id', 'plan_date', 'createdAt', 'updatedAt'],
    default: 'id',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    required: false,
    example: 'DESC',
    description: 'Urutan sorting',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}

export class ActivityGroupDetailDto {
  @ApiProperty({ description: 'ID aktivitas', example: 1 })
  @IsNumber()
  activities_id: number;

  @ApiProperty({ description: 'Nama aktivitas', example: 'P5M' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Tipe data aktivitas', example: 'number' })
  @IsString()
  type_data: string;

  @ApiProperty({ description: 'Tipe field aktivitas', example: 'input' })
  @IsString()
  type_field: string;

  @ApiProperty({ description: 'Jam aktivitas', example: 1 })
  @IsNumber()
  activities_hour: number;
}

export class GetParentPlanWorkingHourDetailQueryDto {
  @ApiProperty({
    description: 'Tanggal mulai (format: YYYY-MM-DD)',
    example: '2025-08-01',
    required: false,
  })
  start_date?: string;

  @ApiProperty({
    description: 'Tanggal akhir (format: YYYY-MM-DD)',
    example: '2025-08-31',
    required: false,
  })
  end_date?: string;

  @ApiProperty({
    name: 'page',
    required: false,
    description: 'Nomor halaman (default: 1)',
    example: '1',
  })
  page?: string;

  @ApiProperty({
    name: 'limit',
    required: false,
    description: 'Jumlah data per halaman (default: 10, max: 100)',
    example: '10',
  })
  limit?: string;

  @ApiProperty({
    name: 'calendar_day',
    required: false,
    description: 'Filter berdasarkan status hari kalender',
    example: 'available',
    enum: ['available', 'holiday', 'one-shift'],
  })
  calendar_day?: string;
}

export class ParentPlanWorkingHourDetailResponseDto {
  @ApiProperty({
    description: 'ID dari tabel r_plan_working_hour',
    example: 1,
  })
  r_plan_working_hour_id: number;

  @ApiProperty({
    description: 'Tanggal rencana',
    example: '2025-08-01',
  })
  plan_date: string;

  @ApiProperty({
    description: 'Status hari kalender',
    example: 'available',
    enum: ['available', 'one shift', 'holiday'],
  })
  calendar_day: string;

  @ApiProperty({
    description: 'Jam kerja per hari',
    example: 8,
  })
  working_hour_day: number;

  @ApiProperty({
    description: 'Jam kerja per bulan',
    example: 216,
  })
  working_hour_month: number;

  @ApiProperty({
    description: 'Jam kerja long shift',
    example: 14.4,
  })
  working_hour_longshift: number;

  @ApiProperty({
    description: 'Hari kerja long shift',
    example: 1.5,
  })
  working_day_longshift: number;

  @ApiProperty({
    description: 'MOHH per bulan',
    example: 100,
  })
  mohh_per_month: number;

  @ApiProperty({
    description: 'Status long shift dari kolom working_longshift (boolean: true = ada long shift, false = tidak ada long shift)',
    example: true,
  })
  working_longshift: boolean;

  @ApiProperty({
    description: 'Total delay',
    example: 10,
  })
  total_delay: number;

  @ApiProperty({
    description: 'Total idle',
    example: 10,
  })
  total_idle: number;

  @ApiProperty({
    description: 'Total breakdown',
    example: 10,
  })
  total_breakdown: number;

  @ApiProperty({
    description: 'Effective Working Hours',
    example: 80,
  })
  ewh: number;

  @ApiProperty({
    description: 'Performance Availability',
    example: 1.0,
  })
  pa: number;

  @ApiProperty({
    description: 'Mechanical Availability',
    example: 0.89,
  })
  ma: number;

  @ApiProperty({
    description: 'Utilization Availability',
    example: 0.8,
  })
  ua: number;

  @ApiProperty({
    description: 'Equipment Utilization',
    example: 0.67,
  })
  eu: number;

  @ApiProperty({
    description: 'Apakah tersedia untuk edit',
    example: true,
  })
  is_available_to_edit: boolean;

  @ApiProperty({
    description: 'Apakah tersedia untuk hapus',
    example: true,
  })
  is_available_to_delete: boolean;
}

export class ActivityDetailByIdDto {
  @ApiProperty({
    description: 'ID dari tabel r_plan_working_hour_detail',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'ID dari tabel m_activities',
    example: 1,
  })
  activities_id: number;

  @ApiProperty({
    description: 'Jam aktivitas',
    example: 5.0,
  })
  activities_hour: number;

  @ApiProperty({
    description: 'Nama aktivitas',
    example: 'Loading Barge',
  })
  activity_name: string;

  @ApiProperty({
    description: 'Status aktivitas',
    example: 'working',
    enum: ['working', 'delay', 'idle', 'breakdown'],
  })
  activity_status: string;

  @ApiProperty({
    description: 'ID dari tabel m_activities_group',
    example: 1,
  })
  activities_group_id: number;

  @ApiProperty({
    description: 'Nama grup aktivitas',
    example: 'Production',
  })
  activities_group_name: string;
}

export class ActivityGroupDto {
  @ApiProperty({
    description: 'Nama grup aktivitas',
    example: 'Delay',
  })
  name: string;

  @ApiProperty({
    description: 'Detail aktivitas dalam grup',
    type: [ActivityDetailDto],
  })
  group_detail: ActivityDetailDto[];
}

export class ParentPlanWorkingHourDetailByIdResponseDto {
  @ApiProperty({
    description: 'ID dari parent plan working hour',
    example: 9,
  })
  id: number;

  @ApiProperty({
    description: 'Tanggal rencana kerja',
    example: '2025-08-01T00:00:00.000Z',
  })
  plan_date: Date;

  @ApiProperty({
    description: 'Total jam kerja per bulan',
    example: 184,
  })
  total_working_hour_month: number;

  @ApiProperty({
    description: 'Total jam kerja per hari',
    example: 8,
  })
  total_working_hour_day: number;

  @ApiProperty({
    description: 'Total hari kerja longshift',
    example: 5,
  })
  total_working_day_longshift: number;

  @ApiProperty({
    description: 'Total jam kerja longshift',
    example: '12.00',
  })
  total_working_hour_longshift: string;

  @ApiProperty({
    description: 'Total MOHH per bulan',
    example: 1000,
  })
  total_mohh_per_month: number;

  @ApiProperty({
    description: 'Status long shift dari kolom working_longshift (boolean: true = ada long shift, false = tidak ada long shift)',
    example: true,
  })
  working_longshift: boolean;

  @ApiProperty({
    description: 'Detail aktivitas dikelompokkan berdasarkan status',
    type: [ActivityGroupDto],
  })
  details: ActivityGroupDto[];
}

export class UpdateDetailParentPlanWorkingHourDto {
  @ApiProperty({
    description: 'Tanggal rencana',
    example: '2025-08-01',
    type: 'string',
    format: 'date',
    required: true,
  })
  @IsDateString()
  plan_date: string;

  @ApiProperty({
    description: 'Total jam kerja dalam bulan',
    example: 184,
    type: 'number',
    required: true,
    minimum: 0,
  })
  @IsNumber()
  working_hour_month: number;

  @ApiProperty({
    description: 'Total hari kerja dengan long shift',
    example: 5,
    type: 'number',
    required: true,
    minimum: 0,
  })
  @IsNumber()
  working_day_longshift: number;

  @ApiProperty({
    description: 'Total jam kerja per hari',
    example: 8,
    type: 'number',
    required: true,
    minimum: 0,
    maximum: 24,
  })
  @IsNumber()
  working_hour_day: number;

  @ApiProperty({
    description: 'Total jam kerja long shift',
    example: 12,
    required: true,
    type: 'number',
    minimum: 0,
    maximum: 24,
  })
  @IsNumber()
  working_hour_longshift: number;

  @ApiProperty({
    description: 'Total MOHH (Man Operating Hour per Hour) per bulan',
    example: 1000,
    type: 'number',
    required: true,
    minimum: 0,
  })
  @IsNumber()
  mohh_per_month: number;

  @ApiProperty({
    description: 'Total hari schedule kerja',
    example: 23,
    type: 'number',
    required: true,
    minimum: 0,
    maximum: 31,
  })
  @IsNumber()
  schedule_day: number;

  @ApiProperty({
    description: 'Detail aktivitas per tanggal',
    type: [ActivityDetailDto],
    required: true,
    example: [
      { activities_id: 1, activities_hour: 1 },
      { activities_id: 2, activities_hour: 1 },
      { activities_id: 3, activities_hour: 1 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActivityDetailDto)
  detail: ActivityDetailDto[];
}

// DTO baru untuk update dengan struktur detail yang sederhana
export class UpdateParentPlanWorkingHourSimpleDto {
  @ApiProperty({
    description: 'Tanggal rencana',
    example: '2025-08-01',
    type: 'string',
    format: 'date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  plan_date?: string;

  @ApiProperty({
    description: 'Total hari kalender dalam bulan',
    example: 31,
    type: 'number',
    required: false,
    minimum: 28,
    maximum: 31,
  })
  @IsOptional()
  @IsNumber()
  total_calendar_day?: number;

  @ApiProperty({
    description: 'Total hari libur dalam bulan',
    example: 8,
    type: 'number',
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  total_holiday_day?: number;

  @ApiProperty({
    description: 'Total hari tersedia untuk kerja',
    example: 23,
    type: 'number',
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  total_available_day?: number;

  @ApiProperty({
    description: 'Total jam kerja dalam bulan',
    example: 184,
    type: 'number',
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  total_working_hour_month?: number;

  @ApiProperty({
    description: 'Total hari kerja dengan long shift',
    example: 5,
    type: 'number',
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  total_working_day_longshift?: number;

  @ApiProperty({
    description: 'Total jam kerja per hari',
    example: 8,
    type: 'number',
    required: false,
    minimum: 0,
    maximum: 24,
  })
  @IsOptional()
  @IsNumber()
  total_working_hour_day?: number;

  @ApiProperty({
    description: 'Total jam kerja long shift',
    example: 12,
    required: false,
    type: 'number',
    minimum: 0,
    maximum: 24,
  })
  @IsOptional()
  @IsNumber()
  total_working_hour_longshift?: number;

  @ApiProperty({
    description: 'Total MOHH (Man Operating Hour per Hour) per bulan',
    example: 1000,
    type: 'number',
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  total_mohh_per_month?: number;

  @ApiProperty({
    description: 'Detail aktivitas per tanggal (struktur sederhana)',
    type: [SimpleActivityDetailDto],
    required: false,
    example: [
      { activities_id: 1, activities_hour: 2 },
      { activities_id: 2, activities_hour: 3 },
      { activities_id: 3, activities_hour: 4 },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SimpleActivityDetailDto)
  detail?: SimpleActivityDetailDto[];
}
