import {
  IsEnum,
  IsDateString,
  IsInt,
  IsString,
  IsOptional,
  IsNumber,
  ValidateIf,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LossType, Shift } from '../entities/effective-working-hours.entity';

function IsGreaterThan(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isGreaterThan',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value > relatedValue;
        },
      },
    });
  };
}

export class CreateEffectiveWorkingHoursDto {
  @ApiProperty({
    description: 'Tanggal aktivitas (format: YYYY-MM-DD)',
    example: '2024-01-15',
    type: 'string',
  })
  @IsDateString()
  dateActivity: string;

  @ApiProperty({
    description: 'Tipe loss time',
    enum: LossType,
    example: LossType.STB,
    enumName: 'LossType',
  })
  @IsEnum(LossType)
  lossType: LossType;

  @ApiProperty({
    description: 'Shift kerja',
    enum: Shift,
    example: Shift.DS,
    enumName: 'Shift',
  })
  @IsEnum(Shift)
  shift: Shift;

  @ApiProperty({
    description: 'ID population/unit',
    example: 1,
    type: 'number',
  })
  @IsInt()
  populationId: number;

  @ApiProperty({
    description: 'ID aktivitas',
    example: 1,
    type: 'number',
  })
  @IsInt()
  activitiesId: number;

  @ApiPropertyOptional({
    description: 'Deskripsi loss time',
    example: 'Standby karena hujan',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Waktu mulai (format: ISO 8601)',
    example: '2024-01-15T08:00:00Z',
    type: 'string',
  })
  @IsOptional()
  @IsDateString()
  start?: string;

  @ApiPropertyOptional({
    description: 'Waktu selesai (format: ISO 8601)',
    example: '2024-01-15T10:00:00Z',
    type: 'string',
  })
  @IsOptional()
  @IsDateString()
  @ValidateIf((o) => o.start !== undefined && o.stop !== undefined)
  @IsGreaterThan('start', {
    message: 'Stop Time tidak boleh kurang dari atau sama dengan Start Time',
  })
  stop?: string;

