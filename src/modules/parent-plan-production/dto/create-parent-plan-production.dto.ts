import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class CreateParentPlanProductionDto {
  @ApiProperty({
    description: 'Tanggal rencana produksi (format: YYYY-MM-DD)',
    example: '2025-08-21',
    required: true,
  })
  @IsNotEmpty({ message: 'plan_date tidak boleh kosong' })
  @IsDateString({}, { message: 'plan_date harus dalam format tanggal yang valid' })
  plan_date: string;

  @ApiProperty({
    description: 'Total rata-rata EWH harian',
    example: 150,
    required: true,
  })
  @IsNotEmpty({ message: 'total_average_day_ewh tidak boleh kosong' })
  @IsNumber({}, { message: 'total_average_day_ewh harus berupa angka' })
  @IsPositive({ message: 'total_average_day_ewh harus lebih dari 0' })
  total_average_day_ewh: number;

  @ApiProperty({
    description: 'Total rata-rata EWH bulanan',
    example: 4500,
    required: true,
  })
  @IsNotEmpty({ message: 'total_average_month_ewh tidak boleh kosong' })
  @IsNumber({}, { message: 'total_average_month_ewh harus berupa angka' })
  @IsPositive({ message: 'total_average_month_ewh harus lebih dari 0' })
  total_average_month_ewh: number;

  @ApiProperty({
    description: 'Total target OB (Overburden)',
    example: 1500000,
    required: true,
  })
  @IsNotEmpty({ message: 'total_ob_target tidak boleh kosong' })
  @IsNumber({}, { message: 'total_ob_target harus berupa angka' })
  @IsPositive({ message: 'total_ob_target harus lebih dari 0' })
  total_ob_target: number;

  @ApiProperty({
    description: 'Total target bijih',
    example: 750000,
    required: true,
  })
  @IsNotEmpty({ message: 'total_ore_target tidak boleh kosong' })
  @IsNumber({}, { message: 'total_ore_target harus berupa angka' })
  @IsPositive({ message: 'total_ore_target harus lebih dari 0' })
  total_ore_target: number;

  @ApiProperty({
    description: 'Total target quarry',
    example: 300000,
    required: true,
  })
  @IsNotEmpty({ message: 'total_quarry_target tidak boleh kosong' })
  @IsNumber({}, { message: 'total_quarry_target harus berupa angka' })
  @IsPositive({ message: 'total_quarry_target harus lebih dari 0' })
  total_quarry_target: number;

  @ApiProperty({
    description: 'Total target SR (Stripping Ratio) - Optional, default: 2.0',
    example: 2.0,
    required: false,
    default: 2.0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'total_sr_target harus berupa angka' })
  @IsPositive({ message: 'total_sr_target harus lebih dari 0' })
  total_sr_target?: number;

  @ApiProperty({
    description: 'Total target pengiriman bijih',
    example: 600000,
    required: true,
  })
  @IsNotEmpty({ message: 'total_ore_shipment_target tidak boleh kosong' })
  @IsNumber({}, { message: 'total_ore_shipment_target harus berupa angka' })
  @IsPositive({ message: 'total_ore_shipment_target harus lebih dari 0' })
  total_ore_shipment_target: number;

  @ApiProperty({
    description: 'Total stok tersisa - Optional, default: 0',
    example: 0,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'total_remaining_stock harus berupa angka' })
  total_remaining_stock?: number;

  @ApiProperty({
    description: 'Total sisa stok',
    example: 50000,
    required: true,
  })
  @IsNotEmpty({ message: 'total_sisa_stock tidak boleh kosong' })
  @IsNumber({}, { message: 'total_sisa_stock harus berupa angka' })
  @IsPositive({ message: 'total_sisa_stock harus lebih dari 0' })
  total_sisa_stock: number;

  @ApiProperty({
    description: 'Total fleet',
    example: 25,
    required: true,
  })
  @IsNotEmpty({ message: 'total_fleet tidak boleh kosong' })
  @IsNumber({}, { message: 'total_fleet harus berupa angka' })
  @IsPositive({ message: 'total_fleet harus lebih dari 0' })
  total_fleet: number;
}
