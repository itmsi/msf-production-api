import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsNumberString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRolesDto {
  @ApiProperty({ 
    description: 'Kode role yang harus unik', 
    example: 'ADMIN',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  role_code: string;

  @ApiProperty({ 
    description: 'Nama posisi/jabatan', 
    example: 'Administrator',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  position_name: string;

  @ApiPropertyOptional({ 
    description: 'Kode role parent/atasan',
    example: 'SUPER_ADMIN',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  role_parent?: string;

  @ApiPropertyOptional({ 
    description: 'ID site tempat role ini berlaku',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  sites_id?: number;

  @ApiPropertyOptional({ 
    description: 'ID user yang membuat role ini',
    minimum: 1,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  createdBy?: number;
}

export class UpdateRolesDto {
  @ApiPropertyOptional({ 
    description: 'Kode role yang harus unik', 
    example: 'ADMIN',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(100)
  role_code?: string;

  @ApiPropertyOptional({ 
    description: 'Nama posisi/jabatan', 
    example: 'Administrator',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(100)
  position_name?: string;

  @ApiPropertyOptional({ 
    description: 'Kode role parent/atasan',
    example: 'SUPER_ADMIN',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  role_parent?: string;

  @ApiPropertyOptional({ 
    description: 'ID site tempat role ini berlaku',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  sites_id?: number;

  @ApiPropertyOptional({ 
    description: 'ID user yang mengupdate role ini',
    minimum: 1,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  updatedBy?: number;
}

export class GetRolesQueryDto {
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
    example: 'admin',
    description: 'Search berdasarkan position_name',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiProperty({
    required: false,
    example: 'id',
    description: 'Field untuk sorting',
    enum: ['id', 'role_code', 'position_name', 'createdAt', 'updatedAt'],
    default: 'id',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    required: false,
    example: 'DESC',
    description: 'Urutan sorting',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}

export class SiteDto {
  @ApiProperty({ example: 1, description: 'ID site' })
  id: number;

  @ApiProperty({ example: 'Jakarta Office', description: 'Nama site' })
  site_name: string;

  @ApiProperty({ example: 'JKT', description: 'Kode site' })
  site_code: string;
}

export class RolesResponseDto {
  @ApiProperty({ example: 1, description: 'ID unik role' })
  id: number;

  @ApiProperty({ example: 'ADMIN', description: 'Kode role (unik)' })
  role_code: string;

  @ApiProperty({ example: 'Administrator', description: 'Nama posisi/jabatan' })
  position_name: string;

  @ApiProperty({ 
    example: 'SUPER_ADMIN', 
    description: 'Kode role parent/atasan',
    required: false,
  })
  role_parent?: string;

  @ApiProperty({ example: 1, description: 'ID site tempat role ini berlaku' })
  sites_id: number;

  @ApiProperty({ 
    example: '2024-01-01T00:00:00.000Z', 
    description: 'Waktu pembuatan role' 
  })
  createdAt: Date;

  @ApiProperty({ example: 1, description: 'ID user yang membuat role' })
  createdBy: number;

  @ApiProperty({ 
    example: '2024-01-01T00:00:00.000Z', 
    description: 'Waktu terakhir update role' 
  })
  updatedAt: Date;

  @ApiProperty({ example: 1, description: 'ID user yang terakhir mengupdate role' })
  updatedBy: number;

  @ApiProperty({ 
    type: SiteDto, 
    description: 'Data site yang terkait',
    required: false,
  })
  sites?: SiteDto;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 100, description: 'Total data yang tersedia' })
  total: number;

  @ApiProperty({ example: 1, description: 'Halaman saat ini' })
  page: number;

  @ApiProperty({ example: 10, description: 'Jumlah data per halaman' })
  limit: number;
}

export class RoleListResponseDto {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ example: 'Get roles successfully', description: 'Pesan response' })
  message: string;

  @ApiProperty({ type: [RolesResponseDto], description: 'Array data roles' })
  data: RolesResponseDto[];

  @ApiProperty({ type: PaginationMetaDto, description: 'Informasi pagination' })
  meta: PaginationMetaDto;
}

export class SingleRoleResponseDto {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ example: 'Get role successfully', description: 'Pesan response' })
  message: string;

  @ApiProperty({ type: RolesResponseDto, description: 'Data role' })
  data: RolesResponseDto;
}


