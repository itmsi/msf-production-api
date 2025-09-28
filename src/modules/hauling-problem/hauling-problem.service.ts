import {
  Injectable,
  InternalServerErrorException,
  HttpException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, DataSource } from 'typeorm';
import { HaulingProblem } from './entities/hauling-problem.entity';
import { Activities } from '../activities/entities/activities.entity';
import { Sites } from '../sites/entities/sites.entity';
import {
  ApiResponse,
  successResponse,
  throwError,
  emptyDataResponse,
} from '../../common/helpers/response.helper';
import {
  combineDateTime,
  combineShiftDateTime,
  convertStringDateYYYYMMDD,
  extractTime,
  normalizeString,
  paginateResponse,
  setCsvExportHeaders,
} from '../../common/helpers/public.helper';
import {
  CreateHaulingProblemDto,
  UpdateHaulingProblemDto,
  HaulingProblemResponseDto,
  GetHaulingProblemQueryDto,
} from './dto';
import { format } from '@fast-csv/format';
import { Response } from 'express';
import { S3Service } from 'src/integrations/s3/s3.service';
import {
  ImportHaulingProblemCsvRowDto,
  ImportHaulingProblemItemDto,
} from './dto/import-hauling-problem.dto';
import { Readable } from 'stream';
import csv from 'csv-parser';
import moment from 'moment';

@Injectable()
export class HaulingProblemService {
  private readonly logger = new Logger(HaulingProblemService.name);

  constructor(
    @InjectRepository(HaulingProblem)
    private haulingProblemRepository: Repository<HaulingProblem>,
    @InjectRepository(Activities)
    private activitiesRepository: Repository<Activities>,
    @InjectRepository(Sites)
    private sitesRepository: Repository<Sites>,
    private dataSource: DataSource,
    private s3Service: S3Service,
  ) {}

