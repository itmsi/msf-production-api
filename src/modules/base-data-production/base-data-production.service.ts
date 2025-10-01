import { Injectable, NotFoundException, BadRequestException, HttpException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, ILike, SelectQueryBuilder, DataSource } from 'typeorm';

import { ParentBaseDataPro, BaseDataPro, ActivityType } from './entities';
import { Population } from '../population/entities/population.entity';
import { Barge } from '../barge/entities/barge.entity';
import { OperationPoints } from '../operation-points/entities/operation-points.entity';
import { Users } from '../users/entities/users.entity';
import {
  CreateBaseDataProductionDto,
  UpdateBaseDataProductionDto,
  QueryBaseDataProductionDto,
  QueryExportBaseDataProductionDto,
} from './dto';
import { successResponse, emptyDataResponse, throwError } from '../../common/helpers/response.helper';
import { CsvHelper, paginateResponse, setCsvExportHeaders } from '../../common/helpers/public.helper';
import { S3Service } from 'src/integrations/s3/s3.service';
import { Response } from 'express';
import { format } from '@fast-csv/format';
import moment from 'moment';

@Injectable()
export class BaseDataProductionService {
  constructor(
    @InjectRepository(ParentBaseDataPro)
    private parentBaseDataProRepository: Repository<ParentBaseDataPro>,
    @InjectRepository(BaseDataPro)
    private baseDataProRepository: Repository<BaseDataPro>,
    @InjectRepository(Population)
    private populationRepository: Repository<Population>,
    @InjectRepository(Barge)
    private bargeRepository: Repository<Barge>,
    @InjectRepository(OperationPoints)
    private operationPointsRepository: Repository<OperationPoints>,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    private s3Service: S3Service,
    private dataSource: DataSource,
  ) {}

  async create(createDto: CreateBaseDataProductionDto, userId: number) {
    try {
      // Validate foreign key constraints
      await this.validateForeignKeys(createDto);

      // Validate KM values based on type
      this.validateKmBasedOnType(createDto);
      let savedParent;
      const checkParent = await this.parentBaseDataProRepository.findOne({
        where: {
          populationId: createDto.population_id,
          activityDate: new Date(createDto.activityDate),
          shift: createDto.shift,
          driverId: createDto.driverId,
        },
      });

      if (!checkParent) {
        const parentBaseDataPro = this.parentBaseDataProRepository.create({
          populationId: createDto.population_id,
          activityDate: new Date(createDto.activityDate),
          shift: createDto.shift,
          driverId: createDto.driverId,
          startShift: createDto.startShift ? new Date(createDto.startShift) : null,
          endShift: createDto.endShift ? new Date(createDto.endShift) : null,
        });

        savedParent = await this.parentBaseDataProRepository.save(parentBaseDataPro);
      }

      // Create parent base data pro
      const parent = checkParent ?? savedParent;
      // Create base data pro details
      const baseDataProDetails = createDto.detail.map((detail) => {
        const isBarge = detail.activity && ['barging', 'direct'].includes(detail.activity?.toLowerCase());
        if (isBarge && detail.dumpingPointId) {
          detail.dumpingPointBargeId = detail.dumpingPointId;
        }

        if (detail.activity && !isBarge && detail.dumpingPointId) {
          detail.dumpingPointOpId = detail.dumpingPointId;
        }
        detail.dumpingPointId = null;

        return this.baseDataProRepository.create({
          parentBaseDataProId: parent.id,
          kmAwal: detail.kmAwal,
          kmAkhir: detail.kmAkhir,
          totalKm: detail.totalKm ?? (detail.kmAkhir && detail.kmAwal ? detail.kmAkhir - detail.kmAwal : 0),
          hmAwal: detail.hmAwal,
          hmAkhir: detail.hmAkhir,
          totalHm: detail.totalHm ?? detail.hmAkhir - detail.hmAwal,
          loadingPointId: detail.loadingPointId,
          dumpingPointId: detail.dumpingPointId,
          dumpingPointOpId: detail.dumpingPointOpId,
          dumpingPointBargeId: detail.dumpingPointBargeId,
          activity: detail.activity,
          mroundDistance: detail.distance, // Store distance as is, no need to floor
          distance: detail.distance,
          totalVessel: detail.totalVessel,
          material: detail.material,
          createdBy: userId,
          updatedBy: userId,
        });
      });

      await this.baseDataProRepository.save(baseDataProDetails);

      // Get created data for response
      const createdData = await this.parentBaseDataProRepository.findOne({
        where: { id: parent.id },
        relations: ['baseDataPro'],
      });

      if (!createdData) {
        throw new NotFoundException('Base data production not found after creation');
      }

      // Transform data to response format
      const transformedData = {
        id: createdData.id,
        population_id: createdData.populationId,
        type: createDto.type, // Use type from DTO, not from database
        activityDate: createdData.activityDate,
        shift: createdData.shift,
        driverId: createdData.driverId,
        startShift: createdData.startShift,
        endShift: createdData.endShift,
        baseDataPro:
          createdData.baseDataPro?.map((detail) => ({
            id: detail.id,
            parentBaseDataProId: detail.parentBaseDataProId,
            kmAwal: detail.kmAwal,
            kmAkhir: detail.kmAkhir,
            totalKm: detail.totalKm,
            hmAwal: detail.hmAwal,
            hmAkhir: detail.hmAkhir,
            totalHm: detail.totalHm,
            loadingPointId: detail.loadingPointId,
            dumpingPointId: detail.dumpingPointId,
            dumpingPointOpId: detail.dumpingPointOpId,
            dumpingPointBargeId: detail.dumpingPointBargeId,
            activity: detail.activity,
            mroundDistance: detail.mroundDistance,
            distance: detail.distance,
            totalVessel: detail.totalVessel,
            material: detail.material,
            createdBy: detail.createdBy,
            updatedBy: detail.updatedBy,
            deletedBy: detail.deletedBy,
            createdAt: detail.createdAt,
            updatedAt: detail.updatedAt,
            deletedAt: detail.deletedAt,
          })) || [],
      };

      return successResponse(transformedData, 'Base data production berhasil dibuat', 201);
    } catch (error) {
      // Re-throw specific exceptions
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      // Handle database constraint errors
      if (error.code === '23503') {
        // Foreign key violation
        throw new BadRequestException(
          'Data referensi tidak ditemukan. Pastikan Unit ID, Driver ID, Loading Point ID, dan Dumping Point ID valid.',
        );
      }

      // Handle other database errors
      if (error.code === '23505') {
        // Unique constraint violation
        throw new BadRequestException('Data duplikat ditemukan.');
      }

      // Handle date parsing errors
      if (error instanceof TypeError && error.message.includes('Invalid Date')) {
        throw new BadRequestException('Format tanggal tidak valid. Gunakan format ISO: YYYY-MM-DD atau YYYY-MM-DDTHH:mm:ss.sssZ');
      }

      // Log unexpected errors
      console.error('Unexpected error in create base data production:', error);
      throw new BadRequestException('Terjadi kesalahan internal. Silakan coba lagi atau hubungi administrator.');
    }
  }

