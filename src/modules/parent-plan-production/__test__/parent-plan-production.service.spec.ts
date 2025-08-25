import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { ParentPlanProductionService } from '../parent-plan-production.service';
import { ParentPlanProduction } from '../entities/parent-plan-production.entity';
import { PlanProduction } from '../../plan-production/entities/plan-production.entity';
import { CreateParentPlanProductionDto } from '../dto/create-parent-plan-production.dto';

describe('ParentPlanProductionService', () => {
  let service: ParentPlanProductionService;
  let parentPlanProductionRepository: Repository<ParentPlanProduction>;
  let planProductionRepository: Repository<PlanProduction>;

  const mockParentPlanProductionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockPlanProductionRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParentPlanProductionService,
        {
          provide: getRepositoryToken(ParentPlanProduction),
          useValue: mockParentPlanProductionRepository,
        },
        {
          provide: getRepositoryToken(PlanProduction),
          useValue: mockPlanProductionRepository,
        },
      ],
    }).compile();

    service = module.get<ParentPlanProductionService>(
      ParentPlanProductionService,
    );
    parentPlanProductionRepository = module.get<
      Repository<ParentPlanProduction>
    >(getRepositoryToken(ParentPlanProduction));
    planProductionRepository = module.get<Repository<PlanProduction>>(
      getRepositoryToken(PlanProduction),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateParentPlanProductionDto = {
      plan_date: '2025-08-21',
      total_average_day_ewh: 150.0,
      total_average_month_ewh: 4500.0,
      total_ob_target: 1500000.0,
      total_ore_target: 750000.0,
      total_quarry_target: 300000.0,
      total_sr_target: 2.0,
      total_ore_shipment_target: 600000.0,
      total_remaining_stock: 100000.0,
      total_sisa_stock: 50000.0,
      total_fleet: 25,
    };

    it('should create parent plan production successfully', async () => {
      // Mock existing parent check
      mockParentPlanProductionRepository.findOne.mockResolvedValue(null);

      // Mock parent creation
      const mockParent = {
        id: 1,
        total_calender_day: 31,
        total_holiday_day: 5,
        total_available_day: 26,
        ...createDto,
      };
      mockParentPlanProductionRepository.create.mockReturnValue(mockParent);
      mockParentPlanProductionRepository.save.mockResolvedValue(mockParent);

      // Mock old stock global
      mockPlanProductionRepository.findOne.mockResolvedValue(null);
      mockParentPlanProductionRepository.findOne.mockResolvedValueOnce(null);

      // Mock daily plan production save
      mockPlanProductionRepository.save.mockResolvedValue([]);

      const result = await service.create(createDto);

      expect(result).toEqual(mockParent);
      expect(mockParentPlanProductionRepository.findOne).toHaveBeenCalled();
      expect(mockParentPlanProductionRepository.create).toHaveBeenCalled();
      expect(mockParentPlanProductionRepository.save).toHaveBeenCalled();
      expect(mockPlanProductionRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if plan_date already exists', async () => {
      const existingParent = { id: 1, plan_date: new Date('2025-08-21') };
      mockParentPlanProductionRepository.findOne.mockResolvedValue(
        existingParent,
      );

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockParentPlanProductionRepository.findOne).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all parent plan productions', async () => {
      const mockParents = [
        { id: 1, plan_date: new Date('2025-08-21') },
        { id: 2, plan_date: new Date('2025-09-21') },
      ];
      mockParentPlanProductionRepository.find.mockResolvedValue(mockParents);

      const result = await service.findAll();

      expect(result).toEqual(mockParents);
      expect(mockParentPlanProductionRepository.find).toHaveBeenCalledWith({
        relations: ['planProductions'],
        order: { plan_date: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return parent plan production by ID', async () => {
      const mockParent = { id: 1, plan_date: new Date('2025-08-21') };
      mockParentPlanProductionRepository.findOne.mockResolvedValue(mockParent);

      const result = await service.findOne(1);

      expect(result).toEqual(mockParent);
      expect(mockParentPlanProductionRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['planProductions'],
      });
    });

    it('should throw BadRequestException if parent not found', async () => {
      mockParentPlanProductionRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(BadRequestException);
      expect(mockParentPlanProductionRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: ['planProductions'],
      });
    });
  });

  describe('findByDate', () => {
    it('should return parent plan production by date', async () => {
      const mockParent = { id: 1, plan_date: new Date('2025-08-21') };
      mockParentPlanProductionRepository.findOne.mockResolvedValue(mockParent);

      const result = await service.findByDate('2025-08-21');

      expect(result).toEqual(mockParent);
      expect(mockParentPlanProductionRepository.findOne).toHaveBeenCalledWith({
        where: { plan_date: new Date('2025-08-21') },
        relations: ['planProductions'],
      });
    });

    it('should throw BadRequestException if parent not found for date', async () => {
      mockParentPlanProductionRepository.findOne.mockResolvedValue(null);

      await expect(service.findByDate('2025-08-21')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockParentPlanProductionRepository.findOne).toHaveBeenCalledWith({
        where: { plan_date: new Date('2025-08-21') },
        relations: ['planProductions'],
      });
    });
  });

  describe('getDaysInMonth', () => {
    it('should return correct days for August 2025', () => {
      const date = new Date('2025-08-21');
      const result = (service as any).getDaysInMonth(date);
      expect(result).toBe(31);
    });

    it('should return correct days for February 2025', () => {
      const date = new Date('2025-02-15');
      const result = (service as any).getDaysInMonth(date);
      expect(result).toBe(28);
    });

    it('should return correct days for April 2025', () => {
      const date = new Date('2025-04-15');
      const result = (service as any).getDaysInMonth(date);
      expect(result).toBe(30);
    });

    it('should return correct days for December 2025', () => {
      const date = new Date('2025-12-15');
      const result = (service as any).getDaysInMonth(date);
      expect(result).toBe(31);
    });
  });

  describe('getSundaysInMonth', () => {
    it('should return correct sunday count for August 2025', () => {
      const date = new Date('2025-08-21');
      const result = (service as any).getSundaysInMonth(date);
      expect(result).toBe(5);
    });

    it('should return correct sunday count for February 2025', () => {
      const date = new Date('2025-02-15');
      const result = (service as any).getSundaysInMonth(date);
      expect(result).toBe(4);
    });
  });

  describe('generateDailyPlanProductions', () => {
    it('should generate correct number of daily plan productions', async () => {
      const mockParent = {
        id: 1,
        plan_date: new Date('2025-08-01'),
        total_calender_day: 31,
        total_holiday_day: 5,
        total_available_day: 26,
      };

      const createDto: CreateParentPlanProductionDto = {
        plan_date: '2025-08-21',
        total_average_day_ewh: 150.0,
        total_average_month_ewh: 4500.0,
        total_ob_target: 1500000.0,
        total_ore_target: 750000.0,
        total_quarry_target: 300000.0,
        total_sr_target: 2.0,
        total_ore_shipment_target: 600000.0,
        total_remaining_stock: 100000.0,
        total_sisa_stock: 50000.0,
        total_fleet: 25,
      };

      // Mock old stock global
      mockPlanProductionRepository.findOne.mockResolvedValue(null);
      mockParentPlanProductionRepository.findOne.mockResolvedValue(null);

      // Mock save daily plan productions
      const mockDailyData = Array(31)
        .fill(null)
        .map((_, index) => ({
          id: index + 1,
          plan_date: new Date(2025, 7, index + 1), // August 2025
          parent_plan_production_id: 1,
        }));
      mockPlanProductionRepository.save.mockResolvedValue(mockDailyData);

      const result = await (service as any).generateDailyPlanProductions(
        mockParent,
        createDto,
      );

      expect(result).toHaveLength(31);
      expect(mockPlanProductionRepository.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            plan_date: new Date(2025, 7, 1), // August 1, 2025
            parent_plan_production_id: 1,
          }),
          expect.objectContaining({
            plan_date: new Date(2025, 7, 31), // August 31, 2025
            parent_plan_production_id: 1,
          }),
        ]),
      );
    });
  });
});
