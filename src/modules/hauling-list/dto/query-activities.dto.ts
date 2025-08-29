import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryActivitiesDto {
  @ApiPropertyOptional({
    description: 'Nomor halaman',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Jumlah data per halaman',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan nama operation point',
    example: 'OP-001',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan tipe operation point',
    example: 'loading',
    enum: ['loading', 'dumping', 'stockpile'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['loading', 'dumping', 'stockpile'])
  type?: string;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan nama site',
    example: 'Site A',
  })
  @IsOptional()
  @IsString()
  site_name?: string;

  @ApiPropertyOptional({
    description: 'Urutan berdasarkan field',
    example: 'name',
    enum: ['id', 'name', 'type', 'longitude', 'latitude', 'createdAt'],
    default: 'id',
  })
  @IsOptional()
  @IsString()
  @IsIn(['id', 'name', 'type', 'longitude', 'latitude', 'createdAt'])
  orderBy?: string = 'id';

  @ApiPropertyOptional({
    description: 'Urutan ascending atau descending',
    example: 'ASC',
    enum: ['ASC', 'DESC'],
    default: 'ASC',
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  orderDirection?: 'ASC' | 'DESC' = 'ASC';
}
