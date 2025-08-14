import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumberString, IsNumber, IsDateString, IsEnum } from 'class-validator';

export class CreatePopulationDto {
  @ApiProperty({ 
    example: '2024-01-01', 
    description: 'Tanggal kedatangan unit' 
  })
  @IsDateString()
  @IsNotEmpty()
  date_arrive: string;

  @ApiProperty({ 
    example: 'active', 
    description: 'Status unit (active/inactive)',
    enum: ['active', 'inactive']
  })
  @IsEnum(['active', 'inactive'])
  @IsNotEmpty()
  status: string;

  @ApiProperty({ 
    example: 1, 
    description: 'ID dari unit type yang terkait' 
  })
  @IsNumber()
  @IsNotEmpty()
  unit_type_id: number;

  @ApiProperty({ 
    example: 'EXC001', 
    description: 'Nomor unit' 
  })
  @IsString()
  @IsNotEmpty()
  no_unit: string;

  @ApiProperty({ 
    example: 'VIN123456789', 
    description: 'Nomor VIN unit' 
  })
  @IsString()
  @IsNotEmpty()
  vin_number: string;

  @ApiProperty({ 
    example: 'SYS001', 
    description: 'Nomor unit sistem' 
  })
  @IsString()
  @IsNotEmpty()
  no_unit_system: string;

  @ApiProperty({ 
    example: 'cummins', 
    description: 'Brand engine (cummins/weichai)',
    enum: ['cummins', 'weichai']
  })
  @IsEnum(['cummins', 'weichai'])
  @IsNotEmpty()
  engine_brand: string;

  @ApiProperty({ 
    example: 'ENG123456', 
    description: 'Serial number engine' 
  })
  @IsString()
  @IsNotEmpty()
  serial_engine: string;

  @ApiProperty({ 
    example: 1, 
    description: 'ID dari activities yang terkait' 
  })
  @IsNumber()
  @IsNotEmpty()
  activities_id: number;

  @ApiProperty({ 
    example: 'Site A', 
    description: 'Site asal unit' 
  })
  @IsString()
  @IsNotEmpty()
  site_origin: string;

  @ApiProperty({ 
    example: 'Unit dalam kondisi baik', 
    description: 'Catatan tambahan' 
  })
  @IsString()
  @IsOptional()
  remarks?: string;

  @ApiProperty({ 
    example: 1, 
    description: 'ID dari site yang terkait' 
  })
  @IsNumber()
  @IsNotEmpty()
  site_id: number;

  @ApiProperty({ 
    example: 'PT ABC', 
    description: 'Nama perusahaan' 
  })
  @IsString()
  @IsNotEmpty()
  company: string;

  @ApiProperty({ 
    example: '6x4', 
    description: 'Tipe ban (6x4/8x4)',
    enum: ['6x4', '8x4']
  })
  @IsEnum(['6x4', '8x4'])
  @IsNotEmpty()
  tyre_type: string;
}

export class UpdatePopulationDto {
  @ApiProperty({ 
    required: false,
    example: '2024-01-01', 
    description: 'Tanggal kedatangan unit' 
  })
  @IsOptional()
  @IsDateString()
  date_arrive?: string;

  @ApiProperty({ 
    required: false,
    example: 'active', 
    description: 'Status unit (active/inactive)',
    enum: ['active', 'inactive']
  })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: string;

  @ApiProperty({ 
    required: false,
    example: 1, 
    description: 'ID dari unit type yang terkait' 
  })
  @IsOptional()
  @IsNumber()
  unit_type_id?: number;

  @ApiProperty({ 
    required: false,
    example: 'EXC001', 
    description: 'Nomor unit' 
  })
  @IsOptional()
  @IsString()
  no_unit?: string;

  @ApiProperty({ 
    required: false,
    example: 'VIN123456789', 
    description: 'Nomor VIN unit' 
  })
  @IsOptional()
  @IsString()
  vin_number?: string;

  @ApiProperty({ 
    required: false,
    example: 'SYS001', 
    description: 'Nomor unit sistem' 
  })
  @IsOptional()
  @IsString()
  no_unit_system?: string;

  @ApiProperty({ 
    required: false,
    example: 'cummins', 
    description: 'Brand engine (cummins/weichai)',
    enum: ['cummins', 'weichai']
  })
  @IsOptional()
  @IsEnum(['cummins', 'weichai'])
  engine_brand?: string;

