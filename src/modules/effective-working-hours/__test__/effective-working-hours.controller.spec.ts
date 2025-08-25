import { Test, TestingModule } from '@nestjs/testing';
import { EffectiveWorkingHoursController } from '../effective-working-hours.controller';
import { EffectiveWorkingHoursService } from '../effective-working-hours.service';
import { CreateEffectiveWorkingHoursDto, UpdateEffectiveWorkingHoursDto } from '../dto/effective-working-hours.dto';
import { LossType, Shift } from '../entities/effective-working-hours.entity';

describe('EffectiveWorkingHoursController', () => {
  let controller: EffectiveWorkingHoursController;
  let service: EffectiveWorkingHoursService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EffectiveWorkingHoursController],
      providers: [
        {
          provide: EffectiveWorkingHoursService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<EffectiveWorkingHoursController>(EffectiveWorkingHoursController);
    service = module.get<EffectiveWorkingHoursService>(EffectiveWorkingHoursService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create effective working hours', async () => {
      const createDto: CreateEffectiveWorkingHoursDto = {
        dateActivity: '2024-01-15',
        lossType: LossType.STB,
        shift: Shift.DS,
        populationId: 1,
        activitiesId: 1,
        description: 'Test standby',
      };

      const mockResult = {
        id: 1,
        ...createDto,
        duration: 0,
      };

      mockService.create.mockResolvedValue(mockResult);

      const result = await controller.create(createDto);

      expect(result.message).toBe('Effective working hours created successfully');
      expect(result.data).toEqual(mockResult);
      expect(mockService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all effective working hours', async () => {
      const mockResult = {
        statusCode: 200,
        message: 'Data retrieved successfully',
        data: [],
        meta: { total: 0, page: 1, limit: 10 },
      };

      mockService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll({});

      expect(result).toEqual(mockResult);
      expect(mockService.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return effective working hours by id', async () => {
      const mockResult = {
        id: 1,
        dateActivity: '2024-01-15',
        lossType: LossType.STB,
        shift: Shift.DS,
        populationId: 1,
        activitiesId: 1,
      };

      mockService.findOne.mockResolvedValue(mockResult);

      const result = await controller.findOne(1);

      expect(result.message).toBe('Effective working hours retrieved successfully');
      expect(result.data).toEqual(mockResult);
      expect(mockService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update effective working hours', async () => {
      const updateDto: UpdateEffectiveWorkingHoursDto = {
        description: 'Updated description',
      };

      const mockResult = {
        id: 1,
        dateActivity: '2024-01-15',
        lossType: LossType.STB,
        shift: Shift.DS,
        populationId: 1,
        activitiesId: 1,
        description: 'Updated description',
      };

      mockService.update.mockResolvedValue(mockResult);

      const result = await controller.update(1, updateDto);

      expect(result.message).toBe('Effective working hours updated successfully');
      expect(result.data).toEqual(mockResult);
      expect(mockService.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete effective working hours', async () => {
      mockService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(1);

      expect(result.message).toBe('Effective working hours deleted successfully');
      expect(result.data).toBeNull();
      expect(mockService.remove).toHaveBeenCalledWith(1);
    });
  });
});
