import {
  Injectable,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UnitType } from './entities/unit-type.entity';
import { Repository, Not } from 'typeorm';
import {
  ApiResponse,
  successResponse,
  throwError,
  emptyDataResponse,
} from '../../common/helpers/response.helper';
import { paginateResponse } from '../../common/helpers/public.helper';
import {
  CreateUnitTypeDto,
  UnitTypeResponseDto,
  GetUnitTypesQueryDto,
  UpdateUnitTypeDto,
} from './dto/unit-type.dto';

@Injectable()
export class UnitTypeService {
  constructor(
    @InjectRepository(UnitType)
    private unitTypeRepository: Repository<UnitType>,
  ) {}

  async findById(id: number): Promise<ApiResponse<UnitTypeResponseDto | null>> {
    try {
      const result = await this.unitTypeRepository.findOne({
        where: { id },
        relations: ['brand'],
      });

      if (!result) {
        return emptyDataResponse('Unit type tidak ditemukan', null);
      }

      const response: UnitTypeResponseDto = {
        id: result.id,
        brand_id: result.brand_id,
        unit_name: result.unit_name,
        type_name: result.type_name,
        model_name: result.model_name,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        brand: result.brand
          ? {
              id: result.brand.id,
              brand_name: result.brand.brand_name,
            }
          : undefined,
      };

      return successResponse(response);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal mengambil data unit type');
    }
  }

