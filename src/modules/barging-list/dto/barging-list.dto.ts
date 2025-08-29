import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum ShiftType {
  DS = 'ds',
  NS = 'ns',
}

export class CreateBargingListDto {
  @ApiProperty({
    description: 'Tanggal aktivitas barging',
    example: '2025-01-15',
  })
  @IsNotEmpty({ message: 'Activity date tidak boleh kosong' })
  @IsDateString({}, { message: 'Activity date harus berupa tanggal yang valid' })
  activity_date: string;

  @ApiProperty({
    description: 'Shift kerja',
    enum: ShiftType,
    example: 'ds',
  })
  @IsNotEmpty({ message: 'Shift tidak boleh kosong' })
  @IsEnum(ShiftType, { message: 'Shift harus berupa ds atau ns' })
  shift: ShiftType;

  @ApiProperty({
    description: 'Waktu aktivitas',
    example: '2025-01-15T08:00:00.000Z',
  })
  @IsNotEmpty({ message: 'Time tidak boleh kosong' })
  @IsDateString({}, { message: 'Time harus berupa timestamp yang valid' })
  time: string;

  @ApiProperty({
    description: 'ID unit hauler dari tabel m_population',
    example: 1,
  })
  @IsNotEmpty({ message: 'Unit hauler ID tidak boleh kosong' })
  @IsInt({ message: 'Unit hauler ID harus berupa angka' })
  @Min(1, { message: 'Unit hauler ID harus lebih dari 0' })
  @Transform(({ value }) => parseInt(value))
  unit_hauler_id: number;

  @ApiProperty({
    description: 'ID barge dari tabel m_barge',
    example: 1,
  })
  @IsNotEmpty({ message: 'Barge ID tidak boleh kosong' })
  @IsInt({ message: 'Barge ID harus berupa angka' })
  @Min(1, { message: 'Barge ID harus lebih dari 0' })
  @Transform(({ value }) => parseInt(value))
  barge_id: number;

  @ApiProperty({
    description: 'Jumlah vessel',
    example: 5,
  })
  @IsNotEmpty({ message: 'Vessel tidak boleh kosong' })
  @IsInt({ message: 'Vessel harus berupa angka' })
  @IsPositive({ message: 'Vessel harus lebih dari 0' })
  @Transform(({ value }) => parseInt(value))
  vessel: number;
}

export class UpdateBargingListDto {
  @ApiPropertyOptional({
    description: 'Tanggal aktivitas barging',
    example: '2025-01-15',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Activity date harus berupa tanggal yang valid' })
  activity_date?: string;

  @ApiPropertyOptional({
    description: 'Shift kerja',
    enum: ShiftType,
    example: 'ds',
  })
  @IsOptional()
  @IsEnum(ShiftType, { message: 'Shift harus berupa ds atau ns' })
  shift?: ShiftType;

  @ApiPropertyOptional({
    description: 'Waktu aktivitas',
    example: '2025-01-15T08:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Time harus berupa timestamp yang valid' })
  time?: string;

  @ApiPropertyOptional({
    description: 'ID unit hauler dari tabel m_population',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Unit hauler ID harus berupa angka' })
  @Min(1, { message: 'Unit hauler ID harus lebih dari 0' })
  @Transform(({ value }) => parseInt(value))
  unit_hauler_id?: number;

  @ApiPropertyOptional({
    description: 'ID barge dari tabel m_barge',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Barge ID harus berupa angka' })
  @Min(1, { message: 'Barge ID harus lebih dari 0' })
  @Transform(({ value }) => parseInt(value))
  barge_id?: number;

  @ApiPropertyOptional({
    description: 'Jumlah vessel',
    example: 5,
  })
  @IsOptional()
  @IsInt({ message: 'Vessel harus berupa angka' })
  @IsPositive({ message: 'Vessel harus lebih dari 0' })
  @Transform(({ value }) => parseInt(value))
  vessel?: number;
}

export class BargingListResponseDto {
  @ApiProperty({
    description: 'ID barging list',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Tanggal aktivitas barging',
    example: '2025-01-15',
  })
  activity_date: string;

  @ApiProperty({
    description: 'Shift kerja',
    example: 'ds',
  })
  shift: string;

  @ApiProperty({
    description: 'Waktu aktivitas',
    example: '2025-01-15T08:00:00.000Z',
  })
  time: string;

  @ApiProperty({
    description: 'ID unit hauler',
    example: 1,
  })
  unit_hauler_id: number;

  @ApiProperty({
    description: 'Nama unit hauler dari tabel m_population',
    example: 'DT-001',
  })
  unit_hauler_name: string;

  @ApiProperty({
    description: 'ID barge',
    example: 1,
  })
  barge_id: number;

  @ApiProperty({
    description: 'Nama barge dari tabel m_barge',
    example: 'Barge A',
  })
  barge_name: string;

  @ApiProperty({
    description: 'Jumlah vessel',
    example: 5,
  })
  vessel: number;

  @ApiProperty({
    description: 'Total tonnage (vessel * 40)',
    example: 200,
  })
  total_tonnage: number;

  @ApiProperty({
    description: 'Waktu pembuatan',
    example: '2025-01-15T08:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Waktu update terakhir',
    example: '2025-01-15T08:00:00.000Z',
  })
  updatedAt: Date;
}

export class GetBargingListQueryDto {
  @ApiPropertyOptional({
    description: 'Halaman',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page harus berupa angka' })
  @Min(1, { message: 'Page harus lebih dari 0' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Limit per halaman',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit harus berupa angka' })
  @Min(1, { message: 'Limit harus lebih dari 0' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Pencarian berdasarkan unit hauler name atau barge name',
    example: 'DT-001',
  })
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan shift',
    enum: ShiftType,
    example: 'ds',
  })
  @IsOptional()
  @IsEnum(ShiftType, { message: 'Shift harus berupa ds atau ns' })
  shift?: ShiftType;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan unit hauler ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Unit hauler ID harus berupa angka' })
  unit_hauler_id?: number;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan barge ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Barge ID harus berupa angka' })
  barge_id?: number;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan tanggal dari',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Date from harus berupa tanggal yang valid' })
  date_from?: string;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan tanggal sampai',
    example: '2025-01-31',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Date to harus berupa tanggal yang valid' })
  date_to?: string;

  @ApiPropertyOptional({
    description: 'Sort by field',
    example: 'id',
  })
  @IsOptional()
  sortBy?: string = 'id';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'DESC',
  })
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
