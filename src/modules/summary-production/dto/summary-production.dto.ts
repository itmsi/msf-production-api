import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class SummaryProductionQueryDto {
  @ApiProperty({ 
    description: 'Start date for filtering (YYYY-MM-DD format)', 
    example: '2025-01-01',
    required: false 
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ 
    description: 'End date for filtering (YYYY-MM-DD format)', 
    example: '2025-01-31',
    required: false 
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ 
    description: 'DT Type filter (10, 12, or N/A)', 
    example: '10',
    required: false 
  })
  @IsOptional()
  @IsString()
  dtType?: string;

  @ApiProperty({ 
    description: 'Material type filter', 
    example: 'ore barge',
    required: false 
  })
  @IsOptional()
  @IsString()
  material?: string;
}

export class SummaryProductionItemDto {
  @ApiProperty({ description: 'DT Type', example: '10' })
  dt_type: string;

  @ApiProperty({ description: 'Unit number', example: 'DT-001' })
  unit: string;

  @ApiProperty({ description: 'Date', example: '2025-01-15' })
  date: string;

  @ApiProperty({ description: 'Material type', example: 'ore barge' })
  material_type: string;

  @ApiProperty({ description: 'Vessel count', example: 5 })
  vessel: number;

  @ApiProperty({ description: 'Tonnage', example: 132.8 })
  tonnage: number;
}

export class SummaryProductionResponseDto {
  @ApiProperty({ description: 'HTTP status code', example: 200 })
  statusCode: number;

  @ApiProperty({ description: 'Response message', example: 'success' })
  message: string;

  @ApiProperty({ description: 'Summary production data', type: [SummaryProductionItemDto] })
  data: SummaryProductionItemDto[];
}
