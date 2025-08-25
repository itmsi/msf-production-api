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
  emptyDataResponse,
} from '../../common/helpers/response.helper';
import { paginateResponse } from '../../common/helpers/public.helper';
import {
  validateNotEmptyString,
  validateNotEmptyArray,
  validateLongitude,
  validateLatitude,
  validateNullableLongitude,
  validateNullableLatitude,
  validateEnum,
  validateMultipleFields,
  ValidationResult,
} from '../../common/helpers/validation.helper';
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

  /**
   * Validasi tambahan untuk data sites sebelum disimpan
   * Bisa digunakan untuk validasi business logic yang lebih kompleks
   */
  private validateSiteData(
    data: CreateSitesDto | UpdateSitesDto,
  ): ValidationResult {
    const validations: ValidationResult[] = [];

    // Validasi untuk create (semua field mandatory)
    if ('name' in data && data.name !== undefined) {
      validations.push(validateNotEmptyString(data.name, 'name'));
    }

    if ('location' in data && data.location !== undefined) {
      validations.push(validateNotEmptyString(data.location, 'location'));
    }

    if ('longitude' in data && data.longitude !== undefined) {
      validations.push(validateLongitude(data.longitude, 'longitude'));
    }

    if ('latitude' in data && data.latitude !== undefined) {
      validations.push(validateLatitude(data.latitude, 'latitude'));
    }

    // Validasi operator points jika ada
    if ('operator_point' in data && data.operator_point !== undefined) {
      validations.push(
        validateNotEmptyArray(data.operator_point, 'operator_point'),
      );

      // Validasi setiap operator point
      if (Array.isArray(data.operator_point)) {
        data.operator_point.forEach((op, index) => {
          validations.push(
            validateNotEmptyString(op.type, `operator_point[${index}].type`),
          );
          validations.push(
            validateNotEmptyString(op.name, `operator_point[${index}].name`),
          );

          // Longitude dan latitude nullable, gunakan helper functions khusus
          validations.push(
            validateNullableLongitude(
              op.longitude,
              `operator_point[${index}].longitude`,
            ),
          );
          validations.push(
            validateNullableLatitude(
              op.latitude,
              `operator_point[${index}].latitude`,
            ),
          );
        });
      }
    }

    return validateMultipleFields(validations);
  }

  /**
   * Validasi business logic khusus
   * Contoh: nama site tidak boleh duplikat
   */
  private async validateBusinessRules(
    data: CreateSitesDto | UpdateSitesDto,
    excludeId?: number,
  ): Promise<ValidationResult> {
    const errors: string[] = [];

    // Validasi nama site tidak boleh duplikat
    if ('name' in data && data.name !== undefined) {
      const existingSite = await this.sitesRepository.findOne({
        where: {
          name: data.name,
          ...(excludeId && { id: Not(excludeId) }),
        },
      });

      if (existingSite) {
        errors.push(`Nama site '${data.name}' sudah ada`);
      }
    }

    // Validasi koordinat tidak boleh sama dengan site lain
    if (
      'longitude' in data &&
      'latitude' in data &&
      data.longitude !== undefined &&
      data.latitude !== undefined
    ) {
      const existingSite = await this.sitesRepository.findOne({
        where: {
          longitude: data.longitude,
          latitude: data.latitude,
          ...(excludeId && { id: Not(excludeId) }),
        },
      });

      if (existingSite) {
        errors.push(
          `Koordinat (${data.longitude}, ${data.latitude}) sudah digunakan oleh site lain`,
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async findById(id: number): Promise<ApiResponse<SitesResponseDto | null>> {
    try {
      const result = await this.sitesRepository.findOne({
        where: { id },
        relations: ['operator_points'],
      });

      if (!result) {
        return emptyDataResponse('Site tidak ditemukan', null);
      }

      return successResponse(result as SitesResponseDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal mengambil data site');
    }
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

      // Validate limit
      if (limit > 100) {
        throwError('Limit tidak boleh lebih dari 100', 400);
      }

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
      const allowedSortFields = [
        'id',
        'name',
        'location',
        'longitude',
        'latitude',
        'createdAt',
        'updatedAt',
      ];
      const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'id';
      const validSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

      qb.orderBy(`site.${validSortBy}`, validSortOrder).skip(skip).take(limit);

      const [result, total] = await qb.getManyAndCount();

      // Transform result to DTO format
      const transformedResult = result.map((site) => ({
        id: site.id,
        name: site.name,
        location: site.location,
        longitude: site.longitude,
        latitude: site.latitude,
        createdAt: site.createdAt || new Date(),
        updatedAt: site.updatedAt || new Date(),
        operator_points:
          site.operator_points?.map((op) => ({
            id: op.id,
            sites_id: op.sites_id,
            type: op.type,
            name: op.name,
            longitude: op.longitude,
            latitude: op.latitude,
            createdAt: op.createdAt,
            updatedAt: op.updatedAt,
          })) || [],
      }));

      return paginateResponse(
        transformedResult,
        total,
        page,
        limit,
        'Data sites berhasil diambil',
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Gagal mengambil data sites');
    }
  }

  async create(data: CreateSitesDto): Promise<ApiResponse<SitesResponseDto>> {
    try {
      // Validasi tambahan menggunakan helper functions
      const validationResult = this.validateSiteData(data);
      if (!validationResult.isValid) {
        throwError(
          `Validasi gagal: ${validationResult.errors.join(', ')}`,
          400,
        );
      }

      // Validasi business rules
      const businessValidation = await this.validateBusinessRules(data);
      if (!businessValidation.isValid) {
        throwError(
          `Business rule validation gagal: ${businessValidation.errors.join(', ')}`,
          400,
        );
      }

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
        const operatorPoints = data.operator_point.map((op) =>
          this.operationPointsRepository.create({
            sites_id: savedSite.id,
            type: op.type,
            name: op.name,
            longitude: op.longitude,
            latitude: op.latitude,
          }),
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

      return successResponse(
        result as SitesResponseDto,
        'Site berhasil dibuat',
      );
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
  ): Promise<ApiResponse<SitesResponseDto | null>> {
    try {
      const site = await this.sitesRepository.findOne({ where: { id } });

      if (!site) {
        return emptyDataResponse('Site tidak ditemukan', null);
      }

      // Validasi tambahan menggunakan helper functions (hanya untuk field yang diisi)
      const validationResult = this.validateSiteData(updateDto);
      if (!validationResult.isValid) {
        throwError(
          `Validasi gagal: ${validationResult.errors.join(', ')}`,
          400,
        );
      }

      // Validasi business rules (exclude current site ID)
      const businessValidation = await this.validateBusinessRules(
        updateDto,
        id,
      );
      if (!businessValidation.isValid) {
        throwError(
          `Business rule validation gagal: ${businessValidation.errors.join(', ')}`,
          400,
        );
      }

      // Update site data
      const updatedSite = this.sitesRepository.merge(site, {
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
        const operatorPoints = updateDto.operator_point.map((op) =>
          this.operationPointsRepository.create({
            sites_id: id,
            type: op.type,
            name: op.name,
            longitude: op.longitude,
            latitude: op.latitude,
          }),
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

      return successResponse(
        result as SitesResponseDto,
        'Site berhasil diupdate',
      );
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
        return emptyDataResponse('Site tidak ditemukan', null);
      }

      // Soft delete the site (this will cascade to operator points due to foreign key constraint)
      await this.sitesRepository.softRemove(site);

      return successResponse(null, 'Site berhasil dihapus');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal menghapus site');
    }
  }
}
