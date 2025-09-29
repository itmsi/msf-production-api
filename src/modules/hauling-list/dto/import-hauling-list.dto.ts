import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class ImportHaulingListItemDto {
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
  data: ImportHaulingListCsvRowDto;
}

export class ImportHaulingListCsvRowDto {
  @ApiProperty({
    description: 'Tanggal Aktifitas (format: yyyy-mm-dd)',
    example: '2025-01-01',
  })
  activity_date: string;

  @ApiProperty({
    description: 'Shift unit (ns atau ds)',
    example: 'ns',
    enum: ['ns', 'ds'],
  })
  shift: string;

  @ApiProperty({
    description: 'Time Hauling',
    example: '2025-09-17 12:00',
  })
  time: string;

  @ApiProperty({
    description: 'Unit Loading',
    example: 'EX-0001',
  })
  loading_unit: string;

  @ApiProperty({
    description: 'Unit Hauler',
    example: 'DT-0001',
  })
  hauler_unit: string;

  @ApiProperty({
    description: 'Material',
    example: 'ore, quarry, boulder',
    enum: ['ore', 'quarry', 'boulder'],
  })
  material: string;

  @ApiProperty({
    description: 'Loading Point',
    example: 'EFO 1, ETO 1',
  })
  loading_point_name: string;

  @ApiProperty({
    description: 'Dumping Point',
    example: 'EFO 1, ETO 1',
  })
  dumping_point_name: string;

  @ApiProperty({
    description: 'Total Vessel',
    example: 1,
  })
  vessel: number;

  @ApiProperty({
    description: 'Activity Type',
    example: 'direct, hauling',
    enum: ['direct', 'hauling'],
  })
  activity_type: string;
}
