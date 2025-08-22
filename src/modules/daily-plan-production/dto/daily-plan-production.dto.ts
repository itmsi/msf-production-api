import { IsDateString, IsNumber, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDailyPlanProductionDto {
  @ApiProperty({
    description: 'Tanggal rencana (format: YYYY-MM-DD)',
    example: '2025-01-01',
    type: String,
  })
  @IsDateString()
  plan_date: string;

  @ApiProperty({
    description: 'Rata-rata EWH per hari',
    example: 1.5,
    type: Number,
  })
  @IsNumber()
  average_day_ewh: number;

  @ApiProperty({
    description: 'Rata-rata EWH per shift',
    example: 0.75,
    type: Number,
  })
  @IsNumber()
  average_shift_ewh: number;

  @ApiProperty({
    description: 'Target OB (Overburden)',
    example: 1000,
    type: Number,
  })
  @IsNumber()
  ob_target: number;

  @ApiProperty({
    description: 'Target ore',
    example: 800,
    type: Number,
  })
  @IsNumber()
  ore_target: number;

  @ApiProperty({
    description: 'Target quarry',
    example: 200,
    type: Number,
  })
  @IsNumber()
  quarry: number;

  @ApiProperty({
    description: 'Target pengiriman ore',
    example: 750,
    type: Number,
  })
  @IsNumber()
  ore_shipment_target: number;

  @ApiProperty({
    description: 'Total armada',
    example: 15,
    type: Number,
  })
  @IsNumber()
  total_fleet: number;
}

export class UpdateDailyPlanProductionDto {
  @ApiProperty({
    description: 'Tanggal rencana (format: YYYY-MM-DD)',
    example: '2025-08-21',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsDateString()
  plan_date?: string;

  @ApiProperty({
    description: 'Rata-rata EWH per hari',
    example: 1.5,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  average_day_ewh?: number;

  @ApiProperty({
    description: 'Rata-rata EWH per bulan',
    example: 1.5,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  average_month_ewh?: number;

  @ApiProperty({
    description: 'Schedule day',
    example: 1,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  schedule_day?: number;

  @ApiProperty({
    description: 'Sisa stock',
    example: 100,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  sisa_stock?: number;

  @ApiProperty({
    description: 'Target OB (Overburden)',
    example: 1200,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  ob_target?: number;

  @ApiProperty({
    description: 'Target ore',
    example: 900,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  ore_target?: number;

  @ApiProperty({
    description: 'Target quarry',
    example: 200,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  quarry?: number;

  @ApiProperty({
    description: 'Target pengiriman ore',
    example: 750,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  ore_shipment_target?: number;

  @ApiProperty({
    description: 'Total armada',
    example: 15,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  total_fleet?: number;
}

export class QueryDailyPlanProductionDto {
  @ApiProperty({
    description: 'Filter tanggal mulai (YYYY-MM-DD)',
    example: '2025-01-01',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiProperty({
    description: 'Filter tanggal akhir (YYYY-MM-DD)',
    example: '2025-01-31',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiProperty({
    description: 'Keyword pencarian',
    example: '2025-08',
    type: String,
    required: false,
  })
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'Field untuk sorting',
    example: 'plan_date',
    type: String,
    required: false,
    enum: ['id', 'plan_date', 'ob_target', 'ore_target', 'total_fleet', 'createdAt'],
  })
  @IsOptional()
  sortBy?: string;

  @ApiProperty({
    description: 'Urutan sorting',
    example: 'DESC',
    type: String,
    required: false,
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiProperty({
    description: 'Nomor halaman',
    example: 1,
    type: Number,
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: 'Limit per halaman',
    example: 10,
    type: Number,
    required: false,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;
}

export class DailyPlanProductionResponseDto {
  @ApiProperty({
    description: 'ID unik',
    example: 1,
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'Tanggal rencana',
    example: '2025-01-01T00:00:00.000Z',
    type: Date,
  })
  plan_date: Date;

  @ApiProperty({
    description: 'Apakah hari kalender',
    example: true,
    type: Boolean,
  })
  is_calender_day: boolean;

  @ApiProperty({
    description: 'Apakah hari libur',
    example: false,
    type: Boolean,
  })
  is_holiday_day: boolean;

  @ApiProperty({
    description: 'Apakah hari tersedia',
    example: true,
    type: Boolean,
  })
  is_available_day: boolean;

  @ApiProperty({
    description: 'Rata-rata EWH per hari',
    example: 1.5,
    type: Number,
  })
  average_day_ewh: number;

  @ApiProperty({
    description: 'Rata-rata EWH per shift',
    example: 0.75,
    type: Number,
  })
  average_shift_ewh: number;

  @ApiProperty({
    description: 'Target OB (Overburden)',
    example: 1000,
    type: Number,
  })
  ob_target: number;

  @ApiProperty({
    description: 'Target ore',
    example: 800,
    type: Number,
  })
  ore_target: number;

  @ApiProperty({
    description: 'Target quarry',
    example: 200,
    type: Number,
  })
  quarry: number;

  @ApiProperty({
    description: 'Target SR (dihitung otomatis: ob_target / ore_target)',
    example: 1.25,
    type: Number,
  })
  sr_target: number;

  @ApiProperty({
    description: 'Target pengiriman ore',
    example: 750,
    type: Number,
  })
  ore_shipment_target: number;

  @ApiProperty({
    description: 'Stock lama harian (dihitung otomatis)',
    example: 0,
    type: Number,
  })
  daily_old_stock: number;

  @ApiProperty({
    description: 'Target OB per shift (dihitung otomatis: ob_target / 2)',
    example: 500,
    type: Number,
  })
  shift_ob_target: number;

  @ApiProperty({
    description: 'Target ore per shift (dihitung otomatis: ore_target / 2)',
    example: 400,
    type: Number,
  })
  shift_ore_target: number;

  @ApiProperty({
    description: 'Target quarry per shift (dihitung otomatis: quarry / 2)',
    example: 100,
    type: Number,
  })
  shift_quarrt: number;

  @ApiProperty({
    description: 'Target SR per shift (dihitung otomatis: shift_ob_target / shift_ore_target)',
    example: 1.25,
    type: Number,
  })
  shift_sr_target: number;

  @ApiProperty({
    description: 'Total armada',
    example: 15,
    type: Number,
  })
  total_fleet: number;

  @ApiProperty({
    description: 'Stock tersisa (dihitung otomatis: old_stock_global - ore_shipment_target + ore_target)',
    example: 50,
    type: Number,
  })
  remaining_stock: number;

  @ApiProperty({
    description: 'Waktu pembuatan',
    example: '2025-01-01T00:00:00.000Z',
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Waktu update terakhir',
    example: '2025-01-01T00:00:00.000Z',
    type: Date,
  })
  updatedAt: Date;
}

// DTO untuk response list dengan format yang diminta
export class DailyPlanProductionListResponseDto {
  @ApiProperty({
    description: 'ID unik',
    example: 2,
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'Tanggal rencana',
    example: '2025-08-21',
    type: String,
  })
  date: string;

  @ApiProperty({
    description: 'Status hari kalender (available/not holiday)',
    example: 'available',
    type: String,
  })
  calender_day: string;

  @ApiProperty({
    description: 'Rata-rata EWH per bulan',
    example: 1.5,
    type: Number,
  })
  average_month_ewh: number;

  @ApiProperty({
    description: 'Rata-rata EWH per hari',
    example: 1.5,
    type: Number,
  })
  average_day_ewh: number;

  @ApiProperty({
    description: 'Target OB (Overburden)',
    example: 1000,
    type: Number,
  })
  ob_target: number;

  @ApiProperty({
    description: 'Target ore',
    example: 800,
    type: Number,
  })
  ore_target: number;

  @ApiProperty({
    description: 'Target quarry',
    example: 200,
    type: Number,
  })
  quarry: number;

  @ApiProperty({
    description: 'Target SR (ob_target / ore_target)',
    example: 1.25,
    type: Number,
  })
  sr_target: number;

  @ApiProperty({
    description: 'Target pengiriman ore',
    example: 750,
    type: Number,
  })
  ore_shipment_target: number;

  @ApiProperty({
    description: 'Sisa stock (ore_target - ore_shipment_target)',
    example: 50,
    type: Number,
  })
  sisa_stock: number;

  @ApiProperty({
    description: 'Total armada',
    example: 15,
    type: Number,
  })
  total_fleet: number;

  @ApiProperty({
    description: 'Tonnage per fleet (ore_target / total_fleet)',
    example: 53.33,
    type: Number,
  })
  tonnage_per_fleet: number;

  @ApiProperty({
    description: 'Vessel per fleet (tonnage_per_fleet / 35)',
    example: 1.52,
    type: Number,
  })
  vessel_per_fleet: number;

  @ApiProperty({
    description: 'Apakah tersedia untuk edit',
    example: true,
    type: Boolean,
  })
  is_available_to_edit: boolean;

  @ApiProperty({
    description: 'Apakah tersedia untuk hapus',
    example: true,
    type: Boolean,
  })
  is_available_to_delete: boolean;
}

// DTO untuk response pagination - konsisten dengan module lainnya
export class DailyPlanProductionPaginationDto {
  @ApiProperty({
    description: 'Total data',
    example: 1,
    type: Number,
  })
  total: number;

  @ApiProperty({
    description: 'Nomor halaman',
    example: 1,
    type: Number,
  })
  page: number;

  @ApiProperty({
    description: 'Limit per halaman',
    example: 10,
    type: Number,
  })
  limit: number;

  @ApiProperty({
    description: 'Total halaman',
    example: 5,
    type: Number,
  })
  lastPage: number;
}

// DTO untuk response utama
export class DailyPlanProductionListResponseMainDto {
  @ApiProperty({
    description: 'Status code',
    example: 200,
    type: Number,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Pesan response',
    example: 'Data daily plan production berhasil diambil',
    type: String,
  })
  message: string;

  @ApiProperty({
    description: 'Data response',
    type: Object,
  })
  data: {
    data: DailyPlanProductionListResponseDto[];
    pagination: DailyPlanProductionPaginationDto;
  };
}
