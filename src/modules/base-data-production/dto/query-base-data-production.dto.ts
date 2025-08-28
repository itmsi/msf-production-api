import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryBaseDataProductionDto {
  @ApiPropertyOptional({ description: 'Filter by date range start (YYYY-MM-DD)', example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filter by date range end (YYYY-MM-DD)', example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Filter by keyword (population_id, driver_id, shift, material, total_vessel, mround_distance, distance, total_km, total_hm, loading_point_id, dumping_point_id)', example: 'coal' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: 'Page number', example: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', example: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;
}
