import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export enum ProblemType {
  P5M = 'P5M',
  PERG_SHIFT = 'Perg. Shift',
  REST_TIME = 'Rest Time',
  GST = 'GST',
  TRAVELLING = 'Travelling',
  PERBAIKAN_FRONT_LOADING = 'Perbaikan Front Loading',
  CEK_ELEVASI = 'Cek Elevasi',
  REFUELLING = 'Refuelling',
  SLIPPERY = 'Slippery',
  TRAVELLING_EQUIPMENT = 'Travelling Equipment',
  FOGGING = 'Fogging',
  SAFETY_TALK = 'Safety Talk',
  P2H = 'P2H',
  SCHEDULE_MAINTENANCE = 'Schedule Maintenance',
}

export class MtdWorkHourQueryDto {
  @ApiProperty({
    description: 'Tanggal mulai filter',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Tanggal akhir filter',
    example: '2024-01-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Unit/No Unit untuk filter',
    example: 'DT-001',
    required: false,
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({
    description: 'Jenis problem untuk filter',
    enum: ProblemType,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProblemType)
  problemType?: ProblemType;

  @ApiProperty({
    description: 'Nomor halaman',
    example: 1,
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Jumlah data per halaman',
    example: 10,
    required: false,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class MtdWorkHourResponseDto {
  @ApiProperty({
    description: 'Unit/No Unit',
    example: 'DT-001',
  })
  unit: string;

  @ApiProperty({
    description: 'Tanggal aktivitas',
    example: '2024-01-15',
  })
  activityDate: string;

  @ApiProperty({
    description: 'Jenis problem',
    example: 'P5M',
  })
  problemType: string;

  @ApiProperty({
    description: 'Durasi dalam jam',
    example: 2.5,
  })
  duration: number;

  @ApiProperty({
    description: 'Deskripsi',
    example: 'P5M - Preventive Maintenance',
    nullable: true,
  })
  description?: string;

  @ApiProperty({
    description: 'Total durasi untuk unit ini',
    example: 8.5,
  })
  totalDuration: number;
}

export class MtdWorkHourSummaryDto {
  @ApiProperty({
    description: 'Unit/No Unit',
    example: 'DT-001',
  })
  unit: string;

  @ApiProperty({
    description: 'Total durasi semua problem',
    example: 24.5,
  })
  totalDuration: number;

  @ApiProperty({
    description: 'Detail per jenis problem',
    type: [MtdWorkHourResponseDto],
  })
  problems: MtdWorkHourResponseDto[];
}
