import {
  Injectable,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Sites } from './entities/sites.entity';
import { OperationPoints } from '../operation-points/entities/operation-points.entity';
import { Repository, Not } from 'typeorm';
import {
  ApiResponse,
  successResponse,
  throwError,
} from '../../common/helpers/response.helper';
import { paginateResponse } from '../../common/helpers/public.helper';
import {
  CreateSitesDto,
  SitesResponseDto,
  GetSitesQueryDto,
  UpdateSitesDto,
  OperatorPointDto,
} from './dto/sites.dto';

@Injectable()
export class SitesService {
  constructor(
    @InjectRepository(Sites)
    private sitesRepository: Repository<Sites>,
    @InjectRepository(OperationPoints)
    private operationPointsRepository: Repository<OperationPoints>,
  ) {}

  async findById(id: number): Promise<ApiResponse<SitesResponseDto>> {
    const result = await this.sitesRepository.findOne({
      where: { id },
      relations: ['operator_points'],
    });
    
    if (!result) {
      throwError('Site tidak ditemukan', 404);
    }
    
    return successResponse(result as SitesResponseDto);
  }

  async findAll(
    query: GetSitesQueryDto,
  ): Promise<ApiResponse<SitesResponseDto[]>> {
    try {
      const page = parseInt(query.page ?? '1', 10);
      const limit = parseInt(query.limit ?? '10', 10);
      const skip = (page - 1) * limit;
      const search = query.search?.toLowerCase() ?? '';
      const name = query.name?.toLowerCase() ?? '';
      const location = query.location?.toLowerCase() ?? '';
      const sortBy = query.sortBy ?? 'id';
      const sortOrder = query.sortOrder ?? 'DESC';

      const qb = this.sitesRepository
        .createQueryBuilder('site')
        .leftJoinAndSelect('site.operator_points', 'op')
        .where('site.deletedAt IS NULL'); // Exclude soft deleted records

      // Search filter (mencari di semua field yang relevan)
      if (search) {
        qb.andWhere(
          '(site.name ILIKE :search OR site.location ILIKE :search)',
          { search: `%${search}%` },
        );
      }

      // Filter by name (exact match atau partial match)
      if (name) {
        qb.andWhere('site.name ILIKE :name', {
          name: `%${name}%`,
        });
      }

      // Filter by location (exact match atau partial match)
      if (location) {
        qb.andWhere('site.location ILIKE :location', {
          location: `%${location}%`,
        });
      }

      // Validate sortBy field to prevent SQL injection
      const allowedSortFields = ['id', 'name', 'location', 'longitude', 'latitude', 'createdAt', 'updatedAt'];
      const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'id';
      const validSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

      qb.orderBy(`site.${validSortBy}`, validSortOrder)
        .skip(skip)
        .take(limit);

      const [result, total] = await qb.getManyAndCount();

      // Transform result to DTO format
      const transformedResult = result.map(site => ({
        id: site.id,
        name: site.name,
        location: site.location,
        longitude: site.longitude,
        latitude: site.latitude,
        createdAt: site.createdAt || new Date(),
        updatedAt: site.updatedAt || new Date(),
        operator_points: site.operator_points?.map(op => ({
          id: op.id,
          sites_id: op.sites_id,
          type: op.type,
          name: op.name,
          longitude: op.longitude,
          latitude: op.latitude,
          createdAt: op.createdAt,
          updatedAt: op.updatedAt
        })) || []
      }));

      const response = paginateResponse(
        transformedResult,
        total,
        page,
        limit,
        'Data sites berhasil diambil',
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
      throw new InternalServerErrorException('Gagal mengambil data sites');
    }
  }

  async create(data: CreateSitesDto): Promise<ApiResponse<SitesResponseDto>> {
    try {
      // Create site first
      const newSite = this.sitesRepository.create({
        name: data.name,
        location: data.location,
        longitude: data.longitude,
        latitude: data.latitude,
      });
      
      const savedSite = await this.sitesRepository.save(newSite);

      // Create operator points
      if (data.operator_point && data.operator_point.length > 0) {
        const operatorPoints = data.operator_point.map(op => 
          this.operationPointsRepository.create({
            sites_id: savedSite.id,
            type: op.type,
            name: op.name,
            longitude: op.longitude,
            latitude: op.latitude,
          })
        );
        
        await this.operationPointsRepository.save(operatorPoints);
      }

      // Get the complete data with operator points
      const result = await this.sitesRepository.findOne({
        where: { id: savedSite.id },
        relations: ['operator_points'],
      });
      
      if (!result) {
        throwError('Gagal mengambil data site yang baru dibuat', 500);
      }
      
      return successResponse(result as SitesResponseDto, 'Site berhasil dibuat');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal membuat site');
    }
  }

  async update(
    id: number,
    updateDto: UpdateSitesDto,
  ): Promise<ApiResponse<SitesResponseDto>> {
    try {
      const site = await this.sitesRepository.findOne({ where: { id } });

      if (!site) {
        throwError('Site tidak ditemukan', 404);
      }

      // Update site data
      const updatedSite = this.sitesRepository.merge(site!, {
        name: updateDto.name,
        location: updateDto.location,
        longitude: updateDto.longitude,
        latitude: updateDto.latitude,
      });
      
      await this.sitesRepository.save(updatedSite);

      // Update operator points if provided
      if (updateDto.operator_point && updateDto.operator_point.length > 0) {
        // Delete existing operator points for this site
        await this.operationPointsRepository.delete({ sites_id: id });
        
        // Create new operator points
        const operatorPoints = updateDto.operator_point.map(op => 
          this.operationPointsRepository.create({
            sites_id: id,
            type: op.type,
            name: op.name,
            longitude: op.longitude,
            latitude: op.latitude,
          })
        );
        
        await this.operationPointsRepository.save(operatorPoints);
      }

      // Get the complete updated data
      const result = await this.sitesRepository.findOne({
        where: { id },
        relations: ['operator_points'],
      });
      
      if (!result) {
        throwError('Gagal mengambil data site yang diupdate', 500);
      }
      
      return successResponse(result as SitesResponseDto, 'Site berhasil diupdate');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal mengupdate site');
    }
  }

  async remove(id: number): Promise<ApiResponse<null>> {
    try {
      const site = await this.sitesRepository.findOne({ where: { id } });

      if (!site) {
        throwError('Site tidak ditemukan', 404);
      }
      
      // Soft delete the site (this will cascade to operator points due to foreign key constraint)
      await this.sitesRepository.softRemove(site!);

      return successResponse(null, 'Site berhasil dihapus');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal menghapus site');
    }
  }
}
