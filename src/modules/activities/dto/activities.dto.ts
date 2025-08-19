import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumberString,
} from 'class-validator';

export class CreateActivitiesDto {
  @ApiProperty({
    example: 'Loading Barge',
    description: 'Nama aktivitas yang akan dibuat',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'active',
    description: 'Status aktivitas (active, inactive, pending)',
  })
  @IsString()
  @IsNotEmpty()
  status: string;
}

export class UpdateActivitiesDto {
  @ApiProperty({
    example: 'Loading Barge',
    description: 'Nama aktivitas yang akan diupdate',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'active',
    description: 'Status aktivitas (active, inactive, pending)',
  })
  @IsString()
  @IsNotEmpty()
  status: string;
}

export class ActivitiesResponseDto {
  id: number;
  name: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class GetActivitiesQueryDto {
  @ApiProperty({
    required: false,
    example: '1',
    description: 'Nomor halaman (default: 1)',
  })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiProperty({
    required: false,
    example: '10',
    description: 'Jumlah data per halaman (default: 10, max: 100)',
  })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiProperty({
    required: false,
    example: 'loading',
    description: 'Pencarian umum di semua field',
  })
  @IsOptional()
  search?: string;

  @ApiProperty({
    required: false,
    example: 'loading',
    description: 'Filter berdasarkan nama aktivitas (partial match)',
  })
  @IsOptional()
  name?: string;

  @ApiProperty({
    required: false,
    example: 'active',
    description: 'Filter berdasarkan status aktivitas',
  })
  @IsOptional()
  status?: string;

  @ApiProperty({
    required: false,
    example: 'name',
    description: 'Field untuk sorting (id, name, status, createdAt, updatedAt)',
  })
  @IsOptional()
  sortBy?: string;

  @ApiProperty({
    required: false,
    example: 'ASC',
    description: 'Urutan sorting (ASC atau DESC)',
  })
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}
