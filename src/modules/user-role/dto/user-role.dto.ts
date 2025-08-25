import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsNumberString,
  IsString,
  MinLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserRoleDto {
  @ApiProperty({
    description: 'ID user yang akan diberikan role',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  user_id: number;

  @ApiProperty({
    description: 'ID role yang akan diberikan kepada user',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  role_id: number;

  @ApiPropertyOptional({
    description: 'ID user yang membuat record ini',
    minimum: 1,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  createdBy?: number;
}

export class UpdateUserRoleDto {
  @ApiPropertyOptional({
    description: 'ID user yang akan diberikan role',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  user_id?: number;

  @ApiPropertyOptional({
    description: 'ID role yang akan diberikan kepada user',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  role_id?: number;

  @ApiPropertyOptional({
    description: 'ID user yang mengupdate record ini',
    minimum: 1,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  updatedBy?: number;
}

export class AssignRoleDto {
  @ApiProperty({
    description: 'ID user yang akan diberikan role',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  user_id: number;

  @ApiProperty({
    description: 'ID role yang akan diberikan kepada user',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  role_id: number;
}

export class RemoveRoleDto {
  @ApiProperty({
    description: 'ID user yang akan dicabut rolenya',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  user_id: number;

  @ApiProperty({
    description: 'ID role yang akan dicabut dari user',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  role_id: number;
}

export class GetUserRolesQueryDto {
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
    example: '1',
    description: 'Filter berdasarkan user ID',
    minimum: 1,
  })
  @IsOptional()
  @IsNumberString()
  user_id?: string;

  @ApiProperty({
    required: false,
    example: '1',
    description: 'Filter berdasarkan role ID',
    minimum: 1,
  })
  @IsOptional()
  @IsNumberString()
  role_id?: string;

  @ApiProperty({
    required: false,
    example: 'user.name',
    description: 'Field untuk sorting',
    enum: ['id', 'user_id', 'role_id', 'createdAt', 'updatedAt'],
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

export class UserDto {
  @ApiProperty({ example: 1, description: 'ID user' })
  id: number;

  @ApiProperty({ example: 'john@example.com', description: 'Email user' })
  email: string;

  @ApiProperty({ example: 'John Doe', description: 'Nama lengkap user' })
  name: string;

  @ApiProperty({ example: 'active', description: 'Status user' })
  status: string;
}

export class RoleDto {
  @ApiProperty({ example: 1, description: 'ID role' })
  id: number;

  @ApiProperty({ example: 'Admin', description: 'Nama role' })
  name: string;

  @ApiProperty({ example: 'Administrator role', description: 'Deskripsi role' })
  description: string;

  @ApiProperty({ example: 'admin', description: 'Slug role' })
  slug: string;
}

export class UserRoleResponseDto {
  @ApiProperty({ example: 1, description: 'ID unik user role' })
  id: number;

  @ApiProperty({ example: 1, description: 'ID user yang memiliki role' })
  user_id: number;

  @ApiProperty({ example: 1, description: 'ID role yang dimiliki user' })
  role_id: number;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Waktu pembuatan user role',
  })
  createdAt: Date;

  @ApiProperty({ example: 1, description: 'ID user yang membuat record ini' })
  createdBy: number;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Waktu terakhir update user role',
  })
  updatedAt: Date;

  @ApiProperty({
    example: 1,
    description: 'ID user yang terakhir mengupdate record ini',
  })
  updatedBy: number;

  @ApiProperty({
    type: UserDto,
    description: 'Data user yang terkait',
    required: false,
  })
  user?: UserDto;

  @ApiProperty({
    type: RoleDto,
    description: 'Data role yang terkait',
    required: false,
  })
  role?: RoleDto;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 100, description: 'Total data yang tersedia' })
  total: number;

  @ApiProperty({ example: 1, description: 'Halaman saat ini' })
  page: number;

  @ApiProperty({ example: 10, description: 'Jumlah data per halaman' })
  limit: number;
}

export class UserRoleListResponseDto {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'Get user roles successfully',
    description: 'Pesan response',
  })
  message: string;

  @ApiProperty({
    type: [UserRoleResponseDto],
    description: 'Array data user roles',
  })
  data: UserRoleResponseDto[];

  @ApiProperty({ type: PaginationMetaDto, description: 'Informasi pagination' })
  meta: PaginationMetaDto;
}

export class SingleUserRoleResponseDto {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'Get user role successfully',
    description: 'Pesan response',
  })
  message: string;

  @ApiProperty({ type: UserRoleResponseDto, description: 'Data user role' })
  data: UserRoleResponseDto;
}
