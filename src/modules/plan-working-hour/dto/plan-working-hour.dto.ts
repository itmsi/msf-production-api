import { IsOptional, IsDate, IsBoolean, IsNumber, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePlanWorkingHourDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  plan_date?: Date;

  @IsOptional()
  @IsBoolean()
  is_calender_day?: boolean;

  @IsOptional()
  @IsBoolean()
  is_holiday_day?: boolean;

  @IsOptional()
  @IsBoolean()
  is_schedule_day?: boolean;

  @IsOptional()
  @IsNumber()
  working_hour?: number;

  @IsOptional()
  @IsInt()
  working_day_longshift?: number;

  @IsOptional()
  @IsInt()
  working_hour_longshift?: number;

  @IsOptional()
  @IsNumber()
  mohh_per_month?: number;
}

export class UpdatePlanWorkingHourDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  plan_date?: Date;

  @IsOptional()
  @IsBoolean()
  is_calender_day?: boolean;

  @IsOptional()
  @IsBoolean()
  is_holiday_day?: boolean;

  @IsOptional()
  @IsBoolean()
  is_schedule_day?: boolean;

  @IsOptional()
  @IsNumber()
  working_hour?: number;

  @IsOptional()
  @IsInt()
  working_day_longshift?: number;

  @IsOptional()
  @IsInt()
  working_hour_longshift?: number;

  @IsOptional()
  @IsNumber()
  mohh_per_month?: number;
}

export class QueryPlanWorkingHourDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  plan_date?: Date;

  @IsOptional()
  @IsBoolean()
  is_calender_day?: boolean;

  @IsOptional()
  @IsBoolean()
  is_holiday_day?: boolean;

  @IsOptional()
  @IsBoolean()
  is_schedule_day?: boolean;

  @IsOptional()
  @IsNumber()
  working_hour?: number;

  @IsOptional()
  @IsInt()
  working_day_longshift?: number;

  @IsOptional()
  @IsInt()
  working_hour_longshift?: number;

  @IsOptional()
  @IsNumber()
  mohh_per_month?: number;
}
