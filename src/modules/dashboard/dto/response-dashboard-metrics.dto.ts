import { ApiProperty } from '@nestjs/swagger';

export class SpiderAchievementResponseDto {
  @ApiProperty({description: 'Cycle Time',example: 'CT'})
  metric: string;

  @ApiProperty({description: 'Target Production', example: 100})
  target: number;

  @ApiProperty({description: 'Actual Production',example: 80})
  actual: number;

  @ApiProperty({description: 'Percentage', example: 80})
  percent: number;
}

export class MtdAchievementResponseDto {
  @ApiProperty({description: 'Cycle Time', example: 'Ore Hauling'})
  name: string;

  @ApiProperty({description: 'Target Production',example: 10000})
  Target: number;

  @ApiProperty({description: 'Actual Production', example: 80})
  actual: number;
}

export class HaulingAchievementResponseDto {
  @ApiProperty({description: 'date', example: ''})
  date: string;

  @ApiProperty({description: 'target', example: 2500})
  target: number;

  @ApiProperty({description: 'slippery', example: ''})
  slippery: number;

  @ApiProperty({description: 'rain', example: ''})
  rain: number;
}

export class BargeAchievementResponseDto {
  @ApiProperty({description: 'date', example: ''})
  date: string;

  @ApiProperty({description: 'barge', example: 2500})
  barge: number;

  @ApiProperty({description: 'hauling', example: ''})
  hauling: number;
}