  @ApiProperty({ 
    required: false,
    example: 'ENG123456', 
    description: 'Serial number engine' 
  })
  @IsOptional()
  @IsString()
  serial_engine?: string;

  @ApiProperty({ 
    required: false,
    example: 1, 
    description: 'ID dari activities yang terkait' 
  })
  @IsOptional()
  @IsNumber()
  activities_id?: number;

  @ApiProperty({ 
    required: false,
    example: 'Site A', 
    description: 'Site asal unit' 
  })
  @IsOptional()
  @IsString()
  site_origin?: string;

  @ApiProperty({ 
    required: false,
    example: 'Unit dalam kondisi baik', 
    description: 'Catatan tambahan' 
  })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({ 
    required: false,
    example: 1, 
    description: 'ID dari site yang terkait' 
  })
  @IsOptional()
  @IsNumber()
  site_id?: number;

  @ApiProperty({ 
    required: false,
    example: 'PT ABC', 
    description: 'Nama perusahaan' 
  })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiProperty({ 
    required: false,
    example: '6x4', 
    description: 'Tipe ban (6x4/8x4)',
    enum: ['6x4', '8x4']
  })
  @IsOptional()
  @IsEnum(['6x4', '8x4'])
  tyre_type?: string;
}

export class PopulationResponseDto {
  id: number;
  date_arrive: Date;
  status: string;
  unit_type_id: number;
  no_unit: string;
  vin_number: string;
  no_unit_system: string;
  engine_brand: string;
  serial_engine: string;
  activities_id: number;
  site_origin: string;
  remarks?: string;
  site_id: number;
  company: string;
  tyre_type: string;
  createdAt: Date;
  updatedAt: Date;
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
  activities?: {
    id: number;
    activity_name: string;
  };
  site?: {
    id: number;
    site_name: string;
  };
}

export class GetPopulationsQueryDto {
  @ApiProperty({ 
    required: false, 
    example: '1', 
    description: 'Nomor halaman (default: 1)' 
  })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiProperty({ 
    required: false, 
    example: '10', 
    description: 'Jumlah data per halaman (default: 10, max: 100)' 
  })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiProperty({ 
    required: false, 
    example: 'exc001', 
    description: 'Pencarian umum di semua field' 
  })
  @IsOptional()
  search?: string;

  @ApiProperty({ 
    required: false, 
    example: 'active', 
    description: 'Filter berdasarkan status (active/inactive)' 
  })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: string;

  @ApiProperty({ 
    required: false, 
    example: 1, 
    description: 'Filter berdasarkan unit type ID' 
  })
  @IsOptional()
  @IsNumberString()
  unit_type_id?: string;

  @ApiProperty({ 
    required: false, 
    example: 1, 
    description: 'Filter berdasarkan activities ID' 
  })
  @IsOptional()
  @IsNumberString()
  activities_id?: string;

  @ApiProperty({ 
    required: false, 
    example: 1, 
    description: 'Filter berdasarkan site ID' 
  })
  @IsOptional()
  @IsNumberString()
  site_id?: string;

  @ApiProperty({ 
    required: false, 
    example: 'cummins', 
    description: 'Filter berdasarkan brand engine (cummins/weichai)' 
  })
  @IsOptional()
  @IsEnum(['cummins', 'weichai'])
  engine_brand?: string;

  @ApiProperty({ 
    required: false, 
    example: '6x4', 
    description: 'Filter berdasarkan tipe ban (6x4/8x4)' 
  })
  @IsOptional()
  @IsEnum(['6x4', '8x4'])
  tyre_type?: string;

  @ApiProperty({ 
    required: false, 
    example: '2024-01-01', 
    description: 'Filter berdasarkan tanggal kedatangan (dari)' 
  })
  @IsOptional()
  @IsDateString()
  date_from?: string;

  @ApiProperty({ 
    required: false, 
    example: '2024-12-31', 
    description: 'Filter berdasarkan tanggal kedatangan (sampai)' 
  })
  @IsOptional()
  @IsDateString()
  date_to?: string;

  @ApiProperty({ 
    required: false, 
    example: 'id', 
    description: 'Field untuk sorting (id, date_arrive, status, no_unit, vin_number, createdAt, updatedAt)' 
  })
  @IsOptional()
  sortBy?: string;

  @ApiProperty({ 
    required: false, 
    example: 'DESC', 
    description: 'Urutan sorting (ASC atau DESC)' 
  })
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}
