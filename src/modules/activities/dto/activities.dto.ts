import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumberString,
  IsEnum,
  IsArray,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum ActivityStatus {
  WORKING = 'working',
  BREAKDOWN = 'breakdown',
  IDLE = 'idle',
  DELAY = 'delay',
}

export class CreateActivitiesDto {
  @ApiProperty({
    example: 'Loading Barge',
    description: 'Nama aktivitas yang akan dibuat',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'working',
    description: 'Status aktivitas',
    enum: ActivityStatus,
    default: ActivityStatus.WORKING,
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(ActivityStatus)
  status: ActivityStatus;
}

export class UpdateActivitiesDto {
  @ApiProperty({
    example: 'Loading Barge Updated',
    description: 'Nama aktivitas yang akan diupdate',
    minLength: 1,
    maxLength: 255,
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'active',
    description: 'Status aktivitas',
    enum: ActivityStatus,
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(ActivityStatus)
  status: ActivityStatus;
}

export class ActivitiesResponseDto {
  @ApiProperty({
    example: 1,
    description: 'ID unik aktivitas',
  })
  id: number;

  @ApiProperty({
    example: 'Loading Barge',
    description: 'Nama aktivitas',
  })
  name: string;

  @ApiProperty({
    example: 'active',
    description: 'Status aktivitas',
    enum: ActivityStatus,
  })
  status: ActivityStatus;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Waktu pembuatan aktivitas',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Waktu terakhir update aktivitas',
  })
  updatedAt: Date;
}

export class GetActivitiesQueryDto {
  @ApiProperty({
    required: false,
    example: '1',
    description: 'Nomor halaman (default: 1)',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiProperty({
    required: false,
    example: '10',
    description: 'Jumlah data per halaman (default: 10, max: 100)',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiProperty({
    required: false,
    example: 'loading',
    description: 'Pencarian umum di semua field (name dan status)',
    minLength: 1,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    required: false,
    example: 'loading',
    description: 'Filter berdasarkan nama aktivitas (partial match)',
    minLength: 1,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    required: false,
    example: 'active',
    description: 'Filter berdasarkan status aktivitas',
    enum: ActivityStatus,
  })
  @IsOptional()
  @IsString()
  @IsEnum(ActivityStatus)
  status?: ActivityStatus;

  @ApiProperty({
    required: false,
    example: 'idle,delay',
    description: 'Filter berdasarkan multiple status aktivitas (comma-separated atau array format)',
    enum: ActivityStatus,
    isArray: true,
    type: [String],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(s => s.trim());
    }
    if (Array.isArray(value)) {
      return value;
    }
    return [];
  })
  @IsArray()
  @IsEnum(ActivityStatus, { each: true })
  status_multiple?: ActivityStatus[];

  @ApiProperty({
    required: false,
    example: 'name',
    description: 'Field untuk sorting',
    enum: ['id', 'name', 'status', 'createdAt', 'updatedAt'],
    default: 'id',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    required: false,
    example: 'ASC',
    description: 'Urutan sorting',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}

export class PaginationMetaDto {
  @ApiProperty({
    example: 100,
    description: 'Total data yang tersedia',
  })
  total: number;

  @ApiProperty({
    example: 1,
    description: 'Halaman saat ini',
  })
  page: number;

  @ApiProperty({
    example: 10,
    description: 'Jumlah data per halaman',
  })
  limit: number;
}

export class ActivitiesListResponseDto {
  @ApiProperty({
    example: 200,
    description: 'HTTP status code',
  })
  statusCode: number;

  @ApiProperty({
    example: 'Data aktivitas berhasil diambil',
    description: 'Pesan response',
  })
  message: string;

  @ApiProperty({
    type: [ActivitiesResponseDto],
    description: 'Array data aktivitas',
  })
  data: ActivitiesResponseDto[];

  @ApiProperty({
    type: PaginationMetaDto,
    description: 'Informasi pagination',
  })
  meta: PaginationMetaDto;
}

export class SingleActivityResponseDto {
  @ApiProperty({
    example: 200,
    description: 'HTTP status code',
  })
  statusCode: number;

  @ApiProperty({
    example: 'Retrieve data success',
    description: 'Pesan response',
  })
  message: string;

  @ApiProperty({
    type: ActivitiesResponseDto,
    description: 'Data aktivitas',
  })
  data: ActivitiesResponseDto;
}
