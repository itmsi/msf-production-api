import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In, IsNull, DataSource } from 'typeorm';
import { ParentBaseDataPro, BaseDataPro } from './entities';
import { Population } from '../population/entities/population.entity';
import { Employee } from '../employee/entities/employee.entity';
import { Sites } from '../sites/entities/sites.entity';
import { Barge } from '../barge/entities/barge.entity';
import { OperationPoints } from '../operation-points/entities/operation-points.entity';
import { Users } from '../users/entities/users.entity';
import {
  CreateBaseDataProductionDto,
  UpdateBaseDataProductionDto,
  QueryBaseDataProductionDto,
  PaginatedBaseDataProductionResponseDto,
} from './dto';
import {
  successResponse,
  emptyDataResponse,
  throwError,
} from '../../common/helpers/response.helper';
import { paginateResponse } from '../../common/helpers/public.helper';
import { use } from 'passport';

@Injectable()
export class BaseDataProductionService {
  constructor(
    @InjectRepository(ParentBaseDataPro)
    private parentBaseDataProRepository: Repository<ParentBaseDataPro>,
    @InjectRepository(BaseDataPro)
    private baseDataProRepository: Repository<BaseDataPro>,
    @InjectRepository(Population)
    private populationRepository: Repository<Population>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Sites)
    private sitesRepository: Repository<Sites>,
    @InjectRepository(Barge)
    private bargeRepository: Repository<Barge>,
    @InjectRepository(OperationPoints)
    private operationPointsRepository: Repository<OperationPoints>,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}

  async create(createDto: CreateBaseDataProductionDto, userId: number) {
    try {
      // Validate foreign key constraints
      await this.validateForeignKeys(createDto);

      // Validate KM values based on type
      this.validateKmBasedOnType(createDto);

      const checkParent = await this.parentBaseDataProRepository.findOne({
        where: {
          populationId: createDto.population_id,
          activityDate: new Date(createDto.activityDate),
          shift: createDto.shift,
          driverId: createDto.driverId,
        },
      });

      if (checkParent) {
        const updated = await this.update(checkParent.id, createDto, userId);
        return successResponse(
          updated,
          'Base data production berhasil dibuat dan update parentnya',
          201,
        );
      }

      // Create parent base data pro
      const parentBaseDataPro = this.parentBaseDataProRepository.create({
        populationId: createDto.population_id,
        activityDate: new Date(createDto.activityDate),
        shift: createDto.shift,
        driverId: createDto.driverId,
        startShift: createDto.startShift
          ? new Date(createDto.startShift)
          : null,
        endShift: createDto.endShift ? new Date(createDto.endShift) : null,
      });

      const savedParent = (await this.parentBaseDataProRepository.save(
        parentBaseDataPro,
      )) as ParentBaseDataPro;

      // Create base data pro details
      const baseDataProDetails = createDto.detail.map((detail) =>
        this.baseDataProRepository.create({
          parentBaseDataProId: savedParent.id,
          kmAwal: detail.kmAwal,
          kmAkhir: detail.kmAkhir,
          totalKm:
            detail.totalKm ??
            (detail.kmAkhir && detail.kmAwal
              ? detail.kmAkhir - detail.kmAwal
              : 0),
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
        }),
      );

      await this.baseDataProRepository.save(baseDataProDetails);

      // Get created data for response
      const createdData = await this.parentBaseDataProRepository.findOne({
        where: { id: savedParent.id },
        relations: ['baseDataPro'],
      });

      if (!createdData) {
        throw new NotFoundException(
          'Base data production not found after creation',
        );
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

      return successResponse(
        transformedData,
        'Base data production berhasil dibuat',
        201,
      );
    } catch (error) {
      // Re-throw specific exceptions
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
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
      if (
        error instanceof TypeError &&
        error.message.includes('Invalid Date')
      ) {
        throw new BadRequestException(
          'Format tanggal tidak valid. Gunakan format ISO: YYYY-MM-DD atau YYYY-MM-DDTHH:mm:ss.sssZ',
        );
      }

      // Log unexpected errors
      console.error('Unexpected error in create base data production:', error);
      throw new BadRequestException(
        'Terjadi kesalahan internal. Silakan coba lagi atau hubungi administrator.',
      );
    }
  }

  private async validateForeignKeysForUpdate(
    updateDto: UpdateBaseDataProductionDto,
  ): Promise<void> {
    // Validate Population ID if provided
    if (updateDto.population_id !== undefined) {
      const population = await this.populationRepository.findOne({
        where: { id: updateDto.population_id, deletedAt: IsNull() },
      });
      if (!population) {
        throw new BadRequestException(
          `Unit dengan ID ${updateDto.population_id} tidak ditemukan di tabel population`,
        );
      }
    }

    // Validate Driver ID if provided
    if (updateDto.driverId !== undefined) {
      const driver = await this.usersRepository.findOne({
        where: { id: updateDto.driverId, deletedAt: IsNull() },
        relations: ['employees'],
      });
      if (!driver) {
        throw new BadRequestException(
          `Driver dengan ID ${updateDto.driverId} tidak ditemukan`,
        );
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
            throw new BadRequestException(
              `Loading Point dengan ID ${detail.loadingPointId} tidak ditemukan di tabel m_operation_points`,
            );
          }
        }

        // Validate Dumping Point ID if provided
        if (detail.dumpingPointId) {
          const dumpingPoint = await this.operationPointsRepository.findOne({
            where: { id: detail.dumpingPointId, deletedAt: IsNull() },
          });
          if (!dumpingPoint) {
            throw new BadRequestException(
              `Dumping Point dengan ID ${detail.dumpingPointId} tidak ditemukan di tabel m_operation_points`,
            );
          }
        }

        // Validate Dumping Point Operation ID if provided
        if (detail.dumpingPointOpId) {
          const dumpingPointOp = await this.operationPointsRepository.findOne({
            where: { id: detail.dumpingPointOpId, deletedAt: IsNull() },
          });
          if (!dumpingPointOp) {
            throw new BadRequestException(
              `Dumping Point Operation dengan ID ${detail.dumpingPointOpId} tidak ditemukan`,
            );
          }
        }

        // Validate Dumping Point Barge ID if provided
        if (detail.dumpingPointBargeId) {
          const dumpingPointBarge = await this.bargeRepository.findOne({
            where: { id: detail.dumpingPointBargeId, deletedAt: IsNull() },
          });
          if (!dumpingPointBarge) {
            throw new BadRequestException(
              `Dumping Point Barge dengan ID ${detail.dumpingPointBargeId} tidak ditemukan`,
            );
          }
        }
      }
    }
  }

  private async validateForeignKeys(
    createDto: CreateBaseDataProductionDto,
  ): Promise<void> {
    // Validate Population ID
    const population = await this.populationRepository.findOne({
      where: { id: createDto.population_id, deletedAt: IsNull() },
    });
    if (!population) {
      throw new BadRequestException(
        `Unit dengan ID ${createDto.population_id} tidak ditemukan di tabel population`,
      );
    }

    // Validate Driver ID
    const driver = await this.usersRepository.findOne({
      where: { id: createDto.driverId, deletedAt: IsNull() },
      relations: ['employees'],
    });
    if (!driver) {
      throw new BadRequestException(
        `Driver dengan ID ${createDto.driverId} tidak ditemukan`,
      );
    }

    // Validate Loading Point IDs
    for (const detail of createDto.detail) {
      // Validate Loading Point ID if provided
      if (detail.loadingPointId) {
        const loadingPoint = await this.operationPointsRepository.findOne({
          where: { id: detail.loadingPointId, deletedAt: IsNull() },
        });
        if (!loadingPoint) {
          throw new BadRequestException(
            `Loading Point dengan ID ${detail.loadingPointId} tidak ditemukan di tabel m_operation_points`,
          );
        }
      }

      // Validate Dumping Point ID if provided
      if (detail.dumpingPointId) {
        const dumpingPoint = await this.operationPointsRepository.findOne({
          where: { id: detail.dumpingPointId, deletedAt: IsNull() },
        });
        if (!dumpingPoint) {
          throw new BadRequestException(
            `Dumping Point dengan ID ${detail.dumpingPointId} tidak ditemukan di tabel m_operation_points`,
          );
        }
      }

      // Validate Dumping Point Operation ID if provided
      if (detail.dumpingPointOpId) {
        const dumpingPointOp = await this.operationPointsRepository.findOne({
          where: { id: detail.dumpingPointOpId, deletedAt: IsNull() },
        });
        if (!dumpingPointOp) {
          throw new BadRequestException(
            `Dumping Point Operation dengan ID ${detail.dumpingPointOpId} tidak ditemukan`,
          );
        }
      }

      // Validate Dumping Point Barge ID if provided
      if (detail.dumpingPointBargeId) {
        const dumpingPointBarge = await this.bargeRepository.findOne({
          where: { id: detail.dumpingPointBargeId, deletedAt: IsNull() },
        });
        if (!dumpingPointBarge) {
          throw new BadRequestException(
            `Dumping Point Barge dengan ID ${detail.dumpingPointBargeId} tidak ditemukan`,
          );
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

  async update(
    id: number,
    updateDto: UpdateBaseDataProductionDto,
    userId: number,
  ) {
    const parentBaseDataPro = await this.parentBaseDataProRepository.findOne({
      where: { id },
      relations: ['baseDataPro'],
    });

    if (!parentBaseDataPro) {
      throw new NotFoundException(
        `Base data production with ID ${id} not found`,
      );
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
    if (updateDto.population_id !== undefined)
      parentBaseDataPro.populationId = updateDto.population_id;
    if (updateDto.activityDate !== undefined)
      parentBaseDataPro.activityDate = new Date(updateDto.activityDate);
    if (updateDto.shift !== undefined)
      parentBaseDataPro.shift = updateDto.shift;
    if (updateDto.driverId !== undefined)
      parentBaseDataPro.driverId = updateDto.driverId;
    if (updateDto.startShift !== undefined)
      parentBaseDataPro.startShift = updateDto.startShift
        ? new Date(updateDto.startShift)
        : null;
    if (updateDto.endShift !== undefined)
      parentBaseDataPro.endShift = updateDto.endShift
        ? new Date(updateDto.endShift)
        : null;

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

        if (i < existingDetails.length) {
          // Update existing detail
          const existingDetail = existingDetails[i];
          existingDetail.kmAwal = detailDto.kmAwal ?? existingDetail.kmAwal;
          existingDetail.kmAkhir = detailDto.kmAkhir ?? existingDetail.kmAkhir;
          existingDetail.totalKm =
            detailDto.totalKm ??
            (detailDto.kmAkhir && detailDto.kmAwal
              ? detailDto.kmAkhir - detailDto.kmAwal
              : existingDetail.totalKm);
          existingDetail.hmAwal = detailDto.hmAwal;
          existingDetail.hmAkhir = detailDto.hmAkhir;
          existingDetail.totalHm =
            detailDto.totalHm ?? detailDto.hmAkhir - detailDto.hmAwal;
          existingDetail.loadingPointId = detailDto.loadingPointId || null;
          existingDetail.dumpingPointId = detailDto.dumpingPointId || null;
          existingDetail.dumpingPointOpId = detailDto.dumpingPointOpId || null;
          existingDetail.dumpingPointBargeId =
            detailDto.dumpingPointBargeId || null;
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
            totalKm:
              detailDto.totalKm ??
              (detailDto.kmAkhir && detailDto.kmAwal
                ? detailDto.kmAkhir - detailDto.kmAwal
                : 0),
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
      throw new NotFoundException(
        'Base data production not found after update',
      );
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

    return successResponse(
      transformedData,
      'Base data production berhasil diupdate',
    );
  }

  async findAll(queryDto: QueryBaseDataProductionDto): Promise<any> {
    try {
      const page = Number(queryDto.page);
      const limit = Number(queryDto.limit);
      const skip = (page - 1) * limit;

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
        .leftJoin(
          'r_parent_base_data_pro',
          'r2',
          'r2.id = r.parent_base_data_pro_id',
        )
        .leftJoin('m_user', 'u', 'u.id = r2.driver_id')
        .leftJoin('m_population', 'm', 'm.id = r2.population_id')
        .leftJoin(
          'm_operation_points',
          'm2',
          `m2.id = r.loading_point_id AND m2.type = 'loading'`,
        )
        .leftJoin(
          'm_operation_points',
          'm3',
          `m3.id = r.dumping_point_id AND m3.type = 'dumping'`,
        )
        .leftJoin(
          'm_operation_points',
          'm4',
          `m4.id = r.dumping_point_op_id AND m4.type = 'dumping'`,
        )
        .leftJoin('m_barge', 'm5', 'm5.id = r.dumping_point_barge_id');

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
      // const result = await qb.offset(skip).limit(limit).getRawMany();
      const rawResult = await qb.offset(skip).limit(limit).getRawMany();

      const result = rawResult.map((item) => ({
        ...item,
        km_awal: item.km_awal ? parseFloat(Number(item.km_awal).toFixed(2)) : 0,
        km_akhir: item.km_akhir
          ? parseFloat(Number(item.km_akhir).toFixed(2))
          : 0,
        hm_awal: item.hm_awal ? parseFloat(Number(item.hm_awal).toFixed(2)) : 0,
        hm_akhir: item.hm_akhir
          ? parseFloat(Number(item.hm_akhir).toFixed(2))
          : 0,
        total_km: item.total_km
          ? parseFloat(Number(item.total_km).toFixed(2))
          : 0,
        total_hm: item.total_hm
          ? parseFloat(Number(item.total_hm).toFixed(2))
          : 0,
        total_vessel: item.total_vessel ? Number(item.total_vessel) : 0,
        mround_distance: item.mround_distance
          ? Number(item.mround_distance)
          : 0,
        distance: item.distance ? Number(item.distance) : 0,
      }));

      if (result.length < 1) {
        throwError('data production not found', 404);
      }

      return paginateResponse(
        result,
        total,
        page,
        limit,
        'retrieve data success',
        200,
      );
    } catch (error) {
      throwError('Failed to retrieve base data production', 500);
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
            dumpingPointId: baseData?.dumpingPointId,
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

      return successResponse(
        result,
        'Base data production retrieved successfully',
        200,
      );
    } catch (error) {
      throwError('Failed to retrieve base data production', 500);
    }
  }

  async remove(id: number) {
    const parentBaseDataPro = await this.parentBaseDataProRepository.findOne({
      where: { id },
      relations: ['baseDataPro'],
    });

    if (!parentBaseDataPro) {
      throw new NotFoundException(
        `Base data production with ID ${id} not found`,
      );
    }

    // Delete base data pro details first
    await this.baseDataProRepository.delete({ parentBaseDataProId: id });

    // Delete parent base data pro
    await this.parentBaseDataProRepository.remove(parentBaseDataPro);

    return successResponse(null, 'Base data production berhasil dihapus');
  }
}
