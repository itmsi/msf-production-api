import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { ParentPlanWorkingHourService } from '../parent-plan-working-hour.service';
import { ParentPlanWorkingHour } from '../entities/parent-plan-working-hour.entity';
import { PlanWorkingHour } from '../entities/plan-working-hour.entity';
import { PlanWorkingHourDetail } from '../entities/plan-working-hour-detail.entity';
import { Activities } from '../../activities/entities/activities.entity';
import { CreateParentPlanWorkingHourDto } from '../dto/parent-plan-working-hour.dto';

describe('ParentPlanWorkingHourService - Validation Tests', () => {
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
    getRepository: jest.fn(),
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

  describe('create - Validation Tests', () => {
    const validCreateDto: CreateParentPlanWorkingHourDto = {
      plan_date: '2025-08-01',
      total_calendar_day: 31,
      total_holiday_day: 8,
      total_available_day: 23,
      total_working_hour_month: 184,
      total_working_day_longshift: 5,
      total_working_hour_day: 8,
      total_working_hour_longshift: 12,
      total_mohh_per_month: 1000,
      detail: [
        { activities_id: 6, activities_hour: 1 },
        { activities_id: 2, activities_hour: 1 },
        { activities_id: 3, activities_hour: 1 },
      ],
    };

    it('should throw error when plan_date is not first day of month', async () => {
      const invalidDto = { ...validCreateDto, plan_date: '2025-08-15' };

      await expect(service.create(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(invalidDto)).rejects.toThrow(
        'plan_date harus berupa tanggal pertama dari bulan (01)',
      );
    });

    it('should throw error when plan_date is in the past', async () => {
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 2);
      const pastDateString = pastDate.toISOString().slice(0, 7) + '-01';
      
      const invalidDto = { ...validCreateDto, plan_date: pastDateString };

      await expect(service.create(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(invalidDto)).rejects.toThrow(
        'Tidak dapat membuat plan untuk bulan yang sudah lewat',
      );
    });



    it('should throw error when total_available_day + total_holiday_day != total_calendar_day', async () => {
      const invalidDto = { ...validCreateDto, total_available_day: 20 }; // 20 + 8 != 31

      await expect(service.create(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(invalidDto)).rejects.toThrow(
        'Total hari tersedia + total hari libur harus sama dengan total hari kalender',
      );
    });

    it('should throw error when detail is empty', async () => {
      const invalidDto = { ...validCreateDto, detail: [] };

      await expect(service.create(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(invalidDto)).rejects.toThrow(
        'Detail activities tidak boleh kosong',
      );
    });

    it('should throw error when detail is empty array', async () => {
      const invalidDto = { ...validCreateDto, detail: [] };

      await expect(service.create(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(invalidDto)).rejects.toThrow(
        'Detail activities tidak boleh kosong',
      );
    });

    it('should throw error when activities_id is duplicated', async () => {
      const invalidDto = {
        ...validCreateDto,
        detail: [
          { activities_id: 6, activities_hour: 1 },
          { activities_id: 6, activities_hour: 2 }, // Duplicate activities_id
          { activities_id: 3, activities_hour: 1 },
        ],
      };

      await expect(service.create(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(invalidDto)).rejects.toThrow(
        'Activities ID harus unik',
      );
    });

    it('should throw error when activities_hour is negative', async () => {
      const invalidDto = {
        ...validCreateDto,
        detail: [
          { activities_id: 6, activities_hour: -1 }, // Negative hour
          { activities_id: 2, activities_hour: 1 },
          { activities_id: 3, activities_hour: 1 },
        ],
      };

      // Mock activities repository untuk test ini
      jest.spyOn(dataSource, 'getRepository').mockReturnValue({
        find: jest.fn().mockResolvedValue([
          { id: 6 }, { id: 2 }, { id: 3 }
        ]),
      } as any);

      await expect(service.create(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(invalidDto)).rejects.toThrow(
        'Activities hour tidak boleh negatif',
      );
    });

    it('should throw error when duplicate month exists in same year', async () => {
      // Mock existing data for August 2025
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ id: 1, plan_date: '2025-08-01' }),
      };

      jest.spyOn(parentPlanWorkingHourRepository, 'createQueryBuilder').mockReturnValue(
        mockQueryBuilder as any,
      );

      // Mock activities repository
      jest.spyOn(dataSource, 'getRepository').mockReturnValue({
        find: jest.fn().mockResolvedValue([
          { id: 6 }, { id: 2 }, { id: 3 }
        ]),
      } as any);

      await expect(service.create(validCreateDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(validCreateDto)).rejects.toThrow(
        'Data untuk bulan Agustus 2025 sudah ada dalam sistem',
      );
    });


  });
});
