import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsDateString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CreateFuelConsumptionDto {
  @ApiProperty({
    description: 'ID Unit',
    example: 1,
  })
  @IsInt()
  unit_id: number;

  @ApiProperty({
    description: 'Shift',
    example: 'DS',
    enum: ['DS', 'NS'],
  })
  @IsEnum(['DS', 'NS'])
  shift: string;

  @ApiProperty({
    description: 'Activity Date',
    example: '2024-01-01',
  })
  @IsDateString()
  activity_date: string;

  @ApiProperty({
    description: 'Part Name',
    example: 'Engine Part A',
  })
  @IsString()
  part_name: string;

  @ApiProperty({
    description: 'Operator ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  operator_id?: number;

  @ApiProperty({
    description: 'Last Refueling HM',
    example: 100.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  last_refueling_hm?: number;

  @ApiProperty({
    description: 'Now Refueling HM',
    example: 150.2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  now_refueling_hm?: number;

  @ApiProperty({
    description: 'Last Refueling KM',
    example: 1000.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  last_refueling_km?: number;

  @ApiProperty({
    description: 'Now Refueling KM',
    example: 1200.8,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  now_refueling_km?: number;

  @ApiProperty({
    description: 'Quantity Supply',
    example: 50.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  qty_supply?: number;

  @ApiProperty({
    description: 'Unit of Measure',
    example: 'liter',
    enum: ['none', 'liter'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['none', 'liter'])
  uom?: string;

  @ApiProperty({
    description: 'Start Refueling Time',
    example: '2024-01-01T08:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  start_refueling_time?: string;

  @ApiProperty({
    description: 'End Refueling Time',
    example: '2024-01-01T08:30:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  end_refueling_time?: string;

  // Calculated fields (not in request body, but needed for service)
  running_refueling_hm?: number;
  running_refueling_km?: number;
  l_per_km?: number;
  l_per_hm?: number;
  lead_time_refueling_time?: number;
}
