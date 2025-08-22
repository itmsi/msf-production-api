import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString, IsNumber, IsOptional, IsNumberString, Min, Max } from 'class-validator';

export class CreateParentPlanProductionDto {
  @ApiProperty({
    description: 'Tanggal rencana produksi',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsNotEmpty()
  @IsDateString()
  plan_date: string;

  @ApiProperty({
    description: 'Total hari kalender dalam bulan',
    example: 31,
  })
  @IsNotEmpty()
  @IsNumber()
  total_calender_day: number;

  @ApiProperty({
    description: 'Total hari libur dalam bulan',
    example: 8,
  })
  @IsNotEmpty()
  @IsNumber()
  total_holiday_day: number;

  @ApiProperty({
    description: 'Total hari tersedia dalam bulan',
    example: 23,
  })
  @IsNotEmpty()
  @IsNumber()
  total_available_day: number;

  @ApiProperty({
    description: 'Total rata-rata EWH bulanan',
    example: 150.5,
  })
  @IsNotEmpty()
  @IsNumber()
  total_average_month_ewh: number;

  @ApiProperty({
    description: 'Total rata-rata EWH harian',
    example: 5.0,
  })
  @IsNotEmpty()
  @IsNumber()
  total_average_day_ewh: number;

  @ApiProperty({
    description: 'Total target OB (Overburden)',
    example: 1000000.0,
  })
  @IsNotEmpty()
  @IsNumber()
  total_ob_target: number;

  @ApiProperty({
    description: 'Total target bijih',
    example: 500000.0,
  })
  @IsNotEmpty()
  @IsNumber()
  total_ore_target: number;

  @ApiProperty({
    description: 'Total target quarry',
    example: 200000.0,
  })
  @IsNotEmpty()
  @IsNumber()
  total_quary_target: number;

  @ApiProperty({
    description: 'Total target SR (Stripping Ratio)',
    example: 2.0,
  })
  @IsNotEmpty()
  @IsNumber()
  total_sr_target: number;

  @ApiProperty({
    description: 'Total target pengiriman bijih',
    example: 450000.0,
  })
  @IsNotEmpty()
  @IsNumber()
  total_ore_shipment_target: number;

  @ApiProperty({
    description: 'Total stok tersisa',
    example: 50000.0,
  })
  @IsNotEmpty()
  @IsNumber()
  total_remaining_stock: number;

  @ApiProperty({
    description: 'Total sisa stock yang tersedia',
    example: 1000,
  })
  @IsNotEmpty()
  @IsNumber()
  total_sisa_stock: number;

  @ApiProperty({
    description: 'Total fleet yang tersedia',
    example: 50,
  })
  @IsNotEmpty()
  @IsNumber()
  total_fleet: number;
}

export class UpdateParentPlanProductionDto {
  @ApiProperty({
    description: 'Tanggal rencana produksi',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  plan_date?: string;

  @ApiProperty({
    description: 'Total hari kalender dalam bulan',
    example: 31,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  total_calender_day?: number;

  @ApiProperty({
    description: 'Total hari libur dalam bulan',
    example: 8,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  total_holiday_day?: number;

  @ApiProperty({
    description: 'Total hari tersedia dalam bulan',
    example: 23,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  total_available_day?: number;

  @ApiProperty({
    description: 'Total rata-rata EWH bulanan',
    example: 150.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  total_average_month_ewh?: number;

  @ApiProperty({
    description: 'Total rata-rata EWH harian',
    example: 5.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  total_average_day_ewh?: number;

  @ApiProperty({
    description: 'Total target OB (Overburden)',
    example: 1000000.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  total_ob_target?: number;

  @ApiProperty({
    description: 'Total target bijih',
    example: 500000.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  total_ore_target?: number;

  @ApiProperty({
    description: 'Total target quarry',
    example: 200000.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  total_quary_target?: number;

  @ApiProperty({
    description: 'Total target SR (Stripping Ratio)',
    example: 2.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  total_sr_target?: number;

  @ApiProperty({
    description: 'Total target pengiriman bijih',
    example: 450000.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  total_ore_shipment_target?: number;

  @ApiProperty({
    description: 'Total stok tersisa',
    example: 50000.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  total_remaining_stock?: number;

  @ApiProperty({
    description: 'Total sisa stock yang tersedia',
    example: 1000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  total_sisa_stock?: number;

  @ApiProperty({
    description: 'Total fleet yang tersedia',
    example: 50,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  total_fleet?: number;
}

export class ParentPlanProductionResponseDto {
  @ApiProperty({
    description: 'ID parent plan production',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Tanggal rencana produksi',
    example: '2024-01-01T00:00:00.000Z',
  })
  plan_date: Date;

  @ApiProperty({
    description: 'Total hari kalender dalam bulan',
    example: 31,
  })
  total_calender_day: number;

  @ApiProperty({
    description: 'Total hari libur dalam bulan',
    example: 8,
  })
  total_holiday_day: number;

  @ApiProperty({
    description: 'Total hari tersedia dalam bulan',
    example: 23,
  })
  total_available_day: number;

  @ApiProperty({
    description: 'Total rata-rata EWH bulanan',
    example: 150.5,
  })
  total_average_month_ewh: number;

  @ApiProperty({
    description: 'Total rata-rata EWH harian',
    example: 5.0,
  })
  total_average_day_ewh: number;

  @ApiProperty({
    description: 'Total target OB (Overburden)',
    example: 1000000.0,
  })
  total_ob_target: number;

  @ApiProperty({
    description: 'Total target bijih',
    example: 500000.0,
  })
  total_ore_target: number;

  @ApiProperty({
    description: 'Total target quarry',
    example: 200000.0,
  })
  total_quary_target: number;

  @ApiProperty({
    description: 'Total target SR (Stripping Ratio)',
    example: 2.0,
  })
  total_sr_target: number;

  @ApiProperty({
    description: 'Total target pengiriman bijih',
    example: 450000.0,
  })
  total_ore_shipment_target: number;

  @ApiProperty({
    description: 'Total stok tersisa',
    example: 50000.0,
  })
  total_remaining_stock: number;

  @ApiProperty({
    description: 'Total sisa stock yang tersedia',
    example: 1000,
  })
  total_sisa_stock: number;

  @ApiProperty({
    description: 'Total fleet yang tersedia',
    example: 50,
  })
  total_fleet: number;

  @ApiProperty({
    description: 'Tanggal dibuat',
    example: '2024-01-01T00:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Tanggal diupdate',
    example: '2024-01-01T00:00:00.000Z',
  })
  updated_at: Date;

  @ApiProperty({
    description: 'Tanggal dihapus',
    example: null,
    required: false,
  })
  deleted_at?: Date;
}

export class GetParentPlanProductionQueryDto {
  @ApiProperty({
    description: 'Filter bulan (1-12) untuk menampilkan data sesuai bulan tersebut',
    example: '8',
    required: false,
    minimum: 1,
    maximum: 12,
  })
  @IsOptional()
  @IsNumberString()
  month?: string;

  @ApiProperty({
    description: 'Filter tanggal dari (format: YYYY-MM-DD)',
    example: '2025-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date_from?: string;

  @ApiProperty({
    description: 'Filter tanggal sampai (format: YYYY-MM-DD)',
    example: '2025-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date_to?: string;

  @ApiProperty({
    description: 'Nomor halaman',
    example: '1',
    required: false,
    default: '1',
  })
  @IsOptional()
  page?: string;

  @ApiProperty({
    description: 'Jumlah data per halaman',
    example: '10',
    required: false,
    default: '10',
  })
  @IsOptional()
  limit?: string;

  @ApiProperty({
    description: 'Field untuk sorting',
    example: 'plan_date',
    required: false,
    default: 'plan_date',
  })
  @IsOptional()
  sort?: string;

  @ApiProperty({
    description: 'Urutan sorting (ASC/DESC)',
    example: 'DESC',
    required: false,
    default: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

export class ParentPlanProductionSummaryResponseDto {
  @ApiProperty({
    description: 'Bulan dan tahun dari plan_date',
    example: '2025-01',
  })
  month_year: string;

  @ApiProperty({
    description: 'Jumlah hari tersedia (is_available_day = true)',
    example: 26,
  })
  available_day: number;

  @ApiProperty({
    description: 'Jumlah hari libur (is_holiday_day = true)',
    example: 5,
  })
  holiday_day: number;

  @ApiProperty({
    description: 'Rata-rata EWH bulanan',
    example: 4500.0,
  })
  average_month_ewh: number;

  @ApiProperty({
    description: 'Rata-rata EWH harian',
    example: 150.0,
  })
  average_day_ewh: number;

  @ApiProperty({
    description: 'Target OB (Overburden)',
    example: 1500000.0,
  })
  ob_target: number;

  @ApiProperty({
    description: 'Target bijih',
    example: 750000.0,
  })
  ore_target: number;

  @ApiProperty({
    description: 'Target quarry',
    example: 300000.0,
  })
  quarry_target: number;

  @ApiProperty({
    description: 'Target SR (Stripping Ratio)',
    example: 2.0,
  })
  sr_target: number;

  @ApiProperty({
    description: 'Target pengiriman bijih',
    example: 600000.0,
  })
  ore_shipment_target: number;

  @ApiProperty({
    description: 'Sisa stok',
    example: 50000.0,
  })
  sisa_stock: number;

  @ApiProperty({
    description: 'Apakah tersedia untuk edit',
    example: true,
  })
  is_available_to_edit: boolean;

  @ApiProperty({
    description: 'Apakah tersedia untuk hapus',
    example: true,
  })
  is_available_to_delete: boolean;
}
