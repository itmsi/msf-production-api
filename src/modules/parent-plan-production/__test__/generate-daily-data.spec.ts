import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParentPlanProductionService } from '../parent-plan-production.service';
import { ParentPlanProduction } from '../entities/parent-plan-production.entity';
import { PlanProduction } from '../../plan-production/entities/plan-production.entity';
import { CreateParentPlanProductionDto } from '../dto/create-parent-plan-production.dto';

describe('Generate Daily Data Tests', () => {
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

    service = module.get<ParentPlanProductionService>(ParentPlanProductionService);
    parentPlanProductionRepository = module.get<Repository<ParentPlanProduction>>(
      getRepositoryToken(ParentPlanProduction),
    );
    planProductionRepository = module.get<Repository<PlanProduction>>(
      getRepositoryToken(PlanProduction),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Generate Daily Data for Different Months', () => {
    const testCases = [
      {
        month: 'January 2025',
        planDate: '2025-01-15',
        expectedDays: 31,
        expectedSundays: 5,
        expectedAvailableDays: 26,
      },
      {
        month: 'February 2025',
        planDate: '2025-02-15',
        expectedDays: 28,
        expectedSundays: 4,
        expectedAvailableDays: 24,
      },
      {
        month: 'April 2025',
        planDate: '2025-04-15',
        expectedDays: 30,
        expectedSundays: 4,
        expectedAvailableDays: 26,
      },
      {
        month: 'August 2025',
        planDate: '2025-08-15',
        expectedDays: 31,
        expectedSundays: 5,
        expectedAvailableDays: 26,
      },
      {
        month: 'December 2025',
        planDate: '2025-12-15',
        expectedDays: 31,
        expectedSundays: 5,
        expectedAvailableDays: 26,
      },
    ];

    testCases.forEach(({ month, planDate, expectedDays, expectedSundays, expectedAvailableDays }) => {
      it(`should generate correct data for ${month}`, async () => {
        const createDto: CreateParentPlanProductionDto = {
          plan_date: planDate,
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

        // Mock existing parent check
        mockParentPlanProductionRepository.findOne.mockResolvedValue(null);

              // Mock parent creation
      const mockParent = {
        id: 1,
        total_calender_day: expectedDays,
        total_holiday_day: expectedSundays,
        total_available_day: expectedAvailableDays,
        ...createDto,
      };
        mockParentPlanProductionRepository.create.mockReturnValue(mockParent);
        mockParentPlanProductionRepository.save.mockResolvedValue(mockParent);

        // Mock old stock global
        mockPlanProductionRepository.findOne.mockResolvedValue(null);
        mockParentPlanProductionRepository.findOne.mockResolvedValueOnce(null);

        // Mock daily plan production save
        const mockDailyData = Array(expectedDays).fill(null).map((_, index) => ({
          id: index + 1,
          plan_date: new Date(new Date(planDate).getFullYear(), new Date(planDate).getMonth(), index + 1),
          parent_plan_production_id: 1,
        }));
        mockPlanProductionRepository.save.mockResolvedValue(mockDailyData);

        const result = await service.create(createDto);

        expect(result.total_calender_day).toBe(expectedDays);
        expect(result.total_holiday_day).toBe(expectedSundays);
        expect(result.total_available_day).toBe(expectedAvailableDays);
        expect(mockPlanProductionRepository.save).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              plan_date: new Date(new Date(planDate).getFullYear(), new Date(planDate).getMonth(), 1),
              parent_plan_production_id: 1,
            }),
            expect.objectContaining({
              plan_date: new Date(new Date(planDate).getFullYear(), new Date(planDate).getMonth(), expectedDays),
              parent_plan_production_id: 1,
            }),
          ])
        );
      });
    });
  });

  describe('Daily Data Generation Logic', () => {
    it('should generate data with correct calculations for each day', async () => {
      const createDto: CreateParentPlanProductionDto = {
        plan_date: '2025-08-15',
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
      const mockDailyData = Array(31).fill(null).map((_, index) => ({
        id: index + 1,
        plan_date: new Date(2025, 7, index + 1), // August 2025
        parent_plan_production_id: 1,
        // Expected calculated values
        average_day_ewh: 150.0 / 31,
        average_shift_ewh: 4500.0 / 31,
        ob_target: 1500000.0 / 31,
        ore_target: 750000.0 / 31,
        quarry: 300000.0 / 31,
        ore_shipment_target: 600000.0 / 31,
        total_fleet: 25,
        daily_old_stock: 50000.0,
        shift_ob_target: (1500000.0 / 31) / 2,
        shift_ore_target: (750000.0 / 31) / 2,
        shift_quarry: (300000.0 / 31) / 2,
        shift_sr_target: ((1500000.0 / 31) / 2) / ((750000.0 / 31) / 2),
        remaining_stock: 50000.0 - (600000.0 / 31) + (750000.0 / 31),
      }));
      mockPlanProductionRepository.save.mockResolvedValue(mockDailyData);

      const result = await service.create(createDto);

      // Verify calculations
      const expectedDailyEwh = 150.0 / 31;
      const expectedDailyObTarget = 1500000.0 / 31;
      const expectedDailyOreTarget = 750000.0 / 31;

      expect(mockPlanProductionRepository.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            average_day_ewh: expectedDailyEwh,
            ob_target: expectedDailyObTarget,
            ore_target: expectedDailyOreTarget,
            sr_target: expectedDailyObTarget / expectedDailyOreTarget,
            shift_ob_target: expectedDailyObTarget / 2,
            shift_ore_target: expectedDailyOreTarget / 2,
          }),
        ])
      );
    });
  });
});
