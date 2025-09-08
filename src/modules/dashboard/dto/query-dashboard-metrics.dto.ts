import { ApiProperty } from "@nestjs/swagger";

export class QueryDashboardMetricsDto {
  @ApiProperty({
    example: '2025-01-01',
    description: 'ID unik brand',
  })
  startDate: string;

  @ApiProperty({
    example: '2025-01-31',
    description: 'End Date',
  })
  endDate: string;
}