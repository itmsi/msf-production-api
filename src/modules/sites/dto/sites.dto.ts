import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumberString,
  IsNumber,
  IsArray,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum OperatorPointType {
  DUMPING = 'dumping',
  LOADING = 'loading',
}

export class OperatorPointDto {
  @ApiProperty({
    example: 'dumping',
    description: 'Tipe operator point (dumping atau loading)',
    enum: OperatorPointType,
  })
  @IsEnum(OperatorPointType)
  @IsNotEmpty()
  type: OperatorPointType;

  @ApiProperty({
    example: 'Dumping Point A',
    description: 'Nama operator point',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 106.8456,
    description: 'Longitude operator point',
  })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({
    example: -6.2088,
    description: 'Latitude operator point',
  })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;
}

export class CreateSitesDto {
  @ApiProperty({
    example: 'Site Jakarta',
    description: 'Nama site yang akan dibuat',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Jakarta Selatan',
    description: 'Lokasi site',
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    example: 106.8456,
    description: 'Longitude site',
  })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({
    example: -6.2088,
    description: 'Latitude site',
  })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({
    example: [
      {
        type: 'dumping',
        name: 'Dumping Point A',
        longitude: 106.8456,
        latitude: -6.2088,
      },
    ],
    description: 'Array operator points yang akan dibuat',
    type: [OperatorPointDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OperatorPointDto)
  operator_point: OperatorPointDto[];
}

export class UpdateSitesDto {
  @ApiProperty({
    example: 'Site Jakarta',
    description: 'Nama site yang akan diupdate',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'Jakarta Selatan',
    description: 'Lokasi site',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    example: 106.8456,
    description: 'Longitude site',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({
    example: -6.2088,
    description: 'Latitude site',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({
    example: [
      {
        type: 'dumping',
        name: 'Dumping Point A',
        longitude: 106.8456,
        latitude: -6.2088,
      },
    ],
    description: 'Array operator points yang akan diupdate',
    type: [OperatorPointDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OperatorPointDto)
  operator_point?: OperatorPointDto[];
}

export class SitesResponseDto {
  id: number;
  name: string;
  location: string;
  longitude: number;
  latitude: number;
  createdAt: Date;
  updatedAt: Date;
  operator_points?: OperatorPointResponseDto[];
}

export class OperatorPointResponseDto {
  id: number;
  sites_id: number;
  type: string;
  name: string;
  longitude: number;
  latitude: number;
  createdAt: Date;
  updatedAt: Date;
}

export class GetSitesQueryDto {
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
    example: 'jakarta',
    description: 'Pencarian umum di semua field',
  })
  @IsOptional()
  search?: string;

  @ApiProperty({
    required: false,
    example: 'jakarta',
    description: 'Filter berdasarkan nama site (partial match)',
  })
  @IsOptional()
  name?: string;

  @ApiProperty({
    required: false,
    example: 'jakarta selatan',
    description: 'Filter berdasarkan lokasi site (partial match)',
  })
  @IsOptional()
  location?: string;

  @ApiProperty({
    required: false,
    example: 'name',
    description:
      'Field untuk sorting (id, name, location, longitude, latitude, createdAt, updatedAt)',
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
