import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsInt, 
  IsNumberString,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ 
    description: 'Nama permission yang akan dibuat', 
    example: 'Create User',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  permission_name: string;

  @ApiProperty({ 
    description: 'Kode permission yang harus unik', 
    example: 'CREATE_USER',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  permission_code: string;

  @ApiPropertyOptional({ 
    description: 'Deskripsi detail permission',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ 
    description: 'ID user yang membuat permission ini',
    minimum: 1,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  createdBy?: number;
}

export class UpdatePermissionDto {
  @ApiPropertyOptional({
    description: 'Nama permission yang akan diupdate',
    example: 'Create User',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(100)
  permission_name?: string;

  @ApiPropertyOptional({
    description: 'Kode permission yang harus unik',
    example: 'CREATE_USER',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  permission_code?: string;

  @ApiPropertyOptional({ 
    description: 'Deskripsi detail permission',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ 
    description: 'ID user yang mengupdate permission ini',
    minimum: 1,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  updatedBy?: number;
}

export class GetPermissionsQueryDto {
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
    example: 'user',
    description: 'Search berdasarkan permission_name atau permission_code',
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
    enum: ['id', 'permission_name', 'permission_code', 'createdAt', 'updatedAt'],
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

export class PermissionResponseDto {
  @ApiProperty({ example: 1, description: 'ID unik permission' })
  id: number;

  @ApiProperty({ example: 'Create User', description: 'Nama permission' })
  permission_name: string;

  @ApiProperty({ example: 'CREATE_USER', description: 'Kode permission (unik)' })
  permission_code: string;

  @ApiProperty({ 
    example: 'Permission untuk membuat user baru', 
    description: 'Deskripsi permission',
    required: false,
  })
  description: string;

  @ApiProperty({ 
    example: '2024-01-01T00:00:00.000Z', 
    description: 'Waktu pembuatan permission' 
  })
  createdAt: Date;

  @ApiProperty({ example: 1, description: 'ID user yang membuat permission' })
  createdBy: number;

  @ApiProperty({ 
    example: '2024-01-01T00:00:00.000Z', 
    description: 'Waktu terakhir update permission' 
  })
  updatedAt: Date;

  @ApiProperty({ example: 1, description: 'ID user yang terakhir mengupdate permission' })
  updatedBy: number;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 100, description: 'Total data yang tersedia' })
  total: number;

  @ApiProperty({ example: 1, description: 'Halaman saat ini' })
  page: number;

  @ApiProperty({ example: 10, description: 'Jumlah data per halaman' })
  limit: number;
}

export class PermissionListResponseDto {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ example: 'Get permissions successfully', description: 'Pesan response' })
  message: string;

  @ApiProperty({ type: [PermissionResponseDto], description: 'Array data permissions' })
  data: PermissionResponseDto[];

  @ApiProperty({ type: PaginationMetaDto, description: 'Informasi pagination' })
  meta: PaginationMetaDto;
}

export class SinglePermissionResponseDto {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ example: 'Get permission successfully', description: 'Pesan response' })
  message: string;

  @ApiProperty({ type: PermissionResponseDto, description: 'Data permission' })
  data: PermissionResponseDto;
}
