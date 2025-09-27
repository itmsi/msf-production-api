import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  HttpException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, DataSource } from 'typeorm';
import { HaulingList } from './entities/hauling-list.entity';
import {
  CreateHaulingListDto,
  UpdateHaulingListDto,
  QueryHaulingListDto,
  HaulingListResponseDto,
  QueryActivitiesDto,
  ActivitiesResponseDto,
} from './dto';
import {
  isValidDate,
  isValidDateTime,
  normalizeString,
  paginateResponse,
  setCsvExportHeaders,
} from '../../common/helpers/public.helper';
import {
  ApiResponse,
  successResponse,
  throwError,
} from '../../common/helpers/response.helper';
import { OperationPoints } from '../operation-points/entities/operation-points.entity';
import { Sites } from '../sites/entities/sites.entity';
import { calculateTimeRange } from '../../common/helpers/public.helper';
import { S3Service } from 'src/integrations/s3/s3.service';
import moment from 'moment';
import {
  ImportHaulingListCsvRowDto,
  ImportHaulingListItemDto,
} from './dto/import-hauling-list.dto';
import { Readable } from 'stream';
import { ImportFuelConsumptionCsvRowDto } from '../fuel-consumption/dto/import-fuel-consumption.dto';
import csv from 'csv-parser';
import { Population } from '../population';
import { Barge } from '../barge';
import { format } from '@fast-csv/format';
import { Response } from 'express';

@Injectable()
export class HaulingListService {
  private readonly logger = new Logger(HaulingListService.name);

  constructor(
    @InjectRepository(HaulingList)
    private readonly haulingListRepository: Repository<HaulingList>,
    @InjectRepository(OperationPoints)
    private readonly operationPointsRepository: Repository<OperationPoints>,
    @InjectRepository(Sites)
    private readonly sitesRepository: Repository<Sites>,
    @InjectRepository(Population)
    private readonly populationRepository: Repository<Population>,
    @InjectRepository(Barge)
    private readonly bargeRepository: Repository<Barge>,
    private dataSource: DataSource,
    private s3Service: S3Service,
  ) {}