  private async validateForeignKeysForUpdate(updateDto: UpdateBaseDataProductionDto): Promise<void> {
    // Validate Population ID if provided
    if (updateDto.population_id !== undefined) {
      const population = await this.populationRepository.findOne({
        where: { id: updateDto.population_id, deletedAt: IsNull() },
      });
      if (!population) {
        throw new BadRequestException(`Unit dengan ID ${updateDto.population_id} tidak ditemukan di tabel population`);
      }
    }

    // Validate Driver ID if provided
    if (updateDto.driverId !== undefined) {
      const driver = await this.usersRepository.findOne({
        where: { id: updateDto.driverId, deletedAt: IsNull() },
        relations: ['employees'],
      });
      if (!driver) {
        throw new BadRequestException(`Driver dengan ID ${updateDto.driverId} tidak ditemukan`);
      }
    }

    // Validate Loading Point IDs if detail is provided
    if (updateDto.detail && updateDto.detail.length > 0) {
      for (const detail of updateDto.detail) {
        // Validate Loading Point ID if provided
        if (detail.loadingPointId) {
          const loadingPoint = await this.operationPointsRepository.findOne({
            where: { id: detail.loadingPointId, deletedAt: IsNull() },
          });
          if (!loadingPoint) {
            throw new BadRequestException(`Loading Point dengan ID ${detail.loadingPointId} tidak ditemukan di tabel m_operation_points`);
          }
        }

        // Validate Dumping Point ID if provided
        if (detail.dumpingPointId) {
          if (detail?.activity && ['direct', 'hauling'].includes(detail?.activity?.toLowerCase())) {
            const dumpingPointBarge = await this.bargeRepository.findOne({
              where: { id: detail.dumpingPointBargeId, deletedAt: IsNull() },
            });
            if (!dumpingPointBarge) {
              throw new BadRequestException(`Dumping Point Barge dengan ID ${detail.dumpingPointBargeId} tidak ditemukan`);
            }
          } else {
            const dumpingPoint = await this.operationPointsRepository.findOne({
              where: { id: detail.dumpingPointId, deletedAt: IsNull() },
            });
            if (!dumpingPoint) {
              throw new BadRequestException(`Dumping Point dengan ID ${detail.dumpingPointId} tidak ditemukan di tabel m_operation_points`);
            }
          }
        }

        // Validate Dumping Point Operation ID if provided
        if (detail.dumpingPointOpId) {
          const dumpingPointOp = await this.operationPointsRepository.findOne({
            where: { id: detail.dumpingPointOpId, deletedAt: IsNull() },
          });
          if (!dumpingPointOp) {
            throw new BadRequestException(`Dumping Point Operation dengan ID ${detail.dumpingPointOpId} tidak ditemukan`);
          }
        }

        // Validate Dumping Point Barge ID if provided
        if (detail.dumpingPointBargeId) {
          const dumpingPointBarge = await this.bargeRepository.findOne({
            where: { id: detail.dumpingPointBargeId, deletedAt: IsNull() },
          });
          if (!dumpingPointBarge) {
            throw new BadRequestException(`Dumping Point Barge dengan ID ${detail.dumpingPointBargeId} tidak ditemukan`);
          }
        }
      }
    }
  }

