import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BargeService } from '../barge.service';
import { Barge } from '../entities/barge.entity';
import { CreateBargeDto, UpdateBargeDto } from '../dto/barge.dto';

describe('BargeService', () => {
  let service: BargeService;
  let repository: Repository<Barge>;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BargeService,
        {
          provide: getRepositoryToken(Barge),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BargeService>(BargeService);
    repository = module.get<Repository<Barge>>(getRepositoryToken(Barge));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a barge when found', async () => {
      const mockBarge = {
        id: 1,
        name: 'Barge Kalimantan',
        capacity: 1000,
        remarks: 'Test remarks',
        createdAt: new Date(),
        createdBy: 1,
        updatedAt: new Date(),
        updatedBy: 1,
      };

      mockRepository.findOne.mockResolvedValue(mockBarge);

      const result = await service.findById(1);
      
      expect(result.statusCode).toBe(200);
      expect(result.data).toEqual(mockBarge);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return empty data when barge not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findById(1);
      
      expect(result.statusCode).toBe(200);
      expect(result.data).toBeNull();
      expect(result.message).toBe('Barge tidak ditemukan');
    });
  });

  describe('findAll', () => {
    it('should return paginated barges', async () => {
      const mockBarges = [
        {
          id: 1,
          shipment: 'Barge-001',
          name: 'Barge Kalimantan',
          capacity: 1000,
          remarks: 'Test remarks',
          createdAt: new Date(),
          createdBy: 1,
          updatedAt: new Date(),
          updatedBy: 1,
        },
      ];

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockBarges, 1]);

      const result = await service.findAll({ page: '1', limit: '10' });
      
      expect(result.statusCode).toBe(200);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should apply search filter', async () => {
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ search: 'test' });
      
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(barge.shipment ILIKE :search OR barge.name ILIKE :search OR barge.remarks ILIKE :search)',
        { search: '%test%' }
      );
    });
  });

  describe('create', () => {
    it('should create a new barge', async () => {
      const createBargeDto: CreateBargeDto = {
        name: 'Barge Kalimantan',
        capacity: 1000,
        remarks: 'Test remarks',
      };

      const mockBarge = {
        id: 1,
        ...createBargeDto,
        createdAt: new Date(),
        createdBy: 1,
        updatedAt: new Date(),
        updatedBy: 1,
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockBarge);
      mockRepository.save.mockResolvedValue(mockBarge);

      const result = await service.create(createBargeDto, 1);
      
      expect(result.statusCode).toBe(200);
      expect(result.data).toEqual(mockBarge);
      expect(result.message).toBe('Barge berhasil dibuat');
    });

    it('should throw error when shipment already exists', async () => {
      const createBargeDto: CreateBargeDto = {
        shipment: 'Barge-001',
        name: 'Barge Kalimantan',
        capacity: 1000,
      };

      mockRepository.findOne.mockResolvedValue({ id: 1 });

      await expect(service.create(createBargeDto, 1)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update an existing barge', async () => {
      const updateBargeDto: UpdateBargeDto = {
        name: 'Barge Kalimantan Updated',
        capacity: 1500,
      };

      const existingBarge = {
        id: 1,
        name: 'Barge Kalimantan',
        capacity: 1000,
        remarks: 'Test remarks',
        createdAt: new Date(),
        createdBy: 1,
        updatedAt: new Date(),
        updatedBy: 1,
      };

      const updatedBarge = { ...existingBarge, ...updateBargeDto };

      mockRepository.findOne.mockResolvedValue(existingBarge);
      mockRepository.save.mockResolvedValue(updatedBarge);

      const result = await service.update(1, updateBargeDto, 1);
      
      expect(result.statusCode).toBe(200);
      expect(result.data).toEqual(updatedBarge);
      expect(result.message).toBe('Barge berhasil diupdate');
    });

    it('should throw error when barge not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, {}, 1)).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should soft delete a barge', async () => {
      const existingBarge = {
        id: 1,
        name: 'Barge Kalimantan',
        capacity: 1000,
        remarks: 'Test remarks',
        createdAt: new Date(),
        createdBy: 1,
        updatedAt: new Date(),
        updatedBy: 1,
      };

      mockRepository.findOne.mockResolvedValue(existingBarge);
      mockRepository.save.mockResolvedValue(existingBarge);

      const result = await service.delete(1, 1);
      
      expect(result.statusCode).toBe(200);
      expect(result.data).toBeNull();
      expect(result.message).toBe('Barge berhasil dihapus');
    });

    it('should throw error when barge not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(1, 1)).rejects.toThrow();
    });
  });

  describe('restore', () => {
    it('should restore a deleted barge', async () => {
      const deletedBarge = {
        id: 1,
        name: 'Barge Kalimantan',
        capacity: 1000,
        remarks: 'Test remarks',
        createdAt: new Date(),
        createdBy: 1,
        updatedAt: new Date(),
        updatedBy: 1,
        deletedAt: new Date(),
        deletedBy: 1,
      };

      const restoredBarge = { ...deletedBarge, deletedAt: null, deletedBy: null };

      mockRepository.findOne.mockResolvedValue(deletedBarge);
      mockRepository.save.mockResolvedValue(restoredBarge);

      const result = await service.restore(1, 1);
      
      expect(result.statusCode).toBe(200);
      expect(result.data).toEqual(restoredBarge);
      expect(result.message).toBe('Barge berhasil dipulihkan');
    });

    it('should throw error when barge not found or not deleted', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.restore(1, 1)).rejects.toThrow();
    });
  });
});
