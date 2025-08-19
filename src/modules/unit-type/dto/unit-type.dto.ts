import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumberString,
  IsNumber,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateUnitTypeDto {
  @ApiProperty({
    example: 1,
    description: 'ID dari brand yang terkait',
    minimum: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  brand_id: number;

  @ApiProperty({
    example: 'Excavator',
    description: 'Nama unit yang akan dibuat',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  unit_name: string;

  @ApiProperty({
    example: 'Heavy Equipment',
    description: 'Tipe unit yang akan dibuat',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  type_name: string;

  @ApiProperty({
    example: 'PC200-8',
    description: 'Model unit yang akan dibuat',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  model_name: string;
}

export class UpdateUnitTypeDto {
  @ApiProperty({
    required: false,
    example: 1,
    description: 'ID dari brand yang terkait',
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  brand_id?: number;

  @ApiProperty({
    required: false,
    example: 'Excavator',
    description: 'Nama unit yang akan diupdate',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  unit_name?: string;

  @ApiProperty({
    required: false,
    example: 'Heavy Equipment',
    description: 'Tipe unit yang akan diupdate',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  type_name?: string;

  @ApiProperty({
    required: false,
    example: 'PC200-8',
    description: 'Model unit yang akan diupdate',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  model_name?: string;
}

export class BrandDto {
  @ApiProperty({
    example: 1,
    description: 'ID brand',
  })
  id: number;

  @ApiProperty({
    example: 'Komatsu',
    description: 'Nama brand',
  })
  brand_name: string;
}

export class UnitTypeResponseDto {
  @ApiProperty({
    example: 1,
    description: 'ID unik unit type',
  })
  id: number;

  @ApiProperty({
    example: 1,
    description: 'ID dari brand yang terkait',
  })
  brand_id: number;

  @ApiProperty({
    example: 'Excavator',
    description: 'Nama unit',
  })
  unit_name: string;

  @ApiProperty({
    example: 'Heavy Equipment',
    description: 'Tipe unit',
  })
  type_name: string;

  @ApiProperty({
    example: 'PC200-8',
    description: 'Model unit',
  })
  model_name: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Waktu pembuatan unit type',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Waktu terakhir update unit type',
  })
  updatedAt: Date;

  @ApiProperty({
    type: BrandDto,
    description: 'Data brand yang terkait',
    required: false,
  })
  brand?: BrandDto;
}

export class GetUnitTypesQueryDto {
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
    example: 'excavator',
    description: 'Pencarian umum di semua field (unit_name, type_name, model_name, brand_name)',
    minLength: 1,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  search?: string;

  @ApiProperty({
    required: false,
    example: '1',
    description: 'Filter berdasarkan brand ID',
    minimum: 1,
  })
  @IsOptional()
  @IsNumberString()
  brand_id?: string;

  @ApiProperty({
    required: false,
    example: 'excavator',
    description: 'Filter berdasarkan nama unit (partial match)',
    minLength: 1,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  unit_name?: string;

  @ApiProperty({
    required: false,
    example: 'heavy equipment',
    description: 'Filter berdasarkan tipe unit (partial match)',
    minLength: 1,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  type_name?: string;

  @ApiProperty({
    required: false,
    example: 'pc200',
    description: 'Filter berdasarkan model unit (partial match)',
    minLength: 1,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  model_name?: string;

  @ApiProperty({
    required: false,
    example: 'unit_name',
    description: 'Field untuk sorting',
    enum: ['id', 'brand_id', 'unit_name', 'type_name', 'model_name', 'createdAt', 'updatedAt'],
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

export class UnitTypeListResponseDto {
  @ApiProperty({
    example: 200,
    description: 'HTTP status code',
  })
  statusCode: number;

  @ApiProperty({
    example: 'Data unit type berhasil diambil',
    description: 'Pesan response',
  })
  message: string;

  @ApiProperty({
    type: [UnitTypeResponseDto],
    description: 'Array data unit type',
  })
  data: UnitTypeResponseDto[];

  @ApiProperty({
    type: PaginationMetaDto,
    description: 'Informasi pagination',
  })
  meta: PaginationMetaDto;
}

export class SingleUnitTypeResponseDto {
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
    type: UnitTypeResponseDto,
    description: 'Data unit type',
  })
  data: UnitTypeResponseDto;
}
