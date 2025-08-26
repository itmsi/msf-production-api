import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

// Create DTO
export class CreateDepartmentDto {
  @ApiProperty({
    description: 'Nama department',
    example: 'Human Resources',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'Nama department tidak boleh kosong' })
  @MaxLength(255, { message: 'Nama department tidak boleh lebih dari 255 karakter' })
  name: string;
}

// Update DTO
export class UpdateDepartmentDto {
  @ApiPropertyOptional({
    description: 'Nama department',
    example: 'Human Resources Updated',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Nama department tidak boleh kosong' })
  @MaxLength(255, { message: 'Nama department tidak boleh lebih dari 255 karakter' })
  name?: string;
}

// Response DTO
export class DepartmentResponseDto {
  @ApiProperty({
    description: 'ID Department',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nama department',
    example: 'Human Resources',
  })
  name: string;

  @ApiProperty({
    description: 'Tanggal dibuat',
    example: '2024-01-15T08:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Tanggal diupdate',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}

// Query DTO
export class GetDepartmentsQueryDto {
  @ApiPropertyOptional({
    description: 'Nomor halaman',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page harus berupa angka' })
  @Min(1, { message: 'Page minimal 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Jumlah data per halaman',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit harus berupa angka' })
  @Min(1, { message: 'Limit minimal 1' })
  @Max(100, { message: 'Limit maksimal 100' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Kata kunci pencarian berdasarkan nama department',
    example: 'human',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Field untuk sorting',
    example: 'name',
    enum: ['id', 'name', 'createdAt', 'updatedAt'],
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'id';

  @ApiPropertyOptional({
    description: 'Urutan sorting',
    example: 'ASC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}