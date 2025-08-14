import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleHasPermissionDto {
  @ApiProperty({ description: 'ID role', example: 1 })
  @IsInt()
  @IsNotEmpty()
  role_id: number;

  @ApiProperty({ description: 'ID menu has permission', example: 1 })
  @IsInt()
  @IsNotEmpty()
  mhp_id: number;

  @ApiProperty({ description: 'ID permission', example: 1 })
  @IsInt()
  @IsNotEmpty()
  permission_id: number;

  @ApiPropertyOptional({ description: 'ID user yang membuat' })
  @IsInt()
  @IsOptional()
  createdBy?: number;
}

export class UpdateRoleHasPermissionDto {
  @ApiPropertyOptional({ description: 'ID role', example: 1 })
  @IsInt()
  @IsOptional()
  role_id?: number;

  @ApiPropertyOptional({ description: 'ID menu has permission', example: 1 })
  @IsInt()
  @IsOptional()
  mhp_id?: number;

  @ApiPropertyOptional({ description: 'ID permission', example: 1 })
  @IsInt()
  @IsOptional()
  permission_id?: number;

  @ApiPropertyOptional({ description: 'ID user yang mengupdate' })
  @IsInt()
  @IsOptional()
  updatedBy?: number;
}

export class RoleHasPermissionResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  role_id: number;

  @ApiProperty()
  mhp_id: number;

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
  role?: any;

  @ApiProperty()
  menuHasPermission?: any;

  @ApiProperty()
  permission?: any;
}
