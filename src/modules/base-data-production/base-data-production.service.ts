import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { 
  ParentBaseDataPro, 
  BaseDataPro 
} from './entities';
import { 
  CreateBaseDataProductionDto, 
  UpdateBaseDataProductionDto, 
  QueryBaseDataProductionDto,
  PaginatedBaseDataProductionResponseDto 
} from './dto';
import { successResponse } from '../../common/helpers/response.helper';

@Injectable()
export class BaseDataProductionService {
  constructor(
    @InjectRepository(ParentBaseDataPro)
    private parentBaseDataProRepository: Repository<ParentBaseDataPro>,
    @InjectRepository(BaseDataPro)
    private baseDataProRepository: Repository<BaseDataPro>,

  ) {}

  async create(createDto: CreateBaseDataProductionDto, userId: number) {
    // Create parent base data pro
    const parentBaseDataPro = this.parentBaseDataProRepository.create({
      unitId: createDto.unitId,
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
        totalKm: detail.totalKm,
        hmAwal: detail.hmAwal,
        hmAkhir: detail.hmAkhir,
        totalHm: detail.totalHm,
        loadingPointId: detail.loadingPointId,
        dumpingPointId: detail.dumpingPointId,
        mroundDistance: detail.mroundDistance,
        distance: detail.distance,
        totalVessel: detail.totalVessel,
        material: detail.material,
        createdBy: userId,
        updatedBy: userId,
      })
    );

    await this.baseDataProRepository.save(baseDataProDetails);

    // Return with details using successResponse
    const result = await this.findOne(savedParent.id);
    return successResponse(result, 'Base data production berhasil dibuat', 201);
  }

  async update(id: number, updateDto: UpdateBaseDataProductionDto, userId: number) {
    const parentBaseDataPro = await this.findOne(id);
    
    if (!parentBaseDataPro) {
      throw new NotFoundException(`Base data production with ID ${id} not found`);
    }

    // Update parent base data pro
    if (updateDto.unitId !== undefined) parentBaseDataPro.unitId = updateDto.unitId;
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
          existingDetail.totalKm = detailDto.totalKm;
          existingDetail.hmAwal = detailDto.hmAwal;
          existingDetail.hmAkhir = detailDto.hmAkhir;
          existingDetail.totalHm = detailDto.totalHm;
          existingDetail.loadingPointId = detailDto.loadingPointId;
          existingDetail.dumpingPointId = detailDto.dumpingPointId;
          existingDetail.mroundDistance = detailDto.mroundDistance;
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
            totalKm: detailDto.totalKm,
            hmAwal: detailDto.hmAwal,
            hmAkhir: detailDto.hmAkhir,
            totalHm: detailDto.totalHm,
            loadingPointId: detailDto.loadingPointId,
            dumpingPointId: detailDto.dumpingPointId,
            mroundDistance: detailDto.mroundDistance,
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

    const result = await this.findOne(id);
    return successResponse(result, 'Base data production berhasil diupdate');
  }

  async findAll(queryDto: QueryBaseDataProductionDto): Promise<PaginatedBaseDataProductionResponseDto> {
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

      // Transform data to DTO format
      const data = parentData.map(parent => ({
        id: parent.id,
        date: parent.activityDate,
        shift: parent.shift,
        driver: `Driver ${parent.driverId}`, // Simplified for now
        activity: 'N/A',
        unit: `Unit ${parent.unitId}`, // Simplified for now
        start_shift: parent.startShift,
        end_shift: parent.endShift,
        km_awal: parent.baseDataPro?.[0]?.kmAwal || 0,
        km_akhir: parent.baseDataPro?.[0]?.kmAkhir || 0,
        hm_awal: parent.baseDataPro?.[0]?.hmAwal || 0,
        hm_akhir: parent.baseDataPro?.[0]?.hmAkhir || 0,
        total_km: (parent.baseDataPro?.[0]?.kmAkhir || 0) - (parent.baseDataPro?.[0]?.kmAwal || 0),
        total_hm: (parent.baseDataPro?.[0]?.hmAkhir || 0) - (parent.baseDataPro?.[0]?.hmAwal || 0),
        total_vessel: parent.baseDataPro?.[0]?.totalVessel || 0,
        loading_point: `Loading ${parent.baseDataPro?.[0]?.loadingPointId || 'N/A'}`,
        dumping_point: `Dumping ${parent.baseDataPro?.[0]?.dumpingPointId || 'N/A'}`,
        mround_distance: parent.baseDataPro?.[0]?.mroundDistance || 0,
        distance: parent.baseDataPro?.[0]?.distance || 0,
      }));

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  async findOne(id: number) {
    const parentBaseDataPro = await this.parentBaseDataProRepository.findOne({
      where: { id },
      relations: ['baseDataPro'],
    });

    if (!parentBaseDataPro) {
      throw new NotFoundException(`Base data production with ID ${id} not found`);
    }

    return parentBaseDataPro;
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
