import { IsDateString, IsNumber, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ActivityDetailDto {
  @ApiProperty({ description: 'ID aktivitas', example: 1 })
  @IsNumber()
  activities_id: number;

  @ApiProperty({ description: 'Jam aktivitas', example: 1 })
  @IsNumber()
  activities_hour: number;
}

export class CreateParentPlanWorkingHourDto {
  @ApiProperty({ description: 'Tanggal rencana', example: '2025-08-21' })
  @IsDateString()
  plan_date: string;

  @ApiProperty({ description: 'Total hari kalender', example: 31 })
  @IsNumber()
  total_calendar_day: number;

  @ApiProperty({ description: 'Total hari libur', example: 8 })
  @IsNumber()
  total_holiday_day: number;

  @ApiProperty({ description: 'Total hari tersedia', example: 23 })
  @IsNumber()
  total_available_day: number;

  @ApiProperty({ description: 'Total jam kerja', example: 184 })
  @IsNumber()
  total_working_hour: number;

  @ApiProperty({ description: 'Total hari kerja long shift', example: 5 })
  @IsNumber()
  total_working_day_longshift: number;

  @ApiProperty({ description: 'Jam kerja long shift', example: 12 })
  @IsNumber()
  working_hour_longshift: number;

  @ApiProperty({ description: 'Total MOHH per bulan', example: 1000 })
  @IsNumber()
  total_mohh_per_month: number;

  @ApiProperty({ 
    description: 'Detail aktivitas per tanggal', 
    type: [ActivityDetailDto],
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
  @ApiProperty()
  id: number;

  @ApiProperty()
  plan_date: Date;

  @ApiProperty()
  total_calendar_day: number;

  @ApiProperty()
  total_holiday_day: number;

  @ApiProperty()
  total_available_day: number;

  @ApiProperty()
  total_working_hour: number;

  @ApiProperty()
  total_working_day_longshift: number;

  @ApiProperty()
  working_hour_longshift: number;

  @ApiProperty()
  total_mohh_per_month: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt: Date;
}
