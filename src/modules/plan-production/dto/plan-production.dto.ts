import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreatePlanProductionDto {
  @ApiProperty({
    description: 'Tanggal rencana produksi',
    example: '2024-01-01',
  })
  @IsNotEmpty()
  @IsDateString()
  plan_date: string;

  @ApiProperty({
    description: 'Apakah hari kalender',
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  is_calender_day: boolean;

  @ApiProperty({
    description: 'Apakah hari libur',
    example: false,
  })
  @IsNotEmpty()
  @IsBoolean()
  is_holiday_day: boolean;

  @ApiProperty({
    description: 'Apakah hari tersedia (is_available_day == is_scheduled_day)',
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  is_available_day: boolean;

  @ApiProperty({
    description: 'Rata-rata EWH harian',
    example: 5.0,
  })
  @IsNotEmpty()
  @IsNumber()
  average_day_ewh: number;

  @ApiProperty({
    description: 'Rata-rata EWH shift',
    example: 2.5,
  })
  @IsNotEmpty()
  @IsNumber()
  average_shift_ewh: number;

  @ApiProperty({
    description: 'Target OB (Overburden)',
    example: 50000.0,
  })
  @IsNotEmpty()
  @IsNumber()
  ob_target: number;

  @ApiProperty({
    description: 'Target bijih',
    example: 25000.0,
  })
  @IsNotEmpty()
  @IsNumber()
  ore_target: number;

  @ApiProperty({
    description: 'Target quarry',
    example: 10000.0,
  })
  @IsNotEmpty()
  @IsNumber()
  quarry: number;

  @ApiProperty({
    description: 'Stok tersisa',
    example: 5000.0,
  })
  @IsNotEmpty()
  @IsNumber()
  remaining_stock: number;

  @ApiProperty({
    description:
      'Target SR (Stripping Ratio) - Calculated: (ore_target / ob_target)',
    example: 2.0,
  })
  @IsNotEmpty()
  @IsNumber()
  sr_target: number;

  @ApiProperty({
    description: 'Target pengiriman bijih',
    example: 20000.0,
  })
  @IsNotEmpty()
  @IsNumber()
  ore_shipment_target: number;

  @ApiProperty({
    description: 'Total fleet',
    example: 10,
  })
  @IsNotEmpty()
  @IsNumber()
  total_fleet: number;

  @ApiProperty({
    description:
      'Stok lama harian - Calculated: (old stock global - ore shipment + ore target)',
    example: 30000.0,
  })
  @IsNotEmpty()
  @IsNumber()
  daily_old_stock: number;

  @ApiProperty({
    description: 'Target OB shift - Calculated: (ob target / 2)',
    example: 25000.0,
  })
  @IsNotEmpty()
  @IsNumber()
  shift_ob_target: number;

  @ApiProperty({
    description: 'Target bijih shift - Calculated: (ore target / 2)',
    example: 12500.0,
  })
  @IsNotEmpty()
  @IsNumber()
  shift_ore_target: number;

  @ApiProperty({
    description: 'Target quarry shift - Calculated: (quarry / 2)',
    example: 5000.0,
  })
  @IsNotEmpty()
  @IsNumber()
  shift_quarry: number;

  @ApiProperty({
    description:
      'Target SR shift - Calculated: (shift ob target / shift ore target)',
    example: 2.0,
  })
  @IsNotEmpty()
  @IsNumber()
  shift_sr_target: number;

  @ApiProperty({
    description: 'Rata-rata EWH bulanan',
    example: 150.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  average_moth_ewh?: number;

  @ApiProperty({
    description: 'ID parent plan production',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  parent_plan_production_id: number;
}

export class UpdatePlanProductionDto {
  @ApiProperty({
    description: 'Tanggal rencana produksi',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  plan_date?: string;

  @ApiProperty({
    description: 'Apakah hari kalender',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_calender_day?: boolean;

  @ApiProperty({
    description: 'Apakah hari libur',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_holiday_day?: boolean;

  @ApiProperty({
    description: 'Apakah hari tersedia (is_available_day == is_scheduled_day)',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_available_day?: boolean;

  @ApiProperty({
    description: 'Rata-rata EWH harian',
    example: 5.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  average_day_ewh?: number;

  @ApiProperty({
    description: 'Rata-rata EWH shift',
    example: 2.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  average_shift_ewh?: number;

  @ApiProperty({
    description: 'Target OB (Overburden)',
    example: 50000.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  ob_target?: number;

  @ApiProperty({
    description: 'Target bijih',
    example: 25000.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  ore_target?: number;

  @ApiProperty({
    description: 'Target quarry',
    example: 10000.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  quarry?: number;

  @ApiProperty({
    description: 'Stok tersisa',
    example: 5000.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  remaining_stock?: number;

  @ApiProperty({
    description:
      'Target SR (Stripping Ratio) - Calculated: (ore_target / ob_target)',
    example: 2.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  sr_target?: number;

  @ApiProperty({
    description: 'Target pengiriman bijih',
    example: 20000.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  ore_shipment_target?: number;

  @ApiProperty({
    description: 'Total fleet',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  total_fleet?: number;

  @ApiProperty({
    description:
      'Stok lama harian - Calculated: (old stock global - ore shipment + ore target)',
    example: 30000.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  daily_old_stock?: number;

  @ApiProperty({
    description: 'Target OB shift - Calculated: (ob target / 2)',
    example: 25000.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  shift_ob_target?: number;

  @ApiProperty({
    description: 'Target bijih shift - Calculated: (ore target / 2)',
    example: 12500.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  shift_ore_target?: number;

  @ApiProperty({
    description: 'Target quarry shift - Calculated: (quarry / 2)',
    example: 5000.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  shift_quarry?: number;

  @ApiProperty({
    description:
      'Target SR shift - Calculated: (shift ob target / shift ore target)',
    example: 2.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  shift_sr_target?: number;

  @ApiProperty({
    description: 'Rata-rata EWH bulanan',
    example: 150.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  average_moth_ewh?: number;

  @ApiProperty({
    description: 'ID parent plan production',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  parent_plan_production_id?: number;
}

export class PlanProductionResponseDto {
  @ApiProperty({
    description: 'ID plan production',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Tanggal rencana produksi',
    example: '2024-01-01',
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
    description: 'Apakah hari tersedia (is_available_day == is_scheduled_day)',
    example: true,
  })
  is_available_day: boolean;

  @ApiProperty({
    description: 'Rata-rata EWH harian',
    example: 5.0,
  })
  average_day_ewh: number;

  @ApiProperty({
    description: 'Rata-rata EWH shift',
    example: 2.5,
  })
  average_shift_ewh: number;

  @ApiProperty({
    description: 'Target OB (Overburden)',
    example: 50000.0,
  })
  ob_target: number;

  @ApiProperty({
    description: 'Target bijih',
    example: 25000.0,
  })
  ore_target: number;

  @ApiProperty({
    description: 'Target quarry',
    example: 10000.0,
  })
  quarry: number;

  @ApiProperty({
    description: 'Stok tersisa',
    example: 5000.0,
  })
  remaining_stock: number;

  @ApiProperty({
    description:
      'Target SR (Stripping Ratio) - Calculated: (ore_target / ob_target)',
    example: 2.0,
  })
  sr_target: number;

  @ApiProperty({
    description: 'Target pengiriman bijih',
    example: 20000.0,
  })
  ore_shipment_target: number;

  @ApiProperty({
    description: 'Total fleet',
    example: 10,
  })
  total_fleet: number;

  @ApiProperty({
    description:
      'Stok lama harian - Calculated: (old stock global - ore shipment + ore target)',
    example: 30000.0,
  })
  daily_old_stock: number;

  @ApiProperty({
    description: 'Target OB shift - Calculated: (ob target / 2)',
    example: 25000.0,
  })
  shift_ob_target: number;

  @ApiProperty({
    description: 'Target bijih shift - Calculated: (ore target / 2)',
    example: 12500.0,
  })
  shift_ore_target: number;

  @ApiProperty({
    description: 'Target quarry shift - Calculated: (quarry / 2)',
    example: 5000.0,
  })
  shift_quarry: number;

  @ApiProperty({
    description:
      'Target SR shift - Calculated: (shift ob target / shift ore target)',
    example: 2.0,
  })
  shift_sr_target: number;

  @ApiProperty({
    description: 'Rata-rata EWH bulanan',
    example: 150.0,
    required: false,
  })
  average_moth_ewh?: number;

  @ApiProperty({
    description: 'Tanggal dibuat',
    example: '2024-01-01',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Tanggal diupdate',
    example: '2024-01-01',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Tanggal dihapus',
    example: null,
    required: false,
  })
  deletedAt?: Date;

  @ApiProperty({
    description: 'ID parent plan production',
    example: 1,
  })
  parent_plan_production_id: number;

  @ApiProperty({
    description: 'Parent plan production information',
    required: false,
  })
  parentPlanProduction?: {
    id: number;
    plan_date: Date;
    total_calender_day: number;
    total_available_day: number;
  };
}
