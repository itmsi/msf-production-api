import { Injectable, InternalServerErrorException, HttpException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeepPartial, ILike, Repository, SelectQueryBuilder } from 'typeorm';
import { BargingList } from './entities/barging-list.entity';
import { Population } from '../population/entities/population.entity';
import { Barge } from '../barge/entities/barge.entity';
import { ApiResponse, successResponse, throwError, emptyDataResponse, importResponse } from '../../common/helpers/response.helper';
import { CsvHelper, paginateResponse, setCsvExportHeaders } from '../../common/helpers/public.helper';
import {
  CreateBargingListDto,
  UpdateBargingListDto,
  BargingListResponseDto,
  GetBargingListQueryDto,
  ExportBargingListQueryDto,
} from './dto';
import { calculateTimeRange } from '../../common/helpers/public.helper';
import { validateFileNumber, validateImportFile } from 'src/common/helpers/validation.helper';
import { S3Service } from 'src/integrations/s3/s3.service';
import moment from 'moment';
import { Response } from 'express';
import { format } from '@fast-csv/format';

@Injectable()
export class BargingListService {
  constructor(
    @InjectRepository(BargingList)
    private bargingListRepository: Repository<BargingList>,
    @InjectRepository(Population)
    private populationRepository: Repository<Population>,
    @InjectRepository(Barge)
    private bargeRepository: Repository<Barge>,
    private s3Service: S3Service,
    private dataSource: DataSource,
  ) {}

  /**
   * Validasi unit_hauler_id ada di tabel m_population
   */
  private async validateUnitHaulerId(unitHaulerId: number): Promise<void> {
    const population = await this.populationRepository.findOne({
      where: { id: unitHaulerId, deletedAt: undefined },
    });

    if (!population) {
      throwError(`Unit hauler dengan ID ${unitHaulerId} tidak ditemukan di tabel m_population`, 400);
    }
  }

  /**
   * Validasi barge_id ada di tabel m_barge
   */
  private async validateBargeId(bargeId: number): Promise<void> {
    const barge = await this.bargeRepository.findOne({
      where: { id: bargeId, deletedAt: undefined },
    });

    if (!barge) {
      throwError(`Barge dengan ID ${bargeId} tidak ditemukan di tabel m_barge`, 400);
    }
  }

  /**
   * Transform response untuk include unit_hauler_name dan barge_name
   */
  private transformResponse(bargingList: BargingList): BargingListResponseDto {
    // Pastikan activityDate dan time adalah Date object dengan timezone lokal
    const activityDate =
      bargingList.activityDate instanceof Date
        ? bargingList.activityDate.toLocaleDateString('en-CA')
        : new Date(bargingList.activityDate).toLocaleDateString('en-CA');

    const time = bargingList.time instanceof Date ? bargingList.time.toISOString() : new Date(bargingList.time).toISOString();

    // Hitung time range dari time
    const timeRange = calculateTimeRange(bargingList.time);

    return {
      id: bargingList.id,
      activity_date: activityDate,
      shift: bargingList.shift,
      time: time,
      time_range: timeRange,
      unit_hauler_id: bargingList.unitHaulerId,
      unit_hauler_name: bargingList.unitHauler?.no_unit || '',
      barge_id: bargingList.bargeId,
      barge_name: bargingList.barge?.name || '',
      vessel: bargingList.vessel,
      total_tonnage: bargingList.totalTonnage,
      createdAt: bargingList.createdAt,
      updatedAt: bargingList.updatedAt,
    };
  }

  /**
   * Buat query builder dengan join ke tabel terkait
   */
  private createQueryBuilder(): SelectQueryBuilder<BargingList> {
    return this.bargingListRepository
      .createQueryBuilder('barging')
      .leftJoinAndSelect('barging.unitHauler', 'unitHauler')
      .leftJoinAndSelect('barging.barge', 'barge')
      .where('barging.deletedAt IS NULL');
  }

  /**
   * Test endpoint untuk cek data yang tersedia
   */
  async testData() {
    try {
      // Cek data population
      const populations = await this.populationRepository.find({
        where: { deletedAt: undefined },
        take: 10,
      });

      // Cek data barge
      const barges = await this.bargeRepository.find({
        where: { deletedAt: undefined },
        take: 10,
      });

      return {
        populations: populations.map((p) => ({ id: p.id, no_unit: p.no_unit })),
        barges: barges.map((b) => ({ id: b.id, name: b.name })),
        message: 'Data test berhasil diambil',
      };
    } catch (error) {
      throw new InternalServerErrorException(`Gagal mengambil data test: ${error.message}`);
    }
  }

