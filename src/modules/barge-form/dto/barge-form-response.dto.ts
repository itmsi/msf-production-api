import { ApiProperty } from '@nestjs/swagger';

export class BargeFormResponseDto {
  @ApiProperty({
    description: 'ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Shipment',
    example: 'SHIP001',
  })
  shipment: string;

  @ApiProperty({
    description: 'Barge Name',
    example: 'Barge Alpha',
  })
  barge_name: string;

  @ApiProperty({
    description: 'Site Name',
    example: 'Site Jakarta',
  })
  site_name: string;

  @ApiProperty({
    description: 'Start Loading Date',
    example: '2024-01-01T08:00:00Z',
  })
  start_loading: Date;

  @ApiProperty({
    description: 'End Loading Date',
    example: '2024-01-01T18:00:00Z',
  })
  end_loading: Date;

  @ApiProperty({
    description: 'Total Vessel',
    example: 100.5,
    nullable: true,
  })
  total_vessel: number | null;

  @ApiProperty({
    description: 'Volume by Survey',
    example: 95.2,
    nullable: true,
  })
  vol_by_survey: number | null;

  @ApiProperty({
    description: 'Capacity per DT',
    example: 0.95,
    nullable: true,
  })
  capacity_per_dt: number | null;

  @ApiProperty({
    description: 'Achievement',
    example: 1.0,
    nullable: true,
  })
  achievment: number | null;

  @ApiProperty({
    description: 'Remarks',
    example: 'Loading completed successfully',
    nullable: true,
  })
  remarks: string | null;

  @ApiProperty({
    description: 'Status',
    example: 'completed',
    nullable: true,
  })
  status: string | null;
}
