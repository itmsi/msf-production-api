import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumberString, IsNumber } from 'class-validator';

export class CreateUnitTypeDto {
  @ApiProperty({ 
    example: 1, 
    description: 'ID dari brand yang terkait' 
  })
  @IsNumber()
  @IsNotEmpty()
  brand_id: number;

  @ApiProperty({ 
    example: 'Excavator', 
    description: 'Nama unit yang akan dibuat' 
  })
  @IsString()
  @IsNotEmpty()
  unit_name: string;

  @ApiProperty({ 
    example: 'Heavy Equipment', 
    description: 'Tipe unit yang akan dibuat' 
  })
  @IsString()
  @IsNotEmpty()
  type_name: string;

  @ApiProperty({ 
    example: 'PC200-8', 
    description: 'Model unit yang akan dibuat' 
  })
  @IsString()
  @IsNotEmpty()
  model_name: string;
}

export class UpdateUnitTypeDto {
  @ApiProperty({ 
    required: false,
    example: 1, 
    description: 'ID dari brand yang terkait' 
  })
  @IsOptional()
  @IsNumber()
  brand_id?: number;

  @ApiProperty({ 
    required: false,
    example: 'Excavator', 
    description: 'Nama unit yang akan diupdate' 
  })
  @IsOptional()
  @IsString()
  unit_name?: string;

  @ApiProperty({ 
    required: false,
    example: 'Heavy Equipment', 
    description: 'Tipe unit yang akan diupdate' 
  })
  @IsOptional()
  @IsString()
  type_name?: string;

  @ApiProperty({ 
    required: false,
    example: 'PC200-8', 
    description: 'Model unit yang akan diupdate' 
  })
  @IsOptional()
  @IsString()
  model_name?: string;
}

export class UnitTypeResponseDto {
  id: number;
  brand_id: number;
  unit_name: string;
  type_name: string;
  model_name: string;
  createdAt: Date;
  updatedAt: Date;
  brand?: {
    id: number;
    brand_name: string;
  };
}

export class GetUnitTypesQueryDto {
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
    example: 'excavator', 
    description: 'Pencarian umum di semua field' 
  })
  @IsOptional()
  search?: string;

  @ApiProperty({ 
    required: false, 
    example: 1, 
    description: 'Filter berdasarkan brand ID' 
  })
  @IsOptional()
  @IsNumberString()
  brand_id?: string;

  @ApiProperty({ 
    required: false, 
    example: 'excavator', 
    description: 'Filter berdasarkan nama unit (partial match)' 
  })
  @IsOptional()
  unit_name?: string;

  @ApiProperty({ 
    required: false, 
    example: 'heavy equipment', 
    description: 'Filter berdasarkan tipe unit (partial match)' 
  })
  @IsOptional()
  type_name?: string;

  @ApiProperty({ 
    required: false, 
    example: 'pc200', 
    description: 'Filter berdasarkan model unit (partial match)' 
  })
  @IsOptional()
  model_name?: string;

  @ApiProperty({ 
    required: false, 
    example: 'unit_name', 
    description: 'Field untuk sorting (id, brand_id, unit_name, type_name, model_name, createdAt, updatedAt)' 
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
