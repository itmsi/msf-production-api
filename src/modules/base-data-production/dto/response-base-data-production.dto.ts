import { ApiProperty } from '@nestjs/swagger';
import { MaterialType } from '../entities/base-data-pro.entity';
import { ShiftType } from '../entities/parent-base-data-pro.entity';

export class BaseDataProDetailResponseDto {
  @ApiProperty({ description: 'ID' })
  id: number;

  @ApiProperty({ description: 'Parent base data pro ID' })
  parentBaseDataProId: number;

  @ApiProperty({ description: 'Kilometer awal' })
  kmAwal: number;

  @ApiProperty({ description: 'Kilometer akhir' })
  kmAkhir: number;

  @ApiProperty({ description: 'Total kilometer' })
  totalKm: number;

  @ApiProperty({ description: 'Hour meter awal' })
  hmAwal: number;

  @ApiProperty({ description: 'Hour meter akhir' })
  hmAkhir: number;

  @ApiProperty({ description: 'Total hour meter' })
  totalHm: number;

  @ApiProperty({ description: 'ID loading point' })
  loadingPointId: number;

  @ApiProperty({ description: 'ID dumping point' })
  dumpingPointId: number;

  @ApiProperty({ description: 'Mround distance' })
  mroundDistance: number;

  @ApiProperty({ description: 'Distance' })
  distance: number;

  @ApiProperty({ description: 'Total vessel' })
  totalVessel: number;

  @ApiProperty({ description: 'Material type', enum: MaterialType })
  material: MaterialType;
}

export class ParentBaseDataProResponseDto {
  @ApiProperty({ description: 'ID' })
  id: number;

  @ApiProperty({ description: 'ID unit' })
  unitId: number;

  @ApiProperty({ description: 'Activity date' })
  activityDate: Date;

  @ApiProperty({ description: 'Shift type', enum: ShiftType })
  shift: ShiftType;

  @ApiProperty({ description: 'ID driver' })
  driverId: number;

  @ApiProperty({ description: 'Start shift time' })
  startShift: Date | null;

  @ApiProperty({ description: 'End shift time' })
  endShift: Date | null;

  @ApiProperty({ description: 'Base data pro details', type: [BaseDataProDetailResponseDto] })
  baseDataPro: BaseDataProDetailResponseDto[];
}

export class BaseDataProductionListResponseDto {
  @ApiProperty({ description: 'ID dari tabel r_parent_base_data_pro' })
  id: number;

  @ApiProperty({ description: 'Date dari kolom activity_date' })
  date: Date;

  @ApiProperty({ description: 'Shift dari kolom shift' })
  shift: string;

  @ApiProperty({ description: 'Driver name dari join ke tabel m_user' })
  driver: string;

  @ApiProperty({ description: 'Activity name dari join ke tabel m_activities' })
  activity: string;

  @ApiProperty({ description: 'Unit info dari join ke tabel m_unit' })
  unit: string;

  @ApiProperty({ description: 'Start shift dari kolom start_shift' })
  start_shift: Date | null;

  @ApiProperty({ description: 'End shift dari kolom end_shift' })
  end_shift: Date | null;

  @ApiProperty({ description: 'KM awal dari kolom km_awal' })
  km_awal: number;

  @ApiProperty({ description: 'KM akhir dari kolom km_akhir' })
  km_akhir: number;

  @ApiProperty({ description: 'HM awal dari kolom hm_awal' })
  hm_awal: number;

  @ApiProperty({ description: 'HM akhir dari kolom hm_akhir' })
  hm_akhir: number;

  @ApiProperty({ description: 'Total KM (km_akhir - km_awal)' })
  total_km: number;

  @ApiProperty({ description: 'Total HM (hm_akhir - hm_awal)' })
  total_hm: number;

  @ApiProperty({ description: 'Total vessel dari kolom total_vessel' })
  total_vessel: number;

  @ApiProperty({ description: 'Loading point name dari join ke tabel m_operation_points' })
  loading_point: string;

  @ApiProperty({ description: 'Dumping point name dari join ke tabel m_operation_points' })
  dumping_point: string;

  @ApiProperty({ description: 'Mround distance dari kolom mround_distance' })
  mround_distance: number;

  @ApiProperty({ description: 'Distance dari kolom distance' })
  distance: number;

  @ApiProperty({ description: 'Material dari kolom material', enum: MaterialType })
  material: MaterialType;
}

export class PaginatedBaseDataProductionResponseDto {
  @ApiProperty({ description: 'Data' })
  data: BaseDataProductionListResponseDto[];

  @ApiProperty({ description: 'Total items' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;

  @ApiProperty({ description: 'Total pages' })
  totalPages: number;
}
