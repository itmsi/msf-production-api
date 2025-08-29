import {
  Injectable,
  InternalServerErrorException,
  HttpException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, SelectQueryBuilder } from 'typeorm';
import { BargingList } from './entities/barging-list.entity';
import { Population } from '../population/entities/population.entity';
import { Barge } from '../barge/entities/barge.entity';
import {
  ApiResponse,
  successResponse,
  throwError,
  emptyDataResponse,
} from '../../common/helpers/response.helper';
import { paginateResponse } from '../../common/helpers/public.helper';
import {
  CreateBargingListDto,
  UpdateBargingListDto,
  BargingListResponseDto,
  GetBargingListQueryDto,
} from './dto';

@Injectable()
export class BargingListService {
  constructor(
    @InjectRepository(BargingList)
    private bargingListRepository: Repository<BargingList>,
    @InjectRepository(Population)
    private populationRepository: Repository<Population>,
    @InjectRepository(Barge)
    private bargeRepository: Repository<Barge>,
  ) {}

  /**
   * Validasi unit_hauler_id ada di tabel m_population
   */
  private async validateUnitHaulerId(unitHaulerId: number): Promise<void> {
    const population = await this.populationRepository.findOne({
      where: { id: unitHaulerId, deletedAt: undefined },
    });

    if (!population) {
      throwError(`Unit hauler dengan ID ${unitHaulerId} tidak ditemukan di tabel m_population`, 400);
    }
  }

  /**
   * Validasi barge_id ada di tabel m_barge
   */
  private async validateBargeId(bargeId: number): Promise<void> {
    const barge = await this.bargeRepository.findOne({
      where: { id: bargeId, deletedAt: undefined },
    });

    if (!barge) {
      throwError(`Barge dengan ID ${bargeId} tidak ditemukan di tabel m_barge`, 400);
    }
  }

  /**
   * Transform response untuk include unit_hauler_name dan barge_name
   */
  private transformResponse(bargingList: BargingList): BargingListResponseDto {
    // Pastikan activityDate dan time adalah Date object
    const activityDate = bargingList.activityDate instanceof Date 
      ? bargingList.activityDate.toISOString().split('T')[0]
      : new Date(bargingList.activityDate).toISOString().split('T')[0];
    
    const time = bargingList.time instanceof Date 
      ? bargingList.time.toISOString()
      : new Date(bargingList.time).toISOString();

    // Hitung time range dari time
    const timeRange = this.calculateTimeRange(bargingList.time);

    return {
      id: bargingList.id,
      activity_date: activityDate,
      shift: bargingList.shift,
      time: time,
      time_range: timeRange,
      unit_hauler_id: bargingList.unitHaulerId,
      unit_hauler_name: bargingList.unitHauler?.no_unit || '',
      barge_id: bargingList.bargeId,
      barge_name: bargingList.barge?.name || '',
      vessel: bargingList.vessel,
      total_tonnage: bargingList.totalTonnage,
      createdAt: bargingList.createdAt,
      updatedAt: bargingList.updatedAt,
    };
  }

  /**
   * Buat query builder dengan join ke tabel terkait
   */
  private createQueryBuilder(): SelectQueryBuilder<BargingList> {
    return this.bargingListRepository
      .createQueryBuilder('barging')
      .leftJoinAndSelect('barging.unitHauler', 'unitHauler')
      .leftJoinAndSelect('barging.barge', 'barge')
      .where('barging.deletedAt IS NULL');
  }

  /**
   * Hitung time range dari time dengan format HH-HH
   */
  private calculateTimeRange(time: Date): string {
    // Gunakan UTC time untuk menghindari masalah timezone
    const hours = time.getUTCHours();
    const nextHour = hours + 1;
    
    // Format: HH-HH (contoh: 08-09, 14-15)
    const currentHour = hours.toString().padStart(2, '0');
    const nextHourStr = nextHour.toString().padStart(2, '0');
    
    return `${currentHour}-${nextHourStr}`;
  }

