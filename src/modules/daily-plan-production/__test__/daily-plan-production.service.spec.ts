import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyPlanProductionService } from '../daily-plan-production.service';
import { DailyPlanProduction } from '../entities/daily-plan-production.entity';
import { CreateDailyPlanProductionDto } from '../dto/daily-plan-production.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('DailyPlanProductionService', () => {
  let service: DailyPlanProductionService;
  let repository: Repository<DailyPlanProduction>;

  const mockRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailyPlanProductionService,
        {
          provide: getRepositoryToken(DailyPlanProduction),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DailyPlanProductionService>(DailyPlanProductionService);
    repository = module.get<Repository<DailyPlanProduction>>(
      getRepositoryToken(DailyPlanProduction),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create daily plan production successfully', async () => {
      const createDto: CreateDailyPlanProductionDto = {
        plan_date: '2025-01-01',
        average_day_ewh: 1.5,
        average_shift_ewh: 0.75,
        ob_target: 1000,
        ore_target: 800,
        quarry: 200,
        ore_shipment_target: 750,
        total_fleet: 15,
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.save.mockResolvedValue({
        id: 1,
        ...createDto,
        plan_date: new Date(createDto.plan_date),
        sr_target: 1.25,
        daily_old_stock: 0,
        shift_ob_target: 500,
        shift_ore_target: 400,
        shift_quarrt: 100,
        shift_sr_target: 1.25,
        remaining_stock: 0,
        is_calender_day: true,
        is_holiday_day: false,
        is_available_day: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(createDto);

      expect(result.message).toBe('Daily plan production berhasil dibuat');
      expect(result.data).toBeDefined();
      expect(result.data.sr_target).toBe(1.25);
    });

    it('should throw error if plan_date already exists', async () => {
      const createDto: CreateDailyPlanProductionDto = {
        plan_date: '2025-01-01',
        average_day_ewh: 1.5,
        average_shift_ewh: 0.75,
        ob_target: 1000,
        ore_target: 800,
        quarry: 200,
        ore_shipment_target: 750,
        total_fleet: 15,
      };

      mockRepository.findOne.mockResolvedValue({ id: 1 });

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const mockData = [
        {
          id: 1,
          plan_date: new Date('2025-01-01'),
          ob_target: 1000,
          ore_target: 800,
        },
      ];

      mockRepository.findAndCount.mockResolvedValue([mockData, 1]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.message).toBe('Data daily plan production berhasil diambil');
      expect(result.data.pagination.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return daily plan production by id', async () => {
      const mockData = {
        id: 1,
        plan_date: new Date('2025-01-01'),
        ob_target: 1000,
        ore_target: 800,
      };

      mockRepository.findOne.mockResolvedValue(mockData);

      const result = await service.findOne(1);

      expect(result.message).toBe('Data daily plan production berhasil diambil');
      expect(result.data.id).toBe(1);
    });

    it('should throw error if not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update daily plan production successfully', async () => {
      const existingData = {
        id: 1,
        plan_date: new Date('2025-01-01'),
        ob_target: 1000,
        ore_target: 800,
        quarry: 200,
        ore_shipment_target: 750,
        daily_old_stock: 0,
        remaining_stock: 0,
      };

      mockRepository.findOne.mockResolvedValue(existingData);
      mockRepository.save.mockResolvedValue({
        ...existingData,
        ob_target: 1200,
        sr_target: 1.5,
        shift_ob_target: 600,
        shift_ore_target: 400,
        shift_sr_target: 1.5,
        remaining_stock: 450,
      });

      const result = await service.update(1, { ob_target: 1200 });

      expect(result.message).toBe('Daily plan production berhasil diupdate');
      expect(result.data.ob_target).toBe(1200);
    });
  });

  describe('remove', () => {
    it('should remove daily plan production successfully', async () => {
      const existingData = {
        id: 1,
        plan_date: new Date('2025-01-01'),
      };

      mockRepository.findOne.mockResolvedValue(existingData);
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(result.message).toBe('Daily plan production berhasil dihapus');
    });

    it('should throw error if not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
