import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, DataSource, SelectQueryBuilder } from 'typeorm';
import {
  EffectiveWorkingHours,
  LossType,
  Shift,
} from './entities/effective-working-hours.entity';
import {
  CreateEffectiveWorkingHoursDto,
  UpdateEffectiveWorkingHoursDto,
  QueryEffectiveWorkingHoursDto,
  ImportEwhCsvRowDto,
  ImportEwhItemDto,
  QueryExportEffectiveWorkingHoursDto,
} from './dto/effective-working-hours.dto';
import {
  normalizeString,
  paginateResponse,
  setCsvExportHeaders,
} from '../../common/helpers/public.helper';
import { ApiResponse, successResponse } from 'src/common';
import { Readable } from 'stream';
import csv from 'csv-parser';
import { Population } from '../population';
import { S3Service } from '../../integrations/s3/s3.service';
import { Activities } from '../activities';
import { Response } from 'express';
import { format } from '@fast-csv/format';
import moment from 'moment';

@Injectable()
export class EffectiveWorkingHoursService {
  private readonly logger = new Logger(EffectiveWorkingHoursService.name);
  constructor(
    @InjectRepository(EffectiveWorkingHours)
    private readonly effectiveWorkingHoursRepository: Repository<EffectiveWorkingHours>,
    @InjectRepository(Population)
    private populationRepository: Repository<Population>,
    @InjectRepository(Activities)
    private activityRepository: Repository<Activities>,
    private dataSource: DataSource,
    private s3Service: S3Service,
  ) {}

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return (
      date instanceof Date &&
      !isNaN(date.getTime()) &&
      !!dateString.match(/^\d{4}-\d{2}-\d{2}$/)
    );
  }

  private isValidDateTime(dateTimeStr: string): boolean {
    // format: yyyy-mm-dd HH:mm
    const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
    if (!regex.test(dateTimeStr)) return false;

    const date = new Date(dateTimeStr.replace(' ', 'T'));
    return !isNaN(date.getTime());
  }

  private async parseCsvFile(buffer: Buffer): Promise<ImportEwhCsvRowDto[]> {
    return new Promise((resolve, reject) => {
      const results: ImportEwhCsvRowDto[] = [];
      const stream = Readable.from(buffer);

      stream
        .pipe(csv())
        .on('data', (data) => {
          results.push({
            activity_date: data.activity_date || '',
            no_unit: data.no_unit || '',
            category: data.category || '',
            shift: data.shift || '',
            problem: data.problem || '',
            remarks: data.remarks || '',
            description: data.description || '',
            start_time: data.start_time || '',
            stop_time: data.stop_time || '',
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

  private async validateCsvRow(row: ImportEwhCsvRowDto): Promise<{
    isValid: boolean;
    message: string;
    errors: Array<{ field: string; message: string }>;
  }> {
    const errors: Array<{ field: string; message: string }> = [];

    // Validasi required fields
    if (!row.activity_date) {
      errors.push({
        field: 'activity_date',
        message: 'Tanggal Aktifitas wajib diisi',
      });
    }
    if (!row.category) {
      errors.push({ field: 'category', message: 'Category wajib diisi' });
    }
    if (!row.no_unit) {
      errors.push({ field: 'no_unit', message: 'Nomor unit wajib diisi' });
    }
    if (!row.shift) {
      errors.push({ field: 'shift', message: 'Shift wajib diisi' });
    }
    if (!row.problem) {
      errors.push({
        field: 'problem',
        message: 'Problem wajib diisi',
      });
    }
    if (!row.remarks) {
      errors.push({
        field: 'remarks',
        message: 'Remarks wajib diisi',
      });
    }
    if (!row.start_time) {
      errors.push({
        field: 'start_time',
        message: 'Start Time wajib diisi',
      });
    }
    if (!row.stop_time) {
      errors.push({
        field: 'stop_time',
        message: 'Stop Time wajib diisi',
      });
    }

    // Validasi format date
    if (row.activity_date && !this.isValidDate(row.activity_date)) {
      errors.push({
        field: 'activity_date',
        message: 'Format tanggal tidak valid (yyyy-mm-dd)',
      });
    }

    if (row.start_time && !this.isValidDateTime(row.start_time)) {
      errors.push({
        field: 'start_time',
        message: 'Format start time tidak valid (yyyy-mm-dd HH:mm)',
      });
    }

    if (row.stop_time && !this.isValidDateTime(row.stop_time)) {
      errors.push({
        field: 'stop_time',
        message: 'Format stop time tidak valid (yyyy-mm-dd HH:mm)',
      });
    }

    if (row.category && !['STB', 'BD'].includes(row.category.toUpperCase())) {
      errors.push({
        field: 'category',
        message: 'Category harus STB atau BD',
      });
    }

    if (row.shift && !['NS', 'DS'].includes(row.shift.toUpperCase())) {
      errors.push({
        field: 'Shift',
        message: 'Shift harus NS atau DS',
      });
    }

    if (row.no_unit) {
      const noUnit = await this.populationRepository
        .createQueryBuilder('p')
        .where('LOWER(p.no_unit) = LOWER(:no_unit)', {
          no_unit: normalizeString(row.no_unit),
        })
        .getOne();

      if (!noUnit) {
        errors.push({
          field: 'no_unit',
          message: `No Unit "${row.no_unit}" tidak ditemukan`,
        });
      }
    }

    if (row.problem) {
      const problem = await this.activityRepository
        .createQueryBuilder('a')
        .where('LOWER(a.name) = LOWER(:name)', {
          name: normalizeString(row.problem),
        })
        .getOne();
      if (!problem) {
        errors.push({
          field: 'problem',
          message: `Problem "${row.problem}" tidak ditemukan`,
        });
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
        const errorDetails = errors
          .map((err) => `"${err.field}": ${err.message}`)
          .join(', ');
        message = `${errors.length} field(s) tidak valid: ${errorDetails}`;
      }
    }

    return { isValid, message, errors };
  }

  private generateErrorCsv(errorRows: any[]): Buffer {
    try {
      // Header dengan kolom error
      const headers = [
        'row_number',
        'error_details',
        'activity_date',
        'no_unit',
        'category',
        'shift',
        'problem',
        'remarks',
        'description',
        'start_time',
        'stop_time',
      ];

      // Buat CSV content secara manual
      let csvContent = headers.join(',') + '\n';

      // Tambahkan data dengan error
      errorRows.forEach((errorRow) => {
        const rowData = errorRow.data;
        const errors = errorRow.errors;
        // Gabungkan semua error message
        const errorMessages = errors
          .map((err) => `${err.field}: ${err.message}`)
          .join('; ');

        const csvRow = [
          errorRow.row,
          `"${errorMessages}"`, // Wrap dalam quotes untuk menghindari masalah dengan comma
          rowData.activity_date || '',
          rowData.no_unit || '',
          rowData.category || '',
          rowData.shift || '',
          rowData.problem || '',
          rowData.remarks || '',
          rowData.description || '',
          rowData.start_time || '',
          rowData.stop_time || '',
        ];

        csvContent += csvRow.join(',') + '\n';
      });

      return Buffer.from(csvContent, 'utf-8');
    } catch (error) {
      this.logger.error('Error in generateErrorCsv:', error);
      throw error;
    }
  }

  private async importCsvRow(
    row: ImportEwhCsvRowDto,
    userId?: number | null,
  ): Promise<void> {
    const [population, activities] = await Promise.all([
      this.populationRepository
        .createQueryBuilder('p')
        .where('LOWER(p.no_unit) = LOWER(:no_unit)', {
          no_unit: normalizeString(row.no_unit),
        })
        .getOne(),
      this.activityRepository
        .createQueryBuilder('a')
        .where('LOWER(a.name) = LOWER(:name)', {
          name: normalizeString(row.problem),
        })
        .getOne(),
    ]);

    if (!population) {
      throw new BadRequestException('No Unit tidak ditemukan');
    }

    if (!activities) {
      throw new BadRequestException('Problem tidak ditemukan');
    }
    const startTime = new Date(row.start_time);
    const stopTime = new Date(row.stop_time);
    const durationInMinutes =
      (stopTime.getTime() - startTime.getTime()) / (1000 * 60);

    const ewhData: CreateEffectiveWorkingHoursDto = {
      dateActivity: row.activity_date,
      lossType: row.category.toUpperCase() as LossType,
      shift: row.shift.toUpperCase() as Shift,
      populationId: population.id,
      activitiesId: activities.id,
      description: row.description,
      remarks: row.remarks,
      start: row.start_time,
      stop: row.stop_time,
    };
    if (userId) {
      ewhData.createdBy = userId;
    }

    const newEwh = this.effectiveWorkingHoursRepository.create(ewhData);
    newEwh.duration = durationInMinutes;
    await this.effectiveWorkingHoursRepository.save(newEwh);
  }

  async importData(
    file: Express.Multer.File,
    userId?: number | null,
  ): Promise<ApiResponse<any>> {
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
      const importResults: ImportEwhItemDto[] = [];
      let successCount = 0;
      let failedCount = 0;
      const errorRows: any[] = [];
      const successRows: any[] = [];

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
            errorRows.push({
              row: rowNumber,
              data: row,
              errors: validation.errors,
            });
            importResults.push({
              status: 'error',
              message: validation.message,
              row: rowNumber,
              data: row,
            });
          }
        } catch (error) {
          failedCount++;
          errorRows.push({
            row: rowNumber,
            data: row,
            errors: [
              {
                field: 'general',
                message: error.message || 'Gagal validasi data',
              },
            ],
          });
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
        this.logger.log(
          `Found ${errorRows.length} rows with errors, generating error CSV...`,
        );

        try {
          const errorCsvBuffer = this.generateErrorCsv(errorRows);
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
                errorCsvBuffer,
                'ewh_import_error',
              );

              if (errorFileInfo) {
                this.logger.log('Error file uploaded to MinIO successfully');
              } else {
                this.logger.warn(
                  'MinIO upload failed, using fallback response',
                );
                minioAvailable = false;
              }
            } else {
              this.logger.warn(
                'MinIO tidak tersedia, menggunakan fallback response',
              );
            }
          } catch (s3Error) {
            this.logger.warn(
              'MinIO error, menggunakan fallback response:',
              s3Error.message,
            );
            minioAvailable = false;
          }

          const response = {
            total: csvData.length,
            success: 0,
            failed: failedCount,
            details: importResults,
            error_file:
              errorFileInfo && minioAvailable
                ? {
                    download_url: errorFileInfo.downloadUrl,
                    message:
                      'File error telah diupload ke cloud storage. Silakan download dan perbaiki data sebelum import ulang.',
                  }
                : {
                    download_url: null,
                    message:
                      'File error gagal diupload ke cloud storage. Silakan periksa data error di response details.',
                  },
          };

          return successResponse(
            response,
            'Import dibatalkan karena ada data yang tidak valid',
          );
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
              message:
                'Gagal generate file error. Silakan periksa data error di response details.',
            },
          };

          return successResponse(
            response,
            'Import dibatalkan karena ada data yang tidak valid',
          );
        }
      }

      // Jika semua data valid, lakukan import dengan transaction
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        for (const rowData of successRows) {
          await this.importCsvRow(rowData.data, userId);
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
        if (error?.response && error?.response?.statusCode === 400) {
          throw error;
        }
        throw new InternalServerErrorException(
          `Gagal import data: ${error.message}`,
        );
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

  private applyFilterExportData(
    qb: SelectQueryBuilder<EffectiveWorkingHours>,
    query: QueryExportEffectiveWorkingHoursDto,
  ): SelectQueryBuilder<EffectiveWorkingHours> {
    const { startDate, endDate, lossType, keyword } = query;

    // Kondisi filter tanggal
    if (startDate && endDate) {
      qb.andWhere('ewh.dateActivity BETWEEN :from AND :to', {
        from: startDate,
        to: endDate,
      });
      qb.orderBy('ewh.dateActivity', 'ASC');
    } else {
      qb.orderBy('ewh.dateActivity', 'DESC').limit(10);
    }

    if (lossType) {
      qb.andWhere('ewh.lossType = :lossType', { lossType });
    }

    if (keyword) {
      qb.andWhere(
        '(LOWER(ewh.description) LIKE :keyword OR LOWER(activities.name) LIKE :keyword OR LOWER(population.no_unit) LIKE :keyword)',
        { keyword: `%${keyword.toLowerCase()}%` },
      );
    }

    return qb;
  }

  private mapExportDataToCsvRow(item: EffectiveWorkingHours, index: number) {
    return {
      No: index + 1,
      'Activity Date': item.dateActivity,
      Shift: item.shift,
      Unit: item.population?.no_unit || '',
      Type: item.population?.unitType?.unit_name || '',
      Category: this.mapLossType(item.lossType),
      Problem: item.activities?.name || '',
      Site: item.population?.site?.name || '',
      Start:
        item.start instanceof Date
          ? moment(item.start).format('YYYY-MM-DD HH:mm')
          : item.start || '',
      Stop:
        item.stop instanceof Date
          ? moment(item.stop).format('YYYY-MM-DD HH:mm')
          : item.stop || '',
      Duration: item.duration || 0,
      Remarks: item.remarks || '-',
      Description: item.description || '-',
    };
  }

  async exportData(query: QueryExportEffectiveWorkingHoursDto, res: Response) {
    try {
      const qb = this.effectiveWorkingHoursRepository
        .createQueryBuilder('ewh')
        .leftJoinAndSelect('ewh.population', 'population')
        .leftJoinAndSelect('population.unitType', 'unitType')
        .leftJoinAndSelect('population.site', 'site')
        .leftJoinAndSelect('ewh.activities', 'activities');

      // Apply filters & sorting
      this.applyFilterExportData(qb, query);

      const data = await qb.getMany();
      if (!data.length) {
        res.status(200).json(successResponse([], 'Data Not Found'));
        return;
      }
      // Set headers CSV
      setCsvExportHeaders(res, `ewh_export_${Date.now()}.csv`);

      // Buat stream writer
      const csvStream = format({ headers: true });
      csvStream.pipe(res);

      // Mapping ke row CSV
      data.forEach((item, i) => {
        csvStream.write(this.mapExportDataToCsvRow(item, i));
      });

      csvStream.end();
    } catch (error) {
      this.logger.error('Error exporting data:', error);
      throw new InternalServerErrorException('Gagal export data');
    }
  }

  async create(
    createDto: CreateEffectiveWorkingHoursDto,
  ): Promise<EffectiveWorkingHours> {
    const effectiveWorkingHours =
      this.effectiveWorkingHoursRepository.create(createDto);

    // Calculate duration if start and stop are provided
    if (createDto.start && createDto.stop) {
      const startTime = new Date(createDto.start);
      const stopTime = new Date(createDto.stop);
      const durationInMinutes =
        (stopTime.getTime() - startTime.getTime()) / (1000 * 60);
      effectiveWorkingHours.duration = durationInMinutes;
    }

    return await this.effectiveWorkingHoursRepository.save(
      effectiveWorkingHours,
    );
  }

  async findAll(query: QueryEffectiveWorkingHoursDto) {
    const {
      startDate,
      endDate,
      lossType,
      keyword,
      page = 1,
      limit = 10,
    } = query;
    const skip = (page - 1) * limit;

    // Build where conditions
    const whereConditions: any = {};
    if (startDate && endDate) {
      whereConditions.dateActivity = Between(startDate, endDate);
    }
    if (lossType) {
      whereConditions.lossType = lossType;
    }

    // Get total count
    const total = await this.effectiveWorkingHoursRepository.count({
      where: whereConditions,
    });

    // Get data with relations
    const results = await this.effectiveWorkingHoursRepository.find({
      where: whereConditions,
      relations: [
        'population',
        'population.unitType',
        'population.site',
        'activities',
      ],
      skip,
      take: limit,
    });

    // Transform data to response format
    const data = results.map((result) => ({
      id: result.id,
      dateActivity: result.dateActivity, // Already in YYYY-MM-DD format
      lossType: this.mapLossType(result.lossType),
      shift: result.shift,
      unit: result?.population?.no_unit,
      activity: result.activities?.name || '',
      description: result.description || '',
      start:
        result.start instanceof Date
          ? result.start.toISOString()
          : result.start || '',
      end:
        result.stop instanceof Date
          ? result.stop.toISOString()
          : result.stop || '',
      duration: result.duration || 0,
      remarks: result.remarks || '',
      type: result.population?.unitType?.unit_name || '',
      site: result.population?.site?.name || '',
    }));

    // Apply keyword filter if provided
    let filteredData = data;
    if (keyword) {
      const lowercaseKeyword = keyword.toLowerCase();
      filteredData = data.filter(
        (item) =>
          item.description.toLowerCase().includes(lowercaseKeyword) ||
          item.activity.toLowerCase().includes(lowercaseKeyword) ||
          item.unit.toLowerCase().includes(lowercaseKeyword),
      );
    }

    return paginateResponse(
      filteredData,
      total,
      page,
      limit,
      'Data retrieved successfully',
    );
  }

  async findOne(id: number): Promise<EffectiveWorkingHours> {
    const effectiveWorkingHours =
      await this.effectiveWorkingHoursRepository.findOne({
        where: { id },
        relations: [
          'population',
          'population.unitType',
          'population.site',
          'activities',
        ],
      });

    if (!effectiveWorkingHours) {
      throw new NotFoundException(
        `Effective working hours with ID ${id} not found`,
      );
    }

    return effectiveWorkingHours;
  }

  async update(
    id: number,
    updateDto: UpdateEffectiveWorkingHoursDto,
  ): Promise<EffectiveWorkingHours> {
    const effectiveWorkingHours = await this.findOne(id);

    // Calculate duration if start and stop are provided
    if (updateDto.start && updateDto.stop) {
      const startTime = new Date(updateDto.start);
      const stopTime = new Date(updateDto.stop);
      const durationInMinutes =
        (stopTime.getTime() - startTime.getTime()) / (1000 * 60);
      updateDto['duration'] = durationInMinutes;
    }

    Object.assign(effectiveWorkingHours, updateDto);
    return await this.effectiveWorkingHoursRepository.save(
      effectiveWorkingHours,
    );
  }

  async remove(id: number): Promise<void> {
    const effectiveWorkingHours = await this.findOne(id);
    await this.effectiveWorkingHoursRepository.softDelete(id);
  }

  private mapLossType(lossType: string): string {
    switch (lossType) {
      case 'STB':
        return 'StandBy';
      case 'BD':
        return 'BreakDown';
      default:
        return lossType;
    }
  }
}
