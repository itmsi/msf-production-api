import {
  Injectable,
  InternalServerErrorException,
  HttpException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Population } from './entities/population.entity';
import { UnitType } from '../unit-type/entities/unit-type.entity';
import { Activities } from '../activities/entities/activities.entity';
import { Sites } from '../sites/entities/sites.entity';
import { Repository, Not, Between, DataSource } from 'typeorm';
import {
  ApiResponse,
  successResponse,
  throwError,
  emptyDataResponse,
} from '../../common/helpers/response.helper';
import { paginateResponse } from '../../common/helpers/public.helper';
import {
  CreatePopulationDto,
  PopulationResponseDto,
  GetPopulationsQueryDto,
  UpdatePopulationDto,
  ImportPopulationCsvRowDto,
  ImportPopulationPreviewItemDto,
} from './dto/population.dto';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { S3Service } from '../../integrations/s3/s3.service';

@Injectable()
export class PopulationService {
  private readonly logger = new Logger(PopulationService.name);

  constructor(
    @InjectRepository(Population)
    private populationRepository: Repository<Population>,
    @InjectRepository(UnitType)
    private unitTypeRepository: Repository<UnitType>,
    @InjectRepository(Activities)
    private activitiesRepository: Repository<Activities>,
    @InjectRepository(Sites)
    private sitesRepository: Repository<Sites>,
    private dataSource: DataSource,
    private s3Service: S3Service,
  ) {}

  async findById(
    id: number,
  ): Promise<ApiResponse<PopulationResponseDto | null>> {
    try {
      const result = await this.populationRepository.findOne({
        where: { id },
        relations: ['unitType', 'unitType.brand', 'activities', 'site'],
      });

      if (!result) {
        return emptyDataResponse('Population tidak ditemukan', null);
      }

      const response: PopulationResponseDto = {
        id: result.id,
        date_arrive: result.date_arrive,
        status: result.status,
        unit_type_id: result.unit_type_id,
        no_unit: result.no_unit,
        vin_number: result.vin_number,
        no_unit_system: result.no_unit_system,
        engine_brand: result.engine_brand,
        serial_engine: result.serial_engine,
        activities_id: result.activities_id,
        site_origin: result.site_origin,
        remarks: result.remarks,
        site_id: result.site_id,
        company: result.company,
        last_unit_number: result.last_unit_number,
        tyre_type: result.tyre_type,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        unitType: result.unitType
          ? {
              id: result.unitType.id,
              unit_name: result.unitType.unit_name,
              type_name: result.unitType.type_name,
              model_name: result.unitType.model_name,
              brand: result.unitType.brand
                ? {
                    id: result.unitType.brand.id,
                    brand_name: result.unitType.brand.brand_name,
                  }
                : undefined,
            }
          : undefined,
        activities: result.activities
          ? {
              id: result.activities.id,
              activity_name: result.activities.name,
            }
          : undefined,
        site: result.site
          ? {
              id: result.site.id,
              site_name: result.site.name,
            }
          : undefined,
      };

      return successResponse(response);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal mengambil data population');
    }
  }

