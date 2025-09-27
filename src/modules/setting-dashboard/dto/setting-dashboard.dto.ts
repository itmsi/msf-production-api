import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class CreateSettingDashboardDto {
  @ApiProperty({
    example: 10.5,
    description: 'Cycle time dalam menit',
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @IsPositive()
  cycle_time?: number;

  @ApiProperty({
    example: 0.85,
    description: 'Fuel ratio (0-1)',
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @IsPositive()
  fuel_ratio?: number;

  @ApiProperty({
    example: 25.0,
    description: 'Speed dalam km/h',
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @IsPositive()
  speed?: number;
}

export class UpdateSettingDashboardDto {
  @ApiProperty({
    example: 10.5,
    description: 'Cycle time dalam menit',
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @IsPositive()
  cycle_time?: number;

  @ApiProperty({
    example: 0.85,
    description: 'Fuel ratio (0-1)',
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @IsPositive()
  fuel_ratio?: number;

  @ApiProperty({
    example: 25.0,
    description: 'Speed dalam km/h',
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @IsPositive()
  speed?: number;
}

export class SettingDashboardResponseDto {
  @ApiProperty({ example: 1, description: 'ID setting dashboard' })
  id: number;

  @ApiProperty({ example: 10.5, description: 'Cycle time dalam menit' })
  cycle_time: number;

  @ApiProperty({ example: 0.85, description: 'Fuel ratio (0-1)' })
  fuel_ratio: number;

  @ApiProperty({ example: 25.0, description: 'Speed dalam km/h' })
  speed: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Tanggal dibuat' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Tanggal diupdate' })
  updatedAt: Date;
}

export class SettingDashboardListResponseDto {
  @ApiProperty({ example: 200, description: 'Status code' })
  statusCode: number;

  @ApiProperty({ example: 'Data berhasil diambil', description: 'Pesan response' })
  message: string;

  @ApiProperty({ type: [SettingDashboardResponseDto], description: 'Data setting dashboard' })
  data: SettingDashboardResponseDto[];

  @ApiProperty({
    example: { total: 1, page: 1, limit: 10 },
    description: 'Metadata pagination',
    required: false,
  })
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export class SingleSettingDashboardResponseDto {
  @ApiProperty({ example: 200, description: 'Status code' })
  statusCode: number;

  @ApiProperty({ example: 'Data berhasil diambil', description: 'Pesan response' })
  message: string;

  @ApiProperty({ type: SettingDashboardResponseDto, description: 'Data setting dashboard' })
  data: SettingDashboardResponseDto;
}
