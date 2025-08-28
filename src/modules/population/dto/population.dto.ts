import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsInt,
  IsIn,
  IsNotEmpty,
} from 'class-validator';

export class CreatePopulationDto {
  @ApiProperty({
    description: 'Tanggal kedatangan unit',
    example: '2024-01-01',
  })
  @IsDateString()
  date_arrive: string;

  @ApiProperty({
    description: 'Status unit',
    example: 'active',
    enum: ['active', 'inactive'],
  })
  @IsEnum(['active', 'inactive'])
  status: string;

  @ApiProperty({
    description: 'ID unit type',
    example: 1,
  })
  @IsInt()
  unit_type_id: number;

  @ApiProperty({
    description: 'Nomor unit',
    example: 'EXC001',
  })
  @IsString()
  no_unit: string;

  @ApiProperty({
    description: 'VIN number',
    example: 'VIN123456789',
  })
  @IsString()
  vin_number: string;

  @ApiProperty({
    description: 'Nomor unit sistem',
    example: 'SYS001',
  })
  @IsString()
  no_unit_system: string;

  @ApiProperty({
    description: 'Brand engine',
    example: 'cummins',
    enum: ['cummins', 'weichai'],
  })
  @IsEnum(['cummins', 'weichai'])
  engine_brand: string;

  @ApiProperty({
    description: 'Serial engine',
    example: 'ENG123456',
  })
  @IsNotEmpty()
  @IsString()
  serial_engine: string;

  @ApiProperty({
    description: 'ID aktivitas',
    example: 1,
  })
  @IsInt()
  activities_id: number;

  @ApiProperty({
    description: 'Site origin',
    example: 'Site A',
  })
  @IsString()
  site_origin: string;

  @ApiProperty({
    description: 'Remarks',
    example: 'RFU',
    enum: ['RFU', 'BD'],
  })
  @IsEnum(['RFU', 'BD'])
  remarks: string;

  @ApiProperty({
    description: 'ID site',
    example: 1,
  })
  @IsInt()
  site_id: number;

  @ApiProperty({
    description: 'Company',
    example: 'PT ABC',
  })
  @IsString()
  company: string;

  @ApiProperty({
    description: 'Last unit number',
    example: 'LUN001',
  })
  @IsString()
  last_unit_number: string;

  @ApiProperty({
    description: 'Tipe ban',
    example: '6x4',
    enum: ['6x4', '8x4'],
  })
  @IsEnum(['6x4', '8x4'])
  tyre_type: string;
}

