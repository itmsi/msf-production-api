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
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  IsNotEmptyString,
  IsValidFloat,
  IsFloatInRange,
  IsNullableFloatInRange,
} from '../../../common/validators';

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
  @IsNotEmptyString()
  type: OperatorPointType;

  @ApiProperty({
    example: 'Dumping Point A',
    description: 'Nama operator point',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmptyString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 106.8456,
    description: 'Longitude operator point (nullable)',
    minimum: -180,
    maximum: 180,
    required: false,
  })
  @IsOptional()
  @IsNullableFloatInRange(-180, 180)
  longitude?: number;

  @ApiProperty({
    example: -6.2088,
    description: 'Latitude operator point (nullable)',
    minimum: -90,
    maximum: 90,
    required: false,
  })
  @IsOptional()
  @IsNullableFloatInRange(-90, 90)
  latitude?: number;
}

export class CreateSitesDto {
  @ApiProperty({
    example: 'Site Jakarta',
    description: 'Nama site yang akan dibuat (mandatory)',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmptyString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'Jakarta Selatan',
    description: 'Lokasi site (mandatory)',
    minLength: 1,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmptyString()
  @MinLength(1)
  @MaxLength(200)
  location: string;

  @ApiProperty({
    example: 106.8456,
    description: 'Longitude site (mandatory)',
    minimum: -180,
    maximum: 180,
  })
  @IsValidFloat()
  @IsFloatInRange(-180, 180)
  longitude: number;

  @ApiProperty({
    example: -6.2088,
    description: 'Latitude site (mandatory)',
    minimum: -90,
    maximum: 90,
  })
  @IsValidFloat()
  @IsFloatInRange(-90, 90)
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
    description: 'Array operator points yang akan dibuat (mandatory)',
    type: [OperatorPointDto],
    minLength: 1,
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OperatorPointDto)
  operator_point: OperatorPointDto[];
}

export class UpdateSitesDto {
  @ApiProperty({
    example: 'Site Jakarta',
    description: 'Nama site yang akan diupdate',
    required: false,
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @IsNotEmptyString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    example: 'Jakarta Selatan',
    description: 'Lokasi site',
    required: false,
    minLength: 1,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @IsNotEmptyString()
  @MinLength(1)
  @MaxLength(200)
  location?: string;

  @ApiProperty({
    example: 106.8456,
    description: 'Longitude site',
    required: false,
    minimum: -180,
    maximum: 180,
  })
  @IsOptional()
  @IsValidFloat()
  @IsFloatInRange(-180, 180)
  longitude?: number;

  @ApiProperty({
    example: -6.2088,
    description: 'Latitude site',
    required: false,
    minimum: -90,
    maximum: 90,
  })
  @IsOptional()
  @IsValidFloat()
  @IsFloatInRange(-90, 90)
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
    minLength: 1,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OperatorPointDto)
  operator_point?: OperatorPointDto[];
}

export class OperatorPointResponseDto {
  @ApiProperty({ example: 1, description: 'ID operator point' })
  id: number;

  @ApiProperty({ example: 1, description: 'ID site yang terkait' })
  sites_id: number;

  @ApiProperty({
    example: 'dumping',
    description: 'Tipe operator point',
    enum: OperatorPointType,
  })
  type: string;

  @ApiProperty({
    example: 'Dumping Point A',
    description: 'Nama operator point',
  })
  name: string;

  @ApiProperty({ example: 106.8456, description: 'Longitude operator point' })
  longitude: number;

  @ApiProperty({ example: -6.2088, description: 'Latitude operator point' })
  latitude: number;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Waktu pembuatan operator point',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Waktu terakhir update operator point',
  })
  updatedAt: Date;
}

export class SitesResponseDto {
  @ApiProperty({ example: 1, description: 'ID unik site' })
  id: number;

  @ApiProperty({ example: 'Site Jakarta', description: 'Nama site' })
  name: string;

  @ApiProperty({ example: 'Jakarta Selatan', description: 'Lokasi site' })
  location: string;

  @ApiProperty({ example: 106.8456, description: 'Longitude site' })
  longitude: number;

  @ApiProperty({ example: -6.2088, description: 'Latitude site' })
  latitude: number;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Waktu pembuatan site',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Waktu terakhir update site',
  })
  updatedAt: Date;

  @ApiProperty({
    type: [OperatorPointResponseDto],
    description: 'Array operator points yang terkait dengan site',
    required: false,
  })
  operator_points?: OperatorPointResponseDto[];
}

export class GetSitesQueryDto {
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
    example: 'jakarta',
    description: 'Pencarian umum di field name dan location',
    minLength: 1,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  search?: string;

  @ApiProperty({
    required: false,
    example: 'jakarta',
    description: 'Filter berdasarkan nama site (partial match)',
    minLength: 1,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiProperty({
    required: false,
    example: 'jakarta selatan',
    description: 'Filter berdasarkan lokasi site (partial match)',
    minLength: 1,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  location?: string;

  @ApiProperty({
    required: false,
    example: 'name',
    description:
      'Field untuk sorting (id, name, location, longitude, latitude, createdAt, updatedAt)',
    enum: [
      'id',
      'name',
      'location',
      'longitude',
      'latitude',
      'createdAt',
      'updatedAt',
    ],
    default: 'id',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    required: false,
    example: 'ASC',
    description: 'Urutan sorting (ASC atau DESC)',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}

export class PaginationMetaDto {
  @ApiProperty({ example: 100, description: 'Total data yang tersedia' })
  total: number;

  @ApiProperty({ example: 1, description: 'Halaman saat ini' })
  page: number;

  @ApiProperty({ example: 10, description: 'Jumlah data per halaman' })
  limit: number;
}

export class SitesListResponseDto {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'Data sites berhasil diambil',
    description: 'Pesan response',
  })
  message: string;

  @ApiProperty({ type: [SitesResponseDto], description: 'Array data sites' })
  data: SitesResponseDto[];

  @ApiProperty({ type: PaginationMetaDto, description: 'Informasi pagination' })
  meta: PaginationMetaDto;
}

export class SingleSiteResponseDto {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'Retrieve data success',
    description: 'Pesan response',
  })
  message: string;

  @ApiProperty({ type: SitesResponseDto, description: 'Data site' })
  data: SitesResponseDto;
}