  /**
   * Test endpoint untuk cek data yang tersedia
   */
  async testData() {
    try {
      // Cek data population
      const populations = await this.populationRepository.find({
        where: { deletedAt: undefined },
        take: 10,
      });

      // Cek data barge
      const barges = await this.bargeRepository.find({
        where: { deletedAt: undefined },
        take: 10,
      });

      return {
        populations: populations.map(p => ({ id: p.id, no_unit: p.no_unit })),
        barges: barges.map(b => ({ id: b.id, name: b.name })),
        message: 'Data test berhasil diambil'
      };
    } catch (error) {
      console.error('Error in testData method:', error);
      throw new InternalServerErrorException(`Gagal mengambil data test: ${error.message}`);
    }
  }

  async create(createDto: CreateBargingListDto): Promise<ApiResponse<BargingListResponseDto>> {
    try {
      console.log('Creating barging list with data:', createDto);
      
      // Validasi unit_hauler_id
      await this.validateUnitHaulerId(createDto.unit_hauler_id);
      console.log('Unit hauler validation passed');

      // Validasi barge_id
      await this.validateBargeId(createDto.barge_id);
      console.log('Barge validation passed');

      // Hitung total_tonnage (vessel * 40)
      const totalTonnage = createDto.vessel * 40;
      console.log('Calculated total tonnage:', totalTonnage);

      // Buat entity baru
      const newBargingList = this.bargingListRepository.create({
        activityDate: new Date(createDto.activity_date),
        shift: createDto.shift,
        time: new Date(createDto.time),
        unitHaulerId: createDto.unit_hauler_id,
        bargeId: createDto.barge_id,
        vessel: createDto.vessel,
        totalTonnage,
      });

      console.log('Created entity:', newBargingList);

      const result = await this.bargingListRepository.save(newBargingList);
      console.log('Saved result:', result);

      // Ambil data lengkap dengan relasi
      const savedBargingList = await this.bargingListRepository.findOne({
        where: { id: result.id },
        relations: ['unitHauler', 'barge'],
      });

      console.log('Retrieved saved data:', savedBargingList);

      if (!savedBargingList) {
        throwError('Gagal mengambil data barging list yang baru dibuat', 500);
      }

      const response = this.transformResponse(savedBargingList!);
      console.log('Transformed response:', response);

      return successResponse(
        response,
        'Barging list berhasil dibuat',
        201,
      );
    } catch (error) {
      console.error('Error in create method:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Gagal membuat barging list: ${error.message}`);
    }
  }

  async findAll(query: GetBargingListQueryDto): Promise<ApiResponse<BargingListResponseDto[]>> {
    try {
      const page = parseInt(query.page?.toString() ?? '1', 10);
      const limit = parseInt(query.limit?.toString() ?? '10', 10);
      const skip = (page - 1) * limit;
      const search = query.search?.toLowerCase() ?? '';
      const shift = query.shift;
      const unitHaulerId = query.unit_hauler_id;
      const bargeId = query.barge_id;
      const dateFrom = query.date_from;
      const dateTo = query.date_to;
      const sortBy = query.sortBy ?? 'id';
      const sortOrder = query.sortOrder ?? 'DESC';

      const qb = this.createQueryBuilder();

      // Filter berdasarkan search
      if (search) {
        qb.andWhere(
          '(LOWER(unitHauler.no_unit) LIKE :search OR LOWER(barge.name) LIKE :search)',
          { search: `%${search}%` },
        );
      }

      // Filter berdasarkan shift
      if (shift) {
        qb.andWhere('barging.shift = :shift', { shift });
      }

      // Filter berdasarkan unit hauler ID
      if (unitHaulerId) {
        qb.andWhere('barging.unitHaulerId = :unitHaulerId', { unitHaulerId });
      }

      // Filter berdasarkan barge ID
      if (bargeId) {
        qb.andWhere('barging.bargeId = :bargeId', { bargeId });
      }

      // Filter berdasarkan tanggal
      if (dateFrom && dateTo) {
        qb.andWhere('barging.activityDate BETWEEN :dateFrom AND :dateTo', {
          dateFrom,
          dateTo,
        });
      } else if (dateFrom) {
        qb.andWhere('barging.activityDate >= :dateFrom', { dateFrom });
      } else if (dateTo) {
        qb.andWhere('barging.activityDate <= :dateTo', { dateTo });
      }

      // Sorting
      qb.orderBy(`barging.${sortBy}`, sortOrder);

      // Pagination
      const total = await qb.getCount();
      const data = await qb.skip(skip).take(limit).getMany();

      // Transform response
      const transformedData = data.map((item) => this.transformResponse(item));

      return paginateResponse(transformedData, total, page, limit, 'Data barging list berhasil diambil');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal mengambil data barging list');
    }
  }

  async findOne(id: number): Promise<ApiResponse<BargingListResponseDto | null>> {
    try {
      const bargingList = await this.bargingListRepository.findOne({
        where: { id, deletedAt: undefined },
        relations: ['unitHauler', 'barge'],
      });

      if (!bargingList) {
        return emptyDataResponse('Barging list tidak ditemukan');
      }

      return successResponse(
        this.transformResponse(bargingList),
        'Data barging list berhasil diambil',
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal mengambil data barging list');
    }
  }

  async update(
    id: number,
    updateDto: UpdateBargingListDto,
  ): Promise<ApiResponse<BargingListResponseDto | null>> {
    try {
      // Cek apakah data exists
      const existingBargingList = await this.bargingListRepository.findOne({
        where: { id, deletedAt: undefined },
      });

      if (!existingBargingList) {
        throwError('Barging list tidak ditemukan', 404);
      }

      // Validasi unit_hauler_id jika diupdate
      if (updateDto.unit_hauler_id) {
        await this.validateUnitHaulerId(updateDto.unit_hauler_id);
      }

      // Validasi barge_id jika diupdate
      if (updateDto.barge_id) {
        await this.validateBargeId(updateDto.barge_id);
      }

      // Update data
      const updateData: any = {};

      if (updateDto.activity_date) {
        updateData.activityDate = new Date(updateDto.activity_date);
      }

      if (updateDto.shift) {
        updateData.shift = updateDto.shift;
      }

      if (updateDto.time) {
        updateData.time = new Date(updateDto.time);
      }

      if (updateDto.unit_hauler_id) {
        updateData.unitHaulerId = updateDto.unit_hauler_id;
      }

      if (updateDto.barge_id) {
        updateData.bargeId = updateDto.barge_id;
      }

      if (updateDto.vessel) {
        updateData.vessel = updateDto.vessel;
        // Update total_tonnage jika vessel berubah
        updateData.totalTonnage = updateDto.vessel * 40;
      }

      await this.bargingListRepository.update(id, updateData);

      // Ambil data yang sudah diupdate
      const updatedBargingList = await this.bargingListRepository.findOne({
        where: { id },
        relations: ['unitHauler', 'barge'],
      });

      if (!updatedBargingList) {
        throwError('Gagal mengambil data barging list yang sudah diupdate', 500);
      }

      return successResponse(
        this.transformResponse(updatedBargingList!),
        'Barging list berhasil diupdate',
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal mengupdate barging list');
    }
  }

  async remove(id: number): Promise<ApiResponse<null>> {
    try {
      // Cek apakah data exists
      const existingBargingList = await this.bargingListRepository.findOne({
        where: { id, deletedAt: undefined },
      });

      if (!existingBargingList) {
        throwError('Barging list tidak ditemukan', 404);
      }

      // Soft delete
      await this.bargingListRepository.softDelete(id);

      return successResponse(null, 'Barging list berhasil dihapus');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Gagal menghapus barging list');
    }
  }
}
