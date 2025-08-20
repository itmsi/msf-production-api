import { IsOptional, IsNumber, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlanWorkingHourDetailDto {
  @ApiProperty({
    description: 'ID plan working hour',
    example: 1,
    type: Number
  })
  @IsInt()
  plant_working_hour_id: number;

  @ApiProperty({
    description: 'ID activities',
    example: 1,
    type: Number
  })
  @IsInt()
  activities_id: number;

  @ApiProperty({
    description: 'Jam kerja untuk activities',
    example: 1,
    type: Number,
    required: false
  })
  @IsOptional()
  @IsNumber()
  activities_hour?: number;
}

export class UpdatePlanWorkingHourDetailDto {
  @ApiProperty({
    description: 'ID plan working hour',
    example: 1,
    type: Number,
    required: false
  })
  @IsOptional()
  @IsInt()
  plant_working_hour_id?: number;

  @ApiProperty({
    description: 'ID activities',
    example: 1,
    type: Number,
    required: false
  })
  @IsOptional()
  @IsInt()
  activities_id?: number;

  @ApiProperty({
    description: 'Jam kerja untuk activities',
    example: 1,
    type: Number,
    required: false
  })
  @IsOptional()
  @IsNumber()
  activities_hour?: number;
}

export class QueryPlanWorkingHourDetailDto {
  @ApiProperty({
    description: 'Filter berdasarkan ID plan working hour',
    example: 1,
    type: Number,
    required: false
  })
  @IsOptional()
  @IsInt()
  plant_working_hour_id?: number;

  @ApiProperty({
    description: 'Filter berdasarkan ID activities',
    example: 1,
    type: Number,
    required: false
  })
  @IsOptional()
  @IsInt()
  activities_id?: number;

  @ApiProperty({
    description: 'Filter berdasarkan jam kerja',
    example: 1,
    type: Number,
    required: false
  })
  @IsOptional()
  @IsNumber()
  activities_hour?: number;
}
