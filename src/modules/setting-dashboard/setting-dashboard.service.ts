import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettingDashboard } from './entities/setting-dashboard.entity';
import { CreateSettingDashboardDto, UpdateSettingDashboardDto } from './dto/setting-dashboard.dto';
import { successResponse, emptyDataResponse, successResponseWithMeta } from '../../common/helpers/response.helper';

@Injectable()
export class SettingDashboardService {
  constructor(
    @InjectRepository(SettingDashboard)
    private readonly settingDashboardRepository: Repository<SettingDashboard>,
  ) {}

  async create(createSettingDashboardDto: CreateSettingDashboardDto) {
    const settingDashboard = this.settingDashboardRepository.create(createSettingDashboardDto);
    const result = await this.settingDashboardRepository.save(settingDashboard);
    return successResponse(result, 'Setting dashboard berhasil dibuat', 201);
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.settingDashboardRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    if (data.length === 0) {
      return emptyDataResponse('Data setting dashboard tidak ditemukan', []);
    }

    return successResponseWithMeta(data, 'Data setting dashboard berhasil diambil', 200, { total, page, limit });
  }

  async findOne(id: number) {
    const settingDashboard = await this.settingDashboardRepository.findOne({
      where: { id },
    });

    if (!settingDashboard) {
      throw new NotFoundException('Setting dashboard tidak ditemukan');
    }

    return successResponse(settingDashboard, 'Data setting dashboard berhasil diambil');
  }

  async update(id: number, updateSettingDashboardDto: UpdateSettingDashboardDto) {
    const settingDashboard = await this.settingDashboardRepository.findOne({
      where: { id },
    });

    if (!settingDashboard) {
      throw new NotFoundException('Setting dashboard tidak ditemukan');
    }

    Object.assign(settingDashboard, updateSettingDashboardDto);
    const result = await this.settingDashboardRepository.save(settingDashboard);

    return successResponse(result, 'Setting dashboard berhasil diupdate');
  }

  async remove(id: number) {
    const settingDashboard = await this.settingDashboardRepository.findOne({
      where: { id },
    });

    if (!settingDashboard) {
      throw new NotFoundException('Setting dashboard tidak ditemukan');
    }

    await this.settingDashboardRepository.softDelete(id);

    return successResponse(null, 'Setting dashboard berhasil dihapus');
  }
}
