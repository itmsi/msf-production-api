import {
  Injectable,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Population } from './entities/population.entity';
import { Repository, Not, Between } from 'typeorm';
import {
  ApiResponse,
  successResponse,
  throwError,
} from '../../common/helpers/response.helper';
import { paginateResponse } from '../../common/helpers/public.helper';
import {
  CreatePopulationDto,
  PopulationResponseDto,
  GetPopulationsQueryDto,
  UpdatePopulationDto,
} from './dto/population.dto';

@Injectable()
export class PopulationService {
  constructor(
    @InjectRepository(Population)
    private populationRepository: Repository<Population>,
  ) {}

  async findById(id: number): Promise<ApiResponse<PopulationResponseDto>> {
    const result = await this.populationRepository.findOne({
      where: { id },
      relations: ['unitType', 'unitType.brand', 'activities', 'site'],
    });
    
    if (!result) {
      throwError('Population tidak ditemukan', 404);
    }
    
    const response: PopulationResponseDto = {
      id: result!.id,
      date_arrive: result!.date_arrive,
      status: result!.status,
      unit_type_id: result!.unit_type_id,
      no_unit: result!.no_unit,
      vin_number: result!.vin_number,
      no_unit_system: result!.no_unit_system,
      engine_brand: result!.engine_brand,
      serial_engine: result!.serial_engine,
      activities_id: result!.activities_id,
      site_origin: result!.site_origin,
      remarks: result!.remarks,
      site_id: result!.site_id,
      company: result!.company,
      tyre_type: result!.tyre_type,
      createdAt: result!.createdAt,
      updatedAt: result!.updatedAt,
      unitType: result!.unitType ? {
        id: result!.unitType.id,
        unit_name: result!.unitType.unit_name,
        type_name: result!.unitType.type_name,
        model_name: result!.unitType.model_name,
        brand: result!.unitType.brand ? {
          id: result!.unitType.brand.id,
          brand_name: result!.unitType.brand.brand_name,
        } : undefined,
      } : undefined,
              activities: result!.activities ? {
          id: result!.activities.id,
          activity_name: result!.activities.name,
        } : undefined,
        site: result!.site ? {
          id: result!.site.id,
          site_name: result!.site.name,
        } : undefined,
    };
    
    return successResponse(response);
  }

