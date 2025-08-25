import { ApiProperty } from '@nestjs/swagger';
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
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'usertest',
    description: 'Username unik yang hanya boleh mengandung huruf dan angka',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @Matches(/^[a-zA-Z0-9]+$/, {
    message:
      'Username hanya boleh mengandung huruf dan angka, tanpa spasi atau simbol',
  })
  username: string;

  @ApiProperty({
    example: '******',
    description: 'Password minimal 6 karakter',
    minLength: 6,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'Email yang valid dan unik',
    maxLength: 100,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 1,
    description: 'ID role yang akan diberikan kepada user ini',
    minimum: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  roleId: number;

  @ApiProperty({
    example: 1,
    description: 'ID employee yang terkait dengan user ini',
    minimum: 1,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  employee_id?: number;
}

export class RoleDto {
  @ApiProperty({ example: 1, description: 'ID role' })
  id: number;

  @ApiProperty({ example: 'ADMIN', description: 'Kode role' })
  role_code: string;

  @ApiProperty({ example: 'Administrator', description: 'Nama posisi/jabatan' })
  position_name: string;
}

export class EmployeeDto {
  @ApiProperty({ example: 1, description: 'ID employee' })
  id: number;

  @ApiProperty({ example: 'John', description: 'Nama depan employee' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Nama belakang employee' })
  lastName: string;

  @ApiProperty({
    example: 'john.doe@company.com',
    description: 'Email employee',
  })
  email: string;
}

export class UserResponseDto {
  @ApiProperty({ example: 1, description: 'ID unik user' })
  id: number;

  @ApiProperty({ example: 'usertest', description: 'Username user' })
  username: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email user' })
  email: string;

  @ApiProperty({ example: true, description: 'Status aktif user' })
  isActive: boolean;

  @ApiProperty({ example: 1, description: 'ID employee yang terkait' })
  employee_id: number;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Waktu pembuatan user',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Waktu terakhir update user',
    required: false,
  })
  updatedAt?: Date;

  @ApiProperty({
    type: [RoleDto],
    description: 'Array role yang dimiliki user',
    required: false,
  })
  roles?: RoleDto[];

  @ApiProperty({
    type: EmployeeDto,
    description: 'Data employee yang terkait',
    required: false,
  })
  employees?: EmployeeDto;
}

export class GetUsersQueryDto {
  @ApiProperty({
    required: false,
    description: 'Page number (default: 1)',
    example: '1',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiProperty({
    required: false,
    description: 'Items per page (default: 10, max: 100)',
    example: '10',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiProperty({
    required: false,
    description: 'Search term untuk username, email, atau nama employee',
    example: 'john',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiProperty({
    required: false,
    description: 'Filter berdasarkan role code',
    example: 'ADMIN',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  role?: string;

  @ApiProperty({
    required: false,
    description: 'Field untuk sorting',
    enum: ['id', 'username', 'email', 'createdAt', 'updatedAt'],
    default: 'id',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    required: false,
    description: 'Urutan sorting',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}

export class PaginationMetaDto {
  @ApiProperty({ example: 100, description: 'Total data yang tersedia' })
  total: number;

  @ApiProperty({ example: 1, description: 'Halaman saat ini' })
  page: number;

  @ApiProperty({ example: 10, description: 'Jumlah data per halaman' })
  limit: number;
}

export class UserListResponseDto {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'Get users successfully',
    description: 'Pesan response',
  })
  message: string;

  @ApiProperty({ type: [UserResponseDto], description: 'Array data users' })
  data: UserResponseDto[];

  @ApiProperty({ type: PaginationMetaDto, description: 'Informasi pagination' })
  meta: PaginationMetaDto;
}

export class SingleUserResponseDto {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'Get user successfully',
    description: 'Pesan response',
  })
  message: string;

  @ApiProperty({ type: UserResponseDto, description: 'Data user' })
  data: UserResponseDto;
}

export class UpdateUserDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'Email yang valid dan unik',
    maxLength: 100,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 1,
    description: 'ID unik dari role yang akan diberikan kepada user',
    minimum: 1,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  roleId?: number;

  @ApiProperty({
    example: 1,
    description: 'ID unik dari employee yang terkait dengan user',
    minimum: 1,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  employee_id?: number;

  @ApiProperty({
    example: 'reset_token_123',
    description: 'Token untuk reset password',
    required: false,
  })
  @IsString()
  @IsOptional()
  reset_password_token?: string | null;

  @ApiProperty({
    example: '2024-12-31T23:59:59.000Z',
    description: 'Expiry time untuk reset password token',
    required: false,
  })
  @Type(() => Date)
  @IsOptional()
  reset_password_expires?: Date | null;
}

export class ForgotPassDto {
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  reset_password_token?: string;

  @Type(() => Date)
  reset_password_expires?: Date;
}

export class DeleteUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Type(() => Boolean)
  @IsNumber()
  isActive: boolean;
}