  async create(createHaulingListDto: CreateHaulingListDto): Promise<any> {
    try {
      let totalTonnage: number;
      switch (createHaulingListDto.material) {
        case 'ob':
          totalTonnage = (createHaulingListDto.vessel * 35) / 1.6;
          break;
        case 'quarry':
          totalTonnage = createHaulingListDto.vessel * 18.26;
          break;
        default:
          totalTonnage = createHaulingListDto.vessel * 35;
          break;
      }

      // Mapping DTO ke entity dengan field yang benar
      const haulingList = this.haulingListRepository.create({
        activityDate: new Date(createHaulingListDto.activity_date),
        shift: createHaulingListDto.shift,
        time: new Date(createHaulingListDto.time),
        unitLoadingId: createHaulingListDto.unit_loading_id,
        unitHaulerId: createHaulingListDto.unit_hauler_id,
        material: createHaulingListDto.material,
        loadingPointId: createHaulingListDto.loading_point_id,
        dumpingPointOpId: createHaulingListDto.dumping_point_op_id,
        dumpingPointBargeId: createHaulingListDto.dumping_point_barge_id,
        vessel: createHaulingListDto.vessel,
        totalTonnage,
      });

      const savedHaulingList =
        await this.haulingListRepository.save(haulingList);
      const responseData = this.mapToResponseDto(savedHaulingList);

      return successResponse(
        responseData,
        'Data hauling list berhasil dibuat',
        201,
      );
    } catch (error) {
      if (error instanceof QueryFailedError) {
        // Handle foreign key constraint violation
        if (error.message.includes('foreign key constraint')) {
          // Cek constraint name dari error message
          let errorMessage = 'Foreign key constraint violation: ';

          if (
            error.message.includes('unit_loading_id') ||
            error.message.includes('FK_051101fec7de6360d38ad097376')
          ) {
            errorMessage += `Unit loading dengan ID ${createHaulingListDto.unit_loading_id} tidak ditemukan di tabel m_population`;
          } else if (
            error.message.includes('unit_hauler_id') ||
            error.message.includes('FK_b304210148a3d9e3a3c368989a9')
          ) {
            errorMessage += `Unit hauler dengan ID ${createHaulingListDto.unit_hauler_id} tidak ditemukan di tabel m_population`;
          } else if (
            error.message.includes('loading_point_id') ||
            error.message.includes('FK_b2d534020f293f5784f7d2ae181')
          ) {
            errorMessage += `Loading point dengan ID ${createHaulingListDto.loading_point_id} tidak ditemukan di tabel m_operation_points`;
          } else if (
            error.message.includes('dumping_point_op_id') ||
            error.message.includes('fk_r_ccr_hauling_dumping_point_op_id')
          ) {
            errorMessage += `Dumping point operation dengan ID ${createHaulingListDto.dumping_point_op_id} tidak ditemukan di tabel m_operation_points`;
          } else if (
            error.message.includes('dumping_point_barge_id') ||
            error.message.includes('fk_r_ccr_hauling_dumping_point_barge_id')
          ) {
            errorMessage += `Dumping point barge dengan ID ${createHaulingListDto.dumping_point_barge_id} tidak ditemukan di tabel m_barge`;
          } else {
            // Fallback: cek berdasarkan field yang dikirim
            const missingFields: string[] = [];
            if (createHaulingListDto.unit_loading_id)
              missingFields.push(
                `unit_loading_id: ${createHaulingListDto.unit_loading_id}`,
              );
            if (createHaulingListDto.unit_hauler_id)
              missingFields.push(
                `unit_hauler_id: ${createHaulingListDto.unit_hauler_id}`,
              );
            if (createHaulingListDto.loading_point_id)
              missingFields.push(
                `loading_point_id: ${createHaulingListDto.loading_point_id}`,
              );
            if (createHaulingListDto.dumping_point_op_id)
              missingFields.push(
                `dumping_point_op_id: ${createHaulingListDto.dumping_point_op_id}`,
              );
            if (createHaulingListDto.dumping_point_barge_id)
              missingFields.push(
                `dumping_point_barge_id: ${createHaulingListDto.dumping_point_barge_id}`,
              );

            errorMessage += `Referensi data tidak valid. Field yang bermasalah: ${missingFields.join(', ')}. Silakan periksa ID yang dikirim`;
          }

          throw new BadRequestException(errorMessage);
        }

        // Handle other database errors
        if (error.message.includes('duplicate key')) {
          throw new BadRequestException(
            'Data dengan informasi yang sama sudah ada',
          );
        }

        throw new BadRequestException(`Database error: ${error.message}`);
      }

      // Re-throw other errors
      throw error;
    }
  }

