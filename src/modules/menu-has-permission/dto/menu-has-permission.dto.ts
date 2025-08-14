import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMenuHasPermissionDto {
  @ApiProperty({ description: 'ID menu', example: 1 })
  @IsInt()
  @IsNotEmpty()
  menu_id: number;

  @ApiProperty({ description: 'ID permission', example: 1 })
  @IsInt()
  @IsNotEmpty()
  permission_id: number;

  @ApiPropertyOptional({ description: 'ID user yang membuat' })
  @IsInt()
  @IsOptional()
  createdBy?: number;
}

export class UpdateMenuHasPermissionDto {
  @ApiPropertyOptional({ description: 'ID menu', example: 1 })
  @IsInt()
  @IsOptional()
  menu_id?: number;

  @ApiPropertyOptional({ description: 'ID permission', example: 1 })
  @IsInt()
  @IsOptional()
  permission_id?: number;

  @ApiPropertyOptional({ description: 'ID user yang mengupdate' })
  @IsInt()
  @IsOptional()
  updatedBy?: number;
}

export class MenuHasPermissionResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  menu_id: number;

  @ApiProperty()
  permission_id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  createdBy: number;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  updatedBy: number;

  @ApiProperty()
  menu?: any;

  @ApiProperty()
  permission?: any;
}
