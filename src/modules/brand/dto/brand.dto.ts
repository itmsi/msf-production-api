import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumberString } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ 
    example: 'Toyota', 
    description: 'Nama brand yang akan dibuat' 
  })
  @IsString()
  @IsNotEmpty()
  brand_name: string;
}

export class UpdateBrandDto {
  @ApiProperty({ 
    example: 'Toyota', 
    description: 'Nama brand yang akan diupdate' 
  })
  @IsString()
  @IsNotEmpty()
  brand_name: string;
}

export class BrandResponseDto {
  id: number;
  brand_name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class GetBrandsQueryDto {
  @ApiProperty({ 
    required: false, 
    example: '1', 
    description: 'Nomor halaman (default: 1)' 
  })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiProperty({ 
    required: false, 
    example: '10', 
    description: 'Jumlah data per halaman (default: 10, max: 100)' 
  })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiProperty({ 
    required: false, 
    example: 'toyota', 
    description: 'Pencarian umum di semua field' 
  })
  @IsOptional()
  search?: string;

  @ApiProperty({ 
    required: false, 
    example: 'toyota', 
    description: 'Filter berdasarkan nama brand (partial match)' 
  })
  @IsOptional()
  brand_name?: string;

  @ApiProperty({ 
    required: false, 
    example: 'brand_name', 
    description: 'Field untuk sorting (id, brand_name, createdAt, updatedAt)' 
  })
  @IsOptional()
  sortBy?: string;

  @ApiProperty({ 
    required: false, 
    example: 'ASC', 
    description: 'Urutan sorting (ASC atau DESC)' 
  })
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}
