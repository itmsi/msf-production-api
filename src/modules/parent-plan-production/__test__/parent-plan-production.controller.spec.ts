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

    controller = module.get<ParentPlanProductionController>(
      ParentPlanProductionController,
    );
    service = module.get<ParentPlanProductionService>(
      ParentPlanProductionService,
    );
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
      const mockQuery = {
        page: '1',
        limit: '10',
        sort: 'plan_date',
        sortOrder: 'DESC' as const,
      };

      const mockResult = {
        statusCode: 200,
        message: 'Data parent plan production berhasil diambil',
        data: [
          {
            month_year: '2025-01',
            available_day: 26,
            holiday_day: 5,
            average_month_ewh: 4500.0,
            average_day_ewh: 150.0,
            ob_target: 1500000.0,
            ore_target: 750000.0,
            quarry_target: 300000.0,
            sr_target: 2.0,
            ore_shipment_target: 600000.0,
            sisa_stock: 50000.0,
            is_available_to_edit: true,
            is_available_to_delete: true,
          },
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          lastPage: 1,
        },
      };

      mockParentPlanProductionService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(mockQuery);

      expect(result).toEqual(mockResult);
      expect(service.findAll).toHaveBeenCalledWith(mockQuery);
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
