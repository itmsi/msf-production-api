import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrandService } from '../brand.service';
import { Brand } from '../entities/brand.entity';
import { CreateBrandDto, UpdateBrandDto } from '../dto/brand.dto';
import { InternalServerErrorException } from '@nestjs/common';

describe('BrandService', () => {
  let service: BrandService;
  let repository: Repository<Brand>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    })),
    merge: jest.fn(),
    softRemove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrandService,
        {
          provide: getRepositoryToken(Brand),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BrandService>(BrandService);
    repository = module.get<Repository<Brand>>(getRepositoryToken(Brand));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a brand successfully', async () => {
      const createBrandDto: CreateBrandDto = { brand_name: 'Toyota' };
      const brand = { id: 1, ...createBrandDto };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(brand);
      mockRepository.save.mockResolvedValue(brand);

      const result = await service.create(createBrandDto);

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Brand berhasil dibuat');
      expect(result.data).toEqual(brand);
    });

    it('should throw error if brand name already exists', async () => {
      const createBrandDto: CreateBrandDto = { brand_name: 'Toyota' };
      const existingBrand = { id: 1, brand_name: 'Toyota' };

      mockRepository.findOne.mockResolvedValue(existingBrand);

      await expect(service.create(createBrandDto)).rejects.toThrow(
        'Brand name sudah terdaftar',
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated brands', async () => {
      const query = { page: '1', limit: '10' };
      const brands = [{ id: 1, brand_name: 'Toyota' }];
      const total = 1;

      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getManyAndCount.mockResolvedValue([brands, total]);

      // Mock the query builder methods to return the queryBuilder itself
      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll(query);

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Data brand berhasil diambil');
      expect(result.data).toBeDefined();
      expect(result.meta).toBeDefined();
      expect(result.meta!.total).toBe(total);
      expect(result.meta!.page).toBe(1);
      expect(result.meta!.limit).toBe(10);
    });
  });

  describe('findById', () => {
    it('should return brand by id', async () => {
      const id = 1;
      const brand = { id: 1, brand_name: 'Toyota' };

      mockRepository.findOne.mockResolvedValue(brand);

      const result = await service.findById(id);

      expect(result.statusCode).toBe(200);
      expect(result.data).toEqual(brand);
    });

    it('should throw error if brand not found', async () => {
      const id = 1;

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(id)).rejects.toThrow(
        'Brand tidak ditemukan',
      );
    });
  });

  describe('update', () => {
    it('should update brand successfully', async () => {
      const id = 1;
      const updateBrandDto: UpdateBrandDto = { brand_name: 'Toyota Motor' };
      const existingBrand = { id: 1, brand_name: 'Toyota' };
      const updatedBrand = { id: 1, brand_name: 'Toyota Motor' };

      mockRepository.findOne
        .mockResolvedValueOnce(existingBrand) // first call for finding brand
        .mockResolvedValueOnce(null); // second call for checking duplicate
      mockRepository.merge.mockReturnValue(updatedBrand);
      mockRepository.save.mockResolvedValue(updatedBrand);

      const result = await service.update(id, updateBrandDto);

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Brand berhasil diupdate');
      expect(result.data).toEqual(updatedBrand);
    });

    it('should throw error if brand not found', async () => {
      const id = 1;
      const updateBrandDto: UpdateBrandDto = { brand_name: 'Toyota Motor' };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(id, updateBrandDto)).rejects.toThrow(
        'Brand tidak ditemukan',
      );
    });
  });

  describe('remove', () => {
    it('should remove brand successfully', async () => {
      const id = 1;
      const brand = { id: 1, brand_name: 'Toyota' };

      mockRepository.findOne.mockResolvedValue(brand);
      mockRepository.softRemove.mockResolvedValue(undefined);

      const result = await service.remove(id);

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Brand berhasil dihapus');
      expect(result.data).toBeNull();
    });

    it('should throw error if brand not found', async () => {
      const id = 1;

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow('Brand tidak ditemukan');
    });
  });
});