  async findAll(
    query: GetPopulationsQueryDto,
  ): Promise<ApiResponse<PopulationResponseDto[]>> {
    try {
      const page = parseInt(query.page ?? '1', 10);
      const limit = parseInt(query.limit ?? '10', 10);
      const skip = (page - 1) * limit;
      const search = query.search?.toLowerCase() ?? '';
      const status = query.status;
      const unitTypeId = query.unit_type_id
        ? parseInt(query.unit_type_id, 10)
        : undefined;
      const activitiesId = query.activities_id
        ? parseInt(query.activities_id, 10)
        : undefined;
      const siteId = query.site_id ? parseInt(query.site_id, 10) : undefined;
      const engineBrand = query.engine_brand;
      const tyreType = query.tyre_type;
      const dateFrom = query.date_from;
      const dateTo = query.date_to;
      const sortBy = query.sortBy ?? 'id';
      const sortOrder = query.sortOrder ?? 'DESC';

      const qb = this.populationRepository
        .createQueryBuilder('population')
        .leftJoinAndSelect('population.unitType', 'unitType')
        .leftJoinAndSelect('unitType.brand', 'brand')
        .leftJoinAndSelect('population.activities', 'activities')
        .leftJoinAndSelect('population.site', 'site')
        .where('population.deletedAt IS NULL'); // Exclude soft deleted records

      // Search filter (mencari di semua field yang relevan)
      if (search) {
        qb.andWhere(
          '(population.no_unit ILIKE :search OR population.vin_number ILIKE :search OR population.no_unit_system ILIKE :search OR population.serial_engine ILIKE :search OR population.site_origin ILIKE :search OR population.company ILIKE :search OR unitType.unit_name ILIKE :search OR unitType.type_name ILIKE :search OR unitType.model_name ILIKE :search OR brand.brand_name ILIKE :search OR activities.name ILIKE :search OR site.name ILIKE :search)',
          { search: `%${search}%` },
        );
      }

      // Filter by status
      if (status) {
        qb.andWhere('population.status = :status', { status });
      }

      // Filter by unit_type_id
      if (unitTypeId) {
        qb.andWhere('population.unit_type_id = :unitTypeId', { unitTypeId });
      }

      // Filter by activities_id
      if (activitiesId) {
        qb.andWhere('population.activities_id = :activitiesId', {
          activitiesId,
        });
      }

      // Filter by site_id
      if (siteId) {
        qb.andWhere('population.site_id = :siteId', { siteId });
      }

      // Filter by engine_brand
      if (engineBrand) {
        qb.andWhere('population.engine_brand = :engineBrand', { engineBrand });
      }

      // Filter by tyre_type
      if (tyreType) {
        qb.andWhere('population.tyre_type = :tyreType', { tyreType });
      }

      // Filter by date range
      if (dateFrom && dateTo) {
        qb.andWhere('population.date_arrive BETWEEN :dateFrom AND :dateTo', {
          dateFrom,
          dateTo,
        });
      } else if (dateFrom) {
        qb.andWhere('population.date_arrive >= :dateFrom', { dateFrom });
      } else if (dateTo) {
        qb.andWhere('population.date_arrive <= :dateTo', { dateTo });
      }

      // Validate sortBy field to prevent SQL injection
      const allowedSortFields = [
        'id',
        'date_arrive',
        'status',
        'no_unit',
        'vin_number',
        'createdAt',
        'updatedAt',
      ];
      const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'id';
      const validSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

      qb.orderBy(`population.${validSortBy}`, validSortOrder)
        .skip(skip)
        .take(limit);

      const [result, total] = await qb.getManyAndCount();

      // Transform result to DTO format
      const transformedResult = result.map((population) => ({
        id: population.id,
        date_arrive: population.date_arrive,
        status: population.status,
        unit_type_id: population.unit_type_id,
        no_unit: population.no_unit,
        vin_number: population.vin_number,
        no_unit_system: population.no_unit_system,
        engine_brand: population.engine_brand,
        serial_engine: population.serial_engine,
        activities_id: population.activities_id,
        site_origin: population.site_origin,
        remarks: population.remarks,
        site_id: population.site_id,
        company: population.company,
        last_unit_number: population.last_unit_number,
        tyre_type: population.tyre_type,
        createdAt: population.createdAt,
        updatedAt: population.updatedAt,
        unitType: population.unitType
          ? {
              id: population.unitType.id,
              unit_name: population.unitType.unit_name,
              type_name: population.unitType.type_name,
              model_name: population.unitType.model_name,
              brand: population.unitType.brand
                ? {
                    id: population.unitType.brand.id,
                    brand_name: population.unitType.brand.brand_name,
                  }
                : undefined,
            }
          : undefined,
        activities: population.activities
          ? {
              id: population.activities.id,
              activity_name: population.activities.name,
            }
          : undefined,
        site: population.site
          ? {
              id: population.site.id,
              site_name: population.site.name,
            }
          : undefined,
      }));

      const response = paginateResponse(
        transformedResult,
        total,
        page,
        limit,
        'Data population berhasil diambil',
      );

      return {
        statusCode: response.statusCode,
        message: response.message,
        data: response.data,
        meta: {
          total,
          page,
          limit,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Gagal mengambil data population');
    }
  }

  async create(
    data: CreatePopulationDto,
  ): Promise<ApiResponse<PopulationResponseDto>> {
    try {
      // Check if VIN number already exists
      const existingVin = await this.populationRepository.findOne({
        where: { vin_number: data.vin_number },
      });

      if (existingVin) {
        throwError('VIN number sudah terdaftar', 409);
      }

      // Check if no_unit already exists
      const existingNoUnit = await this.populationRepository.findOne({
        where: { no_unit: data.no_unit },
      });

      if (existingNoUnit) {
        throwError('Nomor unit sudah terdaftar', 409);
      }

      // Check if no_unit_system already exists
      const existingNoUnitSystem = await this.populationRepository.findOne({
        where: { no_unit_system: data.no_unit_system },
      });

      if (existingNoUnitSystem) {
        throwError('Nomor unit sistem sudah terdaftar', 409);
      }

      const newPopulation = this.populationRepository.create({
        ...data,
        date_arrive: new Date(data.date_arrive),
      });
      const result = await this.populationRepository.save(newPopulation);

      // Fetch with relations for response
      const savedPopulation = await this.populationRepository.findOne({
        where: { id: result.id },
        relations: ['unitType', 'unitType.brand', 'activities', 'site'],
      });

      const response: PopulationResponseDto = {
        id: savedPopulation!.id,
        date_arrive: savedPopulation!.date_arrive,
        status: savedPopulation!.status,
        unit_type_id: savedPopulation!.unit_type_id,
        no_unit: savedPopulation!.no_unit,
        vin_number: savedPopulation!.vin_number,
        no_unit_system: savedPopulation!.no_unit_system,
        engine_brand: savedPopulation!.engine_brand,
        serial_engine: savedPopulation!.serial_engine,
        activities_id: savedPopulation!.activities_id,
        site_origin: savedPopulation!.site_origin,
        remarks: savedPopulation!.remarks,
        site_id: savedPopulation!.site_id,
        company: savedPopulation!.company,
        last_unit_number: savedPopulation!.last_unit_number,
        tyre_type: savedPopulation!.tyre_type,
        createdAt: savedPopulation!.createdAt,
        updatedAt: savedPopulation!.updatedAt,
        unitType: savedPopulation!.unitType
          ? {
              id: savedPopulation!.unitType.id,
              unit_name: savedPopulation!.unitType.unit_name,
              type_name: savedPopulation!.unitType.type_name,
              model_name: savedPopulation!.unitType.model_name,
              brand: savedPopulation!.unitType.brand
                ? {
                    id: savedPopulation!.unitType.brand.id,
                    brand_name: savedPopulation!.unitType.brand.brand_name,
                  }
                : undefined,
            }
          : undefined,
        activities: savedPopulation!.activities
          ? {
              id: savedPopulation!.activities.id,
              activity_name: savedPopulation!.activities.name,
            }
          : undefined,
        site: savedPopulation!.site
          ? {
              id: savedPopulation!.site.id,
              site_name: savedPopulation!.site.name,
            }
          : undefined,
      };

      return successResponse(response, 'Population berhasil dibuat');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal membuat population');
    }
  }

  async update(
    id: number,
    updateDto: UpdatePopulationDto,
  ): Promise<ApiResponse<PopulationResponseDto | null>> {
    try {
      const population = await this.populationRepository.findOne({
        where: { id },
        relations: ['unitType', 'unitType.brand', 'activities', 'site'],
      });

      if (!population) {
        return emptyDataResponse('Population tidak ditemukan', null);
      }

      // Check if VIN number already exists for other populations
      if (
        updateDto.vin_number &&
        updateDto.vin_number !== population.vin_number
      ) {
        const existingVin = await this.populationRepository.findOne({
          where: { vin_number: updateDto.vin_number, id: Not(id) },
        });

        if (existingVin) {
          throwError('VIN number sudah digunakan oleh population lain', 409);
        }
      }

      // Check if no_unit already exists for other populations
      if (updateDto.no_unit && updateDto.no_unit !== population.no_unit) {
        const existingNoUnit = await this.populationRepository.findOne({
          where: { no_unit: updateDto.no_unit, id: Not(id) },
        });

        if (existingNoUnit) {
          throwError('Nomor unit sudah digunakan oleh population lain', 409);
        }
      }

      // Check if no_unit_system already exists for other populations
      if (
        updateDto.no_unit_system &&
        updateDto.no_unit_system !== population.no_unit_system
      ) {
        const existingNoUnitSystem = await this.populationRepository.findOne({
          where: { no_unit_system: updateDto.no_unit_system, id: Not(id) },
        });

        if (existingNoUnitSystem) {
          throwError(
            'Nomor unit sistem sudah digunakan oleh population lain',
            409,
          );
        }
      }

      const updateData: any = { ...updateDto };
      if (updateDto.date_arrive) {
        updateData.date_arrive = new Date(updateDto.date_arrive);
      }

      const updatedPopulation = this.populationRepository.merge(
        population,
        updateData,
      );
      const result = await this.populationRepository.save(updatedPopulation);

      // Fetch updated data with relations
      const updatedData = await this.populationRepository.findOne({
        where: { id: result.id },
        relations: ['unitType', 'unitType.brand', 'activities', 'site'],
      });

      const response: PopulationResponseDto = {
        id: updatedData!.id,
        date_arrive: updatedData!.date_arrive,
        status: updatedData!.status,
        unit_type_id: updatedData!.unit_type_id,
        no_unit: updatedData!.no_unit,
        vin_number: updatedData!.vin_number,
        no_unit_system: updatedData!.no_unit_system,
        engine_brand: updatedData!.engine_brand,
        serial_engine: updatedData!.serial_engine,
        activities_id: updatedData!.activities_id,
        site_origin: updatedData!.site_origin,
        remarks: updatedData!.remarks,
        site_id: updatedData!.site_id,
        company: updatedData!.company,
        last_unit_number: updatedData!.last_unit_number,
        tyre_type: updatedData!.tyre_type,
        createdAt: updatedData!.createdAt,
        updatedAt: updatedData!.updatedAt,
        unitType: updatedData!.unitType
          ? {
              id: updatedData!.unitType.id,
              unit_name: updatedData!.unitType.unit_name,
              type_name: updatedData!.unitType.type_name,
              model_name: updatedData!.unitType.model_name,
              brand: updatedData!.unitType.brand
                ? {
                    id: updatedData!.unitType.brand.id,
                    brand_name: updatedData!.unitType.brand.brand_name,
                  }
                : undefined,
            }
          : undefined,
        activities: updatedData!.activities
          ? {
              id: updatedData!.activities.id,
              activity_name: updatedData!.activities.name,
            }
          : undefined,
        site: updatedData!.site
          ? {
              id: updatedData!.site.id,
              site_name: updatedData!.site.name,
            }
          : undefined,
      };

      return successResponse(response, 'Population berhasil diupdate');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal mengupdate population');
    }
  }

  async remove(id: number): Promise<ApiResponse<null>> {
    try {
      const population = await this.populationRepository.findOne({
        where: { id },
      });

      if (!population) {
        return emptyDataResponse('Population tidak ditemukan', null);
      }

      await this.populationRepository.softRemove(population);

      return successResponse(null, 'Population berhasil dihapus');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal menghapus population');
    }
  }

  async previewImport(
    file: Express.Multer.File,
  ): Promise<{ status: string; message: string; data: ImportPopulationPreviewItemDto[] }> {
    try {
      if (!file) {
        throw new BadRequestException('File tidak ditemukan');
      }

      if (
        !file.mimetype.includes('csv') &&
        !file.originalname.endsWith('.csv')
      ) {
        throw new BadRequestException('File harus berupa CSV');
      }

      const csvData = await this.parseCsvFile(file.buffer);
      const validationResults: ImportPopulationPreviewItemDto[] = [];

      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        const rowNumber = i + 1;

        // Validasi data
        const validation = await this.validateCsvRow(row);

        validationResults.push({
          status: validation.isValid ? 'success' : 'error',
          message: validation.isValid ? 'Data valid' : validation.message,
          row: rowNumber,
          data: row,
        });
      }

      // Tentukan status dan message berdasarkan hasil validasi
      const hasErrors = validationResults.some(result => result.status === 'error');
      const status = hasErrors ? 'error' : 'success';
      const message = hasErrors ? 'Terdapat data yang tidak valid' : 'Semua data valid';

      return {
        status,
        message,
        data: validationResults
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal preview import CSV');
    }
  }

  async importData(file: Express.Multer.File): Promise<ApiResponse<any>> {
    try {
      if (!file) {
        throw new BadRequestException('File tidak ditemukan');
      }

      if (
        !file.mimetype.includes('csv') &&
        !file.originalname.endsWith('.csv')
      ) {
        throw new BadRequestException('File harus berupa CSV');
      }

      const csvData = await this.parseCsvFile(file.buffer);
      const importResults: ImportPopulationPreviewItemDto[] = [];
      let successCount = 0;
      let failedCount = 0;
      let errorRows: any[] = [];
      let successRows: any[] = [];

      // Validasi semua data terlebih dahulu
      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        const rowNumber = i + 1;

        try {
          const validation = await this.validateCsvRow(row);

          if (validation.isValid) {
            successRows.push({ row: rowNumber, data: row });
            importResults.push({
              status: 'success',
              message: 'Data valid',
              row: rowNumber,
              data: row,
            });
          } else {
            failedCount++;
            errorRows.push({ row: rowNumber, data: row, errors: validation.errors });
            importResults.push({
              status: 'error',
              message: validation.message,
              row: rowNumber,
              data: row,
            });
          }
        } catch (error) {
          failedCount++;
          errorRows.push({ row: rowNumber, data: row, errors: [{ field: 'general', message: error.message || 'Gagal validasi data' }] });
          importResults.push({
            status: 'error',
            message: error.message || 'Gagal validasi data',
            row: rowNumber,
            data: row,
          });
        }
      }

      // Jika ada error, buat file error dan return tanpa insert ke database
      if (errorRows.length > 0) {
        this.logger.log(`Found ${errorRows.length} rows with errors, generating error CSV...`);
        
        try {
          const errorCsvBuffer = await this.generateErrorCsv(errorRows, csvData);
          this.logger.log('Error CSV generated successfully');
          
          // Coba upload ke MinIO, jika gagal gunakan fallback
          let errorFileInfo: { key: string; downloadUrl: string } | null = null;
          let minioAvailable = false;
          
          try {
            // Test koneksi MinIO terlebih dahulu
            minioAvailable = await this.s3Service.testConnection();
            
            if (minioAvailable) {
              errorFileInfo = await this.s3Service.uploadErrorFile(
                `import_error_${Date.now()}.csv`,
                errorCsvBuffer
              );
              
              if (errorFileInfo) {
                this.logger.log('Error file uploaded to MinIO successfully');
              } else {
                this.logger.warn('MinIO upload failed, using fallback response');
                minioAvailable = false;
              }
            } else {
              this.logger.warn('MinIO tidak tersedia, menggunakan fallback response');
            }
          } catch (s3Error) {
            this.logger.warn('MinIO error, menggunakan fallback response:', s3Error.message);
            minioAvailable = false;
          }

          const response = {
            total: csvData.length,
            success: 0,
            failed: failedCount,
            details: importResults,
            error_file: errorFileInfo && minioAvailable ? {
              download_url: errorFileInfo.downloadUrl,
              message: 'File error telah diupload ke cloud storage. Silakan download dan perbaiki data sebelum import ulang.',
            } : {
              download_url: null,
              message: 'File error gagal diupload ke cloud storage. Silakan periksa data error di response details.',
            },
          };

          return successResponse(response, 'Import dibatalkan karena ada data yang tidak valid');
        } catch (error) {
          this.logger.error('Error generating error CSV:', error);
          this.logger.error('Error stack:', error.stack);
          
          // Fallback response tanpa file error
          const response = {
            total: csvData.length,
            success: 0,
            failed: failedCount,
            details: importResults,
            error_file: {
              download_url: null,
              message: 'Gagal generate file error. Silakan periksa data error di response details.',
            },
          };

          return successResponse(response, 'Import dibatalkan karena ada data yang tidak valid');
        }
      }

      // Jika semua data valid, lakukan import dengan transaction
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        for (const rowData of successRows) {
          await this.importCsvRow(rowData.data);
          successCount++;
        }

        await queryRunner.commitTransaction();

        const response = {
          total: csvData.length,
          success: successCount,
          failed: 0,
          details: importResults,
        };

        return successResponse(response, 'Data berhasil diimport');
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException(`Gagal import data: ${error.message}`);
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal import CSV');
    }
  }

  async downloadTemplate(): Promise<Buffer> {
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Coba beberapa path yang mungkin
      const possiblePaths = [
        path.join(__dirname, 'template-population-import.csv'),
        path.join(process.cwd(), 'src/modules/population/template-population-import.csv'),
        path.join(process.cwd(), 'dist/modules/population/template-population-import.csv')
      ];
      
      let templatePath = null;
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          templatePath = p;
          break;
        }
      }
      