  private async validateForeignKeys(createDto: CreateBaseDataProductionDto): Promise<void> {
    // Validate Population ID
    const population = await this.populationRepository.findOne({
      where: { id: createDto.population_id, deletedAt: IsNull() },
    });
    if (!population) {
      throw new BadRequestException(`Unit dengan ID ${createDto.population_id} tidak ditemukan di tabel population`);
    }

    // Validate Driver ID
    const driver = await this.usersRepository.findOne({
      where: { id: createDto.driverId, deletedAt: IsNull() },
      relations: ['employees'],
    });
    if (!driver) {
      throw new BadRequestException(`Driver dengan ID ${createDto.driverId} tidak ditemukan`);
    }

    // Validate Loading Point IDs
    for (const detail of createDto.detail) {
      // Validate Loading Point ID if provided
      if (detail.loadingPointId) {
        const loadingPoint = await this.operationPointsRepository.findOne({
          where: { id: detail.loadingPointId, deletedAt: IsNull() },
        });
        if (!loadingPoint) {
          throw new BadRequestException(`Loading Point dengan ID ${detail.loadingPointId} tidak ditemukan di tabel m_operation_points`);
        }
      }

      // Validate Dumping Point ID if provided
      if (detail.dumpingPointId) {
        if (detail?.activity && ['direct', 'barging'].includes(detail?.activity?.toLowerCase())) {
          const dumpingPointBarge = await this.bargeRepository.findOne({
            where: { id: detail.dumpingPointBargeId, deletedAt: IsNull() },
          });
          if (!dumpingPointBarge) {
            throw new BadRequestException(`Dumping Point Barge dengan ID ${detail.dumpingPointBargeId} tidak ditemukan`);
          }
        } else {
          const dumpingPoint = await this.operationPointsRepository.findOne({
            where: { id: detail.dumpingPointId, deletedAt: IsNull() },
          });
          if (!dumpingPoint) {
            throw new BadRequestException(`Dumping Point dengan ID ${detail.dumpingPointId} tidak ditemukan di tabel m_operation_points`);
          }
        }
      }

      // Validate Dumping Point Operation ID if provided
      if (detail.dumpingPointOpId) {
        const dumpingPointOp = await this.operationPointsRepository.findOne({
          where: { id: detail.dumpingPointOpId, deletedAt: IsNull() },
        });
        if (!dumpingPointOp) {
          throw new BadRequestException(`Dumping Point Operation dengan ID ${detail.dumpingPointOpId} tidak ditemukan`);
        }
      }

      // Validate Dumping Point Barge ID if provided
      if (detail.dumpingPointBargeId) {
        const dumpingPointBarge = await this.bargeRepository.findOne({
          where: { id: detail.dumpingPointBargeId, deletedAt: IsNull() },
        });
        if (!dumpingPointBarge) {
          throw new BadRequestException(`Dumping Point Barge dengan ID ${detail.dumpingPointBargeId} tidak ditemukan`);
        }
      }
    }
  }

  // private validateKmAndHmValues(createDto: CreateBaseDataProductionDto): void {
  //   // Validation disabled - allow 0 and equal values
  //   // for (const detail of createDto.detail) {
  //   //   // Validate KM values - allow 0 or equal values
  //   //   if (detail.kmAwal !== 0 && detail.kmAkhir !== 0 && detail.kmAkhir <= detail.kmAwal) {
  //   //     throw new BadRequestException(`Kilometer akhir (${detail.kmAkhir}) harus lebih besar dari kilometer awal (${detail.kmAwal})`);
  //   //   }

  //   //   // Validate HM values - allow 0 or equal values
  //   //   if (detail.hmAwal !== 0 && detail.hmAkhir !== 0 && detail.hmAkhir <= detail.hmAwal) {
  //   //     throw new BadRequestException(`Hour meter akhir (${detail.hmAkhir}) harus lebih besar dari hour meter awal (${detail.hmAwal})`);
  //   //   }
  //   // }
  // }

  private validateKmBasedOnType(createDto: CreateBaseDataProductionDto): void {
    // Validasi berdasarkan type
    if (createDto.type === 'DT') {
      // Untuk type DT, kmAwal dan kmAkhir wajib diisi
      for (const detail of createDto.detail) {
        if (detail.kmAwal === undefined || detail.kmAwal === null) {
          throw new BadRequestException('kmAwal wajib diisi untuk type DT');
        }
        if (detail.kmAkhir === undefined || detail.kmAkhir === null) {
          throw new BadRequestException('kmAkhir wajib diisi untuk type DT');
        }
      }
    }
    // Untuk type HE, kmAwal dan kmAkhir optional (nullable)
    // Tidak perlu validasi khusus
  }

  private async getPopulation(no_unit: string): Promise<number | undefined> {
    const unit = await this.populationRepository.findOne({
      where: { no_unit: no_unit },
    });

    return unit?.id;
  }

