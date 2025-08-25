import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsNumberString,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMenuHasPermissionDto {
  @ApiProperty({
    description: 'ID menu yang akan diberikan permission',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  menu_id: number;

  @ApiProperty({
    description: 'ID permission yang akan diberikan kepada menu',
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

export class UpdateMenuHasPermissionDto {
  @ApiPropertyOptional({
    description: 'ID menu yang akan diberikan permission',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  menu_id?: number;

  @ApiPropertyOptional({
    description: 'ID permission yang akan diberikan kepada menu',
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

export class GetMenuHasPermissionsQueryDto {
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
    description: 'Filter berdasarkan menu ID',
    minimum: 1,
  })
  @IsOptional()
  @IsNumberString()
  menu_id?: string;

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
    enum: ['id', 'menu_id', 'permission_id', 'createdAt', 'updatedAt'],
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

export class MenuDto {
  @ApiProperty({ example: 1, description: 'ID menu' })
  id: number;

  @ApiProperty({ example: 'Dashboard', description: 'Nama menu' })
  name: string;

  @ApiProperty({ example: 'dashboard', description: 'Slug menu' })
  slug: string;

  @ApiProperty({ example: '/dashboard', description: 'URL menu' })
  url: string;

  @ApiProperty({ example: 'fas fa-dashboard', description: 'Icon menu' })
  icon: string;

  @ApiProperty({ example: 1, description: 'Urutan menu' })
  sort_order: number;

  @ApiProperty({ example: 'dashboard', description: 'Module menu' })
  module: string;
}

export class PermissionDto {
  @ApiProperty({ example: 1, description: 'ID permission' })
  id: number;

  @ApiProperty({ example: 'read', description: 'Nama permission' })
  name: string;

  @ApiProperty({
    example: 'Read permission',
    description: 'Deskripsi permission',
  })
  description: string;

  @ApiProperty({ example: 'read', description: 'Slug permission' })
  slug: string;
}

export class MenuHasPermissionResponseDto {
  @ApiProperty({ example: 1, description: 'ID unik menu has permission' })
  id: number;

  @ApiProperty({ example: 1, description: 'ID menu yang memiliki permission' })
  menu_id: number;

  @ApiProperty({ example: 1, description: 'ID permission yang dimiliki menu' })
  permission_id: number;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Waktu pembuatan menu has permission',
  })
  createdAt: Date;

  @ApiProperty({ example: 1, description: 'ID user yang membuat record ini' })
  createdBy: number;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Waktu terakhir update menu has permission',
  })
  updatedAt: Date;

  @ApiProperty({
    example: 1,
    description: 'ID user yang terakhir mengupdate record ini',
  })
  updatedBy: number;

  @ApiProperty({
    type: MenuDto,
    description: 'Data menu yang terkait',
    required: false,
  })
  menu?: MenuDto;

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

export class MenuHasPermissionListResponseDto {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'Get menu permissions successfully',
    description: 'Pesan response',
  })
  message: string;

  @ApiProperty({
    type: [MenuHasPermissionResponseDto],
    description: 'Array data menu has permissions',
  })
  data: MenuHasPermissionResponseDto[];

  @ApiProperty({ type: PaginationMetaDto, description: 'Informasi pagination' })
  meta: PaginationMetaDto;
}

export class SingleMenuHasPermissionResponseDto {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'Get menu permission successfully',
    description: 'Pesan response',
  })
  message: string;

  @ApiProperty({
    type: MenuHasPermissionResponseDto,
    description: 'Data menu has permission',
  })
  data: MenuHasPermissionResponseDto;
}

// DTO untuk response by-menu dengan format yang diminta
export class MenuPermissionDataDto {
  @ApiProperty({ example: 1, description: 'ID permission' })
  permission_id: number;

  @ApiProperty({ example: 'Create', description: 'Nama permission' })
  permission_name: string;

  @ApiProperty({
    example: true,
    description: 'Status apakah permission dimiliki menu',
  })
  has_status: boolean;

  @ApiProperty({
    example: 150,
    description:
      'ID menu has permission (menu_has_permission_id, kolom id di tabel r_menu_has_permission, jika ada kl tidak ada maka null)',
    nullable: true,
  })
  mhp_id: number | null;
}

export class MenuByMenuResponseDto {
  @ApiProperty({
    example: 150,
    description: 'ID menu has permission (bisa null jika belum ada)',
  })
  id: number | null;

  @ApiProperty({ example: 72, description: 'ID menu' })
  menu_id: number;

  @ApiProperty({
    type: [MenuPermissionDataDto],
    description: 'Array data permission dengan status',
  })
  data_permission: MenuPermissionDataDto[];
}

export class MenuByMenuListResponseDto {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'Get menu permissions by menu ID successfully',
    description: 'Pesan response',
  })
  message: string;

  @ApiProperty({
    type: [MenuByMenuResponseDto],
    description: 'Array data menu dengan permissions',
  })
  data: MenuByMenuResponseDto[];
}

// DTO untuk response menu permissions by role
export class MenuPermissionByRoleDto {
  @ApiProperty({ example: 1, description: 'ID permission' })
  permission_id: number;

  @ApiProperty({ example: 'Create', description: 'Nama permission' })
  permission_name: string;

  @ApiProperty({
    example: true,
    description: 'Status apakah role memiliki permission ini',
  })
  role_has_status: boolean;

  @ApiProperty({
    example: 1,
    description: 'ID menu has permission (selalu ada value)',
  })
  mhp_id: number;
}

export class MenuByRoleResponseDto {
  @ApiProperty({ example: 1, description: 'ID menu' })
  menu_id: number;

  @ApiProperty({ example: 'Dashboard', description: 'Nama menu' })
  menu_name: string;

  @ApiProperty({
    type: [MenuPermissionByRoleDto],
    description: 'Array permissions dengan status role',
  })
  has_permission: MenuPermissionByRoleDto[];
}

export class MenuByRoleListResponseDto {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'Get menu permissions successfully',
    description: 'Pesan response',
  })
  message: string;

  @ApiProperty({
    type: [MenuByRoleResponseDto],
    description: 'Array data menu dengan permissions berdasarkan role',
  })
  data: MenuByRoleResponseDto[];
}
