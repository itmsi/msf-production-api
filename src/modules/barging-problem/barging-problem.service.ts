import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DataSource, ILike, In, DeepPartial, SelectQueryBuilder } from 'typeorm';
import { BargingProblem } from './entities/barging-problem.entity';
import { Barge } from '../barge/entities/barge.entity';
import { Activities } from '../activities/entities/activities.entity';
import { Sites } from '../sites/entities/sites.entity';
import {
  CreateBargingProblemDto,
  UpdateBargingProblemDto,
  BargingProblemResponseDto,
  GetBargingProblemsQueryDto,
  ExportBargingProblemsQueryDto,
} from './dto/barging-problem.dto';
import { successResponse, emptyDataResponse, throwError, importResponse } from '../../common/helpers/response.helper';
import { CsvHelper, paginateResponse, parseDateFile, setCsvExportHeaders } from '../../common/helpers/public.helper';
import { validateImportFile } from 'src/common/helpers/validation.helper';
import moment from 'moment';
import { S3Service } from 'src/integrations/s3/s3.service';
import { Response } from 'express';
import { format } from '@fast-csv/format';

export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data?: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
}

@Injectable()
export class BargingProblemService {
  constructor(
    @InjectRepository(BargingProblem)
    private bargingProblemRepository: Repository<BargingProblem>,
    @InjectRepository(Barge)
    private bargeRepository: Repository<Barge>,
    @InjectRepository(Activities)
    private activitiesRepository: Repository<Activities>,
    @InjectRepository(Sites)
    private sitesRepository: Repository<Sites>,
    private dataSource: DataSource,
    private s3Service: S3Service,
  ) {}

