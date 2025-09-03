import { ApiProperty } from '@nestjs/swagger';

export class SpiderMetricDto {
  @ApiProperty({ description: 'Metric name', example: 'CT' })
  metric: string;

  @ApiProperty({ description: 'Target value', example: 100 })
  target: number;

  @ApiProperty({ description: 'Actual value', example: 80 })
  actual: number;

  @ApiProperty({ description: 'Percentage achieved', example: 80 })
  percent: number;
}

export class SpiderResponseDto {
  @ApiProperty({ description: 'HTTP status code', example: 200 })
  statusCode: number;

  @ApiProperty({ description: 'Response message', example: 'success' })
  message: string;

  @ApiProperty({ description: 'Spider chart data', type: [SpiderMetricDto] })
  data: SpiderMetricDto[];
}

export class AchievementItemDto {
  @ApiProperty({ description: 'Activity name', example: 'Ore Hauling' })
  name: string;

  @ApiProperty({ description: 'Target value', example: 10000 })
  target: number;

  @ApiProperty({ description: 'Actual value', example: 8500 })
  actual: number;
}

export class AchievementResponseDto {
  @ApiProperty({ description: 'HTTP status code', example: 200 })
  statusCode: number;

  @ApiProperty({ description: 'Response message', example: 'success' })
  message: string;

  @ApiProperty({ description: 'Achievement data', type: [AchievementItemDto] })
  data: AchievementItemDto[];
}

export class HaulingDataDto {
  @ApiProperty({ description: 'Date in DD/MM format', example: '01/07' })
  date: string;

  @ApiProperty({ description: 'Target value', example: 2500 })
  target: number;

  @ApiProperty({ description: 'Actual value', example: 2000 })
  actual: number;

  @ApiProperty({ description: 'Slippery condition hours', example: 5 })
  slippery: number;

  @ApiProperty({ description: 'Rain condition hours', example: 8 })
  rain: number;
}

export class HaulingResponseDto {
  @ApiProperty({ description: 'HTTP status code', example: 200 })
  statusCode: number;

  @ApiProperty({ description: 'Response message', example: 'success' })
  message: string;

  @ApiProperty({ description: 'Hauling data', type: [HaulingDataDto] })
  data: HaulingDataDto[];
}

export class BargeDataDto {
  @ApiProperty({ description: 'Date in DD/MM format', example: '01/07' })
  date: string;

  @ApiProperty({ description: 'Barge value', example: 3000 })
  barge: number;

  @ApiProperty({ description: 'Hauling value', example: 2800 })
  hauling: number;
}

export class BargeResponseDto {
  @ApiProperty({ description: 'HTTP status code', example: 200 })
  statusCode: number;

  @ApiProperty({ description: 'Response message', example: 'success' })
  message: string;

  @ApiProperty({ description: 'Barge data', type: [BargeDataDto] })
  data: BargeDataDto[];
}

export class TmmDataDto {
  @ApiProperty({ description: 'Date in DD/MM format', example: '01/07' })
  date: string;

  @ApiProperty({ description: 'Ore value', example: 500 })
  ore: number;

  @ApiProperty({ description: 'Overburden value', example: 1400 })
  over: number;

  @ApiProperty({ description: 'Total Material Movement', example: 2000 })
  tmm: number;
}

export class TmmResponseDto {
  @ApiProperty({ description: 'HTTP status code', example: 200 })
  statusCode: number;

  @ApiProperty({ description: 'Response message', example: 'success' })
  message: string;

  @ApiProperty({ description: 'TMM data', type: [TmmDataDto] })
  data: TmmDataDto[];
}

export class LostTimeItemDto {
  @ApiProperty({ description: 'Lost time category', example: 'Slippery' })
  name: string;

  @ApiProperty({ description: 'Lost time value', example: 30 })
  value: number;
}

export class LostTimeResponseDto {
  @ApiProperty({ description: 'HTTP status code', example: 200 })
  statusCode: number;

  @ApiProperty({ description: 'Response message', example: 'success' })
  message: string;

  @ApiProperty({ description: 'Lost time data', type: [LostTimeItemDto] })
  data: LostTimeItemDto[];
}

export class DailyAchievementDetailDto {
  @ApiProperty({ description: 'Activity name', example: 'Ore Hauling' })
  name: string;

  @ApiProperty({ description: 'Target value', example: 10000 })
  target: number;

  @ApiProperty({ description: 'Actual value', example: 8500 })
  actual: number;
}

export class DailyAchievementItemDto {
  @ApiProperty({ description: 'Achievement title', example: 'Daily ACV' })
  title: string;

  @ApiProperty({ description: 'Achievement details', type: [DailyAchievementDetailDto] })
  details: DailyAchievementDetailDto[];
}

export class DailyAchievementResponseDto {
  @ApiProperty({ description: 'HTTP status code', example: 200 })
  statusCode: number;

  @ApiProperty({ description: 'Response message', example: 'success' })
  message: string;

  @ApiProperty({ description: 'Daily achievement data', type: [DailyAchievementItemDto] })
  data: DailyAchievementItemDto[];
}

export class BargeListItemDto {
  @ApiProperty({ description: 'Barge name', example: 'Barge Alpha' })
  barge_name: string;

  @ApiProperty({ description: 'Start loading time', example: '2025-09-01 08:00' })
  start_loading: string;

  @ApiProperty({ description: 'Finish loading time', example: '2025-09-01 14:30' })
  finish_load: string;

  @ApiProperty({ description: 'Capacity', example: 12000 })
  capacity: number;

  @ApiProperty({ description: 'Total vessel', example: 1 })
  total_vessel: number;

  @ApiProperty({ description: 'Volume by draft', example: 11800 })
  vol_by_draft: number;

  @ApiProperty({ description: 'Capacity per DT', example: 95 })
  capacity_per_dt: number;

  @ApiProperty({ description: 'ACV value', example: 92 })
  acv: number;

  @ApiProperty({ description: 'Remarks', example: 'Smooth operation' })
  remarks: string;
}

export class BargeListDetailDto {
  @ApiProperty({ description: 'Detail title', example: 'Capacity' })
  title: string;

  @ApiProperty({ description: 'Detail value', example: 130000 })
  value: number;
}

export class BargeListDataDto {
  @ApiProperty({ description: 'Barge list', type: [BargeListItemDto] })
  list: BargeListItemDto[];

  @ApiProperty({ description: 'Barge details', type: [BargeListDetailDto] })
  details: BargeListDetailDto[];
}

export class BargeListResponseDto {
  @ApiProperty({ description: 'HTTP status code', example: 200 })
  statusCode: number;

  @ApiProperty({ description: 'Response message', example: 'success' })
  message: string;

  @ApiProperty({ description: 'Barge list data', type: BargeListDataDto })
  data: BargeListDataDto;
}
