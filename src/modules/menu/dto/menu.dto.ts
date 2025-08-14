import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MenuStatus } from '../entities/menu.entity';

export class CreateMenuDto {
  @ApiPropertyOptional({ description: 'ID menu parent' })
  @IsInt()
  @IsOptional()
  parent_id?: number;

  @ApiProperty({ description: 'Nama menu', example: 'User Management' })
  @IsString()
  @IsNotEmpty()
  menu_name: string;

  @ApiProperty({ description: 'Kode menu', example: 'USER_MANAGEMENT' })
  @IsString()
  @IsNotEmpty()
  menu_code: string;

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

  @ApiPropertyOptional({ description: 'Status menu', enum: MenuStatus, example: MenuStatus.ACTIVE })
  @IsEnum(MenuStatus)
  @IsOptional()
  status?: MenuStatus;

  @ApiPropertyOptional({ description: 'ID user yang membuat' })
  @IsInt()
  @IsOptional()
  createdBy?: number;

  @ApiPropertyOptional({ description: 'Array permission IDs', type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
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
