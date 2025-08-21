import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumberString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { IsNotEmptyString } from '../../../common/validators';

export class CreateBrandDto {
  @ApiProperty({
    example: 'Toyota',
    description: 'Nama brand yang akan dibuat (mandatory)',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmptyString()
  @MinLength(1)
  @MaxLength(100)
  brand_name: string;
}

export class UpdateBrandDto {
  @ApiProperty({
    example: 'Toyota Motor',
    description: 'Nama brand yang akan diupdate',
    minLength: 1,
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmptyString()
  @MinLength(1)
  @MaxLength(100)
  brand_name?: string;
}

export class BrandResponseDto {
  @ApiProperty({
    example: 1,
    description: 'ID unik brand',
  })
  id: number;

  @ApiProperty({
    example: 'Toyota',
    description: 'Nama brand',
  })
  brand_name: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Waktu pembuatan brand',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Waktu terakhir update brand',
  })
  updatedAt: Date;
}

export class GetBrandsQueryDto {
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
    example: 'toyota',
    description: 'Pencarian umum di field brand_name',
    minLength: 1,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  search?: string;

  @ApiProperty({
    required: false,
    example: 'toyota',
    description: 'Filter berdasarkan nama brand (partial match)',
    minLength: 1,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  brand_name?: string;

  @ApiProperty({
    required: false,
    example: 'brand_name',
    description: 'Field untuk sorting',
    enum: ['id', 'brand_name', 'createdAt', 'updatedAt'],
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

export class BrandListResponseDto {
  @ApiProperty({
    example: 200,
    description: 'HTTP status code',
  })
  statusCode: number;

  @ApiProperty({
    example: 'Data brand berhasil diambil',
    description: 'Pesan response',
  })
  message: string;

  @ApiProperty({
    type: [BrandResponseDto],
    description: 'Array data brand',
  })
  data: BrandResponseDto[];

  @ApiProperty({
    type: PaginationMetaDto,
    description: 'Informasi pagination',
  })
  meta: PaginationMetaDto;
}

export class SingleBrandResponseDto {
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
    type: BrandResponseDto,
    description: 'Data brand',
  })
  data: BrandResponseDto;
}
