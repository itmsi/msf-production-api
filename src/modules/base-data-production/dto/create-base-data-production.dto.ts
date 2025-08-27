import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ShiftType } from '../entities/parent-base-data-pro.entity';
import { MaterialType } from '../entities/base-data-pro.entity';

export class BaseDataProDetailDto {
  @ApiProperty({ description: 'Kilometer awal', example: 10 })
  @IsInt()
  @IsNotEmpty()
  kmAwal: number;

  @ApiProperty({ description: 'Kilometer akhir', example: 25 })
  @IsInt()
  @IsNotEmpty()
  kmAkhir: number;

  @ApiProperty({ 
    description: 'Total kilometer (calculated automatically as kmAkhir - kmAwal if not provided)', 
    example: 0, 
    required: false 
  })
  @IsInt()
  @IsOptional()
  totalKm?: number;

  @ApiProperty({ description: 'Hour meter awal', example: 5 })
  @IsInt()
  @IsNotEmpty()
  hmAwal: number;

  @ApiProperty({ description: 'Hour meter akhir', example: 12 })
  @IsInt()
  @IsNotEmpty()
  hmAkhir: number;

  @ApiProperty({ 
    description: 'Total hour meter (calculated automatically as hmAkhir - hmAwal if not provided)', 
    example: 0, 
    required: false 
  })
  @IsInt()
  @IsOptional()
  totalHm?: number;

  @ApiProperty({ description: 'ID loading point', example: 1 })
  @IsInt()
  @IsNotEmpty()
  loadingPointId: number;

  @ApiProperty({ description: 'ID dumping point', example: 1 })
  @IsInt()
  @IsNotEmpty()
  dumpingPointId: number;

  @ApiProperty({ description: 'Mround distance', example: 15 })
  @IsInt()
  @IsNotEmpty()
  mroundDistance: number;

  @ApiProperty({ description: 'Distance', example: 15 })
  @IsInt()
  @IsNotEmpty()
  distance: number;

  @ApiProperty({ description: 'Total vessel', example: 3 })
  @IsInt()
  @IsNotEmpty()
  totalVessel: number;

  @ApiProperty({ description: 'Material type', enum: MaterialType, example: MaterialType.BIOMAS })
  @IsEnum(MaterialType)
  @IsNotEmpty()
  material: MaterialType;
}

export class CreateBaseDataProductionDto {
  @ApiProperty({ description: 'ID unit', example: 6 })
  @IsInt()
  @IsNotEmpty()
  unitId: number;

  @ApiProperty({ description: 'Activity date', example: '2025-08-21' })
  @IsString()
  @IsNotEmpty()
  activityDate: string;

  @ApiProperty({ description: 'Shift type', enum: ShiftType, example: ShiftType.DS })
  @IsEnum(ShiftType)
  @IsNotEmpty()
  shift: ShiftType;

  @ApiProperty({ description: 'ID driver', example: 1 })
  @IsInt()
  @IsNotEmpty()
  driverId: number;

  @ApiProperty({ description: 'Start shift time', example: '2025-08-21 08:00:00' })
  @IsString()
  @IsOptional()
  startShift?: string;

  @ApiProperty({ description: 'End shift time', example: '2025-08-21 16:00:00' })
  @IsString()
  @IsOptional()
  endShift?: string;

  @ApiProperty({ description: 'Base data pro details', type: [BaseDataProDetailDto] })
  @ValidateNested({ each: true })
  @Type(() => BaseDataProDetailDto)
  @IsNotEmpty()
  detail: BaseDataProDetailDto[];
}
