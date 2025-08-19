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

export class MenuResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  parent_id: number;

  @ApiProperty()
  menu_name: string;

  @ApiProperty()
  menu_code: string;

  @ApiProperty()
  icon: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  is_parent: boolean;

  @ApiProperty()
  sort_order: number;

  @ApiProperty()
  status: MenuStatus;

  @ApiProperty()
  module: MenuModuleType;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  createdBy: number;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  updatedBy: number;

  @ApiProperty()
  children?: MenuResponseDto[];

  @ApiProperty()
  permissions?: any[];
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
