import { Test, TestingModule } from '@nestjs/testing';
import { ParentPlanProductionController } from '../parent-plan-production.controller';
import { ParentPlanProductionService } from '../parent-plan-production.service';
import { CreateParentPlanProductionDto } from '../dto/create-parent-plan-production.dto';

describe('ParentPlanProductionController', () => {
  let controller: ParentPlanProductionController;
  let service: ParentPlanProductionService;

  const mockParentPlanProductionService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByDate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParentPlanProductionController],
      providers: [
        {
          provide: ParentPlanProductionService,
          useValue: mockParentPlanProductionService,
        },
      ],
    }).compile();

    controller = module.get<ParentPlanProductionController>(ParentPlanProductionController);
    service = module.get<ParentPlanProductionService>(ParentPlanProductionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
      const mockResult = {
        id: 1,
        total_calender_day: 31,
        total_holiday_day: 5,
        total_available_day: 26,
        ...createDto,
      };

      mockParentPlanProductionService.create.mockResolvedValue(mockResult);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockResult);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all parent plan productions', async () => {
      const mockResult = [
        {
          id: 1,
          total_calender_day: 31,
          total_holiday_day: 5,
          total_available_day: 26,
        },
        {
          id: 2,
          total_calender_day: 30,
          total_holiday_day: 4,
          total_available_day: 26,
        },
      ];

      mockParentPlanProductionService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll();

      expect(result).toEqual(mockResult);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return parent plan production by ID', async () => {
      const mockResult = {
        id: 1,
        total_calender_day: 31,
        total_holiday_day: 5,
        total_available_day: 26,
      };

      mockParentPlanProductionService.findOne.mockResolvedValue(mockResult);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockResult);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('findByDate', () => {
    it('should return parent plan production by date', async () => {
      const mockResult = {
        id: 1,
        total_calender_day: 31,
        total_holiday_day: 5,
        total_available_day: 26,
      };

      mockParentPlanProductionService.findByDate.mockResolvedValue(mockResult);

      const result = await controller.findByDate('2025-08-21');

      expect(result).toEqual(mockResult);
      expect(service.findByDate).toHaveBeenCalledWith('2025-08-21');
    });
  });
});
