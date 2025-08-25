import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EffectiveWorkingHoursService } from '../effective-working-hours.service';
import { EffectiveWorkingHours, LossType, Shift } from '../entities/effective-working-hours.entity';
import { CreateEffectiveWorkingHoursDto, UpdateEffectiveWorkingHoursDto } from '../dto/effective-working-hours.dto';

describe('EffectiveWorkingHoursService', () => {
  let service: EffectiveWorkingHoursService;
  let repository: Repository<EffectiveWorkingHours>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    softDelete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EffectiveWorkingHoursService,
        {
          provide: getRepositoryToken(EffectiveWorkingHours),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EffectiveWorkingHoursService>(EffectiveWorkingHoursService);
    repository = module.get<Repository<EffectiveWorkingHours>>(getRepositoryToken(EffectiveWorkingHours));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create effective working hours with duration calculation', async () => {
      const createDto: CreateEffectiveWorkingHoursDto = {
        dateActivity: '2024-01-15',
        lossType: LossType.STB,
        shift: Shift.DS,
        populationId: 1,
        activitiesId: 1,
        description: 'Test standby',
        start: '2024-01-15T08:00:00Z',
        end: '2024-01-15T10:00:00Z',
      };

      const mockEntity = {
        ...createDto,
        id: 1,
        duration: 120,
      };

      mockRepository.create.mockReturnValue(mockEntity);
      mockRepository.save.mockResolvedValue(mockEntity);

      const result = await service.create(createDto);

      expect(result.duration).toBe(120);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return effective working hours by id', async () => {
      const mockEntity = {
        id: 1,
        dateActivity: '2024-01-15',
        lossType: LossType.STB,
        shift: Shift.DS,
        populationId: 1,
        activitiesId: 1,
      };

      mockRepository.findOne.mockResolvedValue(mockEntity);

      const result = await service.findOne(1);

      expect(result).toEqual(mockEntity);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['population', 'population.unitType', 'activities'],
      });
    });

    it('should throw NotFoundException when entity not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow('Effective working hours with ID 999 not found');
    });
  });
});