  async findAll(queryDto: QueryHaulingListDto) {
    const { page = 1, limit = 10, ...filters } = queryDto;

    const queryBuilder = this.haulingListRepository
      .createQueryBuilder('hauling')
      .leftJoinAndSelect('hauling.unitLoading', 'unitLoading')
      .leftJoinAndSelect('hauling.unitHauler', 'unitHauler')
      .leftJoinAndSelect('hauling.loadingPoint', 'loadingPoint')
      .leftJoinAndSelect('hauling.dumpingPointOp', 'dumpingPointOp')
      .leftJoinAndSelect('hauling.dumpingPointBarge', 'dumpingPointBarge');

    // Apply filters
    if (filters.activity_date) {
      queryBuilder.andWhere('hauling.activityDate = :activity_date', {
        activity_date: filters.activity_date,
      });
    }

    // Apply date range filters
    if (filters.start_date && filters.end_date) {
      queryBuilder.andWhere(
        'CAST(hauling.activityDate AS DATE) BETWEEN :start_date AND :end_date',
        {
          start_date: filters.start_date,
          end_date: filters.end_date,
        },
      );
    } else if (filters.start_date) {
      queryBuilder.andWhere(
        'CAST(hauling.activityDate AS DATE) >= :start_date',
        {
          start_date: filters.start_date,
        },
      );
    } else if (filters.end_date) {
      queryBuilder.andWhere('CAST(hauling.activityDate AS DATE) <= :end_date', {
        end_date: filters.end_date,
      });
    }

    if (filters.shift) {
      queryBuilder.andWhere('hauling.shift = :shift', {
        shift: filters.shift,
      });
    }

    if (filters.material) {
      queryBuilder.andWhere('hauling.material = :material', {
        material: filters.material,
      });
    }

    if (filters.unit_loading_name) {
      queryBuilder.andWhere('unitLoading.no_unit ILIKE :unit_loading_name', {
        unit_loading_name: `%${filters.unit_loading_name}%`,
      });
    }

    if (filters.unit_hauler_name) {
      queryBuilder.andWhere('unitHauler.no_unit ILIKE :unit_hauler_name', {
        unit_hauler_name: `%${filters.unit_hauler_name}%`,
      });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Get data
    const data = await queryBuilder.getMany();

    // Map to response DTOs
    const mappedData = data.map((item) => this.mapToResponseDto(item));

    return paginateResponse(
      mappedData,
      total,
      page,
      limit,
      'Data hauling list berhasil diambil',
    );
  }

  async findOne(id: number): Promise<any> {
    const haulingList = await this.haulingListRepository.findOne({
      where: { id },
      relations: [
        'unitLoading',
        'unitHauler',
        'loadingPoint',
        'dumpingPointOp',
        'dumpingPointBarge',
      ],
    });

    if (!haulingList) {
      throw new NotFoundException(
        `Hauling list dengan ID ${id} tidak ditemukan`,
      );
    }

    const responseData = this.mapToResponseDto(haulingList);

    return successResponse(responseData, 'Data hauling list berhasil diambil');
  }

  async update(
    id: number,
    updateHaulingListDto: UpdateHaulingListDto,
  ): Promise<any> {
    try {
      const haulingList = await this.haulingListRepository.findOne({
        where: { id },
      });

      if (!haulingList) {
        throw new NotFoundException(
          `Hauling list dengan ID ${id} tidak ditemukan`,
        );
      }

      // Mapping DTO ke entity dengan field yang benar
      const updateData: any = {};

      if (updateHaulingListDto.activity_date !== undefined) {
        updateData.activityDate = new Date(updateHaulingListDto.activity_date);
      }

      if (updateHaulingListDto.shift !== undefined) {
        updateData.shift = updateHaulingListDto.shift;
      }

      if (updateHaulingListDto.time !== undefined) {
        updateData.time = new Date(updateHaulingListDto.time);
      }

      if (updateHaulingListDto.unit_loading_id !== undefined) {
        updateData.unitLoadingId = updateHaulingListDto.unit_loading_id;
      }

      if (updateHaulingListDto.unit_hauler_id !== undefined) {
        updateData.unitHaulerId = updateHaulingListDto.unit_hauler_id;
      }

      if (updateHaulingListDto.material !== undefined) {
        updateData.material = updateHaulingListDto.material;
      }

      if (updateHaulingListDto.loading_point_id !== undefined) {
        updateData.loadingPointId = updateHaulingListDto.loading_point_id;
      }

      if (updateHaulingListDto.dumping_point_op_id !== undefined) {
        updateData.dumpingPointOpId = updateHaulingListDto.dumping_point_op_id;
      }

      if (updateHaulingListDto.dumping_point_barge_id !== undefined) {
        updateData.dumpingPointBargeId =
          updateHaulingListDto.dumping_point_barge_id;
      }

      if (updateHaulingListDto.vessel !== undefined) {
        updateData.vessel = updateHaulingListDto.vessel;
        // Hitung total tonnage jika vessel diupdate
        updateData.totalTonnage = updateHaulingListDto.vessel * 35;
      }

      // Update data
      await this.haulingListRepository.update(id, updateData);

      const updatedHaulingList = await this.haulingListRepository.findOne({
        where: { id },
        relations: [
          'unitLoading',
          'unitHauler',
          'loadingPoint',
          'dumpingPointOp',
          'dumpingPointBarge',
        ],
      });

      if (!updatedHaulingList) {
        throw new NotFoundException(
          `Hauling list dengan ID ${id} tidak ditemukan setelah update`,
        );
      }

      const responseData = this.mapToResponseDto(updatedHaulingList);

      return successResponse(
        responseData,
        'Data hauling list berhasil diupdate',
      );
    } catch (error) {
      if (error instanceof QueryFailedError) {
        // Handle foreign key constraint violation
        if (error.message.includes('foreign key constraint')) {
          // Cek constraint name dari error message
          let errorMessage = 'Foreign key constraint violation: ';

          if (
            error.message.includes('unit_loading_id') ||
            error.message.includes('FK_051101fec7de6360d38ad097376')
          ) {
            errorMessage += `Unit loading dengan ID ${updateHaulingListDto.unit_loading_id} tidak ditemukan di tabel m_population`;
          } else if (
            error.message.includes('unit_hauler_id') ||
            error.message.includes('FK_b304210148a3d9e3a3c368989a9')
          ) {
            errorMessage += `Unit hauler dengan ID ${updateHaulingListDto.unit_hauler_id} tidak ditemukan di tabel m_population`;
          } else if (
            error.message.includes('loading_point_id') ||
            error.message.includes('FK_b2d534020f293f5784f7d2ae181')
          ) {
            errorMessage += `Loading point dengan ID ${updateHaulingListDto.loading_point_id} tidak ditemukan di tabel m_operation_points`;
          } else if (
            error.message.includes('dumping_point_op_id') ||
            error.message.includes('fk_r_ccr_hauling_dumping_point_op_id')
          ) {
            errorMessage += `Dumping point operation dengan ID ${updateHaulingListDto.dumping_point_op_id} tidak ditemukan di tabel m_operation_points`;
          } else if (
            error.message.includes('dumping_point_barge_id') ||
            error.message.includes('fk_r_ccr_hauling_dumping_point_barge_id')
          ) {
            errorMessage += `Dumping point barge dengan ID ${updateHaulingListDto.dumping_point_barge_id} tidak ditemukan di tabel m_barge`;
          } else {
            // Fallback: cek berdasarkan field yang dikirim
            const missingFields: string[] = [];
            if (updateHaulingListDto.unit_loading_id)
              missingFields.push(
                `unit_loading_id: ${updateHaulingListDto.unit_loading_id}`,
              );
            if (updateHaulingListDto.unit_hauler_id)
              missingFields.push(
                `unit_hauler_id: ${updateHaulingListDto.unit_hauler_id}`,
              );
            if (updateHaulingListDto.loading_point_id)
              missingFields.push(
                `loading_point_id: ${updateHaulingListDto.loading_point_id}`,
              );
            if (updateHaulingListDto.dumping_point_op_id)
              missingFields.push(
                `dumping_point_op_id: ${updateHaulingListDto.dumping_point_op_id}`,
              );
            if (updateHaulingListDto.dumping_point_barge_id)
              missingFields.push(
                `dumping_point_barge_id: ${updateHaulingListDto.dumping_point_barge_id}`,
              );

            errorMessage += `Referensi data tidak valid. Field yang bermasalah: ${missingFields.join(', ')}. Silakan periksa ID yang dikirim`;
          }

          throw new BadRequestException(errorMessage);
        }

        throw new BadRequestException(`Database error: ${error.message}`);
      }

      // Re-throw other errors
      throw error;
    }
  }

  async remove(id: number): Promise<any> {
    const haulingList = await this.haulingListRepository.findOne({
      where: { id },
    });

    if (!haulingList) {
      throw new NotFoundException(
        `Hauling list dengan ID ${id} tidak ditemukan`,
      );
    }

    await this.haulingListRepository.remove(haulingList);

    return successResponse(null, 'Data hauling list berhasil dihapus');
  }

  async getActivities(queryDto: QueryActivitiesDto): Promise<any> {
    const {
      page = 1,
      limit = 10,
      name,
      type,
      site_name,
      orderBy = 'id',
      orderDirection = 'ASC',
    } = queryDto;

    const queryBuilder = this.operationPointsRepository
      .createQueryBuilder('op')
      .leftJoin('op.site', 'site')
      .select([
        'op.id as op_id',
        'op.name as op_name',
        'op.longitude as op_longitude',
        'op.latitude as op_latitude',
        'site.name as site_name',
      ]);

    // Apply filters
    if (name) {
      queryBuilder.andWhere('op.name ILIKE :name', {
        name: `%${name}%`,
      });
    }

    if (type) {
      queryBuilder.andWhere('op.type = :type', {
        type,
      });
    }

    if (site_name) {
      queryBuilder.andWhere('site.name ILIKE :site_name', {
        site_name: `%${site_name}%`,
      });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply ordering
    if (orderBy === 'site_name') {
      queryBuilder.orderBy('site.name', orderDirection);
    } else {
      queryBuilder.orderBy(`op.${orderBy}`, orderDirection);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Get data
    const data = await queryBuilder.getRawMany();

    // Map to response DTOs
    const mappedData: ActivitiesResponseDto[] = data.map((item) => ({
      id: item.op_id,
      name: item.op_name,
      longitude: item.op_longitude,
      latitude: item.op_latitude,
    }));

    return paginateResponse(
      mappedData,
      total,
      page,
      limit,
      'Data activities berhasil diambil',
    );
  }

  private mapToResponseDto(haulingList: HaulingList): HaulingListResponseDto {
    // Hitung time range dari time
    const timeRange = calculateTimeRange(haulingList.time);

    return {
      id: haulingList.id,
      activity_date: haulingList.activityDate.toLocaleDateString('en-CA'), // Format YYYY-MM-DD dengan timezone lokal
      shift: haulingList.shift,
      time: haulingList.time.toISOString(),
      time_range: timeRange,
      unit_loading_id: haulingList.unitLoadingId,
      unit_loading_name: haulingList.unitLoading?.no_unit || '',
      unit_hauler_id: haulingList.unitHaulerId,
      unit_hauler_name: haulingList.unitHauler?.no_unit || '',
      material: haulingList.material,
      loading_point_id: haulingList.loadingPointId,
      loading_point_name: haulingList.loadingPoint?.name || '',
      dumping_point_op_id: haulingList.dumpingPointOpId,
      dumping_point_op_name: haulingList.dumpingPointOp?.name || '',
      dumping_point_barge_id: haulingList.dumpingPointBargeId,
      dumping_point_barge_name: haulingList.dumpingPointBarge?.name || '',
      vessel: haulingList.vessel,
      total_tonnage: haulingList.totalTonnage,
      createdAt: haulingList.createdAt,
      updatedAt: haulingList.updatedAt,
    };
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
      const importResults: ImportHaulingListItemDto[] = [];
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

  private generateErrorCsv(errorRows: any[]): Buffer {
    try {
      // Header dengan kolom error
      const headers = [
        'row_number',
        'error_details',
        'activity_date',
        'shift',
        'time',
        'unit_loading_name',
        'unit_hauler_name',
        'material',
        'loading_point',
        'dumping_point',
        'vessel',
        'activity_type',
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
          rowData.time || '',
          rowData.unit_loading_name || '',
          rowData.unit_hauler_name || '',
          rowData.material || '',
          rowData.loading_point || '',
          rowData.dumping_point || '',
          rowData.vessel || '',
          rowData.activity_type || '',
        ];

        csvContent += csvRow.join(',') + '\n';
      });

      return Buffer.from(csvContent, 'utf-8');
    } catch (error) {
      this.logger.error('Error in generateErrorCsv:', error);
      throw error;
    }
  }

  private async validateCsvRow(row: ImportHaulingListCsvRowDto): Promise<{
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

    if (row.activity_date && !isValidDate(row.activity_date)) {
      errors.push({
        field: 'activity_date',
        message: 'Format tanggal tidak valid (yyyy-mm-dd)',
      });
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

    if (!row.time) {
      errors.push({
        field: 'time',
        message: 'Time wajib diisi',
      });
    }

    if (row.time && !isValidDateTime(row.time)) {
      errors.push({
        field: 'start_refueling_time',
        message: 'Format start time tidak valid (yyyy-mm-dd HH:mm)',
      });
    }

    if (!row.loading_unit) {
      errors.push({
        field: 'loading_unit',
        message: 'Nomor Unit Loading wajib diisi',
      });
    }

    if (row.loading_unit) {
      const noUnit = await this.getPopulationDataByNomorUnit(row.loading_unit);

      if (!noUnit) {
        errors.push({
          field: 'no_unit',
          message: `Unit Loading dengan nomor unit "${row.loading_unit}" tidak ditemukan`,
        });
      }
    }

    if (!row.hauler_unit) {
      errors.push({
        field: 'hauler_unit',
        message: 'Nomor Unit Hauler wajib diisi',
      });
    }

    if (row.hauler_unit) {
      const noUnit = await this.getPopulationDataByNomorUnit(row.hauler_unit);

      if (!noUnit) {
        errors.push({
          field: 'no_unit',
          message: `Unit Hauler dengan nomor unit "${row.hauler_unit}" tidak ditemukan`,
        });
      }
    }

    if (!row.material) {
      errors.push({ field: 'material', message: 'Material wajib diisi' });
    }

    if (!row.loading_point_name) {
      errors.push({
        field: 'loading_point_name',
        message: 'Loading Point Name wajib diisi',
      });
    }

    if (row.loading_point_name) {
      const loadingData = await this.getOperationPointDataByName(
        row.loading_point_name,
      );

      if (!loadingData) {
        errors.push({
          field: 'loading_point_name',
          message: `Loading Point dengan nama "${row.loading_point_name}" tidak ditemukan`,
        });
      }
    }

    if (!row.activity_type) {
      errors.push({
        field: 'activity_type',
        message: 'Activitas tidak boleh kosong',
      });
    }

    if (!row.dumping_point_name) {
      errors.push({
        field: 'dumping_point_name',
        message: 'Dumping Point Name wajib diisi',
      });
    }

    if (row.dumping_point_name && row.activity_type === 'hauling') {
      const dumpingPoint = await this.getOperationPointDataByName(
        row.dumping_point_name,
      );
      if (!dumpingPoint) {
        errors.push({
          field: 'dumping_point_name',
          message: 'Dumping Point tidak ditemukan',
        });
      }
    }

    if (row.dumping_point_name && row.activity_type === 'direct') {
      const bargePoint = await this.getBargeDataByName(row.dumping_point_name);

      if (!bargePoint) {
        errors.push({
          field: 'dumping_point_name',
          message: 'Dumping Point Barge tidak ditemukan',
        });
      }
    }

    if (!row.vessel) {
      errors.push({ field: 'vessel', message: 'Vessel wajib diisi' });
    }

    if (row.vessel == 0) {
      errors.push({ field: 'vessel', message: 'Vessel tidak boleh 0' });
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

  private async parseCsvFile(
    buffer: Buffer,
  ): Promise<ImportHaulingListCsvRowDto[]> {
    return new Promise((resolve, reject) => {
      const results: ImportHaulingListCsvRowDto[] = [];
      const stream = Readable.from(buffer);

      stream
        .pipe(csv())
        .on('data', (data) => {
          results.push({
            activity_date: data.activity_date || '',
            shift: data.shift || '',
            time: data.time || '',
            loading_unit: data.loading_unit || '',
            hauler_unit: data.hauler_unit || '',
            material: data.material || '',
            vessel: data.vessel || 0,
            loading_point_name: data.loading_point_name || '',
            dumping_point_name: data.dumping_point_name || '',
            activity_type: data.activity_type || '',
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

  private async importCsvRow(
    row: ImportHaulingListCsvRowDto,
    userId?: number | null,
  ): Promise<void> {
    const [
      population_loading,
      population_hauler,
      loading_point,
      dumping_point,
    ] = await Promise.all([
      this.getPopulationDataByNomorUnit(row.loading_unit),

      this.getPopulationDataByNomorUnit(row.hauler_unit),

      this.getOperationPointDataByName(row.loading_point_name),

      row.activity_type === 'hauling'
        ? this.getOperationPointDataByName(row.dumping_point_name)
        : this.getBargeDataByName(row.dumping_point_name),
    ]);

    if (!population_loading) {
      throw new BadRequestException('No Unit tidak ditemukan');
    }

    if (!population_hauler) {
      throw new BadRequestException('Problem tidak ditemukan');
    }

    if (!loading_point) {
      throw new BadRequestException('Loading Point tidak ditemukan');
    }

    if (!dumping_point) {
      throw new BadRequestException('Dumping Point tidak ditemukan');
    }

    let haulingListData: CreateHaulingListDto;

    if (row.activity_type === 'hauling') {
      haulingListData = {
        activity_date: row.activity_date,
        shift: row.shift.toLowerCase(),
        time: row.time,
        unit_loading_id: population_loading.id,
        unit_hauler_id: population_hauler.id,
        material: row.material,
        loading_point_id: loading_point.id,
        dumping_point_op_id: dumping_point.id,
        vessel: row.vessel,
      };
    } else {
      haulingListData = {
        activity_date: row.activity_date,
        shift: row.shift.toLowerCase(),
        time: row.time,
        unit_loading_id: population_loading.id,
        unit_hauler_id: population_hauler.id,
        material: row.material,
        loading_point_id: loading_point.id,
        dumping_point_barge_id: dumping_point.id,
        vessel: row.vessel,
      };
    }

    await this.create(haulingListData);
  }

  private async getPopulationDataByNomorUnit(no_unit: string) {
    const noUnit = await this.populationRepository
      .createQueryBuilder('p')
      .where('LOWER(p.no_unit) = LOWER(:no_unit)', {
        no_unit: normalizeString(no_unit),
      })
      .getOne();

    return noUnit;
  }

  private async getOperationPointDataByName(name: string) {
    const dumpingPoint = await this.operationPointsRepository
      .createQueryBuilder('op')
      .where('LOWER(op.name) = LOWER(:name)', {
        name: normalizeString(name),
      })
      .getOne();

    return dumpingPoint;
  }

  private async getBargeDataByName(name: string) {
    const bargeName = await this.bargeRepository
      .createQueryBuilder('br')
      .where('LOWER(br.name) = LOWER(:name)', {
        name: normalizeString(name),
      })
      .getOne();
    return bargeName;
  }

  private async getAllHaulingListData(query: QueryHaulingListDto) {
    const { ...filters } = query;

    const queryBuilder = this.haulingListRepository
      .createQueryBuilder('hauling')
      .leftJoinAndSelect('hauling.unitLoading', 'unitLoading')
      .leftJoinAndSelect('hauling.unitHauler', 'unitHauler')
      .leftJoinAndSelect('hauling.loadingPoint', 'loadingPoint')
      .leftJoinAndSelect('hauling.dumpingPointOp', 'dumpingPointOp')
      .leftJoinAndSelect('hauling.dumpingPointBarge', 'dumpingPointBarge');

    // Apply filters
    if (filters.activity_date) {
      queryBuilder.andWhere('hauling.activityDate = :activity_date', {
        activity_date: filters.activity_date,
      });
    }

    // Apply date range filters
    if (filters.start_date && filters.end_date) {
      queryBuilder.andWhere(
        'CAST(hauling.activityDate AS DATE) BETWEEN :start_date AND :end_date',
        {
          start_date: filters.start_date,
          end_date: filters.end_date,
        },
      );
    } else if (filters.start_date) {
      queryBuilder.andWhere(
        'CAST(hauling.activityDate AS DATE) >= :start_date',
        {
          start_date: filters.start_date,
        },
      );
    } else if (filters.end_date) {
      queryBuilder.andWhere('CAST(hauling.activityDate AS DATE) <= :end_date', {
        end_date: filters.end_date,
      });
    }

    if (filters.shift) {
      queryBuilder.andWhere('hauling.shift = :shift', {
        shift: filters.shift,
      });
    }

    if (filters.material) {
      queryBuilder.andWhere('hauling.material = :material', {
        material: filters.material,
      });
    }

    if (filters.unit_loading_name) {
      queryBuilder.andWhere('unitLoading.no_unit ILIKE :unit_loading_name', {
        unit_loading_name: `%${filters.unit_loading_name}%`,
      });
    }

    if (filters.unit_hauler_name) {
      queryBuilder.andWhere('unitHauler.no_unit ILIKE :unit_hauler_name', {
        unit_hauler_name: `%${filters.unit_hauler_name}%`,
      });
    }

    queryBuilder.take(filters.limit);

    const data = await queryBuilder.getMany();

    if (data.length === 0) {
      throwError('Data tidak ditemukan', 500);
    }

    return data;
  }

  async exportData(query: QueryHaulingListDto, res: Response) {
    try {
      const result = await this.getAllHaulingListData(query);

      if (!result || !result.length) {
        res.status(200).json(successResponse([], 'Data Not Found'));
        return;
      }

      setCsvExportHeaders(res, `hauling_list_export_${Date.now()}.csv`);

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

  private mapExportDataToCsvRow(item: HaulingList, index: number) {
    const timeRange = calculateTimeRange(item.time);

    return {
      No: index + 1,
      'Activity Date': item.activityDate,
      Shift: item.shift.toUpperCase(),
      Time:
        item.time instanceof Date
          ? moment(item.time).format('YYYY-MM-DD HH:mm')
          : item.time || '',
      'Time Range': timeRange,
      'Unit Loading Name': item.unitLoading?.no_unit ?? '',
      'Unit Hauler Name': item.unitHauler?.no_unit ?? '',
      Material: item.material ?? '',
      'Loading Point': item.loadingPoint?.name ?? '',
      'Dumping Point': !item.loadingPointId
        ? item.dumpingPointOp?.name
        : item.dumpingPointBarge?.name,
      Vessel: item.vessel ?? 0,
      'Total Tonnage': item.totalTonnage ?? 0,
    };
  }
}
