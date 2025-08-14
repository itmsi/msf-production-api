import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, IsDateString } from 'class-validator';

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  RESIGN = 'resign',
  ON_LEAVE = 'on-leave',
}

export class CreateEmployeeDto {
  @ApiProperty({ description: 'First name of employee', example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name of employee', example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Department of employee', example: 'IT' })
  @IsString()
  department: string;

  @ApiProperty({ description: 'Position of employee', example: 'Software Engineer' })
  @IsString()
  position: string;

  @ApiProperty({ description: 'NIP (Employee ID)', example: 123456789 })
  @IsNumber()
  nip: number;

  @ApiProperty({ 
    description: 'Employee status', 
    enum: EmployeeStatus,
    example: EmployeeStatus.ACTIVE 
  })
  @IsEnum(EmployeeStatus)
  status: EmployeeStatus;

  @ApiProperty({ description: 'Employee salary', example: '5000000', required: false })
  @IsOptional()
  @IsString()
  salary?: string;
}

export class UpdateEmployeeDto {
  @ApiProperty({ description: 'First name of employee', example: 'John', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ description: 'Last name of employee', example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ description: 'Department of employee', example: 'IT', required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ description: 'Position of employee', example: 'Software Engineer', required: false })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({ description: 'NIP (Employee ID)', example: 123456789, required: false })
  @IsOptional()
  @IsNumber()
  nip?: number;

  @ApiProperty({ 
    description: 'Employee status', 
    enum: EmployeeStatus,
    example: EmployeeStatus.ACTIVE,
    required: false 
  })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @ApiProperty({ description: 'Employee salary', example: '5000000', required: false })
  @IsOptional()
  @IsString()
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

  @ApiProperty({ description: 'Position of employee', example: 'Software Engineer' })
  position: string;

  @ApiProperty({ description: 'NIP (Employee ID)', example: 123456789 })
  nip: number;

  @ApiProperty({ 
    description: 'Employee status', 
    enum: EmployeeStatus,
    example: EmployeeStatus.ACTIVE 
  })
  status: EmployeeStatus;

  @ApiProperty({ description: 'Employee salary', example: '5000000' })
  salary?: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

export class GetEmployeesQueryDto {
  @ApiProperty({ description: 'Page number', example: 1, required: false })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiProperty({ description: 'Items per page', example: 10, required: false })
  @IsOptional()
  @IsString()
  limit?: string;

  @ApiProperty({ description: 'Search term for name, department, or position', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Filter by department', required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ description: 'Filter by status', enum: EmployeeStatus, required: false })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;
}
