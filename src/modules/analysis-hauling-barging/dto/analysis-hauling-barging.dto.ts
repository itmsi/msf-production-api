import { IsOptional, IsDateString, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AnalysisHaulingBargingFilterDto {
  @ApiPropertyOptional({
    description: 'Start date untuk filter data (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date untuk filter data (YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Page number untuk pagination',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Limit data per page untuk pagination',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}

export class AnalysisHaulingBargingResponseDto {
  @ApiPropertyOptional({
    description: 'Tanggal data',
    example: '2024-01-01',
  })
  date: string;

  @ApiPropertyOptional({
    description: 'Jumlah vessel untuk ore barge',
    example: 5,
  })
  bargeVessel: number;

  @ApiPropertyOptional({
    description: 'BCM untuk ore barge (tonnage / 1.6)',
    example: 125.5,
  })
  bargeBCM: number;

  @ApiPropertyOptional({
    description: 'Tonnage untuk ore barge',
    example: 200.8,
  })
  bargeTonnage: number;

  @ApiPropertyOptional({
    description: 'Jumlah vessel untuk ore hauling',
    example: 8,
  })
  oreHaulingVessel: number;

  @ApiPropertyOptional({
    description: 'BCM untuk ore hauling (tonnage / 1.6)',
    example: 200.0,
  })
  oreHaulingBCM: number;

  @ApiPropertyOptional({
    description: 'Tonnage untuk ore hauling',
    example: 320.0,
  })
  oreHaulingTonnage: number;

  @ApiPropertyOptional({
    description: 'Jumlah vessel untuk OB',
    example: 12,
  })
  obVessel: number;

  @ApiPropertyOptional({
    description: 'BCM untuk OB (tonnage / 1.6)',
    example: 300.0,
  })
  obBCM: number;

  @ApiPropertyOptional({
    description: 'Tonnage untuk OB',
    example: 480.0,
  })
  obTonnage: number;

  @ApiPropertyOptional({
    description: 'Total vessel TMM (ore hauling + OB)',
    example: 20,
  })
  tmmVessel: number;

  @ApiPropertyOptional({
    description: 'Total BCM TMM (ore hauling + OB)',
    example: 500.0,
  })
  tmmBCM: number;

  @ApiPropertyOptional({
    description: 'Total tonnage TMM (ore hauling + OB)',
    example: 800.0,
  })
  tmmTonnage: number;
}
