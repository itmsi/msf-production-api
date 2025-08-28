import {
  Injectable,
  InternalServerErrorException,
  HttpException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { HaulingProblem } from './entities/hauling-problem.entity';
import { Activities } from '../activities/entities/activities.entity';
import { Sites } from '../sites/entities/sites.entity';
import {
  ApiResponse,
  successResponse,
  throwError,
  emptyDataResponse,
} from '../../common/helpers/response.helper';
import { paginateResponse } from '../../common/helpers/public.helper';
import {
  CreateHaulingProblemDto,
  UpdateHaulingProblemDto,
  HaulingProblemResponseDto,
  GetHaulingProblemQueryDto,
} from './dto';

@Injectable()
export class HaulingProblemService {
  constructor(
    @InjectRepository(HaulingProblem)
    private haulingProblemRepository: Repository<HaulingProblem>,
    @InjectRepository(Activities)
    private activitiesRepository: Repository<Activities>,
    @InjectRepository(Sites)
    private sitesRepository: Repository<Sites>,
  ) {}

  async create(data: CreateHaulingProblemDto): Promise<ApiResponse<HaulingProblemResponseDto>> {
    try {
      // Validasi activities_id exists
      const activity = await this.activitiesRepository.findOne({
        where: { id: data.activities_id },
      });
      if (!activity) {
        throw new BadRequestException(`Activities dengan ID ${data.activities_id} tidak ditemukan`);
      }

      // Validasi site_id exists
      const site = await this.sitesRepository.findOne({
        where: { id: data.site_id },
      });
      if (!site) {
        throw new BadRequestException(`Site dengan ID ${data.site_id} tidak ditemukan`);
      }

      // Validasi start < finish
      const startDate = new Date(data.start);
      const finishDate = new Date(data.finish);
      if (startDate >= finishDate) {
        throw new BadRequestException('Waktu start harus lebih awal dari waktu finish');
      }

      // Hitung duration dalam jam
      const durationMs = finishDate.getTime() - startDate.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);

      // Buat entity baru
      const haulingProblem = this.haulingProblemRepository.create({
        activityDate: new Date(data.activity_date),
        shift: data.shift,
        activitiesId: data.activities_id,
        start: startDate,
        finish: finishDate,
        duration: durationHours,
        siteId: data.site_id,
        remark: data.remark,
      });

      const saved = await this.haulingProblemRepository.save(haulingProblem);

      // Ambil data dengan join untuk response
      const result = await this.haulingProblemRepository
        .createQueryBuilder('hp')
        .leftJoinAndSelect('hp.activities', 'activities')
        .leftJoinAndSelect('hp.site', 'site')
        .where('hp.id = :id', { id: saved.id })
        .getOne();

      if (!result) {
        throw new InternalServerErrorException('Gagal mengambil data yang baru dibuat');
      }

      const response: HaulingProblemResponseDto = {
        id: result.id,
        activity_date: result.activityDate,
        shift: result.shift,
        activities_id: result.activitiesId,
        activities_name: result.activities?.name || '',
        start: result.start,
        finish: result.finish,
        duration: result.duration,
        site_id: result.siteId,
        site_name: result.site?.name || '',
        remark: result.remark,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };

      return successResponse(response, 'Data hauling problem berhasil dibuat', 201);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Gagal membuat data hauling problem');
    }
  }

  async findAll(query: GetHaulingProblemQueryDto): Promise<ApiResponse<HaulingProblemResponseDto[]>> {
    try {
      const page = parseInt(query.page?.toString() ?? '1', 10);
      const limit = parseInt(query.limit?.toString() ?? '10', 10);
      const skip = (page - 1) * limit;

      // Validate limit
      if (limit > 100) {
        throwError('Limit tidak boleh lebih dari 100', 400);
      }

      const qb = this.haulingProblemRepository
        .createQueryBuilder('hp')
        .leftJoinAndSelect('hp.activities', 'activities')
        .leftJoinAndSelect('hp.site', 'site')
        .where('hp.deletedAt IS NULL');

      // Filter berdasarkan activity_date
      if (query.activity_date) {
        const activityDate = new Date(query.activity_date);
        const nextDay = new Date(activityDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        qb.andWhere('hp.activityDate >= :startDate AND hp.activityDate < :endDate', {
          startDate: activityDate,
          endDate: nextDay,
        });
      }

      // Filter berdasarkan shift
      if (query.shift) {
        qb.andWhere('hp.shift = :shift', { shift: query.shift });
      }

      // Filter berdasarkan activities_id
      if (query.activities_id) {
        qb.andWhere('hp.activitiesId = :activitiesId', { activitiesId: query.activities_id });
      }

      // Filter berdasarkan site_id
      if (query.site_id) {
        qb.andWhere('hp.siteId = :siteId', { siteId: query.site_id });
      }

      // Search filter
      if (query.search) {
        const searchTerm = `%${query.search.toLowerCase()}%`;
        qb.andWhere(
          '(LOWER(activities.name) LIKE :search OR LOWER(site.name) LIKE :search OR LOWER(hp.remark) LIKE :search)',
          { search: searchTerm },
        );
      }

      // Sorting
      const allowedSortFields = ['id', 'activityDate', 'shift', 'start', 'finish', 'duration', 'createdAt', 'updatedAt'];
      const validSortBy = allowedSortFields.includes(query.sortBy || '') ? query.sortBy || 'id' : 'id';
      const validSortOrder = query.sortOrder === 'ASC' ? 'ASC' : 'DESC';

      qb.orderBy(`hp.${validSortBy}`, validSortOrder as 'ASC' | 'DESC');

      const [result, total] = await qb.skip(skip).take(limit).getManyAndCount();

      // Transform result to DTO format
      const transformedResult: HaulingProblemResponseDto[] = result.map((item) => ({
        id: item.id,
        activity_date: item.activityDate,
        shift: item.shift,
        activities_id: item.activitiesId,
        activities_name: item.activities?.name || '',
        start: item.start,
        finish: item.finish,
        duration: item.duration,
        site_id: item.siteId,
        site_name: item.site?.name || '',
        remark: item.remark,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));

      return paginateResponse(
        transformedResult,
        total,
        page,
        limit,
        'Data hauling problem berhasil diambil',
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Gagal mengambil data hauling problem');
    }
  }

  async findById(id: number): Promise<ApiResponse<HaulingProblemResponseDto | null>> {
    try {
      const result = await this.haulingProblemRepository
        .createQueryBuilder('hp')
        .leftJoinAndSelect('hp.activities', 'activities')
        .leftJoinAndSelect('hp.site', 'site')
        .where('hp.id = :id', { id })
        .andWhere('hp.deletedAt IS NULL')
        .getOne();

      if (!result) {
        return emptyDataResponse('Data hauling problem tidak ditemukan');
      }

      const response: HaulingProblemResponseDto = {
        id: result.id,
        activity_date: result.activityDate,
        shift: result.shift,
        activities_id: result.activitiesId,
        activities_name: result.activities?.name || '',
        start: result.start,
        finish: result.finish,
        duration: result.duration,
        site_id: result.siteId,
        site_name: result.site?.name || '',
        remark: result.remark,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };

      return successResponse(response, 'Data hauling problem berhasil diambil');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Gagal mengambil data hauling problem');
    }
  }

  async update(id: number, data: UpdateHaulingProblemDto): Promise<ApiResponse<HaulingProblemResponseDto>> {
    try {
      // Cek apakah data exists
      const existing = await this.haulingProblemRepository.findOne({
        where: { id },
      });
      if (!existing) {
        throw new NotFoundException(`Data hauling problem dengan ID ${id} tidak ditemukan`);
      }

      // Validasi activities_id exists jika diupdate
      if (data.activities_id) {
        const activity = await this.activitiesRepository.findOne({
          where: { id: data.activities_id },
        });
        if (!activity) {
          throw new BadRequestException(`Activities dengan ID ${data.activities_id} tidak ditemukan`);
        }
      }

      // Validasi site_id exists jika diupdate
      if (data.site_id) {
        const site = await this.sitesRepository.findOne({
          where: { id: data.site_id },
        });
        if (!site) {
          throw new BadRequestException(`Site dengan ID ${data.site_id} tidak ditemukan`);
        }
      }

      // Validasi start < finish jika diupdate
      if (data.start && data.finish) {
        const startDate = new Date(data.start);
        const finishDate = new Date(data.finish);
        if (startDate >= finishDate) {
          throw new BadRequestException('Waktu start harus lebih awal dari waktu finish');
        }
      }

      // Update data
      const updateData: any = {};
      if (data.activity_date) updateData.activityDate = new Date(data.activity_date);
      if (data.shift) updateData.shift = data.shift;
      if (data.activities_id) updateData.activitiesId = data.activities_id;
      if (data.start) updateData.start = new Date(data.start);
      if (data.finish) updateData.finish = new Date(data.finish);
      if (data.site_id) updateData.siteId = data.site_id;
      if (data.remark !== undefined) updateData.remark = data.remark;

      // Hitung ulang duration jika start atau finish diupdate
      if (data.start || data.finish) {
        const startDate = data.start ? new Date(data.start) : existing.start;
        const finishDate = data.finish ? new Date(data.finish) : existing.finish;
        const durationMs = finishDate.getTime() - startDate.getTime();
        updateData.duration = durationMs / (1000 * 60 * 60);
      }

      await this.haulingProblemRepository.update(id, updateData);

      // Ambil data yang sudah diupdate
      const result = await this.haulingProblemRepository
        .createQueryBuilder('hp')
        .leftJoinAndSelect('hp.activities', 'activities')
        .leftJoinAndSelect('hp.site', 'site')
        .where('hp.id = :id', { id })
        .getOne();

      if (!result) {
        throw new InternalServerErrorException('Gagal mengambil data yang sudah diupdate');
      }

      const response: HaulingProblemResponseDto = {
        id: result.id,
        activity_date: result.activityDate,
        shift: result.shift,
        activities_id: result.activitiesId,
        activities_name: result.activities?.name || '',
        start: result.start,
        finish: result.finish,
        duration: result.duration,
        site_id: result.siteId,
        site_name: result.site?.name || '',
        remark: result.remark,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };

      return successResponse(response, 'Data hauling problem berhasil diupdate');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Gagal mengupdate data hauling problem');
    }
  }

  async delete(id: number): Promise<ApiResponse<null>> {
    try {
      // Cek apakah data exists
      const existing = await this.haulingProblemRepository.findOne({
        where: { id },
      });
      if (!existing) {
        throw new NotFoundException(`Data hauling problem dengan ID ${id} tidak ditemukan`);
      }

      // Soft delete
      await this.haulingProblemRepository.softDelete(id);

      return successResponse(null, 'Data hauling problem berhasil dihapus');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Gagal menghapus data hauling problem');
    }
  }
}
