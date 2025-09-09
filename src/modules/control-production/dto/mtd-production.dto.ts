import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsString } from "class-validator";


export class MtdProductionQueryDto {
  @ApiProperty({ 
    description: 'Start date for filtering (YYYY-MM-DD format)', 
    example: '2025-01-01',
    required: false 
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ 
    description: 'End date for filtering (YYYY-MM-DD format)', 
    example: '2025-01-31',
    required: false 
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ 
    description: 'DT-001', 
    example: 'DT-001',
    required: false 
  })
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

    @ApiProperty({ 
    description: 'DT-001', 
    example: 'DT-001',
    required: false 
  })
  @IsOptional()
  @IsString()
  unit?: string;
}

export class DayProductionQueryDto {
  @ApiProperty({ 
    description: 'Start date for filtering (YYYY-MM-DD format)', 
    example: '2025-01-01',
    required: false 
  })
  @IsOptional()
  @IsDateString()
  selectedDate?: string;

  @ApiProperty({ 
    description: '1', 
    example: '1',
    required: false 
  })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiProperty({ 
    description: 'Shift Type', 
    example: 'NS',
    required: false 
  })
  @IsOptional()
  @IsString()
  shift?: string;

  @IsOptional()
  @IsString()
  limit?: string;

    @ApiProperty({ 
    description: 'DT-001', 
    example: 'DT-001',
    required: false 
  })
  @IsOptional()
  @IsString()
  unit?: string;
}

export class MtdProductionItemDto {
  @ApiProperty({ description: 'DT Type', example: '10' })
  dt_type: string;

  @ApiProperty({ description: 'Unit number', example: 'DT-001' })
  unit: string;

  @ApiProperty({ description: 'Date', example: '2025-01-15' })
  activityDate: string;

  @ApiProperty({ description: 'Material type', example: 'ore barge' })
  mohh: string;

  @ApiProperty({ description: 'Vessel count', example: 5 })
  standby_time: number;

  @ApiProperty({ description: 'Tonnage', example: 132.8 })
  breakdown_time: number;

  @ApiProperty({ description: 'Effective working hours', example: 2.5 })
  ewh_time: number;

  @ApiProperty({ description: 'Phsyical Availablity', example: 1.2 })
  pa: number;

  @ApiProperty({ description: 'UA (Unit Availablity)', example: 1.2 })
  ua: number;

  @ApiProperty({ description: 'MA (Mechanical Availablity)', example: 1.2 })
  ma: number;

  @ApiProperty({ description: 'EU (Effectivity Utilization)', example: 1.2 })
  eu: number;

  @ApiProperty({ description: 'KM', example: 1.2 })
  km: number;

  @ApiProperty({ description: 'HM', example: 1.2 })
  hm: number;

  @ApiProperty({ description: 'Speed', example: 1.2 })
  speed: number;

  @ApiProperty({ description: 'Cycle Time', example: 1.2 })
  ct: number;

  @ApiProperty({ description: 'Material Ore acitivity Hauling', example: 1.2 })
  ore_hauling: number;

  @ApiProperty({ description: 'quarry', example: 1.2 })
  quarry: number;

  @ApiProperty({ description: 'Material Ore activity barge', example: 1.2 })
  ore_barge: number;

  @ApiProperty({ description: 'OB', example: 1.2 })
  ob: number;

  @ApiProperty({ description: 'Boulder', example: 1.2 })
  boulder: number;

  @ApiProperty({ description: 'Material Ore acitivity Hauling Tonnage', example: 1.2 })
  ore_hauling_tonnage: number;

  @ApiProperty({ description: 'Material Ore acitivity Hauling Tonnage', example: 1.2 })
  ore_barge_tonnage: number;

  @ApiProperty({ description: 'Material Ore acitivity Hauling Tonnage', example: 1.2 })
  ob_tonnage: number;

  @ApiProperty({ description: 'Boulder', example: 1.2 })
  boulder_tonnage: number;

  @ApiProperty({ description: 'Boulder', example: 1.2 })
  quarry_tonnage: number;

