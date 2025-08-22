import { ApiProperty } from '@nestjs/swagger';

export class PlanProductionResponseDto {
  @ApiProperty({
    description: 'ID plan production',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Tanggal rencana produksi',
    example: '2025-08-01T00:00:00.000Z',
  })
  plan_date: Date;

  @ApiProperty({
    description: 'Apakah hari kalender',
    example: true,
  })
  is_calender_day: boolean;

  @ApiProperty({
    description: 'Apakah hari libur',
    example: false,
  })
  is_holiday_day: boolean;

  @ApiProperty({
    description: 'Apakah hari tersedia',
    example: true,
  })
  is_available_day: boolean;

  @ApiProperty({
    description: 'Rata-rata EWH harian',
    example: 4.84,
  })
  average_day_ewh: number;

  @ApiProperty({
    description: 'Rata-rata EWH shift',
    example: 145.16,
  })
  average_shift_ewh: number;

  @ApiProperty({
    description: 'Target OB (Overburden)',
    example: 48387.1,
  })
  ob_target: number;

  @ApiProperty({
    description: 'Target bijih',
    example: 24193.55,
  })
  ore_target: number;

  @ApiProperty({
    description: 'Target quarry',
    example: 9677.42,
  })
  quarry: number;

  @ApiProperty({
    description: 'Target SR (Stripping Ratio)',
    example: 2.0,
  })
  sr_target: number;

  @ApiProperty({
    description: 'Target pengiriman bijih',
    example: 19354.84,
  })
  ore_shipment_target: number;

  @ApiProperty({
    description: 'Total fleet',
    example: 25,
  })
  total_fleet: number;

  @ApiProperty({
    description: 'Stok lama harian',
    example: 50000.0,
  })
  daily_old_stock: number;

  @ApiProperty({
    description: 'Target OB shift',
    example: 24193.55,
  })
  shift_ob_target: number;

  @ApiProperty({
    description: 'Target bijih shift',
    example: 12096.77,
  })
  shift_ore_target: number;

  @ApiProperty({
    description: 'Target quarry shift',
    example: 4838.71,
  })
  shift_quarry: number;

  @ApiProperty({
    description: 'Target SR shift',
    example: 2.0,
  })
  shift_sr_target: number;

  @ApiProperty({
    description: 'Stok tersisa',
    example: 54838.71,
  })
  remaining_stock: number;

  @ApiProperty({
    description: 'ID parent plan production',
    example: 1,
  })
  parent_plan_production_id: number;
}

export class ParentPlanProductionResponseDto {
  @ApiProperty({
    description: 'ID parent plan production',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Tanggal rencana produksi',
    example: '2025-08-01T00:00:00.000Z',
  })
  plan_date: Date;

  @ApiProperty({
    description: 'Total hari kalender dalam bulan',
    example: 31,
  })
  total_calender_day: number;

  @ApiProperty({
    description: 'Total hari libur (minggu) dalam bulan',
    example: 5,
  })
  total_holiday_day: number;

  @ApiProperty({
    description: 'Total hari tersedia dalam bulan',
    example: 26,
  })
  total_available_day: number;

  @ApiProperty({
    description: 'Total rata-rata EWH bulanan',
    example: 4500.0,
  })
  total_average_month_ewh: number;

  @ApiProperty({
    description: 'Total rata-rata EWH harian',
    example: 150.0,
  })
  total_average_day_ewh: number;

  @ApiProperty({
    description: 'Total target OB (Overburden)',
    example: 1500000.0,
  })
  total_ob_target: number;

  @ApiProperty({
    description: 'Total target bijih',
    example: 750000.0,
  })
  total_ore_target: number;

  @ApiProperty({
    description: 'Total target quarry',
    example: 300000.0,
  })
  total_quary_target: number;

  @ApiProperty({
    description: 'Total target SR (Stripping Ratio)',
    example: 2.0,
  })
  total_sr_target: number;

  @ApiProperty({
    description: 'Total target pengiriman bijih',
    example: 600000.0,
  })
  total_ore_shipment_target: number;

  @ApiProperty({
    description: 'Total stok tersisa',
    example: 100000.0,
  })
  total_remaining_stock: number;

  @ApiProperty({
    description: 'Total sisa stok',
    example: 50000.0,
  })
  total_sisa_stock: number;

  @ApiProperty({
    description: 'Total fleet',
    example: 25,
  })
  total_fleet: number;

  @ApiProperty({
    description: 'Tanggal dibuat',
    example: '2025-01-15T10:30:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Tanggal diupdate',
    example: '2025-01-15T10:30:00.000Z',
  })
  updated_at: Date;

  @ApiProperty({
    description: 'Tanggal dihapus',
    example: null,
    required: false,
  })
  deleted_at?: Date;

  @ApiProperty({
    description: 'Daftar plan production harian',
    type: [PlanProductionResponseDto],
    required: false,
  })
  planProductions?: PlanProductionResponseDto[];
}