  async create(createDto: CreateBargingListDto): Promise<ApiResponse<BargingListResponseDto>> {
    try {
      // Validasi unit_hauler_id
      await this.validateUnitHaulerId(createDto.unit_hauler_id);

      // Validasi barge_id
      await this.validateBargeId(createDto.barge_id);

      // Hitung total_tonnage (vessel * 40)
      const totalTonnage = createDto.vessel * 40;

      // Buat entity baru
      const newBargingList = this.bargingListRepository.create({
        activityDate: new Date(createDto.activity_date),
        shift: createDto.shift,
        time: new Date(createDto.time),
        unitHaulerId: createDto.unit_hauler_id,
        bargeId: createDto.barge_id,
        vessel: createDto.vessel,
        totalTonnage,
      });

      const result = await this.bargingListRepository.save(newBargingList);

      // Ambil data lengkap dengan relasi
      const savedBargingList = await this.bargingListRepository.findOne({
        where: { id: result.id },
        relations: ['unitHauler', 'barge'],
      });

      if (!savedBargingList) {
        throwError('Gagal mengambil data barging list yang baru dibuat', 500);
      }

      const response = this.transformResponse(savedBargingList!);

      return successResponse(response, 'Barging list berhasil dibuat', 201);
    } catch (error) {
      console.error('Error in create method:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Gagal membuat barging list: ${error.message}`);
    }
  }

  async findAll(query: GetBargingListQueryDto): Promise<ApiResponse<BargingListResponseDto[]>> {
    try {
      const page = parseInt(query.page?.toString() ?? '1', 10);
      const limit = parseInt(query.limit?.toString() ?? '10', 10);
      const skip = (page - 1) * limit;
      const search = query.search?.toLowerCase() ?? '';
      const shift = query.shift;
      const unitHaulerId = query.unit_hauler_id;
      const bargeId = query.barge_id;
      const dateFrom = query.date_from;
      const dateTo = query.date_to;
      const sortBy = query.sortBy ?? 'id';
      const sortOrder = query.sortOrder ?? 'DESC';

      const qb = this.createQueryBuilder();

      // Filter berdasarkan search
      if (search) {
        qb.andWhere('(LOWER(unitHauler.no_unit) LIKE :search OR LOWER(barge.name) LIKE :search)', {
          search: `%${search}%`,
        });
      }

      // Filter berdasarkan shift
      if (shift) {
        qb.andWhere('barging.shift = :shift', { shift });
      }

      // Filter berdasarkan unit hauler ID
      if (unitHaulerId) {
        qb.andWhere('barging.unitHaulerId = :unitHaulerId', { unitHaulerId });
      }

      // Filter berdasarkan barge ID
      if (bargeId) {
        qb.andWhere('barging.bargeId = :bargeId', { bargeId });
      }

      // Filter berdasarkan tanggal
      if (dateFrom && dateTo) {
        qb.andWhere('barging.activityDate BETWEEN :dateFrom AND :dateTo', {
          dateFrom,
          dateTo,
        });
      } else if (dateFrom) {
        qb.andWhere('barging.activityDate >= :dateFrom', { dateFrom });
      } else if (dateTo) {
        qb.andWhere('barging.activityDate <= :dateTo', { dateTo });
      }

      // Sorting
      qb.orderBy(`barging.${sortBy}`, sortOrder);

      // Pagination
      const total = await qb.getCount();
      const data = await qb.skip(skip).take(limit).getMany();

      // Transform response
      const transformedData = data.map((item) => this.transformResponse(item));

      return paginateResponse(transformedData, total, page, limit, 'Data barging list berhasil diambil');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal mengambil data barging list');
    }
  }

  async findOne(id: number): Promise<ApiResponse<BargingListResponseDto | null>> {
    try {
      const bargingList = await this.bargingListRepository.findOne({
        where: { id, deletedAt: undefined },
        relations: ['unitHauler', 'barge'],
      });

      if (!bargingList) {
        return emptyDataResponse('Barging list tidak ditemukan');
      }

      return successResponse(this.transformResponse(bargingList), 'Data barging list berhasil diambil');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal mengambil data barging list');
    }
  }

  async update(id: number, updateDto: UpdateBargingListDto): Promise<ApiResponse<BargingListResponseDto | null>> {
    try {
      // Cek apakah data exists
      const existingBargingList = await this.bargingListRepository.findOne({
        where: { id, deletedAt: undefined },
      });

      if (!existingBargingList) {
        throwError('Barging list tidak ditemukan', 404);
      }

      // Validasi unit_hauler_id jika diupdate
      if (updateDto.unit_hauler_id) {
        await this.validateUnitHaulerId(updateDto.unit_hauler_id);
      }

      // Validasi barge_id jika diupdate
      if (updateDto.barge_id) {
        await this.validateBargeId(updateDto.barge_id);
      }

      // Update data
      const updateData: any = {};

      if (updateDto.activity_date) {
        updateData.activityDate = new Date(updateDto.activity_date);
      }

      if (updateDto.shift) {
        updateData.shift = updateDto.shift;
      }

      if (updateDto.time) {
        updateData.time = new Date(updateDto.time);
      }

      if (updateDto.unit_hauler_id) {
        updateData.unitHaulerId = updateDto.unit_hauler_id;
      }

      if (updateDto.barge_id) {
        updateData.bargeId = updateDto.barge_id;
      }

      if (updateDto.vessel) {
        updateData.vessel = updateDto.vessel;
        // Update total_tonnage jika vessel berubah
        updateData.totalTonnage = updateDto.vessel * 40;
      }

      await this.bargingListRepository.update(id, updateData);

      // Ambil data yang sudah diupdate
      const updatedBargingList = await this.bargingListRepository.findOne({
        where: { id },
        relations: ['unitHauler', 'barge'],
      });

      if (!updatedBargingList) {
        throwError('Gagal mengambil data barging list yang sudah diupdate', 500);
      }

      return successResponse(this.transformResponse(updatedBargingList!), 'Barging list berhasil diupdate');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal mengupdate barging list');
    }
  }

  async remove(id: number): Promise<ApiResponse<null>> {
    try {
      // Cek apakah data exists
      const existingBargingList = await this.bargingListRepository.findOne({
        where: { id, deletedAt: undefined },
      });

      if (!existingBargingList) {
        throwError('Barging list tidak ditemukan', 404);
      }

      // Soft delete
      await this.bargingListRepository.softDelete(id);

      return successResponse(null, 'Barging list berhasil dihapus');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal menghapus barging list');
    }
  }

  private async getPopulation(namePopulation: string) {
    const name = namePopulation?.trim();
    const populationId = await this.populationRepository.findOne({
      where: {
        no_unit: ILike(`%${name}%`),
      },
    });
    return populationId?.id;
  }

  private async getBarge(bargeName: string): Promise<number | undefined> {
    const name = bargeName?.trim();
    const barge = await this.bargeRepository.findOne({
      where: {
        name: ILike(`%${name}%`),
      },
    });
    return barge?.id;
  }

  private async validateRowData(row: any): Promise<{
    isValid: boolean;
    error?: string;
    payload?: CreateBargingListDto;
  }> {
    if (!row.activity_date) {
      return {
        isValid: false,
        error: 'activity_date is required',
      };
    }

    if (!row.time_activity) {
      return {
        isValid: false,
        error: 'time_activity is required',
      };
    }

    if (!row.shift) {
      return {
        isValid: false,
        error: 'shift is required',
      };
    }

    if (!row.unit_hauler) {
      return {
        isValid: false,
        error: 'unit_hauler is required',
      };
    }

    if (!row.barge) {
      return {
        isValid: false,
        error: 'barge is required',
      };
    }

    if (!row.vessel) {
      return {
        isValid: false,
        error: 'vessel is required',
      };
    }

    if (!moment(row.activity_date, 'YYYY-MM-DD', true).isValid()) {
      return {
        isValid: false,
        error: `activity_date harus dalam format YYYY-MM-DD (row: ${row.activity_date})`,
      };
    }

    if (row.time_activity && !moment(row.time_activity, 'HH:mm', true).isValid()) {
      return {
        isValid: false,
        error: `time_activity harus dalam format (10:00) HH:mm (row: ${row.time_activity})`,
      };
    }

    if (!['ds', 'ns'].includes(row?.shift?.toLowerCase())) {
      return {
        isValid: false,
        error: `shift harus ds or ns (row: ${row.shift})`,
      };
    }

    const res = validateFileNumber(row, 'vessel', 'vessel');
    if (!res.ok) return { isValid: false, error: res.error };

    const [populationId, bargeId] = await Promise.all([this.getPopulation(row.unit_hauler), this.getBarge(row.barge)]);

    if (!populationId) {
      const message = row.unit_hauler ? `Unit ${row?.unit_hauler} tidak ditemukan` : 'Unit tidak ditemukan';
      return {
        isValid: false,
        error: message,
      };
    }

    if (!bargeId) {
      const message = row.barge ? `Barge ${row?.barge} tidak ditemukan` : 'Barge tidak ditemukan';
      return {
        isValid: false,
        error: message,
      };
    }

    const payload = {
      activity_date: row.activity_date,
      shift: row.shift,
      time: `${row.activity_date} ${row.time_activity}`,
      unit_hauler_id: populationId,
      barge_id: bargeId,
      vessel: row.vessel,
    };
    return {
      isValid: true,
      payload,
    };
  }

  private async processImportData(csvData: any[]): Promise<{
    results: any[];
    failedRows: any[];
    successCount: number;
    failedCount: number;
    payload: CreateBargingListDto[];
  }> {
    const results: any[] = [];
    const failedRows: any[] = [];
    let successCount = 0;
    let failedCount = 0;
    const payload: CreateBargingListDto[] = [];

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

  async bulkCreate(payload: CreateBargingListDto[], userId: number): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const bargingListEntities = payload.map((dto) => {
        const totalTonnage = dto.vessel * 40;
        return queryRunner.manager.create(BargingList, {
          activityDate: moment(dto.activity_date, 'YYYY-MM-DD', true).toDate(),
          shift: dto.shift,
          time: moment(dto.time, 'YYYY-MM-DD HH:mm', true).toDate(),
          unitHaulerId: dto.unit_hauler_id,
          bargeId: dto.barge_id,
          vessel: dto.vessel,
          totalTonnage,
          createdBy: userId,
        } as DeepPartial<BargingList>);
      });

      await queryRunner.manager.save(BargingList, bargingListEntities);

      await queryRunner.commitTransaction();
      return;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throwError('Failed to import Barging List', 500);
    } finally {
      await queryRunner.release();
    }
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

    const workingHour = ['year_month', 'total_working_hour_month', 'total_working_hour_day', 'total_mohh_per_month'];
    const activityKeys = [...dynamicKeys].filter((k) => !workingHour.includes(k));

    const csvHeaders = [...workingHour, ...activityKeys, 'error_message (Please delete this column before importing again)'];

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
      const filename = `import-barging-errors-${Date.now()}.csv`;

      const result = await this.s3Service.uploadErrorFile(filename, csvBuffer, 'barging_import_error');

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

      console.error('Unexpected error in importData:', error.stack);
      throwError('Terjadi kesalahan saat memproses file import. Silakan coba lagi atau hubungi administrator.', 400);
    }
  }

  private applyFilterExportData(qb: SelectQueryBuilder<BargingList>, query: ExportBargingListQueryDto): SelectQueryBuilder<BargingList> {
    const search = query.search?.trim().toLowerCase();
    const shift = query.shift?.toLowerCase();
    const unitHaulerId = query.unit_hauler_id;
    const bargeId = query.barge_id;
    const sortOrder = query.sortOrder ?? 'DESC';
    if (search) {
      qb.andWhere('(LOWER(unitHauler.no_unit) LIKE :search OR LOWER(barge.name) LIKE :search)', { search: `%${search}%` });
    }

    if (shift) {
      qb.andWhere('barging.shift = :shift', { shift });
    }

    if (unitHaulerId) {
      qb.andWhere('barging.unitHaulerId = :unitHaulerId', { unitHaulerId });
    }

    if (bargeId) {
      qb.andWhere('barging.bargeId = :bargeId', { bargeId });
    }

    if (query.date_from && query.date_to) {
      qb.andWhere('barging.activityDate BETWEEN :dateFrom AND :dateTo', {
        dateFrom: query.date_from,
        dateTo: query.date_to,
      });
    } else if (query.date_from) {
      qb.andWhere('barging.activityDate >= :dateFrom', {
        dateFrom: query.date_from,
      });
    } else if (query.date_to) {
      qb.andWhere('barging.activityDate <= :dateTo', { dateTo: query.date_to });
    } else {
      qb.take(10);
    }

    qb.orderBy('barging.id', sortOrder);
    return qb;
  }

  private mapExportDataToCsvRow(item: BargingList, index: number) {
    const timeRange = calculateTimeRange(item.time);
    return {
      No: index + 1,
      Date: moment(item.activityDate).format('YYYY-MM-DD'),
      Shift: item?.shift?.toUpperCase(),
      Time: moment(item?.time).format('HH:mm'),
      'Time Range': timeRange,
      'Unit Hauler': item?.unitHauler?.no_unit || '',
      'Barge Name': item?.barge?.name || '',
      'Dump Area': item?.barge?.name || '',
      Vessel: item?.vessel || 0,
      'Total Tonnage': item?.totalTonnage || 0,
    };
  }

  async exportData(query: ExportBargingListQueryDto, res: Response) {
    try {
      const qb = this.createQueryBuilder();

      this.applyFilterExportData(qb, query);

      const data = await qb.getMany();

      if (!data.length) {
        res.status(200).json(successResponse([], 'Data Not Found'));
        return;
      }
      // // Set headers CSV
      setCsvExportHeaders(res, `barging_list_export_${Date.now()}.csv`);
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