  private async getUser(name: string): Promise<number | undefined> {
    const user = await this.usersRepository.findOne({
      where: {
        name: ILike(`%${name?.trim()}%`),
      },
    });

    return user?.id;
  }

  private async getOperationPoint(point: string): Promise<number | undefined> {
    const operation = await this.operationPointsRepository.findOne({
      where: { name: ILike(`%${point?.trim()}%`), deletedAt: IsNull() },
    });
    return operation?.id;
  }

  private async getDumpingPoint(point: string, activity: string): Promise<number | undefined> {
    if (['barging', 'direct'].includes(activity?.toLowerCase())) {
      const barge = await this.bargeRepository.findOne({
        where: { name: ILike(`%${point?.trim()}%`), deletedAt: IsNull() },
      });
      return barge?.id;
    }
    const operationId = await this.getOperationPoint(point);
    return operationId;
  }

  private validateImportFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan');
    }
    if (!file.mimetype.includes('csv') && !file.originalname.endsWith('.csv')) {
      throw new BadRequestException('File harus berupa CSV');
    }
  }

  private async processImportData(csvData: any[]): Promise<{
    results: any[];
    failedRows: any[];
    successCount: number;
    failedCount: number;
    payload: CreateBaseDataProductionDto[];
  }> {
    const results: any[] = [];
    const failedRows: any[] = [];
    let successCount = 0;
    let failedCount = 0;
    const payload: CreateBaseDataProductionDto[] = [];

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

  private async validateRowData(row: any): Promise<{
    isValid: boolean;
    error?: string;
    detail?: any;
    populationId?: number;
    driverId?: number;
    payload?: any;
  }> {
    if (!row.activity) {
      return { isValid: false, error: 'actvity is required' };
    }
    const ACTIVITIES = ['hauling', 'direct', 'barging', 'support'];
    if (!ACTIVITIES.includes(row.activity?.toLowerCase())) {
      return { isValid: false, error: `actvity must be ${ACTIVITIES?.join(' ')}` };
    }

    const unitId = await this.getPopulation(row.population_id);
    const driverId = await this.getUser(row.driverId);
    const loadingId = await this.getOperationPoint(row.loadingPointId);
    const dumpingId = await this.getDumpingPoint(row.dumpingPointId, row.activity);
    if (!unitId) {
      const message = row.population_id ? `Unit ${row.population_id} tidak ditemukan` : 'Unit tidak ditemukan';
      return { isValid: false, error: message };
    }

    if (!driverId) {
      const message = row.driverId ? `Driver ${row.driverId} tidak ditemukan` : 'Driver tidak ditemukan';
      return { isValid: false, error: message };
    }

    if (!loadingId) {
      const message = row.loadingPointId ? `Loading Point ${row.loadingPointId} tidak ditemukan` : 'Loading Point tidak ditemukan';
      return { isValid: false, error: message };
    }

    if (!dumpingId) {
      const message = row.dumpingPointId ? `Dumping Point ${row.dumpingPointId} tidak ditemukan` : 'Dumping Point tidak ditemukan';
      return { isValid: false, error: message };
    }

    const detail = {
      hmAwal: Number(row.hmAwal),
      hmAkhir: Number(row.hmAkhir),
      kmAwal: Number(row.kmAwal),
      kmAkhir: Number(row.kmAkhir),
      totalVessel: Number(row.totalVessel),
      distance: Number(row.distance),
      loadingPointId: loadingId,
      dumpingPointId: dumpingId,
      activity: row.activity,
      material: row.material,
    };

    const payload = {
      activityDate: row.activityDate,
      population_id: unitId, // Use resolved ID
      driverId: driverId, // Use resolved ID
      shift: row?.shift?.toLowerCase(),
      startShift: moment(row.startShift, 'YYYY-MM-DD HH:mm', true).toDate(),
      endShift: moment(row.endShift, 'YYYY-MM-DD HH:mm', true).toDate(),
      type: row.type,
      detail: [detail],
    };
    return {
      isValid: true,
      detail,
      populationId: unitId,
      driverId: driverId,
      payload,
    };
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
      const filename = `import-base-data-pro-errors-${Date.now()}.csv`;

      const result = await this.s3Service.uploadErrorFile(filename, csvBuffer, 'base_data_production_import_error');

      return {
        error_file: result
          ? {
              download_url: result.downloadUrl,
              file_name: filename,
            }
          : null,
      };
    } catch (error) {
      console.error('Error generating CSV file:', error);
      return {
        error_file: null,
      };
    }
  }

  private createErrorCsvContent(failedRows: any[]): string {
    const csvHeaders = [
      'rowNumber',
      'population_id',
      'driverId',
      'activityDate',
      'shift',
      'startShift',
      'endShift',
      'type',
      'hmAwal',
      'hmAkhir',
      'kmAwal',
      'kmAkhir',
      'totalVessel',
      'distance',
      'loadingPointId',
      'dumpingPointId',
      'activity',
      'material',
      'error_message',
    ];

    const csvRows = failedRows.map((row) => [
      row.rowNumber,
      row.population_id || '',
      row.driverId || '',
      row.activityDate || '',
      row.shift || '',
      row.startShift || '',
      row.endShift || '',
      row.type || '',
      row.hmAwal || '',
      row.hmAkhir || '',
      row.kmAwal || '',
      row.kmAkhir || '',
      row.totalVessel || '',
      row.distance || '',
      row.loadingPointId || '',
      row.dumpingPointId || '',
      row.activity || '',
      row.material || '',
      row.error || 'Foreign key tidak ditemukan',
    ]);

    return [csvHeaders.join(','), ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');
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

  /** PUBLIC */
  async update(id: number, updateDto: UpdateBaseDataProductionDto, userId: number) {
    const parentBaseDataPro = await this.parentBaseDataProRepository.findOne({
      where: { id },
      relations: ['baseDataPro'],
    });

    if (!parentBaseDataPro) {
      throw new NotFoundException(`Base data production with ID ${id} not found`);
    }

    // Validate foreign key constraints if provided
    if (updateDto.population_id || updateDto.driverId || updateDto.detail) {
      await this.validateForeignKeysForUpdate(updateDto);
    }

    // Validate KM values based on type if detail is provided
    if (updateDto.detail && updateDto.detail.length > 0 && updateDto.type) {
      this.validateKmBasedOnType(updateDto as CreateBaseDataProductionDto);
    }

    // Update parent base data pro
    if (updateDto.population_id !== undefined) parentBaseDataPro.populationId = updateDto.population_id;
    if (updateDto.activityDate !== undefined) parentBaseDataPro.activityDate = new Date(updateDto.activityDate);
    if (updateDto.shift !== undefined) parentBaseDataPro.shift = updateDto.shift;
    if (updateDto.driverId !== undefined) parentBaseDataPro.driverId = updateDto.driverId;
    if (updateDto.startShift !== undefined) parentBaseDataPro.startShift = updateDto.startShift ? new Date(updateDto.startShift) : null;
    if (updateDto.endShift !== undefined) parentBaseDataPro.endShift = updateDto.endShift ? new Date(updateDto.endShift) : null;

    await this.parentBaseDataProRepository.save(parentBaseDataPro);

    // Update base data pro details if provided
    if (updateDto.detail && updateDto.detail.length > 0) {
      // Get existing details
      const existingDetails = await this.baseDataProRepository.find({
        where: { parentBaseDataProId: id },
      });

      // Update existing details or create new ones
      for (let i = 0; i < updateDto.detail.length; i++) {
        const detailDto = updateDto.detail[i];
        const isBarge = detailDto.activity && ['barging', 'direct'].includes(detailDto.activity?.toLowerCase());
        if (isBarge && detailDto.dumpingPointId) {
          detailDto.dumpingPointBargeId = detailDto.dumpingPointId;
        }

        if (detailDto.activity && !isBarge && detailDto.dumpingPointId) {
          detailDto.dumpingPointOpId = detailDto.dumpingPointId;
        }
        detailDto.dumpingPointId = null;
        if (i < existingDetails.length) {
          // Update existing detail
          const existingDetail = existingDetails[i];
          existingDetail.kmAwal = detailDto.kmAwal ?? existingDetail.kmAwal;
          existingDetail.kmAkhir = detailDto.kmAkhir ?? existingDetail.kmAkhir;
          existingDetail.totalKm =
            detailDto.totalKm ?? (detailDto.kmAkhir && detailDto.kmAwal ? detailDto.kmAkhir - detailDto.kmAwal : existingDetail.totalKm);
          existingDetail.hmAwal = detailDto.hmAwal;
          existingDetail.hmAkhir = detailDto.hmAkhir;
          existingDetail.totalHm = detailDto.totalHm ?? detailDto.hmAkhir - detailDto.hmAwal;
          existingDetail.loadingPointId = detailDto.loadingPointId || null;
          existingDetail.dumpingPointId = detailDto.dumpingPointId || null;
          existingDetail.dumpingPointOpId = detailDto.dumpingPointOpId || null;
          existingDetail.dumpingPointBargeId = detailDto.dumpingPointBargeId || null;
          existingDetail.activity = detailDto.activity || null;
          existingDetail.mroundDistance = detailDto.distance; // Store distance as is, no need to floor
          existingDetail.distance = detailDto.distance;
          existingDetail.totalVessel = detailDto.totalVessel;
          existingDetail.material = detailDto.material || null;
          existingDetail.updatedBy = userId;

          await this.baseDataProRepository.save(existingDetail);
        } else {
          // Create new detail if more details provided than existing
          const newDetail = this.baseDataProRepository.create({
            parentBaseDataProId: id,
            kmAwal: detailDto.kmAwal,
            kmAkhir: detailDto.kmAkhir,
            totalKm: detailDto.totalKm ?? (detailDto.kmAkhir && detailDto.kmAwal ? detailDto.kmAkhir - detailDto.kmAwal : 0),
            hmAwal: detailDto.hmAwal,
            hmAkhir: detailDto.hmAkhir,
            totalHm: detailDto.totalHm ?? detailDto.hmAkhir - detailDto.hmAwal,
            loadingPointId: detailDto.loadingPointId || null,
            dumpingPointId: detailDto.dumpingPointId || null,
            dumpingPointOpId: detailDto.dumpingPointOpId || null,
            dumpingPointBargeId: detailDto.dumpingPointBargeId || null,
            activity: detailDto.activity || null,
            mroundDistance: detailDto.distance, // Store distance as is, no need to floor
            distance: detailDto.distance,
            totalVessel: detailDto.totalVessel,
            material: detailDto.material || null,
            createdBy: userId,
            updatedBy: userId,
          });

          await this.baseDataProRepository.save(newDetail);
        }
      }

      // Delete excess existing details if fewer details provided
      if (existingDetails.length > updateDto.detail.length) {
        const detailsToDelete = existingDetails.slice(updateDto.detail.length);
        for (const detail of detailsToDelete) {
          await this.baseDataProRepository.remove(detail);
        }
      }
    }

    // Get updated data for response
    const updatedData = await this.parentBaseDataProRepository.findOne({
      where: { id },
      relations: ['baseDataPro'],
    });

    if (!updatedData) {
      throw new NotFoundException('Base data production not found after update');
    }

    // Transform data to response format
    const transformedData = {
      id: updatedData.id,
      population_id: updatedData.populationId,
      type: updateDto.type || 'DT', // Use type from DTO or default
      activityDate: updatedData.activityDate,
      shift: updatedData.shift,
      driverId: updatedData.driverId,
      startShift: updatedData.startShift,
      endShift: updatedData.endShift,
      baseDataPro:
        updatedData.baseDataPro?.map((detail) => ({
          id: detail.id,
          parentBaseDataProId: detail.parentBaseDataProId,
          kmAwal: detail.kmAwal,
          kmAkhir: detail.kmAkhir,
          totalKm: detail.totalKm,
          hmAwal: detail.hmAwal,
          hmAkhir: detail.hmAkhir,
          totalHm: detail.totalHm,
          loadingPointId: detail.loadingPointId,
          dumpingPointId: detail.dumpingPointId,
          dumpingPointOpId: detail.dumpingPointOpId,
          dumpingPointBargeId: detail.dumpingPointBargeId,
          activity: detail.activity,
          mroundDistance: detail.mroundDistance,
          distance: detail.distance,
          totalVessel: detail.totalVessel,
          material: detail.material,
          createdBy: detail.createdBy,
          updatedBy: detail.updatedBy,
          deletedBy: detail.deletedBy,
          createdAt: detail.createdAt,
          updatedAt: detail.updatedAt,
          deletedAt: detail.deletedAt,
        })) || [],
    };

    return successResponse(transformedData, 'Base data production berhasil diupdate');
  }

  async findAll(queryDto: QueryBaseDataProductionDto): Promise<any> {
    try {
      const page = Number(queryDto.page);
      const limit = Number(queryDto.limit);
      const skip = (page - 1) * limit;

      const qb = this.findAllQueryBuilder();

      if (queryDto.startDate && queryDto.endDate) {
        qb.andWhere('r2.activity_date BETWEEN :start AND :end', {
          start: queryDto.startDate,
          end: queryDto.endDate,
        });
      }

      if (queryDto.search) {
        qb.andWhere('m.no_unit ILIKE :unit', { unit: `%${queryDto.search}%` });
      }

      const total = await qb.getCount();
      const rawResult = await qb.offset(skip).limit(limit).getRawMany();
      if (rawResult.length == 0) {
        emptyDataResponse('Batch Inbound not found');
      }
      const result = rawResult.map((item) => ({
        ...item,
        dumping_point: item.dumping_point || item.dumping_point_op || item.dumping_point_barge,
        km_awal: item.km_awal ? parseFloat(Number(item.km_awal).toFixed(2)) : 0,
        km_akhir: item.km_akhir ? parseFloat(Number(item.km_akhir).toFixed(2)) : 0,
        hm_awal: item.hm_awal ? parseFloat(Number(item.hm_awal).toFixed(2)) : 0,
        hm_akhir: item.hm_akhir ? parseFloat(Number(item.hm_akhir).toFixed(2)) : 0,
        total_km: item.total_km ? parseFloat(Number(item.total_km).toFixed(2)) : 0,
        total_hm: item.total_hm ? parseFloat(Number(item.total_hm).toFixed(2)) : 0,
        total_vessel: item.total_vessel ? Number(item.total_vessel) : 0,
        mround_distance: item.mround_distance ? Number(item.mround_distance) : 0,
        distance: item.distance ? Number(item.distance) : 0,
      }));

      return paginateResponse(result, total, page, limit, 'retrieve data success', 200);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      return throwError('Failed to fetch Relocation Inbound', 500);
    }
  }

  async findOne(id: number) {
    try {
      const baseData = await this.baseDataProRepository.findOne({
        where: { id },
        relations: [
          'parentBaseDataPro',
          'loadingPoint',
          'dumpingPoint',
          'dumpingPointOp',
          'dumpingPointBarge',
          'parentBaseDataPro.population',
          'parentBaseDataPro.population.unitType', // kalau mau ambil unit_type
        ],
      });

      if (!baseData) {
        throwError('Base data production not found', 404);
      }
      const result = {
        id: baseData?.parentBaseDataPro.id,
        population_id: baseData?.parentBaseDataPro.population.id,
        type: baseData?.parentBaseDataPro.population.unitType.unit_name,
        activityDate: baseData?.parentBaseDataPro.activityDate,
        shift: baseData?.parentBaseDataPro.shift,
        driverId: baseData?.parentBaseDataPro.driverId,
        startShift: baseData?.parentBaseDataPro.startShift,
        endShift: baseData?.parentBaseDataPro.endShift,
        baseDataPro: [
          {
            id: baseData?.id,
            parentBaseDataProId: baseData?.parentBaseDataProId,
            kmAwal: Number(baseData?.kmAwal),
            kmAkhir: Number(baseData?.kmAkhir),
            totalKm: Number(baseData?.totalKm),
            hmAwal: Number(baseData?.hmAwal),
            hmAkhir: Number(baseData?.hmAkhir),
            totalHm: Number(baseData?.totalHm),
            loadingPointId: baseData?.loadingPointId,
            loadingPointName: baseData?.loadingPoint?.name || '',
            dumpingPointId: baseData?.dumpingPointId || baseData?.dumpingPointOpId || baseData?.dumpingPointBargeId,
            dumpingPointName: baseData?.dumpingPoint?.name || baseData?.dumpingPointOp?.name || baseData?.dumpingPointBarge?.name || '',
            dumpingPointOpId: baseData?.dumpingPointOpId,
            dumpingPointBargeId: baseData?.dumpingPointBargeId,
            activity: baseData?.activity,
            mroundDistance: Number(baseData?.mroundDistance),
            distance: Number(baseData?.distance),
            totalVessel: Number(baseData?.totalVessel),
            material: baseData?.material,
          },
        ],
      };

      return successResponse(result, 'Base data production retrieved successfully', 200);
    } catch (error) {
      throwError('Failed to retrieve base data production', 500);
    }
  }

  async remove(id: number) {
    const baseDataPro = await this.baseDataProRepository.findOne({
      where: { id },
    });

    if (!baseDataPro) {
      throw new NotFoundException(`Base data production with ID ${id} not found`);
    }

    await this.baseDataProRepository.delete({ id });

    const baseDataProCHK = await this.baseDataProRepository.count({
      where: { parentBaseDataProId: baseDataPro.parentBaseDataProId },
    });

    await this.parentBaseDataProRepository.delete({
      id: baseDataPro.parentBaseDataProId,
    });

    return successResponse(null, 'Base data production berhasil dihapus');
  }

  async bulkCreate(payload: CreateBaseDataProductionDto[], userId: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const createDto of payload) {
        // Cek parent
        let parent = await queryRunner.manager.findOne(ParentBaseDataPro, {
          where: {
            populationId: createDto.population_id,
            activityDate: new Date(createDto.activityDate),
            shift: createDto.shift,
            driverId: createDto.driverId,
          },
        });

        // Kalau belum ada parent, buat baru
        if (!parent) {
          const newParent = queryRunner.manager.create(ParentBaseDataPro, {
            populationId: createDto.population_id,
            activityDate: new Date(createDto.activityDate),
            shift: createDto.shift,
            driverId: createDto.driverId,
            startShift: createDto.startShift ? new Date(createDto.startShift) : null,
            endShift: createDto.endShift ? new Date(createDto.endShift) : null,
            createdBy: userId,
            updatedBy: userId,
          });

          parent = await queryRunner.manager.save(newParent);
        }

        // Buat detail
        const baseDataProDetails = createDto.detail.map((detail) => {
          const isBarge = detail.activity && ['barging', 'direct'].includes(detail.activity?.toLowerCase());
          if (isBarge && detail.dumpingPointId) {
            detail.dumpingPointBargeId = detail.dumpingPointId;
          }

          if (detail.activity && !isBarge && detail.dumpingPointId) {
            detail.dumpingPointOpId = detail.dumpingPointId;
          }
          detail.dumpingPointId = null;

          return queryRunner.manager.create(BaseDataPro, {
            parentBaseDataProId: parent.id,
            kmAwal: detail.kmAwal,
            kmAkhir: detail.kmAkhir,
            totalKm: detail.totalKm ?? (detail.kmAkhir && detail.kmAwal ? detail.kmAkhir - detail.kmAwal : 0),
            hmAwal: detail.hmAwal,
            hmAkhir: detail.hmAkhir,
            totalHm: detail.totalHm ?? (detail.hmAkhir && detail.hmAwal ? detail.hmAkhir - detail.hmAwal : 0),
            loadingPointId: detail.loadingPointId,
            dumpingPointId: detail.dumpingPointId,
            dumpingPointOpId: detail.dumpingPointOpId,
            dumpingPointBargeId: detail.dumpingPointBargeId,
            activity: detail.activity,
            mroundDistance: detail.distance,
            distance: detail.distance,
            totalVessel: detail.totalVessel,
            material: detail.material,
            createdBy: userId,
            updatedBy: userId,
          });
        });

        await queryRunner.manager.save(BaseDataPro, baseDataProDetails);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Failed to import base data production: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async importData(file: Express.Multer.File, userId: number) {
    try {
      this.validateImportFile(file);
      const csvData = await CsvHelper.parseCsvFile(file.buffer);
      const validationResult = await this.processImportData(csvData);

      if (validationResult.payload?.length > 0 && validationResult.successCount > 0) {
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

      throwError('Terjadi kesalahan saat memproses file import. Silakan coba lagi atau hubungi administrator.', 400);
    }
  }

  private findAllQueryBuilder(): SelectQueryBuilder<BaseDataPro> {
    const qb = this.baseDataProRepository
      .createQueryBuilder('r')
      .select([
        'r.id AS id',
        'r2.activity_date AS date',
        'r2.shift AS shift',
        'u.username AS driver',
        'r.activity AS activity',
        'm.no_unit AS unit',
        'r2.start_shift',
        'r2.end_shift',
        'r.km_awal',
        'r.km_akhir',
        'r.hm_awal',
        'r.hm_akhir',
        'r.total_km',
        'r.total_hm',
        'r.total_vessel',
        'm2.name AS loading_point',
        'm3.name AS dumping_point',
        'm4.name AS dumping_point_op',
        'm5.name AS dumping_point_barge',
        'r.mround_distance',
        'r.distance AS distance',
        'r.material AS material',
      ])
      .leftJoin('r_parent_base_data_pro', 'r2', 'r2.id = r.parent_base_data_pro_id')
      // .leftJoin('m_user', 'u', 'u.id = r2.driver_id')
      .leftJoin('users', 'u', 'u.id = r2.driver_id')
      .leftJoin('m_population', 'm', 'm.id = r2.population_id')
      .leftJoin('m_operation_points', 'm2', `m2.id = r.loading_point_id AND m2.type = 'loading'`)
      .leftJoin('m_operation_points', 'm3', `m3.id = r.dumping_point_id AND m3.type = 'dumping'`)
      .leftJoin('m_operation_points', 'm4', `m4.id = r.dumping_point_op_id AND m4.type = 'dumping'`)
      .leftJoin('m_barge', 'm5', 'm5.id = r.dumping_point_barge_id');
    return qb;
  }

  private applyFilterExportData(
    qb: SelectQueryBuilder<BaseDataPro>,
    query: QueryExportBaseDataProductionDto,
  ): SelectQueryBuilder<BaseDataPro> {
    const { search, startDate, endDate } = query;

    if (startDate && endDate) {
      qb.andWhere('r2.activity_date BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      });
    } else {
      qb.orderBy('r.updatedAt', 'DESC').limit(10);
    }

    if (search) {
      qb.andWhere('m.no_unit ILIKE :unit', { unit: `%${search}%` });
    }

    return qb;
  }

  private mapExportDataToCsvRow(item: any, index: number) {
    const formatDate = (date: any, formatStr: string) => {
      return date && moment(date).isValid() ? moment(date).format(formatStr) : '-';
    };
    return {
      No: index + 1,
      Date: formatDate(item.date, 'DD/MM/YYYY'),
      Shift: item?.shift?.toUpperCase() || '-',
      Driver: item?.driver || '-',
      Activity: item?.activity || '-',
      Unit: item?.unit || '-',
      'Shift Start': formatDate(item?.start_shift, 'HH:mm'),
      'Shift End': formatDate(item?.end_shift, 'HH:mm'),
      'KM Start': item.km_awal ? parseFloat(Number(item.km_awal).toFixed(2)) : 0,
      'KM End': item.km_akhir ? parseFloat(Number(item.km_akhir).toFixed(2)) : 0,
      'KM Total': item.total_km ? parseFloat(Number(item.total_km).toFixed(2)) : 0,
      'HM Start': item.hm_awal ? parseFloat(Number(item.hm_awal).toFixed(2)) : 0,
      'HM End': item.hm_akhir ? parseFloat(Number(item.hm_akhir).toFixed(2)) : 0,
      'HM Total': item.total_hm ? parseFloat(Number(item.total_hm).toFixed(2)) : 0,
      'Loading Point': item?.loading_point || '-',
      'Dumping Point': item?.dumping_point || item?.dumping_point_op || item?.dumping_point_barge || '-',
      'M Round Distance (m)': item.mround_distance ? Number(item.mround_distance) : 0,
      'Distance (m)': item.distance ? Number(item.distance) : 0,
      Vessel: item.total_vessel ? Number(item.total_vessel) : 0,
      Material: item?.material || '-',
    };
  }

  async exportData(query: QueryExportBaseDataProductionDto, res: Response) {
    try {
      const qb = this.findAllQueryBuilder();
      // Apply filters & sorting
      this.applyFilterExportData(qb, query);

      const data = await qb.getRawMany();
      if (!data.length) {
        res.status(200).json(successResponse([], 'Data Not Found'));
        return;
      }
      // Set headers CSV
      setCsvExportHeaders(res, `production_export_${Date.now()}.csv`);

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
}