  @ApiPropertyOptional({
    description: 'Catatan tambahan untuk loss time',
    example: 'Perlu perbaikan mesin',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({
    description: 'User ID yang membuat data (boleh null)',
    example: 42,
    type: 'number',
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  createdBy?: number;
}

export class UpdateEffectiveWorkingHoursDto {
  @ApiPropertyOptional({
    description: 'Tanggal aktivitas (format: YYYY-MM-DD)',
    example: '2024-01-15',
    type: 'string',
  })
  @IsOptional()
  @IsDateString()
  dateActivity?: string;

  @ApiPropertyOptional({
    description: 'Tipe loss time',
    enum: LossType,
    example: LossType.STB,
    enumName: 'LossType',
  })
  @IsOptional()
  @IsEnum(LossType)
  lossType?: LossType;

  @ApiPropertyOptional({
    description: 'Shift kerja',
    enum: Shift,
    example: Shift.DS,
    enumName: 'Shift',
  })
  @IsOptional()
  @IsEnum(Shift)
  shift?: Shift;

  @ApiPropertyOptional({
    description: 'ID population/unit',
    example: 1,
    type: 'number',
  })
  @IsOptional()
  @IsInt()
  populationId?: number;

  @ApiPropertyOptional({
    description: 'ID aktivitas',
    example: 1,
    type: 'number',
  })
  @IsOptional()
  @IsInt()
  activitiesId?: number;

  @ApiPropertyOptional({
    description: 'Deskripsi loss time',
    example: 'Standby karena hujan',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Waktu mulai (format: ISO 8601)',
    example: '2024-01-15T08:00:00Z',
    type: 'string',
  })
  @IsOptional()
  @IsDateString()
  start?: string;

  @ApiPropertyOptional({
    description: 'Waktu selesai (format: ISO 8601)',
    example: '2024-01-15T10:00:00Z',
    type: 'string',
  })
  @IsOptional()
  @IsDateString()
  stop?: string;

  @ApiPropertyOptional({
    description: 'Catatan tambahan untuk loss time',
    example: 'Perlu perbaikan mesin',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class QueryEffectiveWorkingHoursDto {
  @ApiPropertyOptional({
    description: 'Tanggal mulai filter (format: YYYY-MM-DD)',
    example: '2024-01-01',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Tanggal akhir filter (format: YYYY-MM-DD)',
    example: '2024-01-31',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan tipe loss',
    enum: LossType,
    example: LossType.STB,
    enumName: 'LossType',
  })
  @IsOptional()
  @IsEnum(LossType)
  lossType?: LossType;

  @ApiPropertyOptional({
    description:
      'Keyword pencarian untuk description, activity name, unit name, type name, atau model name',
    example: 'standby',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    description: 'Nomor halaman untuk pagination',
    example: 1,
    type: 'number',
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Jumlah item per halaman',
    example: 10,
    type: 'number',
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit?: number = 10;
}

export class EffectiveWorkingHoursResponseDto {
  @ApiProperty({
    description: 'ID effective working hours',
    example: 1,
    type: 'number',
  })
  id: number;

  @ApiProperty({
    description: 'Tanggal aktivitas',
    example: '2024-01-15',
    type: 'string',
  })
  dateActivity: string;

  @ApiProperty({
    description: 'Tipe loss time (StandBy atau BreakDown)',
    example: 'StandBy',
    type: 'string',
  })
  lossType: string;

  @ApiProperty({
    description: 'Shift kerja (DS atau NS)',
    example: 'DS',
    type: 'string',
  })
  shift: string;

  @ApiProperty({
    description: 'Nama unit (format: unitName-typeName-modelName)',
    example: 'EXCAVATOR-HITACHI-EX1200',
    type: 'string',
  })
  unit: string;

  @ApiProperty({
    description: 'Nama aktivitas',
    example: 'Loading',
    type: 'string',
  })
  activity: string;

  @ApiProperty({
    description: 'Deskripsi loss time',
    example: 'Standby karena hujan',
    type: 'string',
  })
  description: string;

  @ApiProperty({
    description: 'Waktu mulai',
    example: '2024-01-15T08:00:00Z',
    type: 'string',
  })
  start: string;

  @ApiProperty({
    description: 'Waktu selesai',
    example: '2024-01-15T10:00:00Z',
    type: 'string',
  })
  end: string;

  @ApiProperty({
    description: 'Durasi dalam menit',
    example: 120,
    type: 'number',
  })
  duration: number;

  @ApiProperty({
    description: 'Catatan tambahan untuk loss time',
    example: 'Perlu perbaikan mesin',
    type: 'string',
    nullable: true,
  })
  remarks: string;

  @ApiProperty({
    description: 'Nama tipe unit (dari m_unit_type.unit_name)',
    example: 'EXCAVATOR',
    type: 'string',
  })
  type: string;

  @ApiProperty({
    description: 'Nama site (dari m_sites.name)',
    example: 'Site A',
    type: 'string',
  })
  site: string;
}

export class ImportEwhCsvRowDto {
  @ApiProperty({
    description: 'Tanggal Aktifitas (format: yyyy-mm-dd)',
    example: '2025-01-01',
  })
  activity_date: string;

  @ApiProperty({
    description: 'Category unit (STB atau BD)',
    example: 'STB',
    enum: ['STB', 'BD', 'stb', 'bd'],
  })
  category: string;

  @ApiProperty({
    description: 'Nomor unit',
    example: 'KFM_DT_005',
  })
  no_unit: string;

  @ApiProperty({
    description: 'Shift unit (ns atau ds)',
    example: 'ns',
    enum: ['ns', 'ds'],
  })
  shift: string;

  @ApiProperty({
    description: 'Problem',
    example: 'rain',
  })
  problem: string;

  @ApiProperty({
    description: 'Remarks',
    example: 'Hujan turun di segmen 1',
  })
  remarks: string;

  @ApiProperty({
    description: 'Description',
    example: 'description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Start Time',
    example: '2025-09-17 10:00',
  })
  start_time: string;

  @ApiProperty({
    description: 'Stop Time',
    example: '2025-09-17 12:00',
  })
  stop_time: string;
}

export class ImportEwhItemDto {
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
    type: ImportEwhCsvRowDto,
  })
  data: ImportEwhCsvRowDto;
}

export class QueryExportEffectiveWorkingHoursDto {
  @ApiPropertyOptional({
    description: 'Tanggal mulai filter (format: YYYY-MM-DD)',
    example: '2024-01-01',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Tanggal akhir filter (format: YYYY-MM-DD)',
    example: '2024-01-31',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan tipe loss',
    enum: LossType,
    example: LossType.STB,
    enumName: 'LossType',
  })
  @IsOptional()
  @IsEnum(LossType)
  lossType?: LossType;

  @ApiPropertyOptional({
    description:
      'Keyword pencarian untuk description, activity name, unit name, type name, atau model name',
    example: 'standby',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  keyword?: string;
}
