import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class ImportFuelConsumptionItemDto {
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
  })
  data: ImportFuelConsumptionCsvRowDto;
}

export class ImportFuelConsumptionCsvRowDto {
  @ApiProperty({
    description: 'Tanggal Aktifitas (format: yyyy-mm-dd)',
    example: '2025-01-01',
  })
  activity_date: string;

  @ApiProperty({
    description: 'Nomor unit',
    example: 'DT-0001',
  })
  no_unit: string;

  @ApiProperty({
    description: 'Category unit (STB atau BD)',
    example: 'B40, B30',
  })
  part_name: string;
  operator_name: string;

  @ApiProperty({
    description: 'Last Refuelling HM',
    example: 'rain',
  })
  last_refueling_hm: number;

  @ApiProperty({
    description: 'Now Refuelling HM',
    example: 0,
  })
  now_refueling_hm: number;

  @ApiProperty({
    description: 'Last Refuelling KM',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsString()
  last_refueling_km?: number;

  @ApiProperty({
    description: 'Now Refuelling KM',
    example: 0,
  })
  now_refueling_km: number;

  @ApiProperty({
    description: 'Total Liter Used for refuelling',
    example: 0,
  })
  qty_supply: number;

  @ApiProperty({
    description: 'Total Liter Used for refuelling',
    example: 'LITER',
  })
  uom: string;

  @ApiProperty({
    description: 'Time start refuelling',
    example: '2025-09-17 12:00',
  })
  start_refueling_time: string;

  @ApiProperty({
    description: 'Time finish refuelling',
    example: '2025-09-17 12:00',
  })
  end_refueling_time: string;

  @ApiProperty({
    description: 'Shift unit (ns atau ds)',
    example: 'ns',
    enum: ['ns', 'ds'],
  })
  shift: string;
}
