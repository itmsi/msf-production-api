import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryFuelConsumptionDto {
  @ApiProperty({
    description: 'Start date for date range filter (activity_date)',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiProperty({
    description: 'End date for date range filter (activity_date)',
    example: '2024-01-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiProperty({
    description: 'Search keyword for all columns',
    example: 'alpha',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  keyword?: string;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    required: false,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 10)
  limit?: number = 10;
}
