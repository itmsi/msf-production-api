import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ description: 'Nama permission', example: 'Create User' })
  @IsString()
  @IsNotEmpty()
  permission_name: string;

  @ApiProperty({ description: 'Kode permission', example: 'CREATE_USER' })
  @IsString()
  @IsNotEmpty()
  permission_code: string;

  @ApiPropertyOptional({ description: 'Deskripsi permission' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'ID user yang membuat' })
  @IsInt()
  @IsOptional()
  createdBy?: number;
}

export class UpdatePermissionDto {
  @ApiPropertyOptional({
    description: 'Nama permission',
    example: 'Create User',
  })
  @IsString()
  @IsOptional()
  permission_name?: string;

  @ApiPropertyOptional({
    description: 'Kode permission',
    example: 'CREATE_USER',
  })
  @IsString()
  @IsOptional()
  permission_code?: string;

  @ApiPropertyOptional({ description: 'Deskripsi permission' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'ID user yang mengupdate' })
  @IsInt()
  @IsOptional()
  updatedBy?: number;
}

export class PermissionResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  permission_name: string;

  @ApiProperty()
  permission_code: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  createdBy: number;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  updatedBy: number;
}
