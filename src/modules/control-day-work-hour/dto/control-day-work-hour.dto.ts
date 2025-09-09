import { IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetControlDayWorkHourDto {
  @ApiPropertyOptional({
    description: 'Tanggal mulai filter (format: YYYY-MM-DD)',
    example: '2024-01-01',
    type: 'string',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Tanggal akhir filter (format: YYYY-MM-DD)',
    example: '2024-01-31',
    type: 'string',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Unit untuk filter',
    example: 'Unit-001',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({
    description: 'Shift untuk filter',
    example: 'DS',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  shift?: string;

  @ApiPropertyOptional({
    description: 'Halaman untuk pagination',
    example: 1,
    type: 'number',
    default: 1,
  })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Limit data per halaman',
    example: 10,
    type: 'number',
    default: 10,
  })
  @IsOptional()
  limit?: number = 10;
}

export class ControlDayWorkHourResponseDto {
  @ApiProperty({
    description: 'ID unik control day work hour',
    example: 1,
    type: 'number',
  })
  id: number;

  @ApiProperty({
    description: 'Unit dari data master population',
    example: 'Unit-001',
    type: 'string',
  })
  unit: string;

  @ApiProperty({
    description: 'Shift dari Production[Shift]',
    example: 'DS',
    type: 'string',
  })
  shift: string;

  @ApiProperty({
    description: 'Tanggal filter',
    example: '2024-01-15',
    type: 'string',
    format: 'date',
  })
  filterDate: string;

  @ApiProperty({
    description: 'Data P5M dari Effective Working Hours',
    example: 120.5,
    type: 'number',
    nullable: true,
  })
  p5m: number;

  @ApiProperty({
    description: 'Data Perg. Shift dari Effective Working Hours',
    example: 45.0,
    type: 'number',
    nullable: true,
  })
  pergShift: number;

  @ApiProperty({
    description: 'Data Rest Time dari Effective Working Hours',
    example: 30.0,
    type: 'number',
    nullable: true,
  })
  restTime: number;

  @ApiProperty({
    description: 'Data GST dari Effective Working Hours',
    example: 15.0,
    type: 'number',
    nullable: true,
  })
  gst: number;

  @ApiProperty({
    description: 'Data Travelling dari Effective Working Hours',
    example: 60.0,
    type: 'number',
    nullable: true,
  })
  travelling: number;

  @ApiProperty({
    description: 'Data Perbaikan Front Loading dari Effective Working Hours',
    example: 90.0,
    type: 'number',
    nullable: true,
  })
  perbaikanFrontLoading: number;

  @ApiProperty({
    description: 'Data Cek Elevasi dari Effective Working Hours',
    example: 20.0,
    type: 'number',
    nullable: true,
  })
  cekElevasi: number;

  @ApiProperty({
    description: 'Data Refuelling dari Effective Working Hours',
    example: 25.0,
    type: 'number',
    nullable: true,
  })
  refuelling: number;

  @ApiProperty({
    description: 'Data Slippery dari Effective Working Hours',
    example: 40.0,
    type: 'number',
    nullable: true,
  })
  slippery: number;

  @ApiProperty({
    description: 'Data Travelling Equipment dari Effective Working Hours',
    example: 35.0,
    type: 'number',
    nullable: true,
  })
  travellingEquipment: number;

  @ApiProperty({
    description: 'Data Fogging dari Effective Working Hours',
    example: 10.0,
    type: 'number',
    nullable: true,
  })
  fogging: number;

  @ApiProperty({
    description: 'Data Safety Talk dari Effective Working Hours',
    example: 15.0,
    type: 'number',
    nullable: true,
  })
  safetyTalk: number;

  @ApiProperty({
    description: 'Data P2H dari Effective Working Hours',
    example: 50.0,
    type: 'number',
    nullable: true,
  })
  p2h: number;

  @ApiProperty({
    description: 'Waktu pembuatan record',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Waktu terakhir update record',
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}

export class ControlDayWorkHourListResponseDto {
  @ApiProperty({
    description: 'Array data control day work hour',
    type: [ControlDayWorkHourResponseDto],
  })
  data: ControlDayWorkHourResponseDto[];

  @ApiProperty({
    description: 'Total data',
    example: 100,
    type: 'number',
  })
  total: number;

  @ApiProperty({
    description: 'Halaman saat ini',
    example: 1,
    type: 'number',
  })
  page: number;

  @ApiProperty({
    description: 'Limit per halaman',
    example: 10,
    type: 'number',
  })
  limit: number;

  @ApiProperty({
    description: 'Total halaman',
    example: 10,
    type: 'number',
  })
  totalPages: number;
}
