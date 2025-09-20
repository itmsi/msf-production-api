import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ImportParentPlanProductionRow {
  @ApiPropertyOptional({
    description: 'Tanggal akhir filter (format: YYYY-MM-DD)',
    example: '2024-01-31',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  plan_date: string;

  @ApiProperty({
    description: 'Total Average Month EWH for generate',
    example: 1,
    type: 'number',
  })
  total_average_month_ewh: number;

  @ApiProperty({
    description: 'Total Average Day EWH for generate',
    example: 1,
    type: 'number',
  })
  total_average_day_ewh: number;

  @ApiProperty({
    description: 'Total Ore target for Generate Daily',
    example: 1,
    type: 'number',
  })
  total_ore_target?: number;

  @ApiProperty({
    description: 'Total Ore Shipment Target for Barging process generate',
    example: 1,
    type: 'number',
  })
  total_ore_shipment_target?: number;

  @ApiProperty({
    description: 'Total sisa stock accumulated',
    example: 1,
    type: 'number',
  })
  total_sisa_stock: number;

  @ApiProperty({
    description: 'Total OB Material target for generate',
    example: 1,
    type: 'number',
  })
  total_ob_target: number;

  @ApiProperty({
    description: 'Total Quarry Material target for generate',
    example: 1,
    type: 'number',
  })
  total_quarry_target: number;

  @ApiProperty({
    description: 'Total fleet',
    example: 1,
    type: 'number',
  })
  total_fleet: number;
}

export class ImportParentPlanProductionItemDto {
  @ApiProperty({
    description: 'Status baris data',
    example: 'error',
  })
  status: string;

  @ApiProperty({
    description: 'Pesan untuk baris data',
    example: 'unit_name tidak ada',
  })
  message: string;

  @ApiProperty({
    description: 'Nomor baris',
    example: 1,
  })
  row: number;

  @ApiProperty({
    description: 'Data baris',
    type: ImportParentPlanProductionRow,
  })
  data: ImportParentPlanProductionRow;
}
