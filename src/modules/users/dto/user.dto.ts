import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
  IsOptional,
  IsNumberString,
  Matches,
} from 'class-validator';
import { JoinColumn, ManyToOne } from 'typeorm';

export class CreateUserDto {
  @ApiProperty({ example: 'usertest' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9]+$/, {
    message:
      'Username hanya boleh mengandung huruf dan angka, tanpa spasi atau simbol',
  })
  username: string;

  @ApiProperty({ example: '******' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'User Example' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  roleId: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  employee_id: number;
}

export class UserResponseDto {
  id: number;
  username: string;
  name: string;
  email: string;
  roleId: number;
  employee_id: number;
  roles?: any;
  meta?: any;
}

export class GetUsersQueryDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  search?: string;

  @IsOptional()
  role?: string;
}

export class UpdateUserDto {
  @ApiProperty({ example: 'usertest' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 1, description: 'ID unik dari role.' })
  @Type(() => Number)
  @IsNumber()
  roleId?: number;

  @ApiProperty({
    example: 1,
    description: 'ID unik dari employee.',
  })
  @Type(() => Number)
  @IsNumber()
  employee_id?: number;

  @IsString()
  @IsOptional()
  reset_password_token?: string | null;

  @Type(() => Date)
  @IsOptional()
  reset_password_expires?: Date | null;
}
export class ForgotPassDto {
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  reset_password_token?: string;

  @Type(() => Date)
  reset_password_expires?: Date;
}

export class DeleteUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Type(() => Boolean)
  @IsNumber()
  isActive: boolean;
}
