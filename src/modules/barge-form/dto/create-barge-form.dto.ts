import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsDateString, IsNumber, IsOptional } from 'class-validator';

export class CreateBargeFormDto {
  @ApiProperty({
    description: 'ID Barge',
    example: 1,
  })
  @IsInt()
  barge_id: number;

  @ApiProperty({
    description: 'ID Site',
    example: 1,
  })
  @IsInt()
  site_id: number;

  @ApiProperty({
    description: 'Shipment',
    example: 'SHIP001',
  })
  @IsString()
  shipment: string;

  @ApiProperty({
    description: 'Start Loading Date',
    example: '2024-01-01T08:00:00Z',
  })
  @IsDateString()
  start_loading: string;

  @ApiProperty({
    description: 'End Loading Date',
    example: '2024-01-01T18:00:00Z',
  })
  @IsDateString()
  end_loading: string;

  @ApiProperty({
    description: 'Total Vessel',
    example: 100.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  total_vessel?: number;

  @ApiProperty({
    description: 'Volume by Survey',
    example: 95.2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  vol_by_survey?: number;

  @ApiProperty({
    description: 'Remarks',
    example: 'Loading completed successfully',
    required: false,
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}
