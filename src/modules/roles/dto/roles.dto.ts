import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
  IsOptional,
  IsNumberString,
} from 'class-validator';
import { JoinColumn, ManyToOne } from 'typeorm';

export class CreateRolesDto {
  @IsString()
  @IsNotEmpty()
  roleCode: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Number)
  @IsNumber()
  role_parent: number;
}

export class RolesResponseDto {
  id: number;
  roleCode: string;
  name: string;
  role_parent: number;
  meta?: any;
}

export class GetRolesQueryDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  search?: string;
}

export class UpdateRolesDto {
  @IsString()
  @IsNotEmpty()
  roleCode: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Number)
  @IsNumber()
  role_parent: number;
}

// export class DeleteUserDto {
//   @IsString()
//   @IsNotEmpty()
//   name: string;

//   @IsEmail()
//   @IsNotEmpty()
//   email: string;

//   @Type(() => Boolean)
//   @IsNumber()
//   isActive: boolean;
// }
