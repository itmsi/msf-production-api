import { 
  IsInt, 
  IsNotEmpty, 
  IsOptional, 
  IsNumberString,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleHasPermissionDto {
  @ApiProperty({ 
    description: 'ID role yang akan diberikan permission', 
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  role_id: number;

  @ApiProperty({ 
    description: 'ID menu has permission yang terkait', 
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  mhp_id: number;

  @ApiProperty({ 
    description: 'ID permission yang akan diberikan kepada role', 
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  permission_id: number;

  @ApiPropertyOptional({ 
    description: 'ID user yang membuat record ini',
    minimum: 1,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  createdBy?: number;
}

export class UpdateRoleHasPermissionDto {
  @ApiPropertyOptional({ 
    description: 'ID role yang akan diberikan permission', 
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  role_id?: number;

  @ApiPropertyOptional({ 
    description: 'ID menu has permission yang terkait', 
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  mhp_id?: number;

  @ApiPropertyOptional({ 
    description: 'ID permission yang akan diberikan kepada role', 
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  permission_id?: number;

  @ApiPropertyOptional({ 
    description: 'ID user yang mengupdate record ini',
    minimum: 1,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  updatedBy?: number;
}

export class GetRoleHasPermissionsQueryDto {
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
    description: 'Filter berdasarkan role ID',
    minimum: 1,
  })
  @IsOptional()
  @IsNumberString()
  role_id?: string;

  @ApiProperty({
    required: false,
    example: '1',
    description: 'Filter berdasarkan menu has permission ID',
    minimum: 1,
  })
  @IsOptional()
  @IsNumberString()
  mhp_id?: string;

  @ApiProperty({
    required: false,
    example: '1',
    description: 'Filter berdasarkan permission ID',
    minimum: 1,
  })
  @IsOptional()
  @IsNumberString()
  permission_id?: string;

  @ApiProperty({
    required: false,
    example: 'id',
    description: 'Field untuk sorting',
    enum: ['id', 'role_id', 'mhp_id', 'permission_id', 'createdAt', 'updatedAt'],
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

export class MenuHasPermissionDto {
  @ApiProperty({ example: 1, description: 'ID menu has permission' })
  id: number;

  @ApiProperty({ example: 1, description: 'ID menu' })
  menu_id: number;

  @ApiProperty({ example: 1, description: 'ID permission' })
  permission_id: number;

  @ApiProperty({ example: 'Dashboard', description: 'Nama menu' })
  menu_name: string;

  @ApiProperty({ example: 'read', description: 'Nama permission' })
  permission_name: string;
}

export class PermissionDto {
  @ApiProperty({ example: 1, description: 'ID permission' })
  id: number;

  @ApiProperty({ example: 'read', description: 'Nama permission' })
  name: string;

  @ApiProperty({ example: 'Read permission', description: 'Deskripsi permission' })
  description: string;

  @ApiProperty({ example: 'read', description: 'Slug permission' })
  slug: string;
}

export class RoleHasPermissionResponseDto {
  @ApiProperty({ example: 1, description: 'ID unik role has permission' })
  id: number;

  @ApiProperty({ example: 1, description: 'ID role yang memiliki permission' })
  role_id: number;

  @ApiProperty({ example: 1, description: 'ID menu has permission yang terkait' })
  mhp_id: number;

  @ApiProperty({ example: 1, description: 'ID permission yang dimiliki role' })
  permission_id: number;

  @ApiProperty({ 
    example: '2024-01-01T00:00:00.000Z', 
    description: 'Waktu pembuatan role has permission' 
  })
  createdAt: Date;

  @ApiProperty({ example: 1, description: 'ID user yang membuat record ini' })
  createdBy: number;

  @ApiProperty({ 
    example: '2024-01-01T00:00:00.000Z', 
    description: 'Waktu terakhir update role has permission' 
  })
  updatedAt: Date;

  @ApiProperty({ example: 1, description: 'ID user yang terakhir mengupdate record ini' })
  updatedBy: number;

  @ApiProperty({ 
    type: RoleDto, 
    description: 'Data role yang terkait',
    required: false,
  })
  role?: RoleDto;

  @ApiProperty({ 
    type: MenuHasPermissionDto, 
    description: 'Data menu has permission yang terkait',
    required: false,
  })
  menuHasPermission?: MenuHasPermissionDto;

  @ApiProperty({ 
    type: PermissionDto, 
    description: 'Data permission yang terkait',
    required: false,
  })
  permission?: PermissionDto;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 100, description: 'Total data yang tersedia' })
  total: number;

  @ApiProperty({ example: 1, description: 'Halaman saat ini' })
  page: number;

  @ApiProperty({ example: 10, description: 'Jumlah data per halaman' })
  limit: number;
}

export class RoleHasPermissionListResponseDto {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ example: 'Get role permissions successfully', description: 'Pesan response' })
  message: string;

  @ApiProperty({ type: [RoleHasPermissionResponseDto], description: 'Array data role has permissions' })
  data: RoleHasPermissionResponseDto[];

  @ApiProperty({ type: PaginationMetaDto, description: 'Informasi pagination' })
  meta: PaginationMetaDto;
}

export class SingleRoleHasPermissionResponseDto {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({ example: 'Get role permission successfully', description: 'Pesan response' })
  message: string;

  @ApiProperty({ type: RoleHasPermissionResponseDto, description: 'Data role has permission' })
  data: RoleHasPermissionResponseDto;
}
