import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryBargeFormDto {
  @ApiProperty({
    description: 'Start date for date range filter (start_loading)',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiProperty({
    description: 'End date for date range filter (end_loading)',
    example: '2024-01-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiProperty({
    description: 'Search keyword for barge name, site name, shipment, or remarks',
    example: 'alpha',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  keyword?: string;

  @ApiProperty({
    description: 'Filter by barge ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  barge_id?: number;

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
