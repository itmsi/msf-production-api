import { IsOptional, IsDate, IsBoolean, IsNumber, IsInt, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
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
  working_hour: number;
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
    description: 'Apakah hari kalender (auto-filled)',
    example: true,
    type: Boolean,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  is_calender_day?: boolean;

  @ApiProperty({
    description: 'Apakah hari libur (auto-filled)',
    example: false,
    type: Boolean,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  is_holiday_day?: boolean;

  @ApiProperty({
    description: 'Apakah hari terjadwal (auto-filled)',
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
    example: [
      {
        activities_id: 1,
        working_hour: 1
      },
      {
        activities_id: 2,
        working_hour: 1
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
        working_hour: 1
      },
      {
        activities_id: 2,
        working_hour: 1
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
    example: 1,
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
    example: 1,
    type: Number,
    required: false
  })
  @IsOptional()
  @IsNumber()
  mohh_per_month?: number;
}