  @ApiProperty({ description: 'Striping ratio', example: 1.2 })
  sr: number;
}

export class MtdProductionResponseDto {
  @ApiProperty({ description: 'HTTP status code', example: 200 })
  statusCode: number;

  @ApiProperty({ description: 'Response message', example: 'success' })
  message: string;

  @ApiProperty({ description: 'Daily summary production data', type: [MtdProductionItemDto] })
  data: MtdProductionItemDto[];
}

export class DayProductionItemDto {
  @ApiProperty({ description: 'No.', example: '10' })
  id: number;

  @ApiProperty({ description: 'Unit number', example: 'DT-001' })
  no_unit: string;

  @ApiProperty({ description: 'Activity Date', example: '2025-01-15' })
  activity_date: string;

  @ApiProperty({ description: 'Shift', example: '2025-01-15' })
  shift: string;

  @ApiProperty({ description: 'Tyre Type', example: '2025-01-15' })
  tyre_type: string;

  @ApiProperty({ description: 'Material type', example: 'ore barge' })
  mohh: number;

  @ApiProperty({ description: 'Vessel count', example: 5 })
  standby_time: number;

  @ApiProperty({ description: 'Tonnage', example: 132.8 })
  breakdown_time: number;

  @ApiProperty({ description: 'Effective working hours', example: 2.5 })
  ewh_time: number;

  @ApiProperty({ description: 'Phsyical Availablity', example: 1.2 })
  pa: number;

  @ApiProperty({ description: 'UA (Unit Availablity)', example: 1.2 })
  ua: number;

  @ApiProperty({ description: 'MA (Mechanical Availablity)', example: 1.2 })
  ma: number;

  @ApiProperty({ description: 'EU (Effectivity Utilization)', example: 1.2 })
  eu: number;

  @ApiProperty({ description: 'Material Ore acitivity Hauling', example: 1.2 })
  ore_hauling: number;

  @ApiProperty({ description: 'quarry', example: 1.2 })
  quarry: number;

  @ApiProperty({ description: 'Material Ore activity barge', example: 1.2 })
  ore_barge: number;

  @ApiProperty({ description: 'OB', example: 1.2 })
  ob: number;

  @ApiProperty({ description: 'Boulder', example: 1.2 })
  boulder: number;

  @ApiProperty({ description: 'Material Ore acitivity Hauling Tonnage', example: 1.2 })
  ore_hauling_tonnage: number;

  @ApiProperty({ description: 'Material Ore acitivity Hauling Tonnage', example: 1.2 })
  ore_barge_tonnage: number;

  @ApiProperty({ description: 'Material Ore acitivity Hauling Tonnage', example: 1.2 })
  ob_tonnage: number;

  @ApiProperty({ description: 'Boulder', example: 1.2 })
  boulder_tonnage: number;

  @ApiProperty({ description: 'Boulder', example: 1.2 })
  quarry_tonnage: number;

  @ApiProperty({ description: 'Striping ratio', example: 1.2 })
  sr: number;
}

export class DayProductionResponseDto {
  @ApiProperty({ description: 'HTTP status code', example: 200 })
  statusCode: number;

  @ApiProperty({ description: 'Response message', example: 'success' })
  message: string;

  @ApiProperty({ description: 'Daily summary production data', type: [DayProductionItemDto] })
  data: DayProductionItemDto[];
}

export class MTDWorkHourResponseDto {
  @ApiProperty({ description: 'HTTP status code', example: 200 })
  statusCode: number;

  @ApiProperty({ description: 'Response message', example: 'success' })
  message: string;

  @ApiProperty({ description: 'Daily summary production data', type: [MtdProductionItemDto] })
  data: MtdProductionItemDto[];
}

export class DayWorkHourResponseDto {
  @ApiProperty({ description: 'HTTP status code', example: 200 })
  statusCode: number;

  @ApiProperty({ description: 'Response message', example: 'success' })
  message: string;

  @ApiProperty({ description: 'Daily summary production data', type: [MtdProductionItemDto] })
  data: MtdProductionItemDto[];
}