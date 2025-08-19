import { IsOptional, IsNumber, IsInt } from 'class-validator';

export class CreatePlanWorkingHourDetailDto {
  @IsInt()
  plant_working_hour_id: number;

  @IsInt()
  activities_id: number;

  @IsOptional()
  @IsNumber()
  activities_hour?: number;
}

export class UpdatePlanWorkingHourDetailDto {
  @IsOptional()
  @IsInt()
  plant_working_hour_id?: number;

  @IsOptional()
  @IsInt()
  activities_id?: number;

  @IsOptional()
  @IsNumber()
  activities_hour?: number;
}

export class QueryPlanWorkingHourDetailDto {
  @IsOptional()
  @IsInt()
  plant_working_hour_id?: number;

  @IsOptional()
  @IsInt()
  activities_id?: number;

  @IsOptional()
  @IsNumber()
  activities_hour?: number;
}
