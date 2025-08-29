import { ApiProperty } from '@nestjs/swagger';

export class ActivitiesResponseDto {
  @ApiProperty({
    description: 'ID dari tabel m_operation_points',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nama dari tabel m_operation_points',
    example: 'OP-001',
  })
  name: string;

  @ApiProperty({
    description: 'Longitude dari tabel m_operation_points',
    example: 106.8456,
    nullable: true,
  })
  longitude: number | null;

  @ApiProperty({
    description: 'Latitude dari tabel m_operation_points',
    example: -6.2088,
    nullable: true,
  })
  latitude: number | null;
}
