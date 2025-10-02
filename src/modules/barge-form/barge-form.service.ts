import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, ILike, DataSource, DeepPartial } from 'typeorm';
import { BargeForm } from './entities/barge-form.entity';
import { CreateBargeFormDto, UpdateBargeFormDto, BargeFormResponseDto, QueryBargeFormDto, QueryExportBargeFormDto } from './dto';
import { successResponse, emptyDataResponse, throwError } from '../../common/helpers/response.helper';
import { ACCEPTED_DATE_FORMATS, CsvHelper, parseDateFile, setCsvExportHeaders } from '../../common/helpers/public.helper';
import { Response } from 'express';
import { format } from '@fast-csv/format';
import moment from 'moment';
import { S3Service } from 'src/integrations/s3/s3.service';
import { Sites } from '../sites';
import { Barge } from '../barge/entities/barge.entity';
import { validateImportFile } from 'src/common/helpers/validation.helper';

@Injectable()
export class BargeFormService {
  constructor(
    @InjectRepository(BargeForm)
    private readonly bargeFormRepository: Repository<BargeForm>,
    @InjectRepository(Sites)
    private sitesRepository: Repository<Sites>,
    @InjectRepository(Barge)
    private bargeRepository: Repository<Barge>,
    private s3Service: S3Service,
    private dataSource: DataSource,
  ) {}

