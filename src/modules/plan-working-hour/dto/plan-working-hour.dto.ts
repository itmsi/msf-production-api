import { IsOptional, IsDate, IsBoolean, IsNumber, IsInt, IsArray, ValidateNested, IsNotEmpty, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PlanWorkingHourDetailDto {
  @ApiProperty({
    description: 'ID activities',
    example: 1,
    type: Number
  })
  @IsNotEmpty()
  @IsInt()
  activities_id: number;

  @ApiProperty({
    description: 'Jam kerja untuk activities',
    example: 1,
    type: Number
  })
  @IsNotEmpty()
  @IsNumber()
  activities_hour: number;
}

export class CreatePlanWorkingHourDto {
  @ApiProperty({
    description: 'Tanggal rencana kerja',
    example: '2025-01-01',
    type: Date
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  plan_date: Date;

  @ApiProperty({
    description: 'Jam kerja',
    example: 1,
    type: Number,
    required: false
  })
  @IsOptional()
  @IsNumber()
  working_hour?: number;

  @ApiProperty({
    description: 'Hari kerja shift panjang',
    example: 1,
    type: Number,
    required: false
  })
  @IsOptional()
  @IsInt()
  working_day_longshift?: number;

  @ApiProperty({
    description: 'Jam kerja shift panjang',
    example: 1,
    type: Number,
    required: false
  })
  @IsOptional()
  @IsInt()
  working_hour_longshift?: number;

  @ApiProperty({
    description: 'MOHH per bulan',
    example: 1,
    type: Number,
    required: false
  })
  @IsOptional()
  @IsNumber()
  mohh_per_month?: number;

  @ApiProperty({
    description: 'Detail activities dengan jam kerja',
    type: [PlanWorkingHourDetailDto],
    example: [
      {
        activities_id: 1,
        activities_hour: 1
      },
      {
        activities_id: 2,
        activities_hour: 1
      }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanWorkingHourDetailDto)
  detail: PlanWorkingHourDetailDto[];
}

export class UpdatePlanWorkingHourDto {
  @ApiProperty({
    description: 'Tanggal rencana kerja',
    example: '2025-01-01',
    type: Date,
    required: false
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  plan_date?: Date;

  @ApiProperty({
    description: 'Apakah hari kalender',
    example: true,
    type: Boolean,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  is_calender_day?: boolean;

  @ApiProperty({
    description: 'Apakah hari libur',
    example: false,
    type: Boolean,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  is_holiday_day?: boolean;

  @ApiProperty({
    description: 'Apakah hari terjadwal',
    example: true,
    type: Boolean,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  is_schedule_day?: boolean;

  @ApiProperty({
    description: 'Jam kerja',
    example: 1,
    type: Number,
    required: false
  })
  @IsOptional()
  @IsNumber()
  working_hour?: number;

  @ApiProperty({
    description: 'Hari kerja shift panjang',
    example: 1,
    type: Number,
    required: false
  })
  @IsOptional()
  @IsInt()
  working_day_longshift?: number;

  @ApiProperty({
    description: 'Jam kerja shift panjang',
    example: 1,
    type: Number,
    required: false
  })
  @IsOptional()
  @IsInt()
  working_hour_longshift?: number;

  @ApiProperty({
    description: 'MOHH per bulan',
    example: 1,
    type: Number,
    required: false
  })
  @IsOptional()
  @IsNumber()
  mohh_per_month?: number;

  @ApiProperty({
    description: 'Detail activities dengan jam kerja',
    type: [PlanWorkingHourDetailDto],
    required: false,
    example: [
      {
        activities_id: 1,
        activities_hour: 1
      },
      {
        activities_id: 2,
        activities_hour: 1
      }
    ]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanWorkingHourDetailDto)
  detail?: PlanWorkingHourDetailDto[];
}

export class QueryPlanWorkingHourDto {
  @ApiProperty({
    description: 'Filter berdasarkan tanggal plan',
    example: '2025-01-01',
    type: Date,
    required: false
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  plan_date?: Date;

  @ApiProperty({
    description: 'Filter berdasarkan tanggal mulai (format: YYYY-MM-DD)',
    example: '2025-01-01',
    type: String,
    required: false
  })
  @IsOptional()
  @IsString()
  start_date?: string;

  @ApiProperty({
    description: 'Filter berdasarkan tanggal akhir (format: YYYY-MM-DD)',
    example: '2025-01-31',
    type: String,
    required: false
  })
  @IsOptional()
  @IsString()
  end_date?: string;

  @ApiProperty({
    description: 'Filter berdasarkan calendar day',
    example: true,
    type: Boolean,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  is_calender_day?: boolean;

  @ApiProperty({
    description: 'Filter berdasarkan holiday day',
    example: false,
    type: Boolean,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  is_holiday_day?: boolean;

  @ApiProperty({
    description: 'Filter berdasarkan schedule day',
    example: true,
    type: Boolean,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  is_schedule_day?: boolean;

  @ApiProperty({
    description: 'Filter berdasarkan working hour',
    example: 8,
    type: Number,
    required: false
  })
  @IsOptional()
  @IsNumber()
  working_hour?: number;

  @ApiProperty({
    description: 'Filter berdasarkan working day longshift',
    example: 1,
    type: Number,
    required: false
  })
  @IsOptional()
  @IsInt()
  working_day_longshift?: number;

  @ApiProperty({
    description: 'Filter berdasarkan working hour longshift',
    example: 1,
    type: Number,
    required: false
  })
  @IsOptional()
  @IsInt()
  working_hour_longshift?: number;

  @ApiProperty({
    description: 'Filter berdasarkan MOHH per month',
    example: 160,
    type: Number,
    required: false
  })
  @IsOptional()
  @IsNumber()
  mohh_per_month?: number;

  @ApiProperty({
    description: 'Halaman yang akan ditampilkan',
    example: 1,
    type: Number,
    required: false,
    default: 1
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: 'Jumlah data per halaman',
    example: 10,
    type: Number,
    required: false,
    default: 10
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class PlanWorkingHourResponseDto {
  @ApiProperty({
    description: 'ID plan working hour',
    example: 1,
    type: Number
  })
  id: number;

  @ApiProperty({
    description: 'Tanggal rencana kerja',
    example: '2025-01-01',
    type: Date
  })
  plan_date: Date;

  @ApiProperty({
    description: 'Total MOHH per bulan',
    example: 1,
    type: Number
  })
  total_mohh: number;

  @ApiProperty({
    description: 'Total jam delay',
    example: 1,
    type: Number
  })
  total_delay: number;

  @ApiProperty({
    description: 'Total jam idle',
    example: 1,
    type: Number
  })
  total_idle: number;

  @ApiProperty({
    description: 'Total jam repair/breakdown',
    example: 1,
    type: Number
  })
  total_repair: number;

  @ApiProperty({
    description: 'Effective Working Hours (EWH)',
    example: 1,
    type: Number
  })
  ewh: number;

  @ApiProperty({
    description: 'Production Availability (PA)',
    example: 1,
    type: Number
  })
  pa: number;

  @ApiProperty({
    description: 'Mechanical Availability (MA)',
    example: 1,
    type: Number
  })
  ma: number;

  @ApiProperty({
    description: 'Utilization Availability (UA)',
    example: 1,
    type: Number
  })
  ua: number;

  @ApiProperty({
    description: 'Equipment Utilization (EU)',
    example: 1,
    type: Number
  })
  eu: number;

  @ApiProperty({
    description: 'Apakah bisa diedit',
    example: true,
    type: Boolean
  })
  is_available_to_edit: boolean;

  @ApiProperty({
    description: 'Apakah bisa dihapus',
    example: true,
    type: Boolean
  })
  is_available_to_delete: boolean;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 100, description: 'Total data yang tersedia' })
  total: number;

  @ApiProperty({ example: 1, description: 'Halaman saat ini' })
  page: number;

  @ApiProperty({ example: 10, description: 'Jumlah data per halaman' })
  limit: number;

  @ApiProperty({ example: 5, description: 'Total halaman' })
  lastPage: number;
}

export class PlanWorkingHourListResponseDto {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ example: 'Plan working hours retrieved successfully', description: 'Pesan response' })
  message: string;

  @ApiProperty({ type: [PlanWorkingHourResponseDto], description: 'Data plan working hour' })
  data: PlanWorkingHourResponseDto[];

  @ApiProperty({ type: PaginationMetaDto, description: 'Informasi pagination' })
  pagination: PaginationMetaDto;
}
