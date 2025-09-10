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
    description: 'Page number for pagination', 
    example: '1',
    required: false 
  })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiProperty({ 
    description: 'Number of items per page', 
    example: '10',
    required: false 
  })
  @IsOptional()
  @IsString()
  limit?: string;

  @ApiProperty({ 
    description: 'Unit number filter (e.g., DT-001)', 
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
    description: 'Shift Type (DS/NS)', 
    example: 'DS',
    required: false 
  })
  @IsOptional()
  @IsString()
  shift?: string;

  @ApiProperty({ 
    description: 'Page number for pagination', 
    example: '1',
    required: false 
  })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiProperty({ 
    description: 'Number of items per page', 
    example: '10',
    required: false 
  })
  @IsOptional()
  @IsString()
  limit?: string;

  @ApiProperty({ 
    description: 'Unit number filter (e.g., DT-001)', 
    example: 'DT-001',
    required: false 
  })
  @IsOptional()
  @IsString()
  unit?: string;
}

export class MtdProductionItemDto {
  @ApiProperty({ description: 'Activity Date', example: '2025-10-01' })
  activity_date: string;

  @ApiProperty({ description: 'Tyre Type', example: '6x4' })
  tyre_type: string;

  @ApiProperty({ description: 'Unit number', example: 'KFM-DT-001' })
  no_unit: string;

  @ApiProperty({ description: 'Shift', example: 'ds' })
  shift: string;

  @ApiProperty({ description: 'Machine Operating Hours', example: 24 })
  mohh: number;

  @ApiProperty({ description: 'Standby Time', example: 2 })
  standby_time: number;

  @ApiProperty({ description: 'Breakdown Time', example: 3.5 })
  breakdown_time: number;

  @ApiProperty({ description: 'Effective Working Hours', example: 35 })
  ewh_time: number;

  @ApiProperty({ description: 'Kilometers', example: 500 })
  km: number;

  @ApiProperty({ description: 'Hours Meter', example: 0 })
  hm: number;

  @ApiProperty({ description: 'Speed (km/hm)', example: 0 })
  speed: number;

  @ApiProperty({ description: 'Cycle Time', example: 0 })
  ct: number;

  @ApiProperty({ description: 'Physical Availability', example: 0 })
  pa: number;

  @ApiProperty({ description: 'Unit Availability', example: 0 })
  ua: number;

  @ApiProperty({ description: 'Mechanical Availability', example: 0 })
  ma: number;

  @ApiProperty({ description: 'Effectiveness Utilization', example: 0 })
  eu: number;

  @ApiProperty({ description: 'Ore Hauling Count', example: 5 })
  ore_hauling: number;

  @ApiProperty({ description: 'Quarry Count', example: 0 })
  quarry: number;

  @ApiProperty({ description: 'OB Count', example: 0 })
  ob: number;

  @ApiProperty({ description: 'Boulder Count', example: 20 })
  boulder: number;

  @ApiProperty({ description: 'Ore Barge Count', example: 8 })
  ore_barge: number;

  @ApiProperty({ description: 'Ore Hauling Tonnage', example: 132.8 })
  ore_hauling_tonnage: number;

  @ApiProperty({ description: 'Quarry Tonnage', example: 0 })
  quarry_tonnage: number;

  @ApiProperty({ description: 'Ore Barge Tonnage', example: 212.48 })
  ore_barge_tonnage: number;

  @ApiProperty({ description: 'Boulder Tonnage', example: 0 })
  boulder_tonnage: number;

  @ApiProperty({ description: 'OB Tonnage', example: 0 })
  ob_tonnage: number;

  @ApiProperty({ description: 'Stripping Ratio', example: 0 })
  sr: number;
}

export class PaginationDto {
  @ApiProperty({ description: 'Total number of items', example: 7 })
  total: number;

  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Number of items per page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Last page number', example: 1 })
  lastPage: number;
}

export class MtdProductionResponseDto {
  @ApiProperty({ description: 'HTTP status code', example: 200 })
  statusCode: number;

  @ApiProperty({ description: 'Response message', example: 'Data berhasil diambil' })
  message: string;

  @ApiProperty({ description: 'MTD Production data', type: [MtdProductionItemDto] })
  data: MtdProductionItemDto[];

  @ApiProperty({ description: 'Pagination information', type: PaginationDto })
  pagination: PaginationDto;
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