  async findAll(
    query: GetPopulationsQueryDto,
  ): Promise<ApiResponse<PopulationResponseDto[]>> {
    try {
      const page = parseInt(query.page ?? '1', 10);
      const limit = parseInt(query.limit ?? '10', 10);
      const skip = (page - 1) * limit;
      const search = query.search?.toLowerCase() ?? '';
      const status = query.status;
      const unitTypeId = query.unit_type_id ? parseInt(query.unit_type_id, 10) : undefined;
      const activitiesId = query.activities_id ? parseInt(query.activities_id, 10) : undefined;
      const siteId = query.site_id ? parseInt(query.site_id, 10) : undefined;
      const engineBrand = query.engine_brand;
      const tyreType = query.tyre_type;
      const dateFrom = query.date_from;
      const dateTo = query.date_to;
      const sortBy = query.sortBy ?? 'id';
      const sortOrder = query.sortOrder ?? 'DESC';

      const qb = this.populationRepository
        .createQueryBuilder('population')
        .leftJoinAndSelect('population.unitType', 'unitType')
        .leftJoinAndSelect('unitType.brand', 'brand')
        .leftJoinAndSelect('population.activities', 'activities')
        .leftJoinAndSelect('population.site', 'site')
        .where('population.deletedAt IS NULL'); // Exclude soft deleted records

      // Search filter (mencari di semua field yang relevan)
      if (search) {
        qb.andWhere(
          '(population.no_unit ILIKE :search OR population.vin_number ILIKE :search OR population.no_unit_system ILIKE :search OR population.serial_engine ILIKE :search OR population.site_origin ILIKE :search OR population.company ILIKE :search OR unitType.unit_name ILIKE :search OR unitType.type_name ILIKE :search OR unitType.model_name ILIKE :search OR brand.brand_name ILIKE :search OR activities.activity_name ILIKE :search OR site.site_name ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      // Filter by status
      if (status) {
        qb.andWhere('population.status = :status', { status });
      }

      // Filter by unit_type_id
      if (unitTypeId) {
        qb.andWhere('population.unit_type_id = :unitTypeId', { unitTypeId });
      }

      // Filter by activities_id
      if (activitiesId) {
        qb.andWhere('population.activities_id = :activitiesId', { activitiesId });
      }

      // Filter by site_id
      if (siteId) {
        qb.andWhere('population.site_id = :siteId', { siteId });
      }

      // Filter by engine_brand
      if (engineBrand) {
        qb.andWhere('population.engine_brand = :engineBrand', { engineBrand });
      }

      // Filter by tyre_type
      if (tyreType) {
        qb.andWhere('population.tyre_type = :tyreType', { tyreType });
      }

      // Filter by date range
      if (dateFrom && dateTo) {
        qb.andWhere('population.date_arrive BETWEEN :dateFrom AND :dateTo', {
          dateFrom,
          dateTo,
        });
      } else if (dateFrom) {
        qb.andWhere('population.date_arrive >= :dateFrom', { dateFrom });
      } else if (dateTo) {
        qb.andWhere('population.date_arrive <= :dateTo', { dateTo });
      }

      // Validate sortBy field to prevent SQL injection
      const allowedSortFields = ['id', 'date_arrive', 'status', 'no_unit', 'vin_number', 'createdAt', 'updatedAt'];
      const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'id';
      const validSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

      qb.orderBy(`population.${validSortBy}`, validSortOrder)
        .skip(skip)
        .take(limit);

      const [result, total] = await qb.getManyAndCount();

      // Transform result to DTO format
      const transformedResult = result.map(population => ({
        id: population.id,
        date_arrive: population.date_arrive,
        status: population.status,
        unit_type_id: population.unit_type_id,
        no_unit: population.no_unit,
        vin_number: population.vin_number,
        no_unit_system: population.no_unit_system,
        engine_brand: population.engine_brand,
        serial_engine: population.serial_engine,
        activities_id: population.activities_id,
        site_origin: population.site_origin,
        remarks: population.remarks,
        site_id: population.site_id,
        company: population.company,
        tyre_type: population.tyre_type,
        createdAt: population.createdAt,
        updatedAt: population.updatedAt,
        unitType: population.unitType ? {
          id: population.unitType.id,
          unit_name: population.unitType.unit_name,
          type_name: population.unitType.type_name,
          model_name: population.unitType.model_name,
          brand: population.unitType.brand ? {
            id: population.unitType.brand.id,
            brand_name: population.unitType.brand.brand_name,
          } : undefined,
        } : undefined,
        activities: population.activities ? {
          id: population.activities.id,
          activity_name: population.activities.name,
        } : undefined,
        site: population.site ? {
          id: population.site.id,
          site_name: population.site.name,
        } : undefined,
      }));

      const response = paginateResponse(
        transformedResult,
        total,
        page,
        limit,
        'Data population berhasil diambil',
      );
      
      return {
        statusCode: response.statusCode,
        message: response.message,
        data: response.data,
        meta: {
          total,
          page,
          limit,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Gagal mengambil data population');
    }
  }

  async create(data: CreatePopulationDto): Promise<ApiResponse<PopulationResponseDto>> {
    try {
      // Check if VIN number already exists
      const existingVin = await this.populationRepository.findOne({
        where: { vin_number: data.vin_number },
      });
      
      if (existingVin) {
        throwError('VIN number sudah terdaftar', 409);
      }

      // Check if no_unit already exists
      const existingNoUnit = await this.populationRepository.findOne({
        where: { no_unit: data.no_unit },
      });
      
      if (existingNoUnit) {
        throwError('Nomor unit sudah terdaftar', 409);
      }

      // Check if no_unit_system already exists
      const existingNoUnitSystem = await this.populationRepository.findOne({
        where: { no_unit_system: data.no_unit_system },
      });
      
      if (existingNoUnitSystem) {
        throwError('Nomor unit sistem sudah terdaftar', 409);
      }

      const newPopulation = this.populationRepository.create({
        ...data,
        date_arrive: new Date(data.date_arrive),
      });
      const result = await this.populationRepository.save(newPopulation);
      
      // Fetch with relations for response
      const savedPopulation = await this.populationRepository.findOne({
        where: { id: result.id },
        relations: ['unitType', 'unitType.brand', 'activities', 'site'],
      });

      const response: PopulationResponseDto = {
        id: savedPopulation!.id,
        date_arrive: savedPopulation!.date_arrive,
        status: savedPopulation!.status,
        unit_type_id: savedPopulation!.unit_type_id,
        no_unit: savedPopulation!.no_unit,
        vin_number: savedPopulation!.vin_number,
        no_unit_system: savedPopulation!.no_unit_system,
        engine_brand: savedPopulation!.engine_brand,
        serial_engine: savedPopulation!.serial_engine,
        activities_id: savedPopulation!.activities_id,
        site_origin: savedPopulation!.site_origin,
        remarks: savedPopulation!.remarks,
        site_id: savedPopulation!.site_id,
        company: savedPopulation!.company,
        tyre_type: savedPopulation!.tyre_type,
        createdAt: savedPopulation!.createdAt,
        updatedAt: savedPopulation!.updatedAt,
        unitType: savedPopulation!.unitType ? {
          id: savedPopulation!.unitType.id,
          unit_name: savedPopulation!.unitType.unit_name,
          type_name: savedPopulation!.unitType.type_name,
          model_name: savedPopulation!.unitType.model_name,
          brand: savedPopulation!.unitType.brand ? {
            id: savedPopulation!.unitType.brand.id,
            brand_name: savedPopulation!.unitType.brand.brand_name,
          } : undefined,
        } : undefined,
        activities: savedPopulation!.activities ? {
          id: savedPopulation!.activities.id,
          activity_name: savedPopulation!.activities.name,
        } : undefined,
        site: savedPopulation!.site ? {
          id: savedPopulation!.site.id,
          site_name: savedPopulation!.site.name,
        } : undefined,
      };
      
      return successResponse(response, 'Population berhasil dibuat');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal membuat population');
    }
  }

  async update(
    id: number,
    updateDto: UpdatePopulationDto,
  ): Promise<ApiResponse<PopulationResponseDto>> {
    try {
      const population = await this.populationRepository.findOne({ 
        where: { id },
        relations: ['unitType', 'unitType.brand', 'activities', 'site'],
      });

      if (!population) {
        throwError('Population tidak ditemukan', 404);
      }

      // Check if VIN number already exists for other populations
      if (updateDto.vin_number && updateDto.vin_number !== population!.vin_number) {
        const existingVin = await this.populationRepository.findOne({
          where: { vin_number: updateDto.vin_number, id: Not(id) },
        });
        
        if (existingVin) {
          throwError('VIN number sudah digunakan oleh population lain', 409);
        }
      }

      // Check if no_unit already exists for other populations
      if (updateDto.no_unit && updateDto.no_unit !== population!.no_unit) {
        const existingNoUnit = await this.populationRepository.findOne({
          where: { no_unit: updateDto.no_unit, id: Not(id) },
        });
        
        if (existingNoUnit) {
          throwError('Nomor unit sudah digunakan oleh population lain', 409);
        }
      }

      // Check if no_unit_system already exists for other populations
      if (updateDto.no_unit_system && updateDto.no_unit_system !== population!.no_unit_system) {
        const existingNoUnitSystem = await this.populationRepository.findOne({
          where: { no_unit_system: updateDto.no_unit_system, id: Not(id) },
        });
        
        if (existingNoUnitSystem) {
          throwError('Nomor unit sistem sudah digunakan oleh population lain', 409);
        }
      }

      const updateData: any = { ...updateDto };
      if (updateDto.date_arrive) {
        updateData.date_arrive = new Date(updateDto.date_arrive);
      }

      const updatedPopulation = this.populationRepository.merge(population!, updateData);
      const result = await this.populationRepository.save(updatedPopulation);
      
      // Fetch updated data with relations
      const updatedData = await this.populationRepository.findOne({
        where: { id: result.id },
        relations: ['unitType', 'unitType.brand', 'activities', 'site'],
      });

      const response: PopulationResponseDto = {
        id: updatedData!.id,
        date_arrive: updatedData!.date_arrive,
        status: updatedData!.status,
        unit_type_id: updatedData!.unit_type_id,
        no_unit: updatedData!.no_unit,
        vin_number: updatedData!.vin_number,
        no_unit_system: updatedData!.no_unit_system,
        engine_brand: updatedData!.engine_brand,
        serial_engine: updatedData!.serial_engine,
        activities_id: updatedData!.activities_id,
        site_origin: updatedData!.site_origin,
        remarks: updatedData!.remarks,
        site_id: updatedData!.site_id,
        company: updatedData!.company,
        tyre_type: updatedData!.tyre_type,
        createdAt: updatedData!.createdAt,
        updatedAt: updatedData!.updatedAt,
        unitType: updatedData!.unitType ? {
          id: updatedData!.unitType.id,
          unit_name: updatedData!.unitType.unit_name,
          type_name: updatedData!.unitType.type_name,
          model_name: updatedData!.unitType.model_name,
          brand: updatedData!.unitType.brand ? {
            id: updatedData!.unitType.brand.id,
            brand_name: updatedData!.unitType.brand.brand_name,
          } : undefined,
        } : undefined,
        activities: updatedData!.activities ? {
          id: updatedData!.activities.id,
          activity_name: updatedData!.activities.name,
        } : undefined,
        site: updatedData!.site ? {
          id: updatedData!.site.id,
          site_name: updatedData!.site.name,
        } : undefined,
      };
      
      return successResponse(response, 'Population berhasil diupdate');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal mengupdate population');
    }
  }

  async remove(id: number): Promise<ApiResponse<null>> {
    try {
      const population = await this.populationRepository.findOne({ where: { id } });

      if (!population) {
        throwError('Population tidak ditemukan', 404);
      }
      
      await this.populationRepository.softRemove(population!);

      return successResponse(null, 'Population berhasil dihapus');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal menghapus population');
    }
  }
}