  async findAll(
    query: GetUnitTypesQueryDto,
  ): Promise<ApiResponse<UnitTypeResponseDto[]>> {
    try {
      const page = parseInt(query.page ?? '1', 10);
      const limit = parseInt(query.limit ?? '10', 10);
      const skip = (page - 1) * limit;
      const search = query.search?.toLowerCase() ?? '';
      const brandId = query.brand_id ? parseInt(query.brand_id, 10) : undefined;
      const unitName = query.unit_name?.toLowerCase() ?? '';
      const typeName = query.type_name?.toLowerCase() ?? '';
      const modelName = query.model_name?.toLowerCase() ?? '';
      const sortBy = query.sortBy ?? 'id';
      const sortOrder = query.sortOrder ?? 'DESC';

      const qb = this.unitTypeRepository
        .createQueryBuilder('unitType')
        .leftJoinAndSelect('unitType.brand', 'brand')
        .where('unitType.deletedAt IS NULL'); // Exclude soft deleted records

      // Search filter (mencari di semua field yang relevan)
      if (search) {
        qb.andWhere(
          '(unitType.unit_name ILIKE :search OR unitType.type_name ILIKE :search OR unitType.model_name ILIKE :search OR brand.brand_name ILIKE :search)',
          { search: `%${search}%` },
        );
      }

      // Filter by brand_id
      if (brandId) {
        qb.andWhere('unitType.brand_id = :brandId', { brandId });
      }

      // Filter by unit_name
      if (unitName) {
        qb.andWhere('unitType.unit_name ILIKE :unitName', {
          unitName: `%${unitName}%`,
        });
      }

      // Filter by type_name
      if (typeName) {
        qb.andWhere('unitType.type_name ILIKE :typeName', {
          typeName: `%${typeName}%`,
        });
      }

      // Filter by model_name
      if (modelName) {
        qb.andWhere('unitType.model_name ILIKE :modelName', {
          modelName: `%${modelName}%`,
        });
      }

      // Validate sortBy field to prevent SQL injection
      const allowedSortFields = [
        'id',
        'brand_id',
        'unit_name',
        'type_name',
        'model_name',
        'createdAt',
        'updatedAt',
      ];
      const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'id';
      const validSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

      qb.orderBy(`unitType.${validSortBy}`, validSortOrder)
        .skip(skip)
        .take(limit);

      const [result, total] = await qb.getManyAndCount();

      // Transform result to DTO format
      const transformedResult = result.map((unitType) => ({
        id: unitType.id,
        brand_id: unitType.brand_id,
        unit_name: unitType.unit_name,
        type_name: unitType.type_name,
        model_name: unitType.model_name,
        createdAt: unitType.createdAt,
        updatedAt: unitType.updatedAt,
        brand: unitType.brand
          ? {
              id: unitType.brand.id,
              brand_name: unitType.brand.brand_name,
            }
          : undefined,
      }));

      const response = paginateResponse(
        transformedResult,
        total,
        page,
        limit,
        'Data unit type berhasil diambil',
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
      throw new InternalServerErrorException('Gagal mengambil data unit type');
    }
  }

  async create(
    data: CreateUnitTypeDto,
  ): Promise<ApiResponse<UnitTypeResponseDto>> {
    try {
      // Check if combination already exists
      const existing = await this.unitTypeRepository.findOne({
        where: {
          brand_id: data.brand_id,
          unit_name: data.unit_name,
          type_name: data.type_name,
          model_name: data.model_name,
        },
      });

      if (existing) {
        throwError(
          'Unit type dengan kombinasi brand, unit, type, dan model yang sama sudah terdaftar',
          409,
        );
      }

      const newUnitType = this.unitTypeRepository.create(data);
      const result = await this.unitTypeRepository.save(newUnitType);

      // Fetch with brand relation for response
      const savedUnitType = await this.unitTypeRepository.findOne({
        where: { id: result.id },
        relations: ['brand'],
      });

      const response: UnitTypeResponseDto = {
        id: savedUnitType!.id,
        brand_id: savedUnitType!.brand_id,
        unit_name: savedUnitType!.unit_name,
        type_name: savedUnitType!.type_name,
        model_name: savedUnitType!.model_name,
        createdAt: savedUnitType!.createdAt,
        updatedAt: savedUnitType!.updatedAt,
        brand: savedUnitType!.brand
          ? {
              id: savedUnitType!.brand.id,
              brand_name: savedUnitType!.brand.brand_name,
            }
          : undefined,
      };

      return successResponse(response, 'Unit type berhasil dibuat');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal membuat unit type');
    }
  }

  async update(
    id: number,
    updateDto: UpdateUnitTypeDto,
  ): Promise<ApiResponse<UnitTypeResponseDto | null>> {
    try {
      const unitType = await this.unitTypeRepository.findOne({
        where: { id },
        relations: ['brand'],
      });

      if (!unitType) {
        return emptyDataResponse('Unit type tidak ditemukan', null);
      }

      // Check if combination already exists for other unit types
      if (
        updateDto.brand_id ||
        updateDto.unit_name ||
        updateDto.type_name ||
        updateDto.model_name
      ) {
        const existingUnitType = await this.unitTypeRepository.findOne({
          where: {
            brand_id: updateDto.brand_id ?? unitType.brand_id,
            unit_name: updateDto.unit_name ?? unitType.unit_name,
            type_name: updateDto.type_name ?? unitType.type_name,
            model_name: updateDto.model_name ?? unitType.model_name,
            id: Not(id),
          },
        });

        if (existingUnitType) {
          throwError(
            'Unit type dengan kombinasi brand, unit, type, dan model yang sama sudah digunakan oleh unit type lain',
            409,
          );
        }
      }

      const updatedUnitType = this.unitTypeRepository.merge(
        unitType,
        updateDto,
      );
      const result = await this.unitTypeRepository.save(updatedUnitType);

      // Fetch updated data with brand relation
      const updatedData = await this.unitTypeRepository.findOne({
        where: { id: result.id },
        relations: ['brand'],
      });

      const response: UnitTypeResponseDto = {
        id: updatedData!.id,
        brand_id: updatedData!.brand_id,
        unit_name: updatedData!.unit_name,
        type_name: updatedData!.type_name,
        model_name: updatedData!.model_name,
        createdAt: updatedData!.createdAt,
        updatedAt: updatedData!.updatedAt,
        brand: updatedData!.brand
          ? {
              id: updatedData!.brand.id,
              brand_name: updatedData!.brand.brand_name,
            }
          : undefined,
      };

      return successResponse(response, 'Unit type berhasil diupdate');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal mengupdate unit type');
    }
  }

  async remove(id: number): Promise<ApiResponse<null>> {
    try {
      const unitType = await this.unitTypeRepository.findOne({ where: { id } });

      if (!unitType) {
        return emptyDataResponse('Unit type tidak ditemukan', null);
      }

      await this.unitTypeRepository.softRemove(unitType);

      return successResponse(null, 'Unit type berhasil dihapus');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal menghapus unit type');
    }
  }
}