  async findAll(query: GetBargingProblemsQueryDto): Promise<ApiResponse<BargingProblemResponseDto[]>> {
    try {
      const page = parseInt(query.page?.toString() ?? '1', 10);
      const limit = parseInt(query.limit?.toString() ?? '10', 10);
      const skip = (page - 1) * limit;
      const search = query.search?.toLowerCase() ?? '';
      const shift = query.shift?.toLowerCase() ?? '';
      const bargeId = query.barge_id;
      const activitiesId = query.activities_id;
      const siteId = query.site_id;
      const sortBy = query.sortBy ?? 'id';
      const sortOrder = query.sortOrder ?? 'DESC';

      // Validate limit
      if (limit > 100) {
        throwError('Limit tidak boleh lebih dari 100', 400);
      }

      const qb = this.createQueryBuilder();

      // Search filter
      if (search) {
        qb.andWhere(
          '(bargingProblem.remark ILIKE :search OR barge.name ILIKE :search OR activities.name ILIKE :search OR site.name ILIKE :search)',
          {
            search: `%${search}%`,
          },
        );
      }

      // Filter by shift
      if (shift) {
        qb.andWhere('bargingProblem.shift = :shift', { shift });
      }

      // Filter by barge_id
      if (bargeId) {
        qb.andWhere('bargingProblem.bargeId = :bargeId', { bargeId });
      }

      // Filter by activities_id
      if (activitiesId) {
        qb.andWhere('bargingProblem.activitiesId = :activitiesId', { activitiesId });
      }

      // Filter by site_id
      if (siteId) {
        qb.andWhere('bargingProblem.siteId = :siteId', { siteId });
      }

      // Filter berdasarkan activity_date
      if (query.activity_date) {
        const activityDate = new Date(query.activity_date);
        const nextDay = new Date(activityDate);
        nextDay.setDate(nextDay.getDate() + 1);

        qb.andWhere('bargingProblem.activityDate >= :startDate AND bargingProblem.activityDate < :endDate', {
          startDate: activityDate,
          endDate: nextDay,
        });
      }

      // Filter berdasarkan date range
      if (query.start_date && query.end_date) {
        const startDate = new Date(query.start_date);
        const endDate = new Date(query.end_date);
        endDate.setDate(endDate.getDate() + 1); // Include end date

        qb.andWhere('bargingProblem.activityDate >= :startDate AND bargingProblem.activityDate < :endDate', {
          startDate: startDate,
          endDate: endDate,
        });
      } else if (query.start_date) {
        const startDate = new Date(query.start_date);
        qb.andWhere('bargingProblem.activityDate >= :startDate', {
          startDate: startDate,
        });
      } else if (query.end_date) {
        const endDate = new Date(query.end_date);
        endDate.setDate(endDate.getDate() + 1); // Include end date
        qb.andWhere('bargingProblem.activityDate < :endDate', {
          endDate: endDate,
        });
      }

      // Validate sortBy field to prevent SQL injection
      const allowedSortFields = [
        'id',
        'activity_date',
        'shift',
        'barge_id',
        'activities_id',
        'site_id',
        'start',
        'finish',
        'duration',
        'createdAt',
        'updatedAt',
      ];
      const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'id';

      // Apply sorting
      if (validSortBy === 'barge_id') {
        qb.orderBy('bargingProblem.bargeId', sortOrder);
      } else if (validSortBy === 'activities_id') {
        qb.orderBy('bargingProblem.activitiesId', sortOrder);
      } else if (validSortBy === 'site_id') {
        qb.orderBy('bargingProblem.siteId', sortOrder);
      } else if (validSortBy === 'activity_date') {
        qb.orderBy('bargingProblem.activityDate', sortOrder);
      } else {
        qb.orderBy(`bargingProblem.${validSortBy}`, sortOrder);
      }

      const [result, total] = await qb.skip(skip).take(limit).getManyAndCount();

      // Transform result to DTO format
      const transformedResult: BargingProblemResponseDto[] = result.map((item) => ({
        id: item.id,
        activity_date: moment(item.activityDate).format('YYYY-MM-DD'),
        shift: item.shift,
        barge_id: item.bargeId,
        barge_name: item.barge?.name || '',
        activities_id: item.activitiesId,
        activities_name: item.activities?.name || '',
        site_id: item.siteId,
        site_name: item.site?.name || null,
        start: moment(item.start).format('HH:mm'),
        finish: moment(item.finish).format('HH:mm'),
        duration: item.duration || this.calculateDuration(item.start, item.finish),
        remark: item.remark,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));

      return paginateResponse(transformedResult, total, page, limit, 'Data barging problem berhasil diambil');
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Gagal mengambil data barging problem');
    }
  }

  async findById(id: number): Promise<ApiResponse<BargingProblemResponseDto | null>> {
    try {
      const bargingProblem = await this.bargingProblemRepository.findOne({
        where: { id, deletedAt: IsNull() },
        relations: ['barge', 'activities', 'site'],
      });

      if (!bargingProblem) {
        return emptyDataResponse('Barging problem tidak ditemukan');
      }

      const result: BargingProblemResponseDto = {
        id: bargingProblem.id,
        activity_date: bargingProblem.activityDate.toLocaleDateString('en-CA'), // Format YYYY-MM-DD dengan timezone lokal
        shift: bargingProblem.shift,
        barge_id: bargingProblem.bargeId,
        barge_name: bargingProblem.barge?.name || '',
        activities_id: bargingProblem.activitiesId,
        activities_name: bargingProblem.activities?.name || '',
        site_id: bargingProblem.siteId,
        site_name: bargingProblem.site?.name || null,
        start: bargingProblem.start.toISOString(),
        finish: bargingProblem.finish.toISOString(),
        duration: bargingProblem.duration || this.calculateDuration(bargingProblem.start, bargingProblem.finish),
        remark: bargingProblem.remark,
        createdAt: bargingProblem.createdAt,
        updatedAt: bargingProblem.updatedAt,
      };

      return successResponse(result, 'Data barging problem berhasil diambil');
    } catch (error) {
      throw new InternalServerErrorException('Gagal mengambil data barging problem');
    }
  }

  async create(createDto: CreateBargingProblemDto): Promise<ApiResponse<BargingProblemResponseDto>> {
    try {
      // Validate barge_id exists
      const barge = await this.bargeRepository.findOne({
        where: { id: createDto.barge_id, deletedAt: IsNull() },
      });
      if (!barge) {
        throwError('Barge dengan ID tersebut tidak ditemukan', 400);
      }

      // Validate activities_id exists
      const activities = await this.activitiesRepository.findOne({
        where: { id: createDto.activities_id, deletedAt: IsNull() },
      });
      if (!activities) {
        throwError('Activities dengan ID tersebut tidak ditemukan', 400);
      }

      // Validate site_id exists if provided
      if (createDto.site_id) {
        const site = await this.sitesRepository.findOne({
          where: { id: createDto.site_id, deletedAt: IsNull() },
        });
        if (!site) {
          throwError('Site dengan ID tersebut tidak ditemukan', 400);
        }
      }

      // Validate start and finish dates
      const startDate = new Date(createDto.start);
      const finishDate = new Date(createDto.finish);

      if (startDate >= finishDate) {
        throwError('Waktu start harus lebih awal dari waktu finish', 400);
      }

      // Calculate duration
      const duration = this.calculateDuration(startDate, finishDate);

      const bargingProblem = this.bargingProblemRepository.create({
        activityDate: new Date(createDto.activity_date),
        shift: createDto.shift,
        bargeId: createDto.barge_id,
        activitiesId: createDto.activities_id,
        siteId: createDto.site_id,
        start: startDate,
        finish: finishDate,
        duration,
        remark: createDto.remark,
      });

      const savedBargingProblem = await this.bargingProblemRepository.save(bargingProblem);

      // Get the saved entity with relations for response
      const result = await this.bargingProblemRepository.findOne({
        where: { id: savedBargingProblem.id },
        relations: ['barge', 'activities', 'site'],
      });

      if (!result) {
        throw new InternalServerErrorException('Gagal mengambil data barging problem yang baru dibuat');
      }

      const response: BargingProblemResponseDto = {
        id: result.id,
        activity_date: result.activityDate.toLocaleDateString('en-CA'), // Format YYYY-MM-DD dengan timezone lokal
        shift: result.shift,
        barge_id: result.bargeId,
        barge_name: result.barge?.name || '',
        activities_id: result.activitiesId,
        activities_name: result.activities?.name || '',
        site_id: result.siteId,
        site_name: result.site?.name || null,
        start: result.start.toISOString(),
        finish: result.finish.toISOString(),
        duration: result.duration || this.calculateDuration(result.start, result.finish),
        remark: result.remark,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };

      return successResponse(response, 'Barging problem berhasil dibuat', 201);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Gagal membuat barging problem');
    }
  }

  async update(id: number, updateDto: UpdateBargingProblemDto): Promise<ApiResponse<BargingProblemResponseDto>> {
    try {
      const existingBargingProblem = await this.bargingProblemRepository.findOne({
        where: { id, deletedAt: IsNull() },
      });

      if (!existingBargingProblem) {
        throwError('Barging problem tidak ditemukan', 404);
      }

      // Validate barge_id exists if provided
      if (updateDto.barge_id) {
        const barge = await this.bargeRepository.findOne({
          where: { id: updateDto.barge_id, deletedAt: IsNull() },
        });
        if (!barge) {
          throwError('Barge dengan ID tersebut tidak ditemukan', 400);
        }
      }

      // Validate activities_id exists if provided
      if (updateDto.activities_id) {
        const activities = await this.activitiesRepository.findOne({
          where: { id: updateDto.activities_id, deletedAt: IsNull() },
        });
        if (!activities) {
          throwError('Activities dengan ID tersebut tidak ditemukan', 400);
        }
      }

      // Validate site_id exists if provided
      if (updateDto.site_id) {
        const site = await this.sitesRepository.findOne({
          where: { id: updateDto.site_id, deletedAt: IsNull() },
        });
        if (!site) {
          throwError('Site dengan ID tersebut tidak ditemukan', 400);
        }
      }

      // Validate start and finish dates if provided
      let startDate = existingBargingProblem!.start;
      let finishDate = existingBargingProblem!.finish;

      if (updateDto.start) {
        startDate = new Date(updateDto.start);
      }
      if (updateDto.finish) {
        finishDate = new Date(updateDto.finish);
      }

      if (startDate >= finishDate) {
        throwError('Waktu start harus lebih awal dari waktu finish', 400);
      }

      // Calculate duration
      const duration = this.calculateDuration(startDate, finishDate);

      // Update fields
      if (updateDto.activity_date) {
        existingBargingProblem!.activityDate = new Date(updateDto.activity_date);
      }
      if (updateDto.shift) {
        existingBargingProblem!.shift = updateDto.shift;
      }
      if (updateDto.barge_id) {
        existingBargingProblem!.bargeId = updateDto.barge_id;
      }
      if (updateDto.activities_id) {
        existingBargingProblem!.activitiesId = updateDto.activities_id;
      }
      if (updateDto.site_id !== undefined) {
        existingBargingProblem!.siteId = updateDto.site_id;
      }
      if (updateDto.start) {
        existingBargingProblem!.start = startDate;
      }
      if (updateDto.finish) {
        existingBargingProblem!.finish = finishDate;
      }
      existingBargingProblem!.duration = duration;
      if (updateDto.remark !== undefined) {
        existingBargingProblem!.remark = updateDto.remark;
      }

      const updatedBargingProblem = await this.bargingProblemRepository.save(existingBargingProblem!);

      // Get the updated entity with relations for response
      const result = await this.bargingProblemRepository.findOne({
        where: { id: updatedBargingProblem.id },
        relations: ['barge', 'activities', 'site'],
      });

      if (!result) {
        throw new InternalServerErrorException('Gagal mengambil data barging problem yang diupdate');
      }

      const response: BargingProblemResponseDto = {
        id: result.id,
        activity_date: result.activityDate.toLocaleDateString('en-CA'), // Format YYYY-MM-DD dengan timezone lokal
        shift: result.shift,
        barge_id: result.bargeId,
        barge_name: result.barge?.name || '',
        activities_id: result.activitiesId,
        activities_name: result.activities?.name || '',
        site_id: result.siteId,
        site_name: result.site?.name || null,
        start: result.start.toISOString(),
        finish: result.finish.toISOString(),
        duration: result.duration || this.calculateDuration(result.start, result.finish),
        remark: result.remark,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };

      return successResponse(response, 'Barging problem berhasil diupdate');
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Gagal mengupdate barging problem');
    }
  }

  async remove(id: number): Promise<ApiResponse<null>> {
    try {
      const bargingProblem = await this.bargingProblemRepository.findOne({
        where: { id, deletedAt: IsNull() },
      });

      if (!bargingProblem) {
        throwError('Barging problem tidak ditemukan', 404);
      }

      // Soft delete
      await this.bargingProblemRepository.softDelete(id);

      return successResponse(null, 'Barging problem berhasil dihapus');
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Gagal menghapus barging problem');
    }
  }

  private calculateDuration(start: Date, finish: Date): number {
    const diffMs = finish.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.round(diffHours * 100) / 100; // Round to 2 decimal places
  }

  private createErrorCsvContent(failedRows: any[]): string {
    if (failedRows.length === 0) return '';

    const dynamicKeys = new Set<string>();
    failedRows.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (key !== 'error' && key !== 'rowNumber') {
          dynamicKeys.add(key);
        }
      });
    });

    const csvHeaders = [
      'activity_date',
      'shift',
      'barge',
      'activity',
      'site',
      'start',
      'finish',
      'remark',
      'error_message (Please delete this column before importing again)',
    ];

    const csvRows = failedRows.map((row) =>
      csvHeaders
        .map((header) => {
          if (header.startsWith('error_message')) return `"${row.error || ''}"`;
          return `"${row[header] ?? ''}"`;
        })
        .join(','),
    );

    return [csvHeaders.join(','), ...csvRows].join('\n');
  }

  private async generateErrorCsv(failedRows: any[]): Promise<{
    error_file: { download_url: string; file_name: string } | null;
  }> {
    if (failedRows.length === 0) {
      return {
        error_file: null,
      };
    }

    try {
      const csvContent = this.createErrorCsvContent(failedRows);
      const csvBuffer = Buffer.from(csvContent, 'utf8');
      const filename = `import-barging-problem-errors-${Date.now()}.csv`;

      const result = await this.s3Service.uploadErrorFile(filename, csvBuffer, 'barging_problem_import_error');

      return {
        error_file: result
          ? {
              download_url: result.downloadUrl,
              file_name: filename,
            }
          : null,
      };
    } catch (error) {
      return {
        error_file: null,
      };
    }
  }

  async bulkCreate(payload: CreateBargingProblemDto[], userId: number): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const bargingProblemEntities = payload.map((dto) => {
        const startDate = moment(dto.start, 'YYYY-MM-DD HH:mm', true).toDate();
        const finishDate = moment(dto.finish, 'YYYY-MM-DD HH:mm', true).toDate();
        const duration = this.calculateDuration(startDate, finishDate);
        return queryRunner.manager.create(BargingProblem, {
          activityDate: moment(dto.activity_date, 'YYYY-MM-DD', true).toDate(),
          shift: dto.shift,
          createdBy: userId,
          bargeId: dto.barge_id,
          activitiesId: dto.activities_id,
          siteId: dto.site_id,
          start: startDate,
          finish: finishDate,
          duration,
          remark: dto.remark,
        } as DeepPartial<BargingProblem>);
      });

      await queryRunner.manager.save(BargingProblem, bargingProblemEntities);

      await queryRunner.commitTransaction();
      return;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throwError('Failed to import Barging List', 500);
    } finally {
      await queryRunner.release();
    }
  }

  private async getBarge(bargeName: string): Promise<number | undefined> {
    const name = bargeName?.trim();
    const barge = await this.bargeRepository.findOne({
      where: {
        name: ILike(`%${name}%`),
        deletedAt: IsNull(),
      },
    });
    return barge?.id;
  }

  private async getSite(siteName: string): Promise<number | undefined> {
    const name = siteName?.trim();
    const site = await this.sitesRepository.findOne({
      where: {
        name: ILike(`%${name}%`),
        deletedAt: IsNull(),
      },
    });
    return site?.id;
  }

  private async getActivity(siteName: string): Promise<number | undefined> {
    const name = siteName?.trim();
    const activity = await this.activitiesRepository.findOne({
      where: {
        name: ILike(`%${name}%`),
        status: In(['delay', 'idle']),
        deletedAt: IsNull(),
      },
    });
    return activity?.id;
  }

  private async validateRowData(row: any): Promise<{
    isValid: boolean;
    error?: string;
    payload?: CreateBargingProblemDto;
  }> {
    if (!row.activity_date) {
      return { isValid: false, error: 'activity_date is required' };
    }
    if (!row.start) {
      return { isValid: false, error: 'start is required' };
    }
    if (!row.finish) {
      return { isValid: false, error: 'finish is required' };
    }
    if (!row.shift) {
      return { isValid: false, error: 'shift is required' };
    }
    if (!row.barge) {
      return { isValid: false, error: 'barge is required' };
    }
    if (!row.site) {
      return { isValid: false, error: 'site is required' };
    }
    if (!row.activity) {
      return { isValid: false, error: 'activity is required' };
    }

    const parsedActivityDate = parseDateFile(row.activity_date);
    if (!parsedActivityDate) {
      return {
        isValid: false,
        error: `start_date harus dalam format DD/MM/YYYY or YYYY-MM-DD (row: ${row.activity_date})`,
      };
    }

    const parsedStartTime = parseDateFile(row.start, 'YYYY-MM-DD HH:mm');
    if (!parsedStartTime) {
      return {
        isValid: false,
        error: `start harus dalam format (2025-09-01 10:00 or 01/09/2025 10:00) DD/MM/YYYY HH:mm or YYYY-MM-DD HH:mm (row: ${row.start})`,
      };
    }

    const parsedFinishTime = parseDateFile(row.finish, 'YYYY-MM-DD HH:mm');
    if (!parsedFinishTime) {
      return {
        isValid: false,
        error: `finish harus dalam format (2025-09-01 10:00 or 01/09/2025 10:00) DD/MM/YYYY HH:mm or YYYY-MM-DD HH:mm (row: ${row.finish})`,
      };
    }

    const activityMoment = moment(parsedActivityDate, 'YYYY-MM-DD', true);
    const startMoment = moment(parsedStartTime, 'YYYY-MM-DD HH:mm', true);
    const finishMoment = moment(parsedFinishTime, 'YYYY-MM-DD HH:mm', true);
    if (startMoment.isBefore(activityMoment, 'day')) {
      return {
        isValid: false,
        error: `start tidak boleh lebih kecil dari activity_date (start: ${row.start}, activity_date: ${row.activity_date})`,
      };
    }
    if (finishMoment.isBefore(activityMoment, 'day')) {
      return {
        isValid: false,
        error: `finish tidak boleh lebih kecil dari activity_date (finish: ${row.finish}, activity_date: ${row.activity_date})`,
      };
    }
    if (startMoment.isAfter(finishMoment)) {
      return {
        isValid: false,
        error: `start tidak boleh lebih dari finish (start: ${row.start}, finish: ${row.finish})`,
      };
    }

    if (!['ds', 'ns'].includes(row.shift.toLowerCase())) {
      return {
        isValid: false,
        error: `shift harus ds or ns (row: ${row.shift})`,
      };
    }

    const [siteId, bargeId, activityId] = await Promise.all([
      this.getSite(row.site),
      this.getBarge(row.barge),
      this.getActivity(row.activity),
    ]);

    if (!siteId) {
      const message = row.site ? `Site ${row.site} tidak ditemukan` : 'Site tidak ditemukan';
      return { isValid: false, error: message };
    }

    if (!bargeId) {
      const message = row.barge ? `Barge ${row.barge} tidak ditemukan` : 'Barge tidak ditemukan';
      return { isValid: false, error: message };
    }

    if (!activityId) {
      const message = row.barge ? `Activity ${row.barge} tidak ditemukan` : 'Activity tidak ditemukan';
      return { isValid: false, error: message };
    }

    const payload = {
      activity_date: parsedActivityDate,
      shift: row.shift?.toLowerCase(),
      site_id: siteId,
      barge_id: bargeId,
      activities_id: activityId,
      start: parsedStartTime,
      finish: parsedFinishTime,
      remark: row.remark,
    };

    return { isValid: true, payload };
  }

  private async processImportData(csvData: any[]): Promise<{
    results: any[];
    failedRows: any[];
    successCount: number;
    failedCount: number;
    payload: CreateBargingProblemDto[];
  }> {
    const results: any[] = [];
    const failedRows: any[] = [];
    let successCount = 0;
    let failedCount = 0;
    const payload: CreateBargingProblemDto[] = [];

    const validations = await Promise.all(
      csvData.map(async (row: any, idx: number) => {
        const rowNumber = idx + 1;
        try {
          const validationResult = await this.validateRowData(row);
          if (!validationResult.isValid) {
            failedCount++;
            failedRows.push({
              rowNumber,
              ...row,
              error: validationResult.error,
            });
            return {
              row: rowNumber,
              status: 'error',
              message: validationResult.error,
              data: row,
            };
          }

          successCount++;
          if (validationResult.payload) payload.push(validationResult.payload);
          return {
            row: rowNumber,
            status: 'success',
            message: 'Data valid',
            data: row,
          };
        } catch (err) {
          failedCount++;
          failedRows.push({ rowNumber, ...row, error: err.message });
          return {
            row: rowNumber,
            status: 'error',
            message: err.message || 'Validasi gagal',
            data: row,
          };
        }
      }),
    );

    results.push(...validations);

    return {
      results,
      failedRows,
      successCount,
      failedCount,
      payload,
    };
  }

  async importData(file: Express.Multer.File, userId: number) {
    try {
      validateImportFile(file);
      const csvData = await CsvHelper.parseCsvFile(file.buffer);
      const validationResult = await this.processImportData(csvData);
      if (validationResult?.payload?.length && validationResult.successCount > 0) {
        await this.bulkCreate(validationResult.payload, userId);
      }

      const errorFileInfo = await this.generateErrorCsv(validationResult.failedRows);

      return importResponse(csvData.length, validationResult.successCount, validationResult.failedCount, errorFileInfo);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throwError(error, 400);
      }

      if (error.message?.includes('CSV') || error.message?.includes('parse')) {
        throwError('Format CSV tidak valid. Pastikan file CSV memiliki format yang benar.', 400);
      }

      if (error.code === '23503') {
        throwError('Data referensi tidak ditemukan. Pastikan semua ID referensi valid.', 400);
      }

      throwError('Terjadi kesalahan saat memproses file import. Silakan coba lagi atau hubungi administrator.', 400);
    }
  }

  private createQueryBuilder(): SelectQueryBuilder<BargingProblem> {
    return this.bargingProblemRepository
      .createQueryBuilder('bargingProblem')
      .leftJoinAndSelect('bargingProblem.barge', 'barge')
      .leftJoinAndSelect('bargingProblem.activities', 'activities')
      .leftJoinAndSelect('bargingProblem.site', 'site')
      .where('bargingProblem.deletedAt IS NULL');
  }

  private applyFilterExportData(
    qb: SelectQueryBuilder<BargingProblem>,
    query: ExportBargingProblemsQueryDto,
  ): SelectQueryBuilder<BargingProblem> {
    const search = query.search?.trim().toLowerCase();
    const shift = query.shift?.toLowerCase();
    const activitiesId = query.activities_id;
    const siteId = query.site_id;
    const bargeId = query.barge_id;
    const sortOrder = query.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    if (search) {
      qb.andWhere(
        '(bargingProblem.remark ILIKE :search OR barge.name ILIKE :search OR activities.name ILIKE :search OR site.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    if (shift) {
      qb.andWhere('bargingProblem.shift = :shift', { shift });
    }

    if (activitiesId) qb.andWhere('barging.activitiesId = :activitiesId', { activitiesId });
    if (bargeId) qb.andWhere('barging.bargeId = :bargeId', { bargeId });
    if (siteId) qb.andWhere('bargingProblem.siteId = :siteId', { siteId });

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (query.activity_date) {
      startDate = moment(query.activity_date, 'YYYY-MM-DD').startOf('day').toDate();
      endDate = moment(query.activity_date, 'YYYY-MM-DD').add(1, 'day').startOf('day').toDate();
    } else if (query.start_date && query.end_date) {
      startDate = moment(query.start_date, 'YYYY-MM-DD').startOf('day').toDate();
      endDate = moment(query.end_date, 'YYYY-MM-DD').add(1, 'day').startOf('day').toDate();
    } else if (query.start_date) {
      startDate = moment(query.start_date, 'YYYY-MM-DD').startOf('day').toDate();
    } else if (query.end_date) {
      endDate = moment(query.end_date, 'YYYY-MM-DD').add(1, 'day').startOf('day').toDate();
    }

    if (startDate && endDate) {
      qb.andWhere('bargingProblem.activityDate >= :startDate AND bargingProblem.activityDate < :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      qb.andWhere('bargingProblem.activityDate >= :startDate', { startDate });
    } else if (endDate) {
      qb.andWhere('bargingProblem.activityDate < :endDate', { endDate });
    } else {
      qb.take(10); // default limit
    }

    qb.orderBy('bargingProblem.bargeId', sortOrder);

    return qb;
  }

  private mapExportDataToCsvRow(item: any, index: number) {
    return {
      No: index + 1,
      Date: moment(item.activityDate).format('YYYY-MM-DD'),
      Shift: item?.shift?.toUpperCase(),
      'Barge Name': item.barge?.name || '-',
      'Standby Factor': item.activities?.name || '' || '-',
      Start: moment(item.start).format('YYYY-MM-DD HH:mm') || '-',
      Finish: moment(item.finish).format('YYYY-MM-DD HH:mm') || '-',
      Duration: item.duration || this.calculateDuration(item.start, item.finish),
      Remark: item.remark,
    };
  }

  async exportData(query: ExportBargingProblemsQueryDto, res: Response) {
    try {
      const qb = this.createQueryBuilder();

      this.applyFilterExportData(qb, query);

      const data = await qb.getMany();

      if (!data.length) {
        res.status(200).json(successResponse([], 'Data Not Found'));
        return;
      }
      // // Set headers CSV
      setCsvExportHeaders(res, `barging_problem_list_export_${Date.now()}.csv`);
      // // Buat stream writer
      const csvStream = format({ headers: true });
      csvStream.pipe(res);
      data.forEach((item, i) => {
        csvStream.write(this.mapExportDataToCsvRow(item, i));
      });
      csvStream.end();
    } catch (error) {
      throw new InternalServerErrorException('Gagal export data');
    }
  }
}
