import {
  Injectable,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { Repository, Not } from 'typeorm';
import {
  ApiResponse,
  successResponse,
  throwError,
  emptyDataResponse,
} from '../../common/helpers/response.helper';
import { paginateResponse } from '../../common/helpers/public.helper';
import {
  CreateBrandDto,
  BrandResponseDto,
  GetBrandsQueryDto,
  UpdateBrandDto,
} from './dto/brand.dto';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
  ) {}

  async findById(id: number): Promise<ApiResponse<BrandResponseDto | null>> {
    try {
      const result = await this.brandRepository.findOne({
        where: { id },
      });
      
      if (!result) {
        return emptyDataResponse('Brand tidak ditemukan', null);
      }
      
      return successResponse(result as BrandResponseDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal mengambil data brand');
    }
  }

  async findAll(
    query: GetBrandsQueryDto,
  ): Promise<ApiResponse<BrandResponseDto[]>> {
    try {
      const page = parseInt(query.page ?? '1', 10);
      const limit = parseInt(query.limit ?? '10', 10);
      const skip = (page - 1) * limit;
      const search = query.search?.toLowerCase() ?? '';
      const brandName = query.brand_name?.toLowerCase() ?? '';
      const sortBy = query.sortBy ?? 'id';
      const sortOrder = query.sortOrder ?? 'DESC';

      const qb = this.brandRepository
        .createQueryBuilder('brand')
        .where('brand.deletedAt IS NULL'); // Exclude soft deleted records

      // Search filter (mencari di semua field yang relevan)
      if (search) {
        qb.andWhere('brand.brand_name ILIKE :search', {
          search: `%${search}%`,
        });
      }

      // Filter by brand_name (exact match atau partial match)
      if (brandName) {
        qb.andWhere('brand.brand_name ILIKE :brandName', {
          brandName: `%${brandName}%`,
        });
      }

      // Validate sortBy field to prevent SQL injection
      const allowedSortFields = ['id', 'brand_name', 'createdAt', 'updatedAt'];
      const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'id';
      const validSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

      qb.orderBy(`brand.${validSortBy}`, validSortOrder)
        .skip(skip)
        .take(limit);

      const [result, total] = await qb.getManyAndCount();

      // Transform result to DTO format without using plainToInstance
      const transformedResult = result.map(brand => ({
        id: brand.id,
        brand_name: brand.brand_name,
        createdAt: brand.createdAt,
        updatedAt: brand.updatedAt
      }));

      const response = paginateResponse(
        transformedResult,
        total,
        page,
        limit,
        'Data brand berhasil diambil',
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
      throw new InternalServerErrorException('Gagal mengambil data brand');
    }
  }

  async create(data: CreateBrandDto): Promise<ApiResponse<BrandResponseDto>> {
    try {
      const existing = await this.brandRepository.findOne({
        where: { brand_name: data.brand_name },
      });
      
      if (existing) {
        throwError('Brand name sudah terdaftar', 409);
      }

      const newBrand = this.brandRepository.create(data);
      const result = await this.brandRepository.save(newBrand);
      
      return successResponse(result, 'Brand berhasil dibuat');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal membuat brand');
    }
  }

  async update(
    id: number,
    updateDto: UpdateBrandDto,
  ): Promise<ApiResponse<BrandResponseDto | null>> {
    try {
      const brand = await this.brandRepository.findOne({ where: { id } });

      if (!brand) {
        return emptyDataResponse('Brand tidak ditemukan', null);
      }

      // Check if brand_name already exists for other brands
      if (updateDto.brand_name) {
        const existingBrand = await this.brandRepository.findOne({
          where: {
            brand_name: updateDto.brand_name,
            id: Not(id),
          },
        });
        
        if (existingBrand) {
          throwError(
            `Brand name ${updateDto.brand_name} sudah digunakan oleh brand lain`,
            409,
          );
        }
      }

      const updatedBrand = this.brandRepository.merge(brand, updateDto);
      const result = await this.brandRepository.save(updatedBrand);
      
      return successResponse(result, 'Brand berhasil diupdate');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal mengupdate brand');
    }
  }

  async remove(id: number): Promise<ApiResponse<null>> {
    try {
      const brand = await this.brandRepository.findOne({ where: { id } });

      if (!brand) {
        return emptyDataResponse('Brand tidak ditemukan', null);
      }
      
      await this.brandRepository.softRemove(brand);

      return successResponse(null, 'Brand berhasil dihapus');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal menghapus brand');
    }
  }
}