      if (!templatePath) {
        console.error('Template paths tried:', possiblePaths);
        throw new Error('Template CSV tidak ditemukan di semua lokasi yang mungkin');
      }
      
      console.log('Template found at:', templatePath);
      return fs.readFileSync(templatePath);
    } catch (error) {
      console.error('Error downloading template:', error);
      throw new InternalServerErrorException('Gagal download template CSV: ' + error.message);
    }
  }

  async checkMinioStatus(): Promise<boolean> {
    try {
      return await this.s3Service.testConnection();
    } catch (error) {
      this.logger.error('Error checking MinIO status:', error);
      return false;
    }
  }

  private async parseCsvFile(
    buffer: Buffer,
  ): Promise<ImportPopulationCsvRowDto[]> {
    return new Promise((resolve, reject) => {
      const results: ImportPopulationCsvRowDto[] = [];
      const stream = Readable.from(buffer);

      stream
        .pipe(csv())
        .on('data', (data) => {
                  results.push({
          date_arrive: data.date_arrive || '',
          status: data.status || '',
          unit_name: data.unit_name || '',
          no_unit: data.no_unit || '',
          vin_number: data.vin_number || '',
          no_unit_system: data.no_unit_system || '',
          serial_engine: data.serial_engine || '',
          engine_brand: data.engine_brand || '',
          activities_name: data.activities_name || '',
          user_site: data.user_site || '',
          site_origin: data.site_origin || '',
          remarks: data.remarks || '',
          site_name: data.site_name || '',
          company: data.company || '',
          last_unit_number: data.last_unit_number || '',
          tyre_type: data.tyre_type || '',
        });
        })
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  private async validateCsvRow(
    row: ImportPopulationCsvRowDto,
  ): Promise<{ isValid: boolean; message: string; errors: Array<{ field: string; message: string }> }> {
    const errors: Array<{ field: string; message: string }> = [];

    // Validasi required fields
    if (!row.date_arrive) {
      errors.push({ field: 'date_arrive', message: 'Tanggal kedatangan wajib diisi' });
    }
    if (!row.status) {
      errors.push({ field: 'status', message: 'Status wajib diisi' });
    }
    if (!row.unit_name) {
      errors.push({ field: 'unit_name', message: 'Nama unit wajib diisi' });
    }
    if (!row.no_unit) {
      errors.push({ field: 'no_unit', message: 'Nomor unit wajib diisi' });
    }
    if (!row.vin_number) {
      errors.push({ field: 'vin_number', message: 'VIN number wajib diisi' });
    }
    if (!row.no_unit_system) {
      errors.push({ field: 'no_unit_system', message: 'Nomor unit sistem wajib diisi' });
    }
    if (!row.serial_engine) {
      errors.push({ field: 'serial_engine', message: 'Serial engine wajib diisi' });
    }
    if (!row.engine_brand) {
      errors.push({ field: 'engine_brand', message: 'Engine brand wajib diisi' });
    }
    if (!row.activities_name) {
      errors.push({ field: 'activities_name', message: 'Nama aktivitas wajib diisi' });
    }
    if (!row.user_site) {
      errors.push({ field: 'user_site', message: 'User site wajib diisi' });
    }
    if (!row.site_origin) {
      errors.push({ field: 'site_origin', message: 'Site origin wajib diisi' });
    }
    if (!row.remarks) {
      errors.push({ field: 'remarks', message: 'Remarks wajib diisi' });
    }
    if (!row.site_name) {
      errors.push({ field: 'site_name', message: 'Nama site wajib diisi' });
    }
    if (!row.company) {
      errors.push({ field: 'company', message: 'Company wajib diisi' });
    }
    if (!row.tyre_type) {
      errors.push({ field: 'tyre_type', message: 'Tyre type wajib diisi' });
    }

    // Validasi format date
    if (row.date_arrive && !this.isValidDate(row.date_arrive)) {
      errors.push({ field: 'date_arrive', message: 'Format tanggal tidak valid (yyyy-mm-dd)' });
    }

    // Validasi status
    if (row.status && !['active', 'inactive'].includes(row.status)) {
      errors.push({ field: 'status', message: 'Status harus active atau inactive' });
    }

    // Validasi tyre_type
    if (row.tyre_type && !['6x4', '8x4'].includes(row.tyre_type)) {
      errors.push({ field: 'tyre_type', message: 'Tyre type harus 6x4 atau 8x4' });
    }

    // Validasi engine_brand
    if (row.engine_brand && !['cummins', 'weichai'].includes(row.engine_brand)) {
      errors.push({ field: 'engine_brand', message: 'Engine brand harus cummins atau weichai' });
    }

    // Validasi remarks
    if (row.remarks && !['RFU', 'BD'].includes(row.remarks)) {
      errors.push({ field: 'remarks', message: 'Remarks harus RFU atau BD' });
    }

    // Validasi unit_name exists
    if (row.unit_name) {
      const unitType = await this.unitTypeRepository.findOne({
        where: { unit_name: row.unit_name },
      });
      if (!unitType) {
        errors.push({ field: 'unit_name', message: `Unit type "${row.unit_name}" tidak ditemukan` });
      }
    }

    // Validasi activities_name exists
    if (row.activities_name) {
      const activity = await this.activitiesRepository.findOne({
        where: { name: row.activities_name },
      });
      if (!activity) {
        errors.push({ field: 'activities_name', message: `Activity "${row.activities_name}" tidak ditemukan` });
      }
    }

    // Validasi site_name exists
    if (row.site_name) {
      const site = await this.sitesRepository.findOne({
        where: { name: row.site_name },
      });
      if (!site) {
        errors.push({ field: 'site_name', message: `Site "${row.site_name}" tidak ditemukan` });
      }
    }

    // Validasi duplikasi VIN number
    if (row.vin_number) {
      const existingVin = await this.populationRepository.findOne({
        where: { vin_number: row.vin_number },
      });
      if (existingVin) {
        errors.push({ field: 'vin_number', message: `VIN number "${row.vin_number}" sudah terdaftar` });
      }
    }

    // Validasi duplikasi no_unit
    if (row.no_unit) {
      const existingNoUnit = await this.populationRepository.findOne({
        where: { no_unit: row.no_unit },
      });
      if (existingNoUnit) {
        errors.push({ field: 'no_unit', message: `Nomor unit "${row.no_unit}" sudah terdaftar` });
      }
    }

    // Validasi duplikasi no_unit_system
    if (row.no_unit_system) {
      const existingNoUnitSystem = await this.populationRepository.findOne({
        where: { no_unit_system: row.no_unit_system },
      });
      if (existingNoUnitSystem) {
        errors.push({ field: 'no_unit_system', message: `Nomor unit sistem "${row.no_unit_system}" sudah terdaftar` });
      }
    }

    const isValid = errors.length === 0;
    
    // Buat message yang lebih detail
    let message = 'Data valid';
    if (!isValid) {
      if (errors.length === 1) {
        const error = errors[0];
        message = `Field "${error.field}" tidak valid: ${error.message}`;
      } else {
        const errorDetails = errors.map(err => `"${err.field}": ${err.message}`).join(', ');
        message = `${errors.length} field(s) tidak valid: ${errorDetails}`;
      }
    }

    return { isValid, message, errors };
  }

  private async importCsvRow(row: ImportPopulationCsvRowDto): Promise<void> {
    // Get unit_type_id from unit_name
    const unitType = await this.unitTypeRepository.findOne({
      where: { unit_name: row.unit_name },
    });

    if (!unitType) {
      throw new Error('Unit type tidak ditemukan');
    }

    // Get activities_id from activities_name
    const activity = await this.activitiesRepository.findOne({
      where: { name: row.activities_name },
    });

    if (!activity) {
      throw new Error('Activity tidak ditemukan');
    }

    // Get site_id from site_name
    const site = await this.sitesRepository.findOne({
      where: { name: row.site_name },
    });

    if (!site) {
      throw new Error('Site tidak ditemukan');
    }

    const populationData = {
      date_arrive: new Date(row.date_arrive),
      status: row.status,
      unit_type_id: unitType.id,
      no_unit: row.no_unit,
      vin_number: row.vin_number,
      no_unit_system: row.no_unit_system,
      serial_engine: row.serial_engine,
      engine_brand: row.engine_brand,
      activities_id: activity.id,
      site_origin: row.site_origin,
      remarks: row.remarks,
      site_id: site.id,
      company: row.company,
      last_unit_number: row.last_unit_number,
      tyre_type: row.tyre_type,
    };

    const newPopulation = this.populationRepository.create(populationData);
    await this.populationRepository.save(newPopulation);
  }

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return (
      date instanceof Date &&
      !isNaN(date.getTime()) &&
      !!dateString.match(/^\d{4}-\d{2}-\d{2}$/)
    );
  }

  private async generateErrorCsv(errorRows: any[], originalData: ImportPopulationCsvRowDto[]): Promise<Buffer> {
    try {
      // Header dengan kolom error
      const headers = [
        'row_number',
        'error_details',
        'date_arrive',
        'status',
        'unit_name',
        'no_unit',
        'vin_number',
        'no_unit_system',
        'serial_engine',
        'engine_brand',
        'activities_name',
        'user_site',
        'site_origin',
        'remarks',
        'site_name',
        'company',
        'last_unit_number',
        'tyre_type'
      ];
      
      // Buat CSV content secara manual
      let csvContent = headers.join(',') + '\n';
      
      // Tambahkan data dengan error
      errorRows.forEach(errorRow => {
        const rowData = errorRow.data;
        const errors = errorRow.errors;
        
        // Gabungkan semua error message
        const errorMessages = errors.map(err => `${err.field}: ${err.message}`).join('; ');
        
        const csvRow = [
          errorRow.row,
          `"${errorMessages}"`, // Wrap dalam quotes untuk menghindari masalah dengan comma
          rowData.date_arrive || '',
          rowData.status || '',
          rowData.unit_name || '',
          rowData.no_unit || '',
          rowData.vin_number || '',
          rowData.no_unit_system || '',
          rowData.serial_engine || '',
          rowData.engine_brand || '',
          rowData.activities_name || '',
          rowData.user_site || '',
          rowData.site_origin || '',
          rowData.remarks || '',
          rowData.site_name || '',
          rowData.company || '',
          rowData.last_unit_number || '',
          rowData.tyre_type || ''
        ];
        
        csvContent += csvRow.join(',') + '\n';
      });
      
      return Buffer.from(csvContent, 'utf-8');
    } catch (error) {
      this.logger.error('Error in generateErrorCsv:', error);
      throw error;
    }
  }
}