  private createErrorCsvContent(failedRows: any[]): string {
    const csvHeaders = [
      'rowNumber',
      'shipment',
      'barge',
      'vol_by_draft_survey',
      'start_date',
      'finish_date',
      'site',
      'total_vessel',
      'remarks',
      'error_message',
    ];

    const csvRows = failedRows.map((row) => [
      row.rowNumber,
      row.shipment || '',
      row.barge || '',
      row.vol_by_draft_survey || '',
      row.start_date || '',
      row.finish_date || '',
      row.site || '',
      row.total_vessel || '',
      row.remarks || '',
      row.error || 'Foreign key tidak ditemukan',
    ]);

    return [csvHeaders.join(','), ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');
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
      const filename = `import-barge-errors-${Date.now()}.csv`;

      const result = await this.s3Service.uploadErrorFile(filename, csvBuffer, 'barge_import_error');

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

  private async getSite(siteName: string): Promise<number | undefined> {
    const name = siteName?.trim();
    const site = await this.sitesRepository.findOne({
      where: {
        name: ILike(`%${name}%`),
      },
    });
    return site?.id;
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
    payload?: CreateBargeFormDto;
  }> {
    if (!row.shipment) {
      return {
        isValid: false,
        error: 'shipment is required',
      };
    }

    if (!row.start_date) {
      return {
        isValid: false,
        error: 'start_date is required',
      };
    }
    const parsedStartDate = parseDateFile(row.start_date);
    if (!parsedStartDate) {
      return {
        isValid: false,
        error: `start_date harus dalam format ${ACCEPTED_DATE_FORMATS.join(' or ')} (row: ${row.start_date})`,
      };
    }

    const parsedFinishDate = parseDateFile(row.finish_date);
    if (row.finish_date && !parsedFinishDate) {
      return {
        isValid: false,
        error: `finish_date harus dalam format ${ACCEPTED_DATE_FORMATS.join(' or ')} (row: ${row.finish_date})`,
      };
    }

    const startMoment = moment(parsedStartDate, 'YYYY-MM-DD', true);
    const finishMoment = moment(parsedFinishDate, 'YYYY-MM-DD', true);
    if (startMoment.isAfter(finishMoment)) {
      return {
        isValid: false,
        error: `start_date tidak boleh lebih dari finish_date (start_date: ${row.start_date}, finish_date: ${row.finish_date})`,
      };
    }

    if (row.total_vessel !== undefined && row.total_vessel !== null) {
      const totalVessel = Number(row.total_vessel);
      if (isNaN(totalVessel)) {
        return {
          isValid: false,
          error: `total_vessel harus berupa number (row: ${row.total_vessel})`,
        };
      }
    }

    if (row.vol_by_draft_survey !== undefined && row.vol_by_draft_survey !== null) {
      const volBySurvey = Number(row.vol_by_draft_survey);
      if (isNaN(volBySurvey)) {
        return {
          isValid: false,
          error: `vol_by_draft_survey harus berupa number (row: ${row.vol_by_draft_survey})`,
        };
      }
    }

    const [siteId, bargeId] = await Promise.all([this.getSite(row.site), this.getBarge(row.barge)]);

    if (!siteId) {
      const message = row.site ? `Site ${row?.site} tidak ditemukan` : 'Site tidak ditemukan';
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
      barge_id: bargeId,
      site_id: siteId,
      shipment: row.shipment,
      start_loading: row.start_date,
      end_loading: row?.finish_date || null,
      total_vessel: row.total_vessel || null,
      vol_by_survey: row?.vol_by_draft_survey || null,
      remarks: row?.remarks || null,
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
    payload: CreateBargeFormDto[];
  }> {
    const results: any[] = [];
    const failedRows: any[] = [];
    let successCount = 0;
    let failedCount = 0;
    const payload: CreateBargeFormDto[] = [];

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

  private buildImportResponse(
    total: number,
    successCount: number,
    failedCount: number,
    errorFileInfo: {
      error_file: { download_url: string; file_name: string } | null;
    },
  ) {
    return successResponse(
      {
        total,
        success: successCount,
        failed: failedCount,
        error_file: errorFileInfo.error_file,
        hasErrorFile: failedCount > 0,
      },
      failedCount > 0
        ? `Import selesai dengan ${failedCount} error. ${
            errorFileInfo.error_file ? 'Download error CSV untuk detail.' : 'Gagal generate error file.'
          }`
        : 'Semua data valid',
    );
  }

  async bulkCreate(payload: CreateBargeFormDto[], userId: number): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const bargeIds = [...new Set(payload.map((dto) => dto.barge_id))];

      const bargeCapacities = await queryRunner.manager
        .createQueryBuilder(Barge, 'barge')
        .select(['barge.id', 'barge.capacity'])
        .where('barge.id IN (:...ids)', { ids: bargeIds })
        .getMany();

      const capacityMap = new Map<number, number>();
      bargeCapacities.forEach((b) => {
        capacityMap.set(b.id, b.capacity);
      });

      const bargeFormEntities = payload.map((dto) => {
        const capacity = capacityMap.get(dto.barge_id) || null;

        let capacity_per_dt: number | null = null;
        if (dto.vol_by_survey && dto.total_vessel) {
          capacity_per_dt = dto.vol_by_survey / dto.total_vessel;
        }

        let achievment: number | null = null;
        if (dto.vol_by_survey && capacity) {
          achievment = Number((dto.vol_by_survey / capacity).toFixed(2));
        }

        const status = dto.end_loading && dto.end_loading !== null ? 'Completed' : 'On Progress';

        return queryRunner.manager.create(BargeForm, {
          ...dto,
          capacity_per_dt,
          achievment,
          status,
          createdBy: userId,
        } as DeepPartial<BargeForm>);
      });

      await queryRunner.manager.save(BargeForm, bargeFormEntities);

      await queryRunner.commitTransaction();
      return;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throwError('Failed to import barge forms', 500);
    } finally {
      await queryRunner.release();
    }
  }

  async importData(file: Express.Multer.File, userId: number) {
    try {
      validateImportFile(file);
      const csvData = await CsvHelper.parseCsvFile(file.buffer);
      const validationResult = await this.processImportData(csvData);
      if (validationResult?.payload.length && validationResult.successCount > 0) {
        await this.bulkCreate(validationResult.payload, userId);
      }

      const errorFileInfo = await this.generateErrorCsv(validationResult.failedRows);

      return this.buildImportResponse(csvData.length, validationResult.successCount, validationResult.failedCount, errorFileInfo);
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

  private findAllQueryBuilder(): SelectQueryBuilder<BargeForm> {
    return this.bargeFormRepository
      .createQueryBuilder('bargeForm')
      .leftJoinAndSelect('bargeForm.barge', 'barge')
      .leftJoinAndSelect('bargeForm.site', 'site');
  }

  private applyFilterExportData(qb: SelectQueryBuilder<BargeForm>, query: QueryExportBargeFormDto): SelectQueryBuilder<BargeForm> {
    const { keyword, barge_id, end_date, start_date } = query;

    if (start_date && end_date) {
      const from = new Date(`${start_date}T00:00:00.000Z`);
      const to = new Date(`${end_date}T23:59:59.999Z`);

      qb.andWhere('bargeForm.start_loading >= :from AND bargeForm.end_loading <= :to', {
        from,
        to,
      });

      qb.orderBy('bargeForm.start_loading', 'ASC');
    } else {
      qb.orderBy('bargeForm.start_loading', 'DESC').limit(10);
    }

    if (barge_id) {
      qb.andWhere('bargeForm.barge_id = :barge_id', { barge_id });
    }

    if (keyword) {
      qb.andWhere(
        '(LOWER(barge.name) LIKE :keyword OR LOWER(site.name) LIKE :keyword OR LOWER(bargeForm.shipment) LIKE :keyword OR LOWER(bargeForm.remarks) LIKE :keyword)',
        { keyword: `%${keyword.toLowerCase()}%` },
      );
    }

    return qb;
  }

  private mapExportDataToCsvRow(item: BargeForm, index: number) {
    let achievement: number | '-' = '-';
    if (item.vol_by_survey && item.barge?.capacity) {
      achievement = Number((item.vol_by_survey / item.barge.capacity).toFixed(2));
    }
    return {
      No: index + 1,
      Shipment: item.shipment,
      'Barge Name': item.barge?.name || '-',
      'Date Start': moment(item.start_loading).format('DD/MM/YYYY'),
      'Date Finish': moment(item.end_loading).format('DD/MM/YYYY'),
      Capacity: item?.barge?.capacity || '-',
      Vessel: item.total_vessel ? Number(item.total_vessel.toFixed(2)) : '-',
      'Vol By Draft Survey': item.vol_by_survey ? Number(item.vol_by_survey.toFixed(2)) : '-',
      'Capacity Per DT': item.capacity_per_dt ? Number(item.capacity_per_dt.toFixed(2)) : '-',
      'ACV (%)': achievement,
      Remarks: item?.remarks || '-',
      Status: item?.status || '-',
    };
  }

  async exportData(query: QueryExportBargeFormDto, res: Response) {
    try {
      const qb = this.findAllQueryBuilder();
      // Apply filters & sorting
      this.applyFilterExportData(qb, query);

      const data = await qb.getMany();
      if (!data.length) {
        res.status(200).json(successResponse([], 'Data Not Found'));
        return;
      }
      // Set headers CSV
      setCsvExportHeaders(res, `barge_export_${Date.now()}.csv`);

      // Buat stream writer
      const csvStream = format({ headers: true });
      csvStream.pipe(res);

      // Mapping ke row CSV
      data.forEach((item, i) => {
        csvStream.write(this.mapExportDataToCsvRow(item, i));
      });

      csvStream.end();
    } catch (error) {
      throw new InternalServerErrorException('Gagal export data');
    }
  }

  async create(createBargeFormDto: CreateBargeFormDto): Promise<any> {
    try {
      // Get barge capacity first
      const bargeCapacityResult = await this.bargeFormRepository.query('SELECT capacity FROM m_barge WHERE id = $1', [
        createBargeFormDto.barge_id,
      ]);
      const capacity = bargeCapacityResult.length > 0 ? bargeCapacityResult[0].capacity : null;
      // Calculate capacity_per_dt if both vol_by_survey and total_vessel are provided
      let capacity_per_dt: number | null = null;
      if (createBargeFormDto.vol_by_survey && createBargeFormDto.total_vessel) {
        capacity_per_dt = createBargeFormDto.vol_by_survey / createBargeFormDto.total_vessel;
      }

      // Calculate achievment if both vol_by_survey and capacity are provided
      let achievment: number | null = null;
      if (createBargeFormDto.vol_by_survey && capacity) {
        achievment = Number((createBargeFormDto.vol_by_survey / capacity).toFixed(2));
      }

      // Calculate status based on end_loading
      const status = createBargeFormDto.end_loading && createBargeFormDto.end_loading !== null ? 'Completed' : 'On Progress';

      const bargeFormData: any = {
        ...createBargeFormDto,
        capacity_per_dt: capacity_per_dt || undefined,
        achievment: achievment || undefined,
        status,
      };

      const bargeForm = this.bargeFormRepository.create(bargeFormData);
      const savedBargeForm = await this.bargeFormRepository.save(bargeForm);

      // Reload with relations
      const bargeFormWithRelations = await this.bargeFormRepository.findOne({
        where: { id: (savedBargeForm as any).id },
        relations: ['barge', 'site'],
      });

      if (!bargeFormWithRelations) {
        throwError('Failed to retrieve created barge form', 500);
      }
      return successResponse([], 'Barge form created successfully', 201);
    } catch (error) {
      throwError('Failed to create barge form', 500);
    }
  }

  async findAll(queryDto: QueryBargeFormDto): Promise<any> {
    try {
      const { start_date, end_date, keyword, barge_id, page = 1, limit = 10 } = queryDto;
      const skip = (page - 1) * limit;

      const queryBuilder = this.findAllQueryBuilder();
      // Apply date range filter
      if (start_date && end_date) {
        queryBuilder.andWhere('bargeForm.start_loading >= :start_date AND bargeForm.end_loading <= :end_date', {
          start_date: new Date(start_date + 'T00:00:00.000Z'),
          end_date: new Date(end_date + 'T23:59:59.999Z'),
        });
      }

      // Apply keyword filter
      if (keyword) {
        queryBuilder.andWhere(
          '(LOWER(barge.name) LIKE :keyword OR LOWER(site.name) LIKE :keyword OR LOWER(bargeForm.shipment) LIKE :keyword OR LOWER(bargeForm.remarks) LIKE :keyword)',
          { keyword: `%${keyword.toLowerCase()}%` },
        );
      }

      // Apply barge_id filter
      if (barge_id) {
        queryBuilder.andWhere('bargeForm.barge_id = :barge_id', { barge_id });
      }

      // Get total count
      const total = await queryBuilder.getCount();

      // Apply pagination
      const bargeForms = await queryBuilder.skip(skip).take(limit).orderBy('bargeForm.createdAt', 'DESC').getMany();

      // Transform data to response format
      const transformedData: BargeFormResponseDto[] = await Promise.all(
        bargeForms.map(async (item) => {
          // Get barge capacity directly from database
          const bargeCapacityResult = await this.bargeFormRepository.query('SELECT capacity FROM m_barge WHERE id = $1', [item.barge_id]);

          const capacity = bargeCapacityResult.length > 0 ? bargeCapacityResult[0].capacity : null;

          // Recalculate achievement using new formula: vol_by_survey / capacity
          let recalculatedAchievement: number | null = null;
          if (item.vol_by_survey && capacity) {
            recalculatedAchievement = Number(((item.vol_by_survey / capacity) * 100).toFixed(2));
          }

          const result = {
            id: item.id,
            barge_id: item.barge_id,
            site_id: item.site_id,
            shipment: item.shipment,
            barge_name: item.barge?.name || '',
            site_name: item.site?.name || '',
            start_loading: item.start_loading,
            end_loading: item.end_loading,
            total_vessel: item.total_vessel ? Number(item.total_vessel.toFixed(2)) : null,
            vol_by_survey: item.vol_by_survey ? Number(item.vol_by_survey.toFixed(2)) : null,
            capacity_per_dt: item.capacity_per_dt ? Number(item.capacity_per_dt.toFixed(2)) : null,
            achievment: recalculatedAchievement, // Use recalculated achievement
            remarks: item.remarks,
            status: item.status,
            capacity: capacity,
          } as any;
          return result;
        }),
      );

      if (transformedData.length === 0) {
        return emptyDataResponse('No barge forms found');
      }

      const response = {
        statusCode: 200,
        message: 'Barge forms retrieved successfully',
        data: transformedData,
        pagination: {
          total,
          page,
          limit,
          lastPage: Math.ceil(total / limit),
        },
      };
      return response;
    } catch (error) {
      throwError('Failed to retrieve barge forms', 500);
    }
  }

  async findOne(id: number): Promise<any> {
    try {
      const bargeForm = await this.bargeFormRepository.findOne({
        where: { id },
        relations: ['barge', 'site'],
      });

      if (!bargeForm) {
        return emptyDataResponse('Barge form not found');
      }

      // Get barge capacity and recalculate achievement
      const bargeCapacityResult = await this.bargeFormRepository.query('SELECT capacity FROM m_barge WHERE id = $1', [bargeForm.barge_id]);
      const capacity = bargeCapacityResult.length > 0 ? bargeCapacityResult[0].capacity : null;

      // Recalculate achievement using new formula: vol_by_survey / capacity
      let recalculatedAchievement: number | null = null;
      if (bargeForm.vol_by_survey && capacity) {
        recalculatedAchievement = Number((bargeForm.vol_by_survey / capacity).toFixed(2));
      }

      const transformedData: BargeFormResponseDto = {
        id: bargeForm.id,
        barge_id: bargeForm.barge_id,
        site_id: bargeForm.site_id,
        shipment: bargeForm.shipment,
        barge_name: bargeForm.barge?.name || '',
        site_name: bargeForm.site?.name || '',
        capacity: capacity,
        start_loading: bargeForm.start_loading,
        end_loading: bargeForm.end_loading,
        total_vessel: bargeForm.total_vessel ? Number(bargeForm.total_vessel.toFixed(2)) : null,
        vol_by_survey: bargeForm.vol_by_survey ? Number(bargeForm.vol_by_survey.toFixed(2)) : null,
        capacity_per_dt: bargeForm.capacity_per_dt ? Number(bargeForm.capacity_per_dt.toFixed(2)) : null,
        achievment: recalculatedAchievement, // Use recalculated achievement
        remarks: bargeForm.remarks,
        status: bargeForm.status,
      };

      return successResponse(transformedData, 'Barge form retrieved successfully');
    } catch (error) {
      throwError('Failed to retrieve barge form', 500);
    }
  }

  async update(id: number, updateBargeFormDto: UpdateBargeFormDto): Promise<any> {
    try {
      const bargeForm = await this.bargeFormRepository.findOne({
        where: { id },
      });

      if (!bargeForm) {
        throw new NotFoundException('Barge form not found');
      }

      // Get barge capacity first
      const bargeCapacityResult = await this.bargeFormRepository.query('SELECT capacity FROM m_barge WHERE id = $1', [bargeForm.barge_id]);
      const capacity = bargeCapacityResult.length > 0 ? bargeCapacityResult[0].capacity : null;
      // Get current values or use updated values
      const vol_by_survey = updateBargeFormDto.vol_by_survey ?? bargeForm.vol_by_survey;
      const total_vessel = updateBargeFormDto.total_vessel ?? bargeForm.total_vessel;
      const end_loading = updateBargeFormDto.end_loading ?? bargeForm.end_loading;

      // Calculate capacity_per_dt if both vol_by_survey and total_vessel are provided
      let capacity_per_dt: number | null = null;
      if (vol_by_survey && total_vessel) {
        capacity_per_dt = vol_by_survey / total_vessel;
      }

      // Calculate achievment if both vol_by_survey and capacity are provided
      let achievment: number | null = null;
      if (vol_by_survey && capacity) {
        achievment = Number((vol_by_survey / capacity).toFixed(2));
      }

      // Calculate status based on end_loading
      const status = end_loading && end_loading !== null ? 'Completed' : 'On Progress';

      const updateData: any = {
        ...updateBargeFormDto,
        capacity_per_dt: capacity_per_dt || undefined,
        achievment: achievment || undefined,
        status,
      };

      await this.bargeFormRepository.update(id, updateData);
      const updatedBargeForm = await this.bargeFormRepository.findOne({
        where: { id },
        relations: ['barge', 'site'],
      });

      if (!updatedBargeForm) {
        throw new NotFoundException('Barge form not found after update');
      }

      const transformedData: BargeFormResponseDto = {
        id: updatedBargeForm.id,
        barge_id: updatedBargeForm.barge_id,
        site_id: updatedBargeForm.site_id,
        shipment: updatedBargeForm.shipment,
        barge_name: updatedBargeForm.barge?.name || '',
        site_name: updatedBargeForm.site?.name || '',
        capacity: updatedBargeForm.barge?.capacity || null,
        start_loading: updatedBargeForm.start_loading,
        end_loading: updatedBargeForm.end_loading,
        total_vessel: updatedBargeForm.total_vessel,
        vol_by_survey: updatedBargeForm.vol_by_survey,
        capacity_per_dt: updatedBargeForm.capacity_per_dt,
        achievment: updatedBargeForm.achievment,
        remarks: updatedBargeForm.remarks,
        status: updatedBargeForm.status,
      };

      return successResponse(transformedData, 'Barge form updated successfully');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throwError('Failed to update barge form', 500);
    }
  }

  async remove(id: number): Promise<any> {
    try {
      const bargeForm = await this.bargeFormRepository.findOne({
        where: { id },
      });

      if (!bargeForm) {
        throw new NotFoundException('Barge form not found');
      }

      await this.bargeFormRepository.softDelete(id);

      return successResponse(null, 'Barge form deleted successfully');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throwError('Failed to delete barge form', 500);
    }
  }
}
