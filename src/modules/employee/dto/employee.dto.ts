import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
  IsNumberString,
} from 'class-validator';

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  RESIGN = 'resign',
  ON_LEAVE = 'on-leave',
}

export class CreateEmployeeDto {
  @ApiProperty({ 
    description: 'First name of employee', 
    example: 'John',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ 
    description: 'Last name of employee', 
    example: 'Doe',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ 
    description: 'Department of employee', 
    example: 'IT',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  department: string;

  @ApiProperty({
    description: 'Position of employee',
    example: 'Software Engineer',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  position: string;

  @ApiProperty({ 
    description: 'NIP (Employee ID)', 
    example: 123456789,
    minimum: 100000000,
    maximum: 999999999,
  })
  @IsNumber()
  @Min(100000000)
  nip: number;

  @ApiProperty({
    description: 'Employee status',
    enum: EmployeeStatus,
    example: EmployeeStatus.ACTIVE,
    default: EmployeeStatus.ACTIVE,
  })
  @IsEnum(EmployeeStatus)
  status: EmployeeStatus;

  @ApiProperty({
    description: 'Employee salary',
    example: '5000000',
    required: false,
    minLength: 1,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  salary?: string;
}

export class UpdateEmployeeDto {
  @ApiProperty({
    description: 'First name of employee',
    example: 'John',
    required: false,
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName?: string;

  @ApiProperty({
    description: 'Last name of employee',
    example: 'Doe',
    required: false,
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName?: string;

  @ApiProperty({
    description: 'Department of employee',
    example: 'IT',
    required: false,
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  department?: string;

  @ApiProperty({
    description: 'Position of employee',
    example: 'Software Engineer',
    required: false,
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  position?: string;

  @ApiProperty({
    description: 'NIP (Employee ID)',
    example: 123456789,
    required: false,
    minimum: 100000000,
    maximum: 999999999,
  })
  @IsOptional()
  @IsNumber()
  @Min(100000000)
  nip?: number;

  @ApiProperty({
    description: 'Employee status',
    enum: EmployeeStatus,
    example: EmployeeStatus.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @ApiProperty({
    description: 'Employee salary',
    example: '5000000',
    required: false,
    minLength: 1,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  salary?: string;
}

export class EmployeeResponseDto {
  @ApiProperty({ description: 'Employee ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'First name of employee', example: 'John' })
  firstName: string;

  @ApiProperty({ description: 'Last name of employee', example: 'Doe' })
  lastName: string;

  @ApiProperty({ description: 'Full name of employee', example: 'John Doe' })
  name: string;

  @ApiProperty({ description: 'Department of employee', example: 'IT' })
  department: string;

  @ApiProperty({
    description: 'Position of employee',
    example: 'Software Engineer',
  })
  position: string;

  @ApiProperty({ description: 'NIP (Employee ID)', example: 123456789 })
  nip: number;

  @ApiProperty({
    description: 'Employee status',
    enum: EmployeeStatus,
    example: EmployeeStatus.ACTIVE,
  })
  status: EmployeeStatus;

  @ApiProperty({ description: 'Employee salary', example: '5000000' })
  salary?: string;

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

export class GetEmployeesQueryDto {
  @ApiProperty({ 
    description: 'Page number', 
    example: '1', 
    required: false,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsString()
  @IsNumberString()
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
  @IsNumberString()
  limit?: string;

  @ApiProperty({
    description: 'Search term for name, department, or position',
    required: false,
    minLength: 1,
    example: 'john',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  search?: string;

  @ApiProperty({ 
    description: 'Filter by department', 
    required: false,
    minLength: 1,
    example: 'IT',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  department?: string;

  @ApiProperty({
    description: 'Filter by status',
    enum: EmployeeStatus,
    required: false,
    example: EmployeeStatus.ACTIVE,
  })
  @IsOptional()
  @IsString()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @ApiProperty({
    description: 'Field for sorting',
    enum: ['id', 'firstName', 'lastName', 'department', 'position', 'nip', 'status', 'createdAt', 'updatedAt'],
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

export class EmployeeListResponseDto {
  @ApiProperty({
    example: 200,
    description: 'HTTP status code',
  })
  statusCode: number;

  @ApiProperty({
    example: 'Get employees successfully',
    description: 'Pesan response',
  })
  message: string;

  @ApiProperty({
    type: [EmployeeResponseDto],
    description: 'Array data employee',
  })
  data: EmployeeResponseDto[];

  @ApiProperty({
    type: PaginationMetaDto,
    description: 'Informasi pagination',
  })
  meta: PaginationMetaDto;
}

export class SingleEmployeeResponseDto {
  @ApiProperty({
    example: 200,
    description: 'HTTP status code',
  })
  statusCode: number;

  @ApiProperty({
    example: 'Get employee successfully',
    description: 'Pesan response',
  })
  message: string;

  @ApiProperty({
    type: EmployeeResponseDto,
    description: 'Data employee',
  })
  data: EmployeeResponseDto;
}
