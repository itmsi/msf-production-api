import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserRoleDto {
  @ApiProperty({ description: 'ID user', example: 1 })
  @IsInt()
  @IsNotEmpty()
  user_id: number;

  @ApiProperty({ description: 'ID role', example: 1 })
  @IsInt()
  @IsNotEmpty()
  role_id: number;

  @ApiPropertyOptional({ description: 'ID user yang membuat' })
  @IsInt()
  @IsOptional()
  createdBy?: number;
}

export class UpdateUserRoleDto {
  @ApiPropertyOptional({ description: 'ID user', example: 1 })
  @IsInt()
  @IsOptional()
  user_id?: number;

  @ApiPropertyOptional({ description: 'ID role', example: 1 })
  @IsInt()
  @IsOptional()
  role_id?: number;

  @ApiPropertyOptional({ description: 'ID user yang mengupdate' })
  @IsInt()
  @IsOptional()
  updatedBy?: number;
}

export class UserRoleResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  user_id: number;

  @ApiProperty()
  role_id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  createdBy: number;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  updatedBy: number;

  @ApiProperty()
  user?: any;

  @ApiProperty()
  role?: any;
}
