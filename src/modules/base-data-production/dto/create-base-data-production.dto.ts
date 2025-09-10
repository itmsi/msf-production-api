import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested, IsNumber, Validate } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ShiftType } from '../entities/parent-base-data-pro.entity';
import { MaterialType, ActivityType } from '../entities/base-data-pro.entity';

// Custom validator untuk format tanggal
export function IsValidDateFormat(validationOptions?: any) {
  return function (object: any, propertyName: string) {
    const originalValidate = function(value: any) {
      if (value === undefined || value === null) return true;
      
      // Coba parse berbagai format tanggal
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return false;
      }
      return true;
    };
    
    Reflect.defineMetadata('validation:isValidDateFormat', originalValidate, object, propertyName);
  };
}

// Custom validator untuk validasi kondisional berdasarkan type
export function IsKmRequiredBasedOnType(validationOptions?: any) {
  return function (object: any, propertyName: string) {
    const originalValidate = function(value: any) {
      // Dapatkan nilai type dari parent object (CreateBaseDataProductionDto)
      const parentType = object.type || object.parent?.type;
      
      // Jika type adalah DT, maka kmAwal dan kmAkhir wajib diisi
      if (parentType === 'DT') {
        if (value === undefined || value === null || value === '') {
          return false;
        }
      }
      // Jika type adalah HE, maka kmAwal dan kmAkhir optional (nullable)
      // Tidak perlu validasi khusus untuk HE
      
      return true;
    };
    
    Reflect.defineMetadata('validation:isKmRequiredBasedOnType', originalValidate, object, propertyName);
  };
}

export class BaseDataProDetailDto {
  @ApiProperty({ description: 'Kilometer awal', example: 10, required: false })
  @IsNumber()
  @IsOptional()
  kmAwal?: number;

  @ApiProperty({ description: 'Kilometer akhir', example: 25.9, required: false })
  @IsNumber()
  @IsOptional()
  kmAkhir?: number;

  @ApiProperty({ 
    description: 'Total kilometer (calculated automatically as kmAkhir - kmAwal if not provided)', 
    example: 0, 
    required: false 
  })
  @IsNumber()
  @IsOptional()
  totalKm?: number;

  @ApiProperty({ description: 'Hour meter awal', example: 5 })
  @IsNumber()
  @IsNotEmpty()
  hmAwal: number;

  @ApiProperty({ description: 'Hour meter akhir', example: 12 })
  @IsNumber()
  @IsNotEmpty()
  hmAkhir: number;

  @ApiProperty({ 
    description: 'Total hour meter (calculated automatically as hmAkhir - hmAwal if not provided)', 
    example: 0, 
    required: false 
  })
  @IsNumber()
  @IsOptional()
  totalHm?: number;

  @ApiProperty({ description: 'ID loading point (references m_operation_points)', example: 1, required: false })
  @IsInt()
  @IsOptional()
  loadingPointId?: number | null;

  @ApiProperty({ description: 'ID dumping point (references m_operation_points)', example: 1, required: false })
  @IsInt()
  @IsOptional()
  dumpingPointId?: number | null;

  @ApiProperty({ description: 'ID dumping point operation (references m_operation_points)', example: 1, required: false })
  @IsInt()
  @IsOptional()
  dumpingPointOpId?: number;

  @ApiProperty({ description: 'ID dumping point barge (references m_barge)', example: 1, required: false })
  @IsInt()
  @IsOptional()
  dumpingPointBargeId?: number;

  @ApiProperty({ description: 'Type of activity', enum: ActivityType, example: ActivityType.HAULING, required: false })
  @IsEnum(ActivityType)
  @IsOptional()
  activity?: ActivityType | null;

  @ApiProperty({ description: 'Distance', example: 15 })
  @IsNumber()
  @IsNotEmpty()
  distance: number;

  @ApiProperty({ description: 'Total vessel', example: 3 })
  @IsNumber()
  @IsNotEmpty()
  totalVessel: number;

  @ApiProperty({ description: 'Material type', enum: MaterialType, example: MaterialType.BIOMAS, required: false })
  @IsEnum(MaterialType)
  @IsOptional()
  material?: MaterialType | null;
}

export class CreateBaseDataProductionDto {
  @ApiProperty({ description: 'ID population/unit', example: 6 })
  @IsInt()
  @IsNotEmpty()
  population_id: number;

  @ApiProperty({ description: 'Type of operation (HE or DT)', example: 'DT' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Activity date', example: '2025-08-21' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    // Normalize date format
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-CA'); // Return YYYY-MM-DD format dengan timezone lokal
      }
    }
    return value;
  })
  activityDate: string;

  @ApiProperty({ description: 'Shift type (DS/NS or ds/ns - will be converted to lowercase automatically)', enum: ShiftType, example: 'DS' })
  @Transform(({ value }) => value?.toLowerCase())
  @IsEnum(ShiftType)
  @IsNotEmpty()
  shift: ShiftType;

  @ApiProperty({ description: 'ID driver', example: 1 })
  @IsInt()
  @IsNotEmpty()
  driverId: number;

  @ApiProperty({ description: 'Start shift time', example: '2025-08-21T08:00:00.000Z' })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => {
    // Normalize datetime format
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString(); // Return ISO format
      }
    }
    return value;
  })
  startShift?: string;

  @ApiProperty({ description: 'End shift time', example: '2025-08-21T16:00:00.000Z' })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => {
    // Normalize datetime format
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString(); // Return ISO format
      }
    }
    return value;
  })
  endShift?: string;

  @ApiProperty({ description: 'Base data pro details', type: [BaseDataProDetailDto] })
  @ValidateNested({ each: true })
  @Type(() => BaseDataProDetailDto)
  @IsNotEmpty()
  detail: BaseDataProDetailDto[];
}
