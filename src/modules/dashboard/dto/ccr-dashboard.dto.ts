import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ShiftType } from 'src/modules/hauling-problem';

class AttendanceItem {
  @ApiProperty()
  name: string;

  @ApiProperty()
  value: number;

  @ApiProperty()
  color: string;
}

class ChartMeta {
  @ApiProperty()
  actual: number;

  @ApiProperty()
  target: number;

  @ApiProperty()
  percent: number;
}

class ChartSummaryItem {
  @ApiProperty()
  title: string;

  @ApiProperty()
  meta: ChartMeta;
}

class WorkingHourItem {
  @ApiProperty()
  title: string;

  @ApiProperty()
  value: number;
}

export class AttendanceSummaryDto {
  @ApiProperty()
  total_mp: number;

  @ApiProperty({ type: [AttendanceItem] })
  attendance: AttendanceItem[];

  @ApiProperty({ type: [ChartSummaryItem] })
  chart_summary: ChartSummaryItem[];

  @ApiProperty({ type: [WorkingHourItem] })
  working_hour: WorkingHourItem[];
}

export class HaulingSummaryResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: AttendanceSummaryDto })
  data: AttendanceSummaryDto;
}

// Fleet Status
export class FleetStatusItemDto {
  @ApiProperty({ example: 123 })
  fleet_id: number;

  @ApiProperty({ example: 'KFM-DT-001' })
  fleet: string;

  @ApiProperty({ example: '2025-10-01 07:00' })
  start_loading: string;

  @ApiProperty({ example: '2025-10-01 07:00' })
  finish_loading: string;

  @ApiProperty({ example: 'Quarry A' })
  loading_point: string;

  @ApiProperty({ example: 'Dumping Site 1' })
  dumping_point: string;

  @ApiProperty({ example: 5 })
  target_hauler: number;

  @ApiProperty({ example: 4 })
  actual_hauler: number;

  @ApiProperty({ example: 0.95 })
  mf: number;

  @ApiProperty({ example: 100 })
  total_vessel: number;

  @ApiProperty({ example: 400 })
  total_tonnage: number;

  @ApiProperty({ example: 200 })
  ore: number;

  @ApiProperty({ example: 100 })
  quarry: number;

  @ApiProperty({ example: 50 })
  ob: number;

  @ApiProperty({ example: 'AYODA 3310' })
  barge_name?: string;
}

export class FleetStatusResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'success' })
  message: string;

  @ApiProperty({ type: [FleetStatusItemDto] })
  data: FleetStatusItemDto[];
}

export class TonnageResponseDto {
  statusCode: number;
  message: string;
  data: ChartDataDto;
}

export class ChartItemDto {
  hour: string;
  [fleet: string]: string | number; // index signature, jangan pakai decorator
}

export class ChartMetaDto {
  [fleet: string]: string; // index signature, jangan pakai decorator
}

export class ChartDataDto {
  chart: ChartItemDto[];
  meta: ChartMetaDto;
}

// Barging - Summary
export class MetaDto {
  @ApiProperty({ example: 4000 })
  actual: number;

  @ApiProperty({ example: 8000 })
  target: number;

  @ApiProperty({ example: 50 })
  percent: number;
}

export class BargingSummaryItemDto {
  @ApiProperty({ example: 'Unit Running' })
  title: string;

  @ApiProperty({ type: () => MetaDto })
  meta: MetaDto;
}

export class BargingSummaryResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'success' })
  message: string;

  @ApiProperty({ type: [BargingSummaryItemDto] })
  data: BargingSummaryItemDto[];
}

// CCR - Dashboard activities
export class CcrActivitiesItemDto {
  @ApiProperty({ example: 'No Operator' })
  label: string;

  @ApiProperty({ example: 3000 })
  target: number;

  @ApiProperty({ example: 2800 })
  actual: number;
}

export class CcrActivitesResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'success' })
  message: string;

  @ApiProperty({ type: [CcrActivitiesItemDto] })
  data: CcrActivitiesItemDto[];
}

export enum ActivityType {
  HAULING = 'hauling',
  BARGING = 'barging',
}

export class CcrActivitiesDto {
  @ApiPropertyOptional({ description: 'Filter berdasarkan tanggal' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({
    description: 'Filter berdasarkan type aktivitas',
    enum: ActivityType,
    example: ActivityType.HAULING,
  })
  @IsEnum(ActivityType, { message: 'type harus hauling atau barging' })
  @IsNotEmpty({ message: 'type is required' })
  type: ActivityType;

  @ApiProperty({
    description: 'Shift (misal: ds/ns)',
    enum: ShiftType,
    example: ShiftType.DS,
  })
  @IsNotEmpty({ message: 'shift is required' })
  shift: ShiftType;
}

export class CcrTonnageDto {
  @ApiPropertyOptional({ description: 'Filter berdasarkan tanggal' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({
    description: 'Unit ID wajib dikirim, boleh kosong',
    type: [Number],
  })
  @IsArray({ message: 'unit_id harus berupa array' })
  @IsNumber({}, { each: true, message: 'unit_id harus berupa angka' })
  unit_id: number[];

  @ApiPropertyOptional({ description: 'Shift (misal: ds/ns)' })
  @IsOptional()
  @IsString()
  shift?: string;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan type aktivitas',
    enum: ActivityType,
  })
  @IsOptional()
  @IsEnum(ActivityType, { message: 'type harus hauling atau barging' })
  type?: ActivityType;
}

// Raw data hasil query tonnage/vessel
export class RawDataTonnageVesselRow {
  @ApiProperty({ example: 100, description: 'Nilai tonnage atau vessel' })
  value: number | null;

  @ApiProperty({
    example: '2025-09-03T01:00:00.000Z',
    description: 'Waktu aktivitas',
  })
  time: Date;

  @ApiProperty({ example: 'KFM-DT-001', description: 'No unit' })
  unit: string;
}

// Data per jam untuk chart tonnage/vessel
export class ChartTonnageVesselRow {
  @ApiProperty({ example: '01-02', description: 'Rentang jam' })
  hour: string;

  @ApiProperty({
    example: 120,
    description: 'Total semua unit pada jam tersebut',
  })
  total: number;

  // Dynamic unit key → tidak bisa pakai decorator
  [unit: string]: number | string;
}

// Hasil akhir chart tonnage/vessel
export class ChartTonnageVesselResult {
  @ApiProperty({ type: [ChartTonnageVesselRow] })
  chart: ChartTonnageVesselRow[];

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'string' },
    description: 'Meta berisi mapping unit ke warna',
    example: {
      'KFM-DT-001': '#F6C89F',
      'KFM-DT-002': '#94D1B2',
      total: '#D96C06',
    },
  })
  meta: Record<string, string>;
}
