import { IsOptional, IsString, IsDateString, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class QueryHaulingListDto {
  @ApiPropertyOptional({ description: 'Nomor halaman', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Jumlah data per halaman', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Filter berdasarkan tanggal aktivitas' })
  @IsOptional()
  @IsDateString()
  activity_date?: string;

  @ApiPropertyOptional({ description: 'Filter berdasarkan shift' })
  @IsOptional()
  @IsString()
  shift?: string;

  @ApiPropertyOptional({ description: 'Filter berdasarkan material' })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({ description: 'Filter berdasarkan unit loading' })
  @IsOptional()
  @IsString()
  unit_loading_name?: string;

  @ApiPropertyOptional({ description: 'Filter berdasarkan unit hauler' })
  @IsOptional()
  @IsString()
  unit_hauler_name?: string;
}
