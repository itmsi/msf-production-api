import { ApiProperty } from '@nestjs/swagger';

export class FuelConsumptionResponseDto {
  @ApiProperty({
    description: 'ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Shift',
    example: 'DS',
  })
  shift: string;

  @ApiProperty({
    description: 'Part Name',
    example: 'Engine Part A',
    nullable: true,
  })
  part_name: string;

  @ApiProperty({
    description: 'Site Name',
    example: 'Site Jakarta',
  })
  site: string;

  @ApiProperty({
    description: 'Unit Number',
    example: 'UNIT001',
  })
  no_unit: string;

  @ApiProperty({
    description: 'Unit Type',
    example: 'Excavator',
  })
  type_unit: string;

  @ApiProperty({
    description: 'Serial Number',
    example: 'SN123456',
  })
  serial_number: string;

  @ApiProperty({
    description: 'Operator Name',
    example: 'John Doe',
  })
  operator_name: string;

  @ApiProperty({
    description: 'Last Refueling HM',
    example: 100.5,
    nullable: true,
  })
  last_refueling_hm: number | null;

  @ApiProperty({
    description: 'Now Refueling HM',
    example: 150.2,
    nullable: true,
  })
  now_refueling_hm: number | null;

  @ApiProperty({
    description: 'Running Refueling HM',
    example: 49.7,
    nullable: true,
  })
  running_refueling_hm: number | null;

  @ApiProperty({
    description: 'Last Refueling KM',
    example: 1000.5,
    nullable: true,
  })
  last_refueling_km: number | null;

  @ApiProperty({
    description: 'Now Refueling KM',
    example: 1200.8,
    nullable: true,
  })
  now_refueling_km: number | null;

  @ApiProperty({
    description: 'Running Refueling KM',
    example: 200.3,
    nullable: true,
  })
  running_refueling_km: number | null;

  @ApiProperty({
    description: 'Quantity Supply',
    example: 50.0,
    nullable: true,
  })
  qty_supply: number | null;

  @ApiProperty({
    description: 'Unit of Measure',
    example: 'liter',
  })
  uom: string;

  @ApiProperty({
    description: 'Liters per KM',
    example: 0.25,
    nullable: true,
  })
  l_per_km: number | null;

  @ApiProperty({
    description: 'Liters per HM',
    example: 1.01,
    nullable: true,
  })
  l_per_hm: number | null;

  @ApiProperty({
    description: 'Start Refueling Time',
    example: '2024-01-01T08:00:00Z',
    nullable: true,
  })
  start_refueling_time: Date;

  @ApiProperty({
    description: 'End Refueling Time',
    example: '2024-01-01T08:30:00Z',
    nullable: true,
  })
  end_refueling_time: Date;

  @ApiProperty({
    description: 'Lead Time Refueling Time',
    example: 30.0,
    nullable: true,
  })
  lead_time_refueling_time: number | null;
}
