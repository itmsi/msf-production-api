import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HaulingListResponseDto {
  @ApiProperty({ description: 'ID hauling list' })
  id: number;

  @ApiProperty({ description: 'Tanggal aktivitas' })
  activity_date: string;

  @ApiProperty({ description: 'Shift' })
  shift: string;

  @ApiProperty({ description: 'Waktu' })
  time: string;

  @ApiProperty({ description: 'ID unit loading' })
  unit_loading_id: number;

  @ApiProperty({ description: 'Nama unit loading' })
  unit_loading_name: string;

  @ApiProperty({ description: 'ID unit hauler' })
  unit_hauler_id: number;

  @ApiProperty({ description: 'Nama unit hauler' })
  unit_hauler_name: string;

  @ApiProperty({ description: 'Material' })
  material: string;

  @ApiProperty({ description: 'ID loading point' })
  loading_point_id: number;

  @ApiProperty({ description: 'Nama loading point' })
  loading_point_name: string;

  @ApiPropertyOptional({ description: 'ID dumping point operation' })
  dumping_point_op_id?: number;

  @ApiPropertyOptional({ description: 'Nama dumping point operation' })
  dumping_point_op_name?: string;

  @ApiPropertyOptional({ description: 'ID dumping point barge' })
  dumping_point_barge_id?: number;

  @ApiPropertyOptional({ description: 'Nama dumping point barge' })
  dumping_point_barge_name?: string;

  @ApiProperty({ description: 'Jumlah vessel' })
  vessel: number;

  @ApiProperty({ description: 'Total tonnage' })
  total_tonnage: number;

  @ApiProperty({ description: 'Tanggal dibuat' })
  createdAt: Date;

  @ApiProperty({ description: 'Tanggal diupdate' })
  updatedAt: Date;
}
