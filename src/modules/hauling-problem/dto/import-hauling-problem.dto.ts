import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { ShiftType } from 'src/modules/base-data-production';

export class ImportHaulingProblemItemDto {
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
  data: ImportHaulingProblemCsvRowDto;
}

export class ImportHaulingProblemCsvRowDto {
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
  shift: ShiftType;

  @ApiProperty({
    description: 'Standby Factor based on Master Activities',
    example: 'Rain, Slippery',
  })
  standby_factor: string;

  @ApiProperty({
    description: 'Start Time Problem Hauling',
    example: '2025-09-17 12:00',
  })
  start_time: string;

  @ApiProperty({
    description: 'Finish Time Problem Hauling',
    example: '2025-09-17 12:00',
  })
  finish_time: string;

  @ApiProperty({
    description: 'Site Name',
    example: 'KFM',
  })
  site_name: string;

  @ApiProperty({
    description: 'Remark Problem Hauling',
    example: 'Hujan di segment 1',
  })
  remark: string;
}
