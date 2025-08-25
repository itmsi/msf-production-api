import { IsDateString, IsNumber, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiExtraModels } from '@nestjs/swagger';

export class ActivityDetailDto {
  @ApiProperty({ description: 'ID aktivitas', example: 1 })
  @IsNumber()
  activities_id: number;

  @ApiProperty({ description: 'Jam aktivitas', example: 1 })
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
      '2025-09-01': { summary: 'September 2025', value: '2025-09-01' }
    }
  })
  @IsDateString()
  plan_date: string;

  @ApiProperty({ 
    description: 'Total hari kalender dalam bulan', 
    example: 31,
    type: 'number',
    required: true,
    minimum: 28,
    maximum: 31
  })
  @IsNumber()
  total_calendar_day: number;

  @ApiProperty({ 
    description: 'Total hari libur dalam bulan', 
    example: 8,
    type: 'number',
    required: true,
    minimum: 0
  })
  @IsNumber()
  total_holiday_day: number;

  @ApiProperty({ 
    description: 'Total hari tersedia untuk kerja', 
    example: 23,
    type: 'number',
    required: true,
    minimum: 0
  })
  @IsNumber()
  total_available_day: number;

  @ApiProperty({ 
    description: 'Total jam kerja dalam bulan', 
    example: 184,
    type: 'number',
    required: true,
    minimum: 0
  })
  @IsNumber()
  total_working_hour: number;

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
      '0': { summary: 'Tidak ada long shift', value: 0 }
    }
  })
  @IsNumber()
  total_working_day_longshift: number;

  @ApiProperty({ 
    description: 'Jam kerja per hari untuk long shift', 
    example: 12,
    type: 'number',
    required: true,
    minimum: 0,
    maximum: 24,
    examples: {
      '12': { summary: '12 jam per hari', value: 12 },
      '10': { summary: '10 jam per hari', value: 10 },
      '8': { summary: '8 jam per hari', value: 8 },
      '16': { summary: '16 jam per hari', value: 16 }
    }
  })
  @IsNumber()
  working_hour_longshift: number;

  @ApiProperty({ 
    description: 'Jam kerja long shift per hari (opsional)', 
    example: 8.5,
    required: false,
    type: 'number',
    format: 'float',
    nullable: true,
    default: null,
    examples: {
      '8.5': { summary: '8 jam 30 menit', value: 8.5 },
      '9.0': { summary: '9 jam penuh', value: 9.0 },
      '7.5': { summary: '7 jam 30 menit', value: 7.5 },
      '10.0': { summary: '10 jam penuh', value: 10.0 },
      'null': { summary: 'Tidak ada long shift per hari', value: null }
    }
  })
  @IsNumber()
  @IsOptional()
  working_hour_longshift_day: number;

  @ApiProperty({ 
    description: 'Total MOHH (Man Operating Hour per Hour) per bulan', 
    example: 1000,
    type: 'number',
    required: true,
    minimum: 0
  })
  @IsNumber()
  total_mohh_per_month: number;

  @ApiProperty({ 
    description: 'Detail aktivitas per tanggal', 
    type: [ActivityDetailDto],
    required: true,
    example: [
      { activities_id: 1, activities_hour: 1 },
      { activities_id: 2, activities_hour: 1 },
      { activities_id: 3, activities_hour: 1 }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActivityDetailDto)
  detail: ActivityDetailDto[];
}

export class ParentPlanWorkingHourResponseDto {
  @ApiProperty({ description: 'ID unik parent plan working hour', example: 1 })
  id: number;

  @ApiProperty({ description: 'Tanggal rencana', example: '2025-08-21T00:00:00.000Z' })
  plan_date: Date;

  @ApiProperty({ description: 'Total hari kalender dalam bulan', example: 31 })
  total_calendar_day: number;

  @ApiProperty({ description: 'Total hari libur dalam bulan', example: 8 })
  total_holiday_day: number;

  @ApiProperty({ description: 'Total hari tersedia untuk kerja', example: 23 })
  total_available_day: number;

  @ApiProperty({ description: 'Total jam kerja dalam bulan', example: 184 })
  total_working_hour: number;

  @ApiProperty({ description: 'Total hari kerja dengan long shift', example: 5 })
  total_working_day_longshift: number;

  @ApiProperty({ description: 'Jam kerja per hari untuk long shift', example: 12 })
  working_hour_longshift: number;

  @ApiProperty({ description: 'Jam kerja long shift per hari', example: 8.5 })
  working_hour_longshift_day: number;

  @ApiProperty({ description: 'Total MOHH per bulan', example: 1000 })
  total_mohh_per_month: number;

  @ApiProperty({ description: 'Waktu pembuatan record', example: '2025-08-22T10:15:04.945Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Waktu terakhir update record', example: '2025-08-22T10:15:04.945Z' })
  updatedAt: Date;

  @ApiProperty({ description: 'Waktu soft delete record', example: null })
  deletedAt: Date;
}
