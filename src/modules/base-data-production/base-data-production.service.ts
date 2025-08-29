import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In } from 'typeorm';
import { 
  ParentBaseDataPro, 
  BaseDataPro 
} from './entities';
import { Population } from '../population/entities/population.entity';
import { Employee } from '../employee/entities/employee.entity';
import { Sites } from '../sites/entities/sites.entity';
import { Barge } from '../barge/entities/barge.entity';
import { OperationPoints } from '../operation-points/entities/operation-points.entity';
import { 
  CreateBaseDataProductionDto, 
  UpdateBaseDataProductionDto, 
  QueryBaseDataProductionDto,
  PaginatedBaseDataProductionResponseDto 
} from './dto';
import { successResponse, emptyDataResponse, throwError } from '../../common/helpers/response.helper';
import { paginateResponse } from '../../common/helpers/public.helper';

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
  ) {}

  async create(createDto: CreateBaseDataProductionDto, userId: number) {
    try {
      // Validate foreign key constraints
      await this.validateForeignKeys(createDto);

      // Create parent base data pro
      const parentBaseDataPro = this.parentBaseDataProRepository.create({
        populationId: createDto.populationId,
        activityDate: new Date(createDto.activityDate),
        shift: createDto.shift,
        driverId: createDto.driverId,
        startShift: createDto.startShift ? new Date(createDto.startShift) : null,
        endShift: createDto.endShift ? new Date(createDto.endShift) : null,
      });

      const savedParent = await this.parentBaseDataProRepository.save(parentBaseDataPro) as ParentBaseDataPro;

      // Create base data pro details
      const baseDataProDetails = createDto.detail.map(detail => 
        this.baseDataProRepository.create({
          parentBaseDataProId: savedParent.id,
          kmAwal: detail.kmAwal,
          kmAkhir: detail.kmAkhir,
          totalKm: detail.totalKm ?? (detail.kmAkhir - detail.kmAwal),
          hmAwal: detail.hmAwal,
          hmAkhir: detail.hmAkhir,
          totalHm: detail.totalHm ?? (detail.hmAkhir - detail.hmAwal),
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
        })
      );

      await this.baseDataProRepository.save(baseDataProDetails);

      // Get created data for response
      const createdData = await this.parentBaseDataProRepository.findOne({
        where: { id: savedParent.id },
        relations: ['baseDataPro'],
      });

      if (!createdData) {
        throw new NotFoundException('Base data production not found after creation');
      }

      // Transform data to response format
      const transformedData = {
        id: createdData.id,
        populationId: createdData.populationId,
        activityDate: createdData.activityDate,
        shift: createdData.shift,
        driverId: createdData.driverId,
        startShift: createdData.startShift,
        endShift: createdData.endShift,
        baseDataPro: createdData.baseDataPro?.map(detail => ({
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
      if (error.code === '23503') { // Foreign key violation
        throw new BadRequestException('Data referensi tidak ditemukan. Pastikan Unit ID, Driver ID, Loading Point ID, dan Dumping Point ID valid.');
      }
      
      // Handle other database errors
      if (error.code === '23505') { // Unique constraint violation
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

  private async validateForeignKeys(createDto: CreateBaseDataProductionDto): Promise<void> {
    // Validate Population ID
    const population = await this.populationRepository.findOne({ where: { id: createDto.populationId } });
    if (!population) {
      throw new BadRequestException(`Unit dengan ID ${createDto.populationId} tidak ditemukan di tabel population`);
    }

    // Validate Driver ID
    const driver = await this.employeeRepository.findOne({ where: { id: createDto.driverId } });
    if (!driver) {
      throw new BadRequestException(`Driver dengan ID ${createDto.driverId} tidak ditemukan`);
    }

    // Validate Loading Point IDs
    for (const detail of createDto.detail) {
      const loadingPoint = await this.sitesRepository.findOne({ where: { id: detail.loadingPointId } });
      if (!loadingPoint) {
        throw new BadRequestException(`Loading Point dengan ID ${detail.loadingPointId} tidak ditemukan`);
      }

      const dumpingPoint = await this.sitesRepository.findOne({ where: { id: detail.dumpingPointId } });
      if (!dumpingPoint) {
        throw new BadRequestException(`Dumping Point dengan ID ${detail.dumpingPointId} tidak ditemukan`);
      }

      // Validate Dumping Point Operation ID if provided
      if (detail.dumpingPointOpId) {
        const dumpingPointOp = await this.operationPointsRepository.findOne({ where: { id: detail.dumpingPointOpId } });
        if (!dumpingPointOp) {
          throw new BadRequestException(`Dumping Point Operation dengan ID ${detail.dumpingPointOpId} tidak ditemukan`);
        }
      }

      // Validate Dumping Point Barge ID if provided
      if (detail.dumpingPointBargeId) {
        const dumpingPointBarge = await this.bargeRepository.findOne({ where: { id: detail.dumpingPointBargeId } });
        if (!dumpingPointBarge) {
          throw new BadRequestException(`Dumping Point Barge dengan ID ${detail.dumpingPointBargeId} tidak ditemukan`);
        }
      }
    }
  }

  async update(id: number, updateDto: UpdateBaseDataProductionDto, userId: number) {
    const parentBaseDataPro = await this.parentBaseDataProRepository.findOne({
      where: { id },
      relations: ['baseDataPro'],
    });
    
    if (!parentBaseDataPro) {
      throw new NotFoundException(`Base data production with ID ${id} not found`);
    }

    // Update parent base data pro
    if (updateDto.populationId !== undefined) parentBaseDataPro.populationId = updateDto.populationId;
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
        where: { parentBaseDataProId: id }
      });

      // Update existing details or create new ones
      for (let i = 0; i < updateDto.detail.length; i++) {
        const detailDto = updateDto.detail[i];
        
        if (i < existingDetails.length) {
          // Update existing detail
          const existingDetail = existingDetails[i];
          existingDetail.kmAwal = detailDto.kmAwal;
          existingDetail.kmAkhir = detailDto.kmAkhir;
          existingDetail.totalKm = detailDto.totalKm ?? (detailDto.kmAkhir - detailDto.kmAwal);
          existingDetail.hmAwal = detailDto.hmAwal;
          existingDetail.hmAkhir = detailDto.hmAkhir;
          existingDetail.totalHm = detailDto.totalHm ?? (detailDto.hmAkhir - detailDto.hmAwal);
          existingDetail.loadingPointId = detailDto.loadingPointId;
          existingDetail.dumpingPointId = detailDto.dumpingPointId;
          existingDetail.dumpingPointOpId = detailDto.dumpingPointOpId || null;
          existingDetail.dumpingPointBargeId = detailDto.dumpingPointBargeId || null;
          existingDetail.activity = detailDto.activity || null;
          existingDetail.mroundDistance = detailDto.distance; // Store distance as is, no need to floor
          existingDetail.distance = detailDto.distance;
          existingDetail.totalVessel = detailDto.totalVessel;
          existingDetail.material = detailDto.material;
          existingDetail.updatedBy = userId;
          
          await this.baseDataProRepository.save(existingDetail);
        } else {
          // Create new detail if more details provided than existing
          const newDetail = this.baseDataProRepository.create({
            parentBaseDataProId: id,
            kmAwal: detailDto.kmAwal,
            kmAkhir: detailDto.kmAkhir,
            totalKm: detailDto.totalKm ?? (detailDto.kmAkhir - detailDto.kmAwal),
            hmAwal: detailDto.hmAwal,
            hmAkhir: detailDto.hmAkhir,
            totalHm: detailDto.totalHm ?? (detailDto.hmAkhir - detailDto.hmAwal),
            loadingPointId: detailDto.loadingPointId,
            dumpingPointId: detailDto.dumpingPointId,
            dumpingPointOpId: detailDto.dumpingPointOpId || null,
            dumpingPointBargeId: detailDto.dumpingPointBargeId || null,
            activity: detailDto.activity || null,
            mroundDistance: detailDto.distance, // Store distance as is, no need to floor
            distance: detailDto.distance,
            totalVessel: detailDto.totalVessel,
            material: detailDto.material,
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
      populationId: updatedData.populationId,
      activityDate: updatedData.activityDate,
      shift: updatedData.shift,
      driverId: updatedData.driverId,
      startShift: updatedData.startShift,
      endShift: updatedData.endShift,
      baseDataPro: updatedData.baseDataPro?.map(detail => ({
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
      const { startDate, endDate, keyword, page = 1, limit = 10 } = queryDto;
      const skip = (page - 1) * limit;

      // Simple query first to test basic functionality
      let whereConditions: any = {};

      // Apply date filter
      if (startDate && endDate) {
        whereConditions.activityDate = Between(new Date(startDate), new Date(endDate));
      }

      // Get total count
      const total = await this.parentBaseDataProRepository.count({
        where: whereConditions,
      });

      // Get parent data with details
      const parentData = await this.parentBaseDataProRepository.find({
        where: whereConditions,
        relations: ['baseDataPro'],
        skip: skip,
        take: limit,
        order: { id: 'DESC' },
      });

      // Get additional data for joins
      const dumpingPointOpIds = parentData
        .flatMap(parent => parent.baseDataPro)
        .map(detail => detail.dumpingPointOpId)
        .filter(id => id !== null && id !== undefined);

      const dumpingPointBargeIds = parentData
        .flatMap(parent => parent.baseDataPro)
        .map(detail => detail.dumpingPointBargeId)
        .filter(id => id !== null && id !== undefined);

      const loadingPointIds = parentData
        .flatMap(parent => parent.baseDataPro)
        .map(detail => detail.loadingPointId)
        .filter(id => id !== null && id !== undefined);

      const dumpingPointIds = parentData
        .flatMap(parent => parent.baseDataPro)
        .map(detail => detail.dumpingPointId)
        .filter(id => id !== null && id !== undefined);

      const populationIds = parentData.map(parent => parent.populationId);
      const driverIds = parentData.map(parent => parent.driverId);

      // Fetch related data
      const [operationPoints, barges, sites, populations, employees] = await Promise.all([
        this.operationPointsRepository.find({ where: { id: In(dumpingPointOpIds) } }),
        this.bargeRepository.find({ where: { id: In(dumpingPointBargeIds) } }),
        this.sitesRepository.find({ where: { id: In([...loadingPointIds, ...dumpingPointIds]) } }),
        this.populationRepository.find({ where: { id: In(populationIds) } }),
        this.employeeRepository.find({ where: { id: In(driverIds) } }),
      ]);

      // Create lookup maps
      const operationPointsMap = new Map(operationPoints.map(op => [op.id, op.name]));
      const bargesMap = new Map(barges.map(barge => [barge.id, barge.name]));
      const sitesMap = new Map(sites.map(site => [site.id, site.name]));
      const populationsMap = new Map(populations.map(pop => [pop.id, pop.no_unit || `Unit ${pop.id}`]));
      const employeesMap = new Map(employees.map(emp => [emp.id, emp.name]));

      // Transform data to DTO format
      const data = parentData.map(parent => {
        const baseData = parent.baseDataPro?.[0];
        return {
          id: parent.id,
          date: parent.activityDate,
          shift: parent.shift,
          driver: employeesMap.get(parent.driverId) || `Driver ${parent.driverId}`,
          activity: this.getActivityDisplayName(baseData?.activity),
          unit: populationsMap.get(parent.populationId) || `Unit ${parent.populationId}`,
          start_shift: parent.startShift,
          end_shift: parent.endShift,
          km_awal: baseData?.kmAwal || 0,
          km_akhir: baseData?.kmAkhir || 0,
          hm_awal: baseData?.hmAwal || 0,
          hm_akhir: baseData?.hmAkhir || 0,
          total_km: (baseData?.kmAkhir || 0) - (baseData?.kmAwal || 0),
          total_hm: (baseData?.hmAkhir || 0) - (baseData?.hmAwal || 0),
          total_vessel: baseData?.totalVessel || 0,
          loading_point: sitesMap.get(baseData?.loadingPointId || 0) || `Loading ${baseData?.loadingPointId || 'N/A'}`,
          dumping_point: sitesMap.get(baseData?.dumpingPointId || 0) || `Dumping ${baseData?.dumpingPointId || 'N/A'}`,
          dumping_point_op: operationPointsMap.get(baseData?.dumpingPointOpId || 0) || '',
          dumping_point_barge: bargesMap.get(baseData?.dumpingPointBargeId || 0) || '',
          activity_type: baseData?.activity || null,
          mround_distance: baseData?.mroundDistance || 0,
          distance: baseData?.distance || 0,
          material: baseData?.material || 'none',
        };
      });

      return paginateResponse(
        data,
        total,
        page,
        limit,
        'Base data production data retrieved successfully'
      );
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  private getActivityDisplayName(activity: string | null): string {
    if (!activity) return 'N/A';
    
    switch (activity.toLowerCase()) {
      case 'hauling':
        return 'Hauling';
      case 'barging':
        return 'Barging';
      case 'direct':
        return 'Direct';
      default:
        return activity;
    }
  }

  async findOne(id: number) {
    try {
      const parentBaseDataPro = await this.parentBaseDataProRepository.findOne({
        where: { id },
        relations: ['baseDataPro'],
      });

      if (!parentBaseDataPro) {
        return emptyDataResponse('Base data production not found');
      }

      // Transform data to response format
      const transformedData = {
        id: parentBaseDataPro.id,
        populationId: parentBaseDataPro.populationId,
        activityDate: parentBaseDataPro.activityDate,
        shift: parentBaseDataPro.shift,
        driverId: parentBaseDataPro.driverId,
        startShift: parentBaseDataPro.startShift,
        endShift: parentBaseDataPro.endShift,
        baseDataPro: parentBaseDataPro.baseDataPro?.map(detail => ({
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

      return successResponse(transformedData, 'Base data production retrieved successfully');
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
      throw new NotFoundException(`Base data production with ID ${id} not found`);
    }

    // Delete base data pro details first
    await this.baseDataProRepository.delete({ parentBaseDataProId: id });

    // Delete parent base data pro
    await this.parentBaseDataProRepository.remove(parentBaseDataPro);

    return successResponse(null, 'Base data production berhasil dihapus');
  }
}
