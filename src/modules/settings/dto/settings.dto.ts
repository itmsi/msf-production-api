import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsNumberString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SettingsResponseDto {
  @ApiProperty({ example: 1, description: 'ID unik settings' })
  id: number;
  @ApiProperty({ example: 'name', description: 'Specification Name' })
  name: string;
  @ApiProperty({ example: 'description', description: 'Penjelasan nama' })
  description: string;
  type?: string;
  value: string;
}
