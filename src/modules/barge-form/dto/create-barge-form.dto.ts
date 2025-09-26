import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  IsDateString,
  IsNumber,
  IsOptional,
  ValidateIf,
  Min,
} from 'class-validator';

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
    description: 'End Loading Date (optional, can be null)',
    example: '2024-01-01T18:00:00Z',
    required: false,
  })
  @IsOptional()
  @ValidateIf((o) => o.end_loading !== null && o.end_loading !== undefined)
  @IsDateString()
  end_loading?: string | null;

  @ApiProperty({
    description: 'Total Vessel (must be > 0 if end_loading is provided)',
    example: 100.5,
    required: false,
  })
  @ValidateIf((o) => !!o.end_loading) // validasi hanya kalau end_loading ada
  @IsNumber({}, { message: 'Total Vessel must be a number' })
  @Min(1, {
    message: 'Total Vessel is required when Finish Date is provided',
  })
  total_vessel?: number;

  @ApiProperty({
    description: 'Volume by Survey (must be > 0 if end_loading is provided)',
    example: 95.2,
    required: false,
  })
  @ValidateIf((o) => !!o.end_loading)
  @IsNumber({}, { message: 'Vol by Survey must be a number' })
  @Min(1, {
    message: 'Vol by Survey is required when Finish Date is provided',
  })
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
