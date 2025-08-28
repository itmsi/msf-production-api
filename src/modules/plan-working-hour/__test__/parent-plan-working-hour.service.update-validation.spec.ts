import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { ParentPlanWorkingHourService } from '../parent-plan-working-hour.service';
import { ParentPlanWorkingHour } from '../entities/parent-plan-working-hour.entity';
import { PlanWorkingHour } from '../entities/plan-working-hour.entity';
import { PlanWorkingHourDetail } from '../entities/plan-working-hour-detail.entity';
import { UpdateParentPlanWorkingHourSimpleDto } from '../dto/parent-plan-working-hour.dto';

describe('ParentPlanWorkingHourService - Update Validation Tests', () => {
  let service: ParentPlanWorkingHourService;
  let parentPlanWorkingHourRepository: Repository<ParentPlanWorkingHour>;
  let planWorkingHourRepository: Repository<PlanWorkingHour>;
  let planWorkingHourDetailRepository: Repository<PlanWorkingHourDetail>;
  let dataSource: DataSource;

  const mockDataSource = {
    createQueryRunner: jest.fn(() => ({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        save: jest.fn(),
        find: jest.fn(),
        delete: jest.fn(),
      },
    })),
  };

  const mockParentPlanWorkingHourRepository = {
    create: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      findOne: jest.fn(),
    })),
  };

  const mockPlanWorkingHourRepository = {
    create: jest.fn(),
  };

  const mockPlanWorkingHourDetailRepository = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParentPlanWorkingHourService,
        {
          provide: getRepositoryToken(ParentPlanWorkingHour),
          useValue: mockParentPlanWorkingHourRepository,
        },
        {
          provide: getRepositoryToken(PlanWorkingHour),
          useValue: mockPlanWorkingHourRepository,
        },
        {
          provide: getRepositoryToken(PlanWorkingHourDetail),
          useValue: mockPlanWorkingHourDetailRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ParentPlanWorkingHourService>(ParentPlanWorkingHourService);
    parentPlanWorkingHourRepository = module.get<Repository<ParentPlanWorkingHour>>(
      getRepositoryToken(ParentPlanWorkingHour),
    );
    planWorkingHourRepository = module.get<Repository<PlanWorkingHour>>(
      getRepositoryToken(PlanWorkingHour),
    );
    planWorkingHourDetailRepository = module.get<Repository<PlanWorkingHourDetail>>(
      getRepositoryToken(PlanWorkingHourDetail),
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('update - Validation Tests', () => {
    const validUpdateDto: UpdateParentPlanWorkingHourSimpleDto = {
      plan_date: '2025-09-01',
      total_calendar_day: 30,
      total_holiday_day: 8,
      total_available_day: 22,
      total_working_hour_month: 176,
      total_working_day_longshift: 5,
      total_working_hour_day: 8,
      total_working_hour_longshift: 12,
      total_mohh_per_month: 1000,
      detail: [
        { activities_id: 1, activities_hour: 2 },
        { activities_id: 2, activities_hour: 3 },
        { activities_id: 3, activities_hour: 4 },
      ],
    };

    it('should throw error when updating plan_date to non-first day of month', async () => {
      const invalidDto = { ...validUpdateDto, plan_date: '2025-09-15' };

      // Mock findOneEntity
      const mockParentPlan = {
        id: 13,
        plan_date: new Date('2025-08-01'),
        total_calendar_day: 31,
        total_holiday_day: 8,
        total_available_day: 23,
        total_working_hour_month: 184,
        total_working_day_longshift: 5,
        total_working_hour_day: 8,
        total_working_hour_longshift: 12,
        total_mohh_per_month: 1000,
        planWorkingHours: [],
        planWorkingHoursDetails: [],
      };

      // Mock findOneEntity method
      const mockFindOneEntity = jest.fn().mockResolvedValue(mockParentPlan);
      Object.defineProperty(service, 'findOneEntity', {
        value: mockFindOneEntity,
        writable: true,
      });

      await expect(service.update(13, invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(13, invalidDto)).rejects.toThrow(
        'plan_date harus berupa tanggal pertama dari bulan (01)',
      );
    });

    it('should throw error when updating plan_date to past month', async () => {
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 2);
      const pastDateString = pastDate.toISOString().slice(0, 7) + '-01';
      
      const invalidDto = { ...validUpdateDto, plan_date: pastDateString };

      // Mock findOneEntity
      const mockParentPlan = {
        id: 13,
        plan_date: new Date('2025-08-01'),
        total_calendar_day: 31,
        total_working_hour_month: 184,
        planWorkingHours: [],
        planWorkingHoursDetails: [],
      };

      // Mock findOneEntity method
      const mockFindOneEntity = jest.fn().mockResolvedValue(mockParentPlan);
      Object.defineProperty(service, 'findOneEntity', {
        value: mockFindOneEntity,
        writable: true,
      });

      await expect(service.update(13, invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(13, invalidDto)).rejects.toThrow(
        'Tidak dapat mengupdate plan untuk bulan yang sudah lewat',
      );
    });

    it('should throw error when updating plan_date to duplicate month', async () => {
      const invalidDto = { ...validUpdateDto, plan_date: '2025-08-01' }; // August 2025

      // Mock findOneEntity
      const mockParentPlan = {
        id: 13,
        plan_date: new Date('2025-09-01'),
        total_calendar_day: 30,
        total_working_hour_month: 176,
        planWorkingHours: [],
        planWorkingHoursDetails: [],
      };

      // Mock findOneEntity method
      const mockFindOneEntity = jest.fn().mockResolvedValue(mockParentPlan);
      Object.defineProperty(service, 'findOneEntity', {
        value: mockFindOneEntity,
        writable: true,
      });

      // Mock existing data for August 2025
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ id: 1, plan_date: '2025-08-01' }),
      };

      jest.spyOn(parentPlanWorkingHourRepository, 'createQueryBuilder').mockReturnValue(
        mockQueryBuilder as any,
      );

      await expect(service.update(13, invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(13, invalidDto)).rejects.toThrow(
        'Data untuk bulan Agustus 2025 sudah ada dalam sistem',
      );
    });

    it('should pass validation when updating plan_date to valid month', async () => {
      const validDto = { ...validUpdateDto, plan_date: '2025-10-01' }; // October 2025

      // Mock findOneEntity
      const mockParentPlan = {
        id: 13,
        plan_date: new Date('2025-09-01'),
        total_calendar_day: 30,
        total_working_hour_month: 176,
        planWorkingHours: [],
        planWorkingHoursDetails: [],
      };

      // Mock findOneEntity method
      const mockFindOneEntity = jest.fn().mockResolvedValue(mockParentPlan);
      Object.defineProperty(service, 'findOneEntity', {
        value: mockFindOneEntity,
        writable: true,
      });

      // Mock no existing data for October 2025
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      jest.spyOn(parentPlanWorkingHourRepository, 'createQueryBuilder').mockReturnValue(
        mockQueryBuilder as any,
      );

      // Mock successful update
      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          save: jest.fn().mockResolvedValue({ id: 13 }),
          find: jest.fn().mockResolvedValue([]),
        },
      };

      jest.spyOn(dataSource, 'createQueryRunner').mockReturnValue(mockQueryRunner as any);

      // Mock findOne after update
      const mockFindOne = jest.fn().mockResolvedValue({
        id: 13,
        plan_date: new Date('2025-10-01'),
      });

      Object.defineProperty(service, 'findOne', {
        value: mockFindOne,
        writable: true,
      });

      // Test that validation passes (no BadRequestException thrown)
      const result = await service.update(13, validDto);
      expect(result).toBeDefined();
    });

    it('should pass validation when not updating plan_date', async () => {
      const validDto = { 
        total_working_hour_month: 200,
        total_working_day_longshift: 10,
      }; // No plan_date update

      // Mock findOneEntity
      const mockParentPlan = {
        id: 13,
        plan_date: new Date('2025-09-01'),
        total_calendar_day: 30,
        total_working_hour_month: 176,
        planWorkingHours: [],
        planWorkingHoursDetails: [],
      };

      // Mock findOneEntity method
      const mockFindOneEntity = jest.fn().mockResolvedValue(mockParentPlan);
      Object.defineProperty(service, 'findOneEntity', {
        value: mockFindOneEntity,
        writable: true,
      });

      // Mock successful update
      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          save: jest.fn().mockResolvedValue({ id: 13 }),
          find: jest.fn().mockResolvedValue([]),
        },
      };

      jest.spyOn(dataSource, 'createQueryRunner').mockReturnValue(mockQueryRunner as any);

      // Mock findOne after update
      const mockFindOne = jest.fn().mockResolvedValue({
        id: 13,
        plan_date: new Date('2025-09-01'),
      });

      Object.defineProperty(service, 'findOne', {
        value: mockFindOne,
        writable: true,
      });

      // Test that validation passes (no BadRequestException thrown)
      const result = await service.update(13, validDto);
      expect(result).toBeDefined();
    });
  });
});
