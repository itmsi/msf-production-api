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
  role_code: string;

  @IsString()
  @IsNotEmpty()
  position_name: string;

  @IsString()
  @IsOptional()
  role_parent: string;

  @IsNumber()
  @IsOptional()
  sites_id: number;
}

export class RolesResponseDto {
  id: number;
  role_code: string;
  position_name: string;
  role_parent: string;
  sites_id: number;
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
  @IsOptional()
  role_code: string;

  @IsString()
  @IsOptional()
  position_name: string;

  @IsString()
  @IsOptional()
  role_parent: string;

  @IsNumber()
  @IsOptional()
  sites_id: number;
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
