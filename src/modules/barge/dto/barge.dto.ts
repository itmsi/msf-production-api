import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumberString,
  IsNumber,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class CreateBargeDto {

  @ApiProperty({
    example: 'Barge Kalimantan',
    description: 'Nama barge',
    minLength: 1,
    maxLength: 255,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: 1000,
    description: 'Kapasitas barge dalam ton',
    minimum: 1,
    maximum: 999999,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(999999)
  capacity: number;

  @ApiProperty({
    example: 'Barge untuk pengangkutan batu bara',
    description: 'Catatan tambahan tentang barge',
    required: false,
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UpdateBargeDto {

  @ApiProperty({
    example: 'Barge Kalimantan Updated',
    description: 'Nama barge',
    minLength: 1,
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    example: 1500,
    description: 'Kapasitas barge dalam ton',
    minimum: 1,
    maximum: 999999,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(999999)
  capacity?: number;

  @ApiProperty({
    example: 'Barge untuk pengangkutan batu bara - Updated',
    description: 'Catatan tambahan tentang barge',
    required: false,
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class BargeResponseDto {
  @ApiProperty({
    example: 1,
    description: 'ID unik barge',
  })
  id: number;

  @ApiProperty({
    example: 'Barge Kalimantan',
    description: 'Nama barge',
  })
  name: string;

  @ApiProperty({
    example: 1000,
    description: 'Kapasitas barge dalam ton',
  })
  capacity: number;

  @ApiProperty({
    example: 'Barge untuk pengangkutan batu bara',
    description: 'Catatan tambahan tentang barge',
  })
  remarks: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Waktu pembuatan barge',
  })
  createdAt: Date;

  @ApiProperty({
    example: 1,
    description: 'ID user yang membuat barge',
  })
  createdBy: number;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Waktu terakhir update barge',
  })
  updatedAt: Date;

  @ApiProperty({
    example: 1,
    description: 'ID user yang terakhir mengupdate barge',
  })
  updatedBy: number;
}

export class GetBargesQueryDto {
  @ApiProperty({
    required: false,
    example: '1',
    description: 'Nomor halaman (default: 1)',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiProperty({
    required: false,
    example: '10',
    description: 'Jumlah data per halaman (default: 10, max: 100)',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiProperty({
    required: false,
    example: 'barge',
    description: 'Pencarian umum di field name dan remarks',
    minLength: 1,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  search?: string;

  @ApiProperty({
    required: false,
    example: 'Barge Kalimantan',
    description: 'Filter berdasarkan nama barge',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    required: false,
    example: '1000',
    description: 'Filter berdasarkan kapasitas minimum',
  })
  @IsOptional()
  @IsNumberString()
  minCapacity?: string;

  @ApiProperty({
    required: false,
    example: '2000',
    description: 'Filter berdasarkan kapasitas maksimum',
  })
  @IsOptional()
  @IsNumberString()
  maxCapacity?: string;

  @ApiProperty({
    required: false,
    example: 'id',
    description: 'Field untuk sorting',
    enum: ['id', 'name', 'capacity', 'createdAt', 'updatedAt'],
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    required: false,
    example: 'DESC',
    description: 'Urutan sorting',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  sortOrder?: string;
}

export class BargeListResponseDto {
  @ApiProperty({
    example: 200,
    description: 'Status code response',
  })
  statusCode: number;

  @ApiProperty({
    example: 'Data barge berhasil diambil',
    description: 'Pesan response',
  })
  message: string;

  @ApiProperty({
    type: [BargeResponseDto],
    description: 'Array data barge',
  })
  data: BargeResponseDto[];

  @ApiProperty({
    description: 'Metadata pagination',
    example: {
      total: 2,
      page: 1,
      limit: 10,
    },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export class SingleBargeResponseDto {
  @ApiProperty({
    example: 200,
    description: 'Status code response',
  })
  statusCode: number;

  @ApiProperty({
    example: 'Data barge berhasil diambil',
    description: 'Pesan response',
  })
  message: string;

  @ApiProperty({
    type: BargeResponseDto,
    description: 'Data barge',
  })
  data: BargeResponseDto;
}
