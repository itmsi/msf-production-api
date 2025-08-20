import { Test, TestingModule } from '@nestjs/testing';
import { DailyPlanProductionController } from '../daily-plan-production.controller';
import { DailyPlanProductionService } from '../daily-plan-production.service';
import { CreateDailyPlanProductionDto, UpdateDailyPlanProductionDto } from '../dto/daily-plan-production.dto';

describe('DailyPlanProductionController', () => {
  let controller: DailyPlanProductionController;
  let service: DailyPlanProductionService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailyPlanProductionController],
      providers: [
        {
          provide: DailyPlanProductionService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<DailyPlanProductionController>(DailyPlanProductionController);
    service = module.get<DailyPlanProductionService>(DailyPlanProductionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create daily plan production', async () => {
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

      const expectedResult = {
        statusCode: 200,
        message: 'Daily plan production berhasil dibuat',
        data: { id: 1, ...createDto },
      };

      mockService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all daily plan productions', async () => {
      const queryDto = { page: 1, limit: 10 };
      const expectedResult = {
        statusCode: 200,
        message: 'Data daily plan production berhasil diambil',
        data: {
          data: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        },
      };

      mockService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(queryDto);

      expect(service.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return daily plan production by id', async () => {
      const id = '1';
      const expectedResult = {
        statusCode: 200,
        message: 'Data daily plan production berhasil diambil',
        data: { id: 1, plan_date: '2025-01-01' },
      };

      mockService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update daily plan production', async () => {
      const id = '1';
      const updateDto: UpdateDailyPlanProductionDto = {
        ob_target: 1200,
        ore_target: 900,
      };

      const expectedResult = {
        statusCode: 200,
        message: 'Daily plan production berhasil diupdate',
        data: { id: 1, ob_target: 1200, ore_target: 900 },
      };

      mockService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove daily plan production', async () => {
      const id = '1';
      const expectedResult = {
        statusCode: 200,
        message: 'Daily plan production berhasil dihapus',
        data: null,
      };

      mockService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedResult);
    });
  });
});