export class UpdatePopulationDto {
  @ApiProperty({
    description: 'Tanggal kedatangan unit',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date_arrive?: string;

  @ApiProperty({
    description: 'Status unit',
    example: 'active',
    enum: ['active', 'inactive'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: string;

  @ApiProperty({
    description: 'ID unit type',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  unit_type_id?: number;

  @ApiProperty({
    description: 'Nomor unit',
    example: 'EXC001',
    required: false,
  })
  @IsOptional()
  @IsString()
  no_unit?: string;

  @ApiProperty({
    description: 'VIN number',
    example: 'VIN123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  vin_number?: string;

  @ApiProperty({
    description: 'Nomor unit sistem',
    example: 'SYS001',
    required: false,
  })
  @IsOptional()
  @IsString()
  no_unit_system?: string;

  @ApiProperty({
    description: 'Brand engine',
    example: 'cummins',
    enum: ['cummins', 'weichai'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['cummins', 'weichai'])
  engine_brand?: string;

  @ApiProperty({
    description: 'Serial engine',
    example: 'ENG123456',
    required: false,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  serial_engine?: string;

  @ApiProperty({
    description: 'ID aktivitas',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  activities_id?: number;

  @ApiProperty({
    description: 'Site origin',
    example: 'Site A',
    required: false,
  })
  @IsOptional()
  @IsString()
  site_origin?: string;

  @ApiProperty({
    description: 'Remarks',
    example: 'RFU',
    enum: ['RFU', 'BD'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['RFU', 'BD'])
  remarks?: string;

  @ApiProperty({
    description: 'ID site',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  site_id?: number;

  @ApiProperty({
    description: 'Company',
    example: 'PT ABC',
    required: false,
  })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiProperty({
    description: 'Last unit number',
    example: 'LUN001',
    required: false,
  })
  @IsOptional()
  @IsString()
  last_unit_number?: string;

  @ApiProperty({
    description: 'Tipe ban',
    example: '6x4',
    enum: ['6x4', '8x4'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['6x4', '8x4'])
  tyre_type?: string;
}

export class PopulationResponseDto {
  @ApiProperty({
    description: 'ID population',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Tanggal kedatangan unit',
    example: '2024-01-01T00:00:00.000Z',
  })
  date_arrive: Date;

  @ApiProperty({
    description: 'Status unit',
    example: 'active',
  })
  status: string;

  @ApiProperty({
    description: 'ID unit type',
    example: 1,
  })
  unit_type_id: number;

  @ApiProperty({
    description: 'Nomor unit',
    example: 'EXC001',
  })
  no_unit: string;

  @ApiProperty({
    description: 'VIN number',
    example: 'VIN123456789',
  })
  vin_number: string;

  @ApiProperty({
    description: 'Nomor unit sistem',
    example: 'SYS001',
  })
  no_unit_system: string;

  @ApiProperty({
    description: 'Brand engine',
    example: 'cummins',
  })
  engine_brand: string;

  @ApiProperty({
    description: 'Serial engine',
    example: 'ENG123456',
  })
  serial_engine: string;

  @ApiProperty({
    description: 'ID aktivitas',
    example: 1,
  })
  activities_id: number;

  @ApiProperty({
    description: 'Site origin',
    example: 'Site A',
  })
  site_origin: string;

  @ApiProperty({
    description: 'Remarks',
    example: 'Unit dalam kondisi baik',
  })
  remarks: string;

  @ApiProperty({
    description: 'ID site',
    example: 1,
  })
  site_id: number;

  @ApiProperty({
    description: 'Company',
    example: 'PT ABC',
  })
  company: string;

  @ApiProperty({
    description: 'Last unit number',
    example: 'LUN001',
  })
  last_unit_number: string;

  @ApiProperty({
    description: 'Tipe ban',
    example: '6x4',
  })
  tyre_type: string;

  @ApiProperty({
    description: 'Tanggal dibuat',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Tanggal diupdate',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Unit type information',
    required: false,
  })
  unitType?: {
    id: number;
    unit_name: string;
    type_name: string;
    model_name: string;
    brand?: {
      id: number;
      brand_name: string;
    };
  };

  @ApiProperty({
    description: 'Activities information',
    required: false,
  })
  activities?: {
    id: number;
    activity_name: string;
  };

  @ApiProperty({
    description: 'Site information',
    required: false,
  })
  site?: {
    id: number;
    site_name: string;
  };
}

export class GetPopulationsQueryDto {
  @ApiProperty({
    description: 'Nomor halaman',
    example: '1',
    required: false,
  })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiProperty({
    description: 'Jumlah data per halaman',
    example: '10',
    required: false,
  })
  @IsOptional()
  @IsString()
  limit?: string;

  @ApiProperty({
    description: 'Kata kunci pencarian',
    example: 'excavator',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter berdasarkan status',
    example: 'active',
    enum: ['active', 'inactive'],
    required: false,
  })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;

  @ApiProperty({
    description: 'Filter berdasarkan unit type ID',
    example: '1',
    required: false,
  })
  @IsOptional()
  @IsString()
  unit_type_id?: string;

  @ApiProperty({
    description: 'Filter berdasarkan unit type name (case-insensitive)',
    example: 'excavator',
    required: false,
  })
  @IsOptional()
  @IsString()
  unit_type_name?: string;

  @ApiProperty({
    description: 'Filter berdasarkan activities ID',
    example: '1',
    required: false,
  })
  @IsOptional()
  @IsString()
  activities_id?: string;

  @ApiProperty({
    description: 'Filter berdasarkan site ID',
    example: '1',
    required: false,
  })
  @IsOptional()
  @IsString()
  site_id?: string;

  @ApiProperty({
    description: 'Filter berdasarkan brand engine',
    example: 'cummins',
    enum: ['cummins', 'weichai'],
    required: false,
  })
  @IsOptional()
  @IsIn(['cummins', 'weichai'])
  engine_brand?: string;

  @ApiProperty({
    description: 'Filter berdasarkan tipe ban',
    example: '6x4',
    enum: ['6x4', '8x4'],
    required: false,
  })
  @IsOptional()
  @IsIn(['6x4', '8x4'])
  tyre_type?: string;

  @ApiProperty({
    description: 'Filter berdasarkan tanggal dari',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsString()
  date_from?: string;

  @ApiProperty({
    description: 'Filter berdasarkan tanggal sampai',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsString()
  date_to?: string;

  @ApiProperty({
    description: 'Field untuk sorting',
    example: 'id',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    description: 'Urutan sorting (ASC atau DESC)',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    required: false,
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}

export class ImportPopulationCsvDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File CSV untuk import data population',
  })
  file: Express.Multer.File;
}

export class ImportPopulationCsvRowDto {
  @ApiProperty({
    description: 'Tanggal kedatangan (format: yyyy-mm-dd)',
    example: '2025-01-01',
  })
  date_arrive: string;

  @ApiProperty({
    description: 'Status unit (active atau inactive)',
    example: 'active',
    enum: ['active', 'inactive'],
  })
  status: string;

  @ApiProperty({
    description: 'Nama unit dari tabel m_unit_type',
    example: 'Excavator',
  })
  unit_name: string;

  @ApiProperty({
    description: 'Nomor unit',
    example: 'EXC001',
  })
  no_unit: string;

  @ApiProperty({
    description: 'VIN number',
    example: 'VIN123456789',
  })
  vin_number: string;

  @ApiProperty({
    description: 'Nomor unit sistem',
    example: 'SYS001',
  })
  no_unit_system: string;

  @ApiProperty({
    description: 'Serial engine',
    example: 'ENG123456',
  })
  serial_engine: string;

  @ApiProperty({
    description: 'Brand engine (cummins atau weichai)',
    example: 'cummins',
    enum: ['cummins', 'weichai'],
  })
  engine_brand: string;

  @ApiProperty({
    description: 'Nama aktivitas dari tabel m_activities',
    example: 'Mining',
  })
  activities_name: string;

  @ApiProperty({
    description: 'User site',
    example: 'user_site',
  })
  user_site: string;

  @ApiProperty({
    description: 'Site origin',
    example: 'Site A',
  })
  site_origin: string;

  @ApiProperty({
    description: 'Remarks (RFU atau BD)',
    example: 'RFU',
    enum: ['RFU', 'BD'],
  })
  remarks: string;

  @ApiProperty({
    description: 'Nama site dari tabel m_site',
    example: 'Site A',
  })
  site_name: string;

  @ApiProperty({
    description: 'Company',
    example: 'PT ABC',
  })
  company: string;

  @ApiProperty({
    description: 'Tipe ban (6x4 atau 8x4)',
    example: '6x4',
    enum: ['6x4', '8x4'],
  })
  tyre_type: string;

  @ApiProperty({
    description: 'Last unit number',
    example: 'LUN001',
    required: false,
  })
  @IsOptional()
  @IsString()
  last_unit_number?: string;
}

export class ImportPopulationPreviewItemDto {
  @ApiProperty({
    description: 'Status baris data',
    example: 'error',
  })
  status: string;

  @ApiProperty({
    description: 'Pesan untuk baris data',
    example: 'unit_name tidak ada',
  })
  message: string;

  @ApiProperty({
    description: 'Nomor baris',
    example: 1,
  })
  row: number;

  @ApiProperty({
    description: 'Data baris',
    type: ImportPopulationCsvRowDto,
  })
  data: ImportPopulationCsvRowDto;
}

export class ImportPopulationPreviewResponseDto {
  @ApiProperty({
    description: 'Status preview import',
    example: 'error',
  })
  status: string;

  @ApiProperty({
    description: 'Pesan preview import',
    example: 'unit_name tidak ada',
  })
  message: string;

  @ApiProperty({
    description: 'Data preview import',
    type: [ImportPopulationPreviewItemDto],
  })
  data: ImportPopulationPreviewItemDto[];
}

export class ImportPopulationRequestDto {
  @ApiProperty({
    description: 'File CSV yang akan diimport',
    type: 'string',
    format: 'binary',
    example: 'population_data.csv',
  })
  file: Express.Multer.File;
}

export class ImportPopulationResponseDto {
  @ApiProperty({
    description: 'Status code response',
    example: 201,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Pesan response',
    example: 'Data berhasil diimport',
  })
  message: string;

  @ApiProperty({
    description: 'Data hasil import',
    example: {
      total: 10,
      success: 8,
      failed: 2,
      details: [
        {
          status: 'success',
          message: 'Data berhasil diimport',
          row: 1,
          data: {
            date_arrive: '2025-01-01',
            status: 'active',
            unit_name: 'Excavator',
            no_unit: 'EXC001',
            vin_number: 'VIN123456789',
            no_unit_system: 'SYS001',
            serial_engine: 'ENG123456',
            activities_name: 'Mining',
            user_site: 'user_site',
            site_origin: 'Site A',
            remarks: 'RFU',
            site_id: '1',
            company: 'PT ABC',
            last_unit_number: 'LUN001',
            tyre_type: '6x4',
          },
        },
      ],
    },
  })
  data: any;
}

export class FileUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File CSV yang akan diupload',
    example: 'population_data.csv',
  })
  file: Express.Multer.File;
}

export class ImportPopulationErrorFileDto {
  @ApiProperty({
    description: 'URL download file error',
    example: 'https://minio.example.com/download/error_file.csv',
  })
  download_url: string;

  @ApiProperty({
    description: 'Pesan informasi file error',
    example:
      'File error telah diupload ke cloud storage. Silakan download dan perbaiki data sebelum import ulang.',
  })
  message: string;
}

export class ImportPopulationWithErrorResponseDto {
  @ApiProperty({
    description: 'Total data yang diimport',
    example: 10,
  })
  total: number;

  @ApiProperty({
    description: 'Jumlah data yang berhasil',
    example: 0,
  })
  success: number;

  @ApiProperty({
    description: 'Jumlah data yang gagal',
    example: 10,
  })
  failed: number;

  @ApiProperty({
    description: 'Detail hasil import',
    type: [ImportPopulationPreviewItemDto],
  })
  details: ImportPopulationPreviewItemDto[];

  @ApiProperty({
    description: 'Informasi file error',
    type: ImportPopulationErrorFileDto,
    required: false,
  })
  error_file?: ImportPopulationErrorFileDto;
}
