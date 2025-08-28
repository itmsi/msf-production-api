import { IsDateString, IsString, IsNumber, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHaulingListDto {
  @ApiProperty({ description: 'Tanggal aktivitas', example: '2024-01-15' })
  @IsDateString()
  @IsNotEmpty()
  activity_date: string;

  @ApiProperty({ description: 'Shift', enum: ['ds', 'ns'], example: 'ds' })
  @IsEnum(['ds', 'ns'])
  @IsNotEmpty()
  shift: string;

  @ApiProperty({ description: 'Waktu', example: '2024-01-15T08:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  time: string;

  @ApiProperty({ description: 'ID unit loading', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  unit_loading_id: number;

  @ApiProperty({ description: 'ID unit hauler', example: 2 })
  @IsNumber()
  @IsNotEmpty()
  unit_hauler_id: number;

  @ApiProperty({ description: 'Material', enum: ['biomas', 'boulder', 'ob', 'ore', 'ore-barge', 'quarry'], example: 'ore' })
  @IsEnum(['biomas', 'boulder', 'ob', 'ore', 'ore-barge', 'quarry'])
  @IsNotEmpty()
  material: string;

  @ApiProperty({ description: 'ID loading point', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  loading_point_id: number;

  @ApiPropertyOptional({ description: 'ID dumping point operation', example: 1 })
  @IsNumber()
  @IsOptional()
  dumping_point_op_id?: number;

  @ApiPropertyOptional({ description: 'ID dumping point barge', example: 1 })
  @IsNumber()
  @IsOptional()
  dumping_point_barge_id?: number;

  @ApiProperty({ description: 'Jumlah vessel', example: 5 })
  @IsNumber()
  @IsNotEmpty()
  vessel: number;
}
