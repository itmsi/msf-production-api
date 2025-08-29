import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { HaulingList } from './entities/hauling-list.entity';
import { CreateHaulingListDto, UpdateHaulingListDto, QueryHaulingListDto, HaulingListResponseDto, QueryActivitiesDto, ActivitiesResponseDto } from './dto';
import { paginateResponse } from '../../common/helpers/public.helper';
import { successResponse } from '../../common/helpers/response.helper';
import { OperationPoints } from '../operation-points/entities/operation-points.entity';
import { Sites } from '../sites/entities/sites.entity';

@Injectable()
export class HaulingListService {
  constructor(
    @InjectRepository(HaulingList)
    private readonly haulingListRepository: Repository<HaulingList>,
    @InjectRepository(OperationPoints)
    private readonly operationPointsRepository: Repository<OperationPoints>,
    @InjectRepository(Sites)
    private readonly sitesRepository: Repository<Sites>,
  ) {}

  async create(createHaulingListDto: CreateHaulingListDto): Promise<any> {
    try {
      // Hitung total tonnage (vessel * 35)
      const totalTonnage = createHaulingListDto.vessel * 35;

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

      const savedHaulingList = await this.haulingListRepository.save(haulingList);
      const responseData = this.mapToResponseDto(savedHaulingList);
      
      return successResponse(
        responseData,
        'Data hauling list berhasil dibuat',
        201
      );
    } catch (error) {
      if (error instanceof QueryFailedError) {
        // Handle foreign key constraint violation
        if (error.message.includes('foreign key constraint')) {
          // Cek constraint name dari error message
          let errorMessage = 'Foreign key constraint violation: ';
          
          if (error.message.includes('unit_loading_id') || error.message.includes('FK_051101fec7de6360d38ad097376')) {
            errorMessage += `Unit loading dengan ID ${createHaulingListDto.unit_loading_id} tidak ditemukan di tabel m_population`;
          } else if (error.message.includes('unit_hauler_id') || error.message.includes('FK_b304210148a3d9e3a3c368989a9')) {
            errorMessage += `Unit hauler dengan ID ${createHaulingListDto.unit_hauler_id} tidak ditemukan di tabel m_population`;
          } else if (error.message.includes('loading_point_id') || error.message.includes('FK_b2d534020f293f5784f7d2ae181')) {
            errorMessage += `Loading point dengan ID ${createHaulingListDto.loading_point_id} tidak ditemukan di tabel m_operation_points`;
          } else if (error.message.includes('dumping_point_op_id') || error.message.includes('fk_r_ccr_hauling_dumping_point_op_id')) {
            errorMessage += `Dumping point operation dengan ID ${createHaulingListDto.dumping_point_op_id} tidak ditemukan di tabel m_operation_points`;
          } else if (error.message.includes('dumping_point_barge_id') || error.message.includes('fk_r_ccr_hauling_dumping_point_barge_id')) {
            errorMessage += `Dumping point barge dengan ID ${createHaulingListDto.dumping_point_barge_id} tidak ditemukan di tabel m_barge`;
          } else {
            // Fallback: cek berdasarkan field yang dikirim
            const missingFields: string[] = [];
            if (createHaulingListDto.unit_loading_id) missingFields.push(`unit_loading_id: ${createHaulingListDto.unit_loading_id}`);
            if (createHaulingListDto.unit_hauler_id) missingFields.push(`unit_hauler_id: ${createHaulingListDto.unit_hauler_id}`);
            if (createHaulingListDto.loading_point_id) missingFields.push(`loading_point_id: ${createHaulingListDto.loading_point_id}`);
            if (createHaulingListDto.dumping_point_op_id) missingFields.push(`dumping_point_op_id: ${createHaulingListDto.dumping_point_op_id}`);
            if (createHaulingListDto.dumping_point_barge_id) missingFields.push(`dumping_point_barge_id: ${createHaulingListDto.dumping_point_barge_id}`);
            
            errorMessage += `Referensi data tidak valid. Field yang bermasalah: ${missingFields.join(', ')}. Silakan periksa ID yang dikirim`;
          }
          
          throw new BadRequestException(errorMessage);
        }
        
        // Handle other database errors
        if (error.message.includes('duplicate key')) {
          throw new BadRequestException('Data dengan informasi yang sama sudah ada');
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
        activity_date: filters.activity_date 
      });
    }

    // Apply date range filters
    if (filters.start_date && filters.end_date) {
      queryBuilder.andWhere('hauling.activityDate BETWEEN :start_date AND :end_date', {
        start_date: filters.start_date,
        end_date: filters.end_date
      });
    } else if (filters.start_date) {
      queryBuilder.andWhere('hauling.activityDate >= :start_date', {
        start_date: filters.start_date
      });
    } else if (filters.end_date) {
      queryBuilder.andWhere('hauling.activityDate <= :end_date', {
        end_date: filters.end_date
      });
    }

    if (filters.shift) {
      queryBuilder.andWhere('hauling.shift = :shift', { 
        shift: filters.shift 
      });
    }

    if (filters.material) {
      queryBuilder.andWhere('hauling.material = :material', { 
        material: filters.material 
      });
    }

    if (filters.unit_loading_name) {
      queryBuilder.andWhere('unitLoading.no_unit ILIKE :unit_loading_name', { 
        unit_loading_name: `%${filters.unit_loading_name}%` 
      });
    }

    if (filters.unit_hauler_name) {
      queryBuilder.andWhere('unitHauler.no_unit ILIKE :unit_hauler_name', { 
        unit_hauler_name: `%${filters.unit_hauler_name}%` 
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
    const mappedData = data.map(item => this.mapToResponseDto(item));

    return paginateResponse(
      mappedData,
      total,
      page,
      limit,
      'Data hauling list berhasil diambil'
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
      throw new NotFoundException(`Hauling list dengan ID ${id} tidak ditemukan`);
    }

    const responseData = this.mapToResponseDto(haulingList);
    
    return successResponse(
      responseData,
      'Data hauling list berhasil diambil'
    );
  }

  async update(id: number, updateHaulingListDto: UpdateHaulingListDto): Promise<any> {
    try {
      const haulingList = await this.haulingListRepository.findOne({ where: { id } });
      
      if (!haulingList) {
        throw new NotFoundException(`Hauling list dengan ID ${id} tidak ditemukan`);
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
        updateData.dumpingPointBargeId = updateHaulingListDto.dumping_point_barge_id;
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
        throw new NotFoundException(`Hauling list dengan ID ${id} tidak ditemukan setelah update`);
      }

      const responseData = this.mapToResponseDto(updatedHaulingList);
      
      return successResponse(
        responseData,
        'Data hauling list berhasil diupdate'
      );
    } catch (error) {
      if (error instanceof QueryFailedError) {
        // Handle foreign key constraint violation
        if (error.message.includes('foreign key constraint')) {
          // Cek constraint name dari error message
          let errorMessage = 'Foreign key constraint violation: ';
          
          if (error.message.includes('unit_loading_id') || error.message.includes('FK_051101fec7de6360d38ad097376')) {
            errorMessage += `Unit loading dengan ID ${updateHaulingListDto.unit_loading_id} tidak ditemukan di tabel m_population`;
          } else if (error.message.includes('unit_hauler_id') || error.message.includes('FK_b304210148a3d9e3a3c368989a9')) {
            errorMessage += `Unit hauler dengan ID ${updateHaulingListDto.unit_hauler_id} tidak ditemukan di tabel m_population`;
          } else if (error.message.includes('loading_point_id') || error.message.includes('FK_b2d534020f293f5784f7d2ae181')) {
            errorMessage += `Loading point dengan ID ${updateHaulingListDto.loading_point_id} tidak ditemukan di tabel m_operation_points`;
          } else if (error.message.includes('dumping_point_op_id') || error.message.includes('fk_r_ccr_hauling_dumping_point_op_id')) {
            errorMessage += `Dumping point operation dengan ID ${updateHaulingListDto.dumping_point_op_id} tidak ditemukan di tabel m_operation_points`;
          } else if (error.message.includes('dumping_point_barge_id') || error.message.includes('fk_r_ccr_hauling_dumping_point_barge_id')) {
            errorMessage += `Dumping point barge dengan ID ${updateHaulingListDto.dumping_point_barge_id} tidak ditemukan di tabel m_barge`;
          } else {
            // Fallback: cek berdasarkan field yang dikirim
            const missingFields: string[] = [];
            if (updateHaulingListDto.unit_loading_id) missingFields.push(`unit_loading_id: ${updateHaulingListDto.unit_loading_id}`);
            if (updateHaulingListDto.unit_hauler_id) missingFields.push(`unit_hauler_id: ${updateHaulingListDto.unit_hauler_id}`);
            if (updateHaulingListDto.loading_point_id) missingFields.push(`loading_point_id: ${updateHaulingListDto.loading_point_id}`);
            if (updateHaulingListDto.dumping_point_op_id) missingFields.push(`dumping_point_op_id: ${updateHaulingListDto.dumping_point_op_id}`);
            if (updateHaulingListDto.dumping_point_barge_id) missingFields.push(`dumping_point_barge_id: ${updateHaulingListDto.dumping_point_barge_id}`);
            
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
    const haulingList = await this.haulingListRepository.findOne({ where: { id } });
    
    if (!haulingList) {
      throw new NotFoundException(`Hauling list dengan ID ${id} tidak ditemukan`);
    }

    await this.haulingListRepository.remove(haulingList);
    
    return successResponse(
      null,
      'Data hauling list berhasil dihapus'
    );
  }

  async getActivities(queryDto: QueryActivitiesDto): Promise<any> {
    const { page = 1, limit = 10, name, type, site_name, orderBy = 'id', orderDirection = 'ASC' } = queryDto;
    
    const queryBuilder = this.operationPointsRepository
      .createQueryBuilder('op')
      .leftJoin('op.site', 'site')
      .select([
        'op.id as op_id',
        'op.name as op_name',
        'op.longitude as op_longitude',
        'op.latitude as op_latitude',
        'site.name as site_name'
      ]);

    // Apply filters
    if (name) {
      queryBuilder.andWhere('op.name ILIKE :name', { 
        name: `%${name}%` 
      });
    }

    if (type) {
      queryBuilder.andWhere('op.type = :type', { 
        type 
      });
    }

    if (site_name) {
      queryBuilder.andWhere('site.name ILIKE :site_name', { 
        site_name: `%${site_name}%` 
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
    const mappedData: ActivitiesResponseDto[] = data.map(item => ({
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
      'Data activities berhasil diambil'
    );
  }

  private mapToResponseDto(haulingList: HaulingList): HaulingListResponseDto {
    // Hitung time range dari time
    const timeRange = this.calculateTimeRange(haulingList.time);
    
    return {
      id: haulingList.id,
      activity_date: haulingList.activityDate.toISOString().split('T')[0],
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

  private calculateTimeRange(time: Date): string {
    // Gunakan UTC time untuk menghindari masalah timezone
    const hours = time.getUTCHours();
    const nextHour = hours + 1;
    
    // Format: HH-HH (contoh: 07-08, 14-15)
    const currentHour = hours.toString().padStart(2, '0');
    const nextHourStr = nextHour.toString().padStart(2, '0');
    
    return `${currentHour}-${nextHourStr}`;
  }
}