  async create(
    data: CreateHaulingProblemDto,
  ): Promise<ApiResponse<HaulingProblemResponseDto>> {
    try {
      // Validasi activities_id exists
      const activity = await this.activitiesRepository.findOne({
        where: { id: data.activities_id },
      });
      if (!activity) {
        throw new BadRequestException(
          `Activities dengan ID ${data.activities_id} tidak ditemukan`,
        );
      }

      // Validasi site_id exists
      const site = await this.sitesRepository.findOne({
        where: { id: data.site_id },
      });
      if (!site) {
        throw new BadRequestException(
          `Site dengan ID ${data.site_id} tidak ditemukan`,
        );
      }

      // Validasi start < finish
      const startDate = new Date(data.start);
      const finishDate = new Date(data.finish);
      if (startDate >= finishDate) {
        throw new BadRequestException(
          'Waktu start harus lebih awal dari waktu finish',
        );
      }

      // Hitung duration dalam jam
      const durationMs = finishDate.getTime() - startDate.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);

      // Buat entity baru
      const haulingProblem = this.haulingProblemRepository.create({
        activityDate: new Date(data.activity_date),
        shift: data.shift,
        activitiesId: data.activities_id,
        start: startDate,
        finish: finishDate,
        duration: durationHours,
        siteId: data.site_id,
        remark: data.remark,
      });

      const saved = await this.haulingProblemRepository.save(haulingProblem);

      // Ambil data dengan join untuk response
      const result = await this.haulingProblemRepository
        .createQueryBuilder('hp')
        .leftJoinAndSelect('hp.activities', 'activities')
        .leftJoinAndSelect('hp.site', 'site')
        .where('hp.id = :id', { id: saved.id })
        .getOne();

      if (!result) {
        throw new InternalServerErrorException(
          'Gagal mengambil data yang baru dibuat',
        );
      }

      const response: HaulingProblemResponseDto = {
        id: result.id,
        activity_date: result.activityDate.toLocaleDateString('en-CA'), // Format YYYY-MM-DD dengan timezone lokal
        shift: result.shift,
        activities_id: result.activitiesId,
        activities_name: result.activities?.name || '',
        start: result.start,
        finish: result.finish,
        duration: result.duration
          ? Number(result.duration.toFixed(2))
          : result.duration,
        site_id: result.siteId,
        site_name: result.site?.name || '',
        remark: result.remark,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };

      return successResponse(
        response,
        'Data hauling problem berhasil dibuat',
        201,
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Gagal membuat data hauling problem',
      );
    }
  }

  async findAll(
    query: GetHaulingProblemQueryDto,
  ): Promise<ApiResponse<HaulingProblemResponseDto[]>> {
    try {
      const page = parseInt(query.page?.toString() ?? '1', 10);
      const limit = parseInt(query.limit?.toString() ?? '10', 10);
      const skip = (page - 1) * limit;

      // Validate limit
      if (limit > 100) {
        throwError('Limit tidak boleh lebih dari 100', 400);
      }

      const qb = this.haulingProblemRepository
        .createQueryBuilder('hp')
        .leftJoinAndSelect('hp.activities', 'activities')
        .leftJoinAndSelect('hp.site', 'site')
        .where('hp.deletedAt IS NULL');

      // Filter berdasarkan activity_date
      if (query.activity_date) {
        const activityDate = new Date(query.activity_date);
        const nextDay = new Date(activityDate);
        nextDay.setDate(nextDay.getDate() + 1);

        qb.andWhere(
          'hp.activityDate >= :startDate AND hp.activityDate < :endDate',
          {
            startDate: activityDate,
            endDate: nextDay,
          },
        );
      }

      // Filter berdasarkan date range
      if (query.start_date && query.end_date) {
        const startDate = new Date(query.start_date);
        const endDate = new Date(query.end_date);
        endDate.setDate(endDate.getDate() + 1); // Include end date

        qb.andWhere(
          'hp.activityDate >= :startDate AND hp.activityDate < :endDate',
          {
            startDate: startDate,
            endDate: endDate,
          },
        );
      } else if (query.start_date) {
        const startDate = new Date(query.start_date);
        qb.andWhere('hp.activityDate >= :startDate', {
          startDate: startDate,
        });
      } else if (query.end_date) {
        const endDate = new Date(query.end_date);
        endDate.setDate(endDate.getDate() + 1); // Include end date
        qb.andWhere('hp.activityDate < :endDate', {
          endDate: endDate,
        });
      }

      // Filter berdasarkan shift
      if (query.shift) {
        qb.andWhere('hp.shift = :shift', { shift: query.shift });
      }

      // Filter berdasarkan activities_id
      if (query.activities_id) {
        qb.andWhere('hp.activitiesId = :activitiesId', {
          activitiesId: query.activities_id,
        });
      }

      // Filter berdasarkan site_id
      if (query.site_id) {
        qb.andWhere('hp.siteId = :siteId', { siteId: query.site_id });
      }

      // Search filter
      if (query.search) {
        const searchTerm = `%${query.search.toLowerCase()}%`;
        qb.andWhere(
          '(LOWER(activities.name) LIKE :search OR LOWER(site.name) LIKE :search OR LOWER(hp.remark) LIKE :search)',
          { search: searchTerm },
        );
      }

      // Sorting
      const allowedSortFields = [
        'id',
        'activityDate',
        'shift',
        'start',
        'finish',
        'duration',
        'createdAt',
        'updatedAt',
      ];
      const validSortBy = allowedSortFields.includes(query.sortBy || '')
        ? query.sortBy || 'id'
        : 'id';
      const validSortOrder = query.sortOrder === 'ASC' ? 'ASC' : 'DESC';

      qb.orderBy(`hp.${validSortBy}`, validSortOrder as 'ASC' | 'DESC');

      const [result, total] = await qb.skip(skip).take(limit).getManyAndCount();

      // Transform result to DTO format
      const transformedResult: HaulingProblemResponseDto[] = result.map(
        (item) => ({
          id: item.id,
          activity_date: item.activityDate.toLocaleDateString('en-CA'), // Format YYYY-MM-DD dengan timezone lokal
          shift: item.shift,
          activities_id: item.activitiesId,
          activities_name: item.activities?.name || '',
          start: item.start,
          finish: item.finish,
          duration: item.duration
            ? Number(item.duration.toFixed(2))
            : item.duration,
          site_id: item.siteId,
          site_name: item.site?.name || '',
          remark: item.remark,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }),
      );

      return paginateResponse(
        transformedResult,
        total,
        page,
        limit,
        'Data hauling problem berhasil diambil',
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Gagal mengambil data hauling problem',
      );
    }
  }

  async findById(
    id: number,
  ): Promise<ApiResponse<HaulingProblemResponseDto | null>> {
    try {
      const result = await this.haulingProblemRepository
        .createQueryBuilder('hp')
        .leftJoinAndSelect('hp.activities', 'activities')
        .leftJoinAndSelect('hp.site', 'site')
        .where('hp.id = :id', { id })
        .andWhere('hp.deletedAt IS NULL')
        .getOne();

      if (!result) {
        return emptyDataResponse('Data hauling problem tidak ditemukan');
      }

      const response: HaulingProblemResponseDto = {
        id: result.id,
        activity_date: result.activityDate.toLocaleDateString('en-CA'), // Format YYYY-MM-DD dengan timezone lokal
        shift: result.shift,
        activities_id: result.activitiesId,
        activities_name: result.activities?.name || '',
        start: result.start,
        finish: result.finish,
        duration: result.duration
          ? Number(result.duration.toFixed(2))
          : result.duration,
        site_id: result.siteId,
        site_name: result.site?.name || '',
        remark: result.remark,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };

      return successResponse(response, 'Data hauling problem berhasil diambil');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Gagal mengambil data hauling problem',
      );
    }
  }

  async update(
    id: number,
    data: UpdateHaulingProblemDto,
  ): Promise<ApiResponse<HaulingProblemResponseDto>> {
    try {
      // Cek apakah data exists
      const existing = await this.haulingProblemRepository.findOne({
        where: { id },
      });
      if (!existing) {
        throw new NotFoundException(
          `Data hauling problem dengan ID ${id} tidak ditemukan`,
        );
      }

      // Validasi activities_id exists jika diupdate
      if (data.activities_id) {
        const activity = await this.activitiesRepository.findOne({
          where: { id: data.activities_id },
        });
        if (!activity) {
          throw new BadRequestException(
            `Activities dengan ID ${data.activities_id} tidak ditemukan`,
          );
        }
      }

      // Validasi site_id exists jika diupdate
      if (data.site_id) {
        const site = await this.sitesRepository.findOne({
          where: { id: data.site_id },
        });
        if (!site) {
          throw new BadRequestException(
            `Site dengan ID ${data.site_id} tidak ditemukan`,
          );
        }
      }

      // Validasi start < finish jika diupdate
      if (data.start && data.finish) {
        const startDate = new Date(data.start);
        const finishDate = new Date(data.finish);
        if (startDate >= finishDate) {
          throw new BadRequestException(
            'Waktu start harus lebih awal dari waktu finish',
          );
        }
      }

      // Update data
      const updateData: any = {};
      if (data.activity_date)
        updateData.activityDate = new Date(data.activity_date);
      if (data.shift) updateData.shift = data.shift;
      if (data.activities_id) updateData.activitiesId = data.activities_id;
      if (data.start) updateData.start = new Date(data.start);
      if (data.finish) updateData.finish = new Date(data.finish);
      if (data.site_id) updateData.siteId = data.site_id;
      if (data.remark !== undefined) updateData.remark = data.remark;

      // Hitung ulang duration jika start atau finish diupdate
      if (data.start || data.finish) {
        const startDate = data.start ? new Date(data.start) : existing.start;
        const finishDate = data.finish
          ? new Date(data.finish)
          : existing.finish;
        const durationMs = finishDate.getTime() - startDate.getTime();
        updateData.duration = durationMs / (1000 * 60 * 60);
      }

      await this.haulingProblemRepository.update(id, updateData);

      // Ambil data yang sudah diupdate
      const result = await this.haulingProblemRepository
        .createQueryBuilder('hp')
        .leftJoinAndSelect('hp.activities', 'activities')
        .leftJoinAndSelect('hp.site', 'site')
        .where('hp.id = :id', { id })
        .getOne();

      if (!result) {
        throw new InternalServerErrorException(
          'Gagal mengambil data yang sudah diupdate',
        );
      }

      const response: HaulingProblemResponseDto = {
        id: result.id,
        activity_date: result.activityDate.toLocaleDateString('en-CA'), // Format YYYY-MM-DD dengan timezone lokal
        shift: result.shift,
        activities_id: result.activitiesId,
        activities_name: result.activities?.name || '',
        start: result.start,
        finish: result.finish,
        duration: result.duration
          ? Number(result.duration.toFixed(2))
          : result.duration,
        site_id: result.siteId,
        site_name: result.site?.name || '',
        remark: result.remark,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };

      return successResponse(
        response,
        'Data hauling problem berhasil diupdate',
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Gagal mengupdate data hauling problem',
      );
    }
  }

  async delete(id: number): Promise<ApiResponse<null>> {
    try {
      // Cek apakah data exists
      const existing = await this.haulingProblemRepository.findOne({
        where: { id },
      });
      if (!existing) {
        throw new NotFoundException(
          `Data hauling problem dengan ID ${id} tidak ditemukan`,
        );
      }

      // Soft delete
      await this.haulingProblemRepository.softDelete(id);

      return successResponse(null, 'Data hauling problem berhasil dihapus');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Gagal menghapus data hauling problem',
      );
    }
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
      const importResults: ImportHaulingProblemItemDto[] = [];
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
                'hauling_problem_import_error',
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

  private async parseCsvFile(
    buffer: Buffer,
  ): Promise<ImportHaulingProblemCsvRowDto[]> {
    return new Promise((resolve, reject) => {
      const results: ImportHaulingProblemCsvRowDto[] = [];
      const stream = Readable.from(buffer);

      stream
        .pipe(csv())
        .on('data', (data) => {
          results.push({
            activity_date: data.activity_date || '',
            shift: data.shift || '',
            standby_factor: data.standby_factor || '',
            start_time: data.start_time || '',
            finish_time: data.finish_time || '',
            site_name: data.site_name || '',
            remark: data.remark || '',
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

  private async validateCsvRow(row: ImportHaulingProblemCsvRowDto): Promise<{
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

    if (row.activity_date) {
      const date = convertStringDateYYYYMMDD(row.activity_date);

      if (date === 'Invalid date') {
        errors.push({
          field: 'activity_date',
          message: 'Format tanggal tidak valid (yyyy-mm-dd)',
        });
      }
    }

    if (!row.shift) {
      errors.push({ field: 'shift', message: 'Shift wajib diisi' });
    }

    if (row.shift && !['NS', 'DS'].includes(row.shift.toUpperCase())) {
      errors.push({
        field: 'Shift',
        message: 'Shift harus NS atau DS',
      });
    }

    if (!row.standby_factor) {
      errors.push({
        field: 'standby_factor',
        message: 'Stand by Factor wajib diisi',
      });
    }

    if (row.standby_factor) {
      const activityData = await this.getActivityDataByName(row.standby_factor);
      if (!activityData) {
        errors.push({
          field: 'standby_factor',
          message: 'Standby factor atau activity tidak ditemukan',
        });
      }
    }

    if (!row.start_time) {
      errors.push({
        field: 'time',
        message: 'Time wajib diisi',
      });
    }

    if (row.start_time) {
      const startTime = combineDateTime(row.activity_date, row.start_time);
      if (startTime === 'Invalid date') {
        errors.push({
          field: 'start_time',
          message: 'Format tanggal tidak valid (2026-01-01 13:00:00:000)',
        });
      }
    }

    if (!row.finish_time) {
      errors.push({
        field: 'time',
        message: 'Time wajib diisi',
      });
    }

    if (row.finish_time) {
      const finish_time = combineShiftDateTime(
        row.activity_date,
        row.start_time,
        row.finish_time,
      );
      if (finish_time.end === 'Invalid date') {
        errors.push({
          field: 'finish_time',
          message: 'Format tanggal tidak valid (2026-01-01 13:00:00:000)',
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

  private async getActivityDataByName(name: string) {
    const activityName = await this.activitiesRepository
      .createQueryBuilder('ac')
      .where('LOWER(ac.name) = LOWER(:name)', {
        name: normalizeString(name),
      })
      .getOne();
    return activityName;
  }

  private async getSiteDataByName(name: string) {
    const siteData = await this.sitesRepository
      .createQueryBuilder('st')
      .where('LOWER(st.name) = LOWER(:name)', {
        name: normalizeString(name),
      })
      .getOne();

    return siteData;
  }

  private generateErrorCsv(errorRows: any[]): Buffer {
    try {
      // Header dengan kolom error
      const headers = [
        'row_number',
        'error_details',
        'activity_date',
        'shift',
        'standby_factor',
        'start_time',
        'finish_time',
        'site_name',
        'remark',
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
          rowData.shift || '',
          rowData.standby_factor || '',
          rowData.start_time || '',
          rowData.finish_time || '',
          rowData.site_name || '',
          rowData.remark || '',
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
    row: ImportHaulingProblemCsvRowDto,
    userId?: number | null,
  ): Promise<void> {
    const [activity_data, site_data] = await Promise.all([
      this.getActivityDataByName(row.standby_factor),
      this.getSiteDataByName(row.site_name),
    ]);

    if (!activity_data) {
      throw new BadRequestException('No Unit tidak ditemukan');
    }

    const date = combineShiftDateTime(
      row.activity_date,
      row.start_time,
      row.finish_time,
    );

    const haulingListData: CreateHaulingProblemDto = {
      activity_date: row.activity_date,
      shift: row.shift,
      activities_id: activity_data.id,
      start: date.start,
      finish: date.end,
      site_id: site_data?.id ?? 0,
      remark: row.remark,
    };

    await this.create(haulingListData);
  }

  async exportData(query: GetHaulingProblemQueryDto, res: Response) {
    try {
      const result = await this.selectAll(query);

      if (!result || !result.length) {
        res.status(200).json(successResponse([], 'Data Not Found'));
        return;
      }

      setCsvExportHeaders(res, `hauling_problem_export_${Date.now()}.csv`);

      const csvStream = format({ headers: true });
      csvStream.pipe(res);

      result?.forEach((item, i) => {
        csvStream.write(this.mapExportDataToCsvRow(item, i));
      });

      csvStream.end();
    } catch (error) {
      this.logger.error('Error exporting data:', error);
      throw new InternalServerErrorException('Gagal export data');
    }
  }

  async selectAll(query: GetHaulingProblemQueryDto) {
    try {
      const page = parseInt(query.page?.toString() ?? '1', 10);
      const limit = parseInt(query.limit?.toString() ?? '10', 10);
      const skip = (page - 1) * limit;

      const qb = this.haulingProblemRepository
        .createQueryBuilder('hp')
        .leftJoinAndSelect('hp.activities', 'activities')
        .leftJoinAndSelect('hp.site', 'site')
        .where('hp.deletedAt IS NULL');

      // Filter berdasarkan activity_date
      if (query.activity_date) {
        const activityDate = new Date(query.activity_date);
        const nextDay = new Date(activityDate);
        nextDay.setDate(nextDay.getDate() + 1);

        qb.andWhere(
          'hp.activityDate >= :startDate AND hp.activityDate < :endDate',
          {
            startDate: activityDate,
            endDate: nextDay,
          },
        );
      }

      // Filter berdasarkan date range
      if (query.start_date && query.end_date) {
        const startDate = new Date(query.start_date);
        const endDate = new Date(query.end_date);
        endDate.setDate(endDate.getDate() + 1); // Include end date

        qb.andWhere(
          'hp.activityDate >= :startDate AND hp.activityDate < :endDate',
          {
            startDate: startDate,
            endDate: endDate,
          },
        );
      } else if (query.start_date) {
        const startDate = new Date(query.start_date);
        qb.andWhere('hp.activityDate >= :startDate', {
          startDate: startDate,
        });
      } else if (query.end_date) {
        const endDate = new Date(query.end_date);
        endDate.setDate(endDate.getDate() + 1); // Include end date
        qb.andWhere('hp.activityDate < :endDate', {
          endDate: endDate,
        });
      }

      // Filter berdasarkan shift
      if (query.shift) {
        qb.andWhere('hp.shift = :shift', { shift: query.shift });
      }

      // Filter berdasarkan activities_id
      if (query.activities_id) {
        qb.andWhere('hp.activitiesId = :activitiesId', {
          activitiesId: query.activities_id,
        });
      }

      // Filter berdasarkan site_id
      if (query.site_id) {
        qb.andWhere('hp.siteId = :siteId', { siteId: query.site_id });
      }

      // Search filter
      if (query.search) {
        const searchTerm = `%${query.search.toLowerCase()}%`;
        qb.andWhere(
          '(LOWER(activities.name) LIKE :search OR LOWER(site.name) LIKE :search OR LOWER(hp.remark) LIKE :search)',
          { search: searchTerm },
        );
      }

      // Sorting
      const allowedSortFields = [
        'id',
        'activityDate',
        'shift',
        'start',
        'finish',
        'duration',
        'createdAt',
        'updatedAt',
      ];
      const validSortBy = allowedSortFields.includes(query.sortBy || '')
        ? query.sortBy || 'id'
        : 'id';
      const validSortOrder = query.sortOrder === 'ASC' ? 'ASC' : 'DESC';

      qb.orderBy(`hp.${validSortBy}`, validSortOrder);

      const [result, total] = await qb.skip(skip).take(limit).getManyAndCount();

      if (!result) {
        throwError('Failed to retrieve Hauling problem data', 500);
      }
      return result;
    } catch (error) {
      throwError('Failed to retrieve Hauling problem data', 500);
    }
  }

  private mapExportDataToCsvRow(item: HaulingProblem, index: number) {
    return {
      No: index + 1,
      'Activity Date': moment(item.activityDate).format('YYYY/MM/DD'),
      Shift: item.shift.toUpperCase(),
      'Standby Factor': item.activities.name,
      Start: extractTime(item.start),
      Finish: extractTime(item.finish),
      Duration: item.duration ?? 0,
      Remarks: item.remark ?? '',
    };
  }
}
