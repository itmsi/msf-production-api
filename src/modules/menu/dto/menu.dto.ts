import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  IsEnum,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MenuStatus, MenuModuleType } from '../entities/menu.entity';

export class CreateMenuDto {
  @ApiPropertyOptional({
    description:
      'ID menu parent (null untuk menu root, atau ID menu yang valid untuk sub-menu). ⚠️ Gunakan null untuk menu root, jangan gunakan 0',
    example: null,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  parent_id?: number | null;

  @ApiProperty({
    description: 'Nama menu',
    example: 'User Management',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  menu_name: string;

  @ApiProperty({
    description: 'Kode menu (harus unik)',
    example: 'USER_MANAGEMENT',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  menu_code: string;

  @ApiPropertyOptional({
    description: 'Icon menu (Material Icons)',
    example: 'user',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({
    description: 'URL menu',
    example: '/users',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({
    description: 'Apakah menu parent (true jika memiliki sub-menu)',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_parent?: boolean;

  @ApiPropertyOptional({
    description: 'Urutan menu (ascending)',
    example: 1,
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  sort_order?: number;

  @ApiPropertyOptional({
    description: 'Status menu',
    enum: MenuStatus,
    example: MenuStatus.ACTIVE,
    default: MenuStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(MenuStatus)
  status?: MenuStatus;

  @ApiPropertyOptional({
    description: 'Module menu',
    enum: MenuModuleType,
    example: MenuModuleType.PRODUCTION,
    default: MenuModuleType.PRODUCTION,
  })
  @IsOptional()
  @IsEnum(MenuModuleType)
  module?: MenuModuleType;

  @ApiPropertyOptional({
    description:
      'ID user yang membuat (akan diisi otomatis jika tidak disediakan)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  createdBy?: number;

  @ApiPropertyOptional({
    description:
      'Array permission IDs untuk menu ini (opsional). Permission ID harus ada di database',
    type: [Number],
    example: [1, 2, 3],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  permissionIds?: number[];
}

export class UpdateMenuDto {
  @ApiPropertyOptional({ description: 'ID menu parent' })
  @IsInt()
  @IsOptional()
  parent_id?: number;

  @ApiPropertyOptional({ description: 'Nama menu', example: 'User Management' })
  @IsString()
  @IsOptional()
  menu_name?: string;

  @ApiPropertyOptional({ description: 'Kode menu', example: 'USER_MANAGEMENT' })
  @IsString()
  @IsOptional()
  menu_code?: string;

  @ApiPropertyOptional({ description: 'Icon menu', example: 'user' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ description: 'URL menu', example: '/users' })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({ description: 'Apakah menu parent', example: false })
  @IsBoolean()
  @IsOptional()
  is_parent?: boolean;

  @ApiPropertyOptional({ description: 'Urutan menu', example: 1 })
  @IsInt()
  @IsOptional()
  sort_order?: number;

  @ApiPropertyOptional({ description: 'Status menu', enum: MenuStatus })
  @IsEnum(MenuStatus)
  @IsOptional()
  status?: MenuStatus;

  @ApiPropertyOptional({ description: 'Module menu', enum: MenuModuleType })
  @IsEnum(MenuModuleType)
  @IsOptional()
  module?: MenuModuleType;

  @ApiPropertyOptional({ description: 'ID user yang mengupdate' })
  @IsInt()
  @IsOptional()
  updatedBy?: number;

  @ApiPropertyOptional({ description: 'Array permission IDs', type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  permissionIds?: number[];
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

export class MenuResponseDto {
  @ApiProperty({ example: 1, description: 'ID unik menu' })
  id: number;

  @ApiProperty({
    example: null,
    description: 'ID menu parent (null untuk menu root)',
    nullable: true,
  })
  parent_id: number | null;

  @ApiProperty({ example: 'User Management', description: 'Nama menu' })
  menu_name: string;

  @ApiProperty({ example: 'USER_MANAGEMENT', description: 'Kode menu (unik)' })
  menu_code: string;

  @ApiProperty({ example: 'user', description: 'Icon menu' })
  icon: string;

  @ApiProperty({ example: '/users', description: 'URL menu' })
  url: string;

  @ApiProperty({ example: false, description: 'Apakah menu parent' })
  is_parent: boolean;

  @ApiProperty({ example: 1, description: 'Urutan menu' })
  sort_order: number;

  @ApiProperty({
    example: MenuStatus.ACTIVE,
    description: 'Status menu',
    enum: MenuStatus,
  })
  status: MenuStatus;

  @ApiProperty({
    example: MenuModuleType.PRODUCTION,
    description: 'Module menu',
    enum: MenuModuleType,
  })
  module: MenuModuleType;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Waktu pembuatan menu',
  })
  createdAt: Date;

  @ApiProperty({ example: 1, description: 'ID user yang membuat menu' })
  createdBy: number;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Waktu terakhir update menu',
  })
  updatedAt: Date;

  @ApiProperty({
    example: 1,
    description: 'ID user yang terakhir mengupdate menu',
  })
  updatedBy: number;

  @ApiProperty({
    type: [MenuResponseDto],
    description: 'Sub-menu (children)',
    required: false,
  })
  children?: MenuResponseDto[];

  @ApiProperty({
    type: [PermissionDto],
    description: 'Permissions yang dimiliki menu',
    required: false,
  })
  permissions?: PermissionDto[];
}

export class PaginationMetaDto {
  @ApiProperty({ example: 100, description: 'Total data yang tersedia' })
  total: number;

  @ApiProperty({ example: 1, description: 'Halaman saat ini' })
  page: number;

  @ApiProperty({ example: 10, description: 'Jumlah data per halaman' })
  limit: number;
}

export class MenuListResponseDto {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'Get menus successfully',
    description: 'Pesan response',
  })
  message: string;

  @ApiProperty({ type: [MenuResponseDto], description: 'Array data menus' })
  data: MenuResponseDto[];

  @ApiProperty({ type: PaginationMetaDto, description: 'Informasi pagination' })
  meta: PaginationMetaDto;
}

export class SingleMenuResponseDto {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'Get menu successfully',
    description: 'Pesan response',
  })
  message: string;

  @ApiProperty({ type: MenuResponseDto, description: 'Data menu' })
  data: MenuResponseDto;
}

export class GetMenusQueryDto {
  @ApiPropertyOptional({ description: 'Page number', example: '1' })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ description: 'Items per page', example: '10' })
  @IsOptional()
  @IsString()
  limit?: string;

  @ApiPropertyOptional({
    description: 'Search term for menu_name or menu_code',
    example: 'user',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by module',
    enum: MenuModuleType,
    example: MenuModuleType.PRODUCTION,
  })
  @IsOptional()
  @IsEnum(MenuModuleType)
  module?: MenuModuleType;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: MenuStatus,
    example: MenuStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(MenuStatus)
  status?: MenuStatus;

  @ApiPropertyOptional({ description: 'Filter by is_parent', example: true })
  @IsOptional()
  @IsBoolean()
  is_parent?: boolean;

  @ApiPropertyOptional({ description: 'Filter by parent_id', example: 1 })
  @IsOptional()
  @IsInt()
  parent_id?: number;

  @ApiPropertyOptional({ description: 'Sort by field', example: 'sort_order' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort order', example: 'ASC' })
  @IsOptional()
  @IsString()
  sortOrder?: string;
}
