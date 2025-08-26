import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsNumber,
} from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({
    description: 'Name of department',
    example: 'Information Technology',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Description of department',
    example: 'Handles all IT related activities',
    required: false,
    minLength: 1,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  description?: string;
}

export class UpdateDepartmentDto {
  @ApiProperty({
    description: 'Name of department',
    example: 'Information Technology',
    required: false,
    minLength: 1,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    description: 'Description of department',
    example: 'Handles all IT related activities',
    required: false,
    minLength: 1,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  description?: string;
}

export class DepartmentResponseDto {
  @ApiProperty({ description: 'Department ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Name of department', example: 'Information Technology' })
  name: string;

  @ApiProperty({ description: 'Description of department', example: 'Handles all IT related activities' })
  description?: string;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class GetDepartmentsQueryDto {
  @ApiProperty({
    description: 'Page number',
    example: '1',
    required: false,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiProperty({
    description: 'Items per page',
    example: '10',
    required: false,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @IsString()
  limit?: string;

  @ApiProperty({
    description: 'Search term for name or description',
    required: false,
    minLength: 1,
    example: 'IT',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  search?: string;

  @ApiProperty({
    description: 'Field for sorting',
    enum: ['id', 'name', 'description', 'createdAt', 'updatedAt'],
    required: false,
    default: 'id',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    required: false,
    default: 'DESC',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}
