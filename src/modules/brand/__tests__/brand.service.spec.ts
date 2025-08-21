import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrandService } from '../brand.service';
import { Brand } from '../entities/brand.entity';
import { CreateBrandDto, UpdateBrandDto } from '../dto/brand.dto';

describe('BrandService', () => {
  let service: BrandService;
  let repository: Repository<Brand>;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
    softRemove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    })),
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateBrandDto = {
      brand_name: 'Toyota',
    };

    it('should create brand successfully', async () => {
      const mockBrand = { id: 1, ...createDto, createdAt: new Date(), updatedAt: new Date() };
      
      mockRepository.findOne.mockResolvedValue(null); // No duplicate
      mockRepository.create.mockReturnValue(mockBrand);
      mockRepository.save.mockResolvedValue(mockBrand);

      const result = await service.create(createDto);

      expect(result.data).toEqual(mockBrand);
      expect(result.message).toBe('Brand berhasil dibuat');
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { brand_name: createDto.brand_name },
      });
    });

    it('should fail when brand_name is empty string', async () => {
      const invalidDto = { brand_name: '' };

      await expect(service.create(invalidDto)).rejects.toThrow('Validasi gagal: brand_name tidak boleh kosong atau hanya berisi whitespace');
    });

    it('should fail when brand_name is whitespace only', async () => {
      const invalidDto = { brand_name: '   ' };

      await expect(service.create(invalidDto)).rejects.toThrow('Validasi gagal: brand_name tidak boleh kosong atau hanya berisi whitespace');
    });

    it('should fail when brand_name already exists', async () => {
      const existingBrand = { id: 1, brand_name: 'Toyota' };
      
      mockRepository.findOne.mockResolvedValue(existingBrand);

      await expect(service.create(createDto)).rejects.toThrow('Business rule validation gagal: Nama brand \'Toyota\' sudah ada');
    });
  });

  describe('update', () => {
    const updateDto: UpdateBrandDto = {
      brand_name: 'Toyota Motor',
    };

    const existingBrand = { 
      id: 1, 
      brand_name: 'Toyota', 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };

    it('should update brand successfully', async () => {
      const updatedBrand = { ...existingBrand, ...updateDto };
      
      mockRepository.findOne
        .mockResolvedValueOnce(existingBrand) // Find existing brand
        .mockResolvedValueOnce(null); // No duplicate name
      mockRepository.merge.mockReturnValue(updatedBrand);
      mockRepository.save.mockResolvedValue(updatedBrand);

      const result = await service.update(1, updateDto);

      expect(result.data).toEqual(updatedBrand);
      expect(result.message).toBe('Brand berhasil diupdate');
    });

    it('should fail when brand not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.update(999, updateDto);

      expect(result.data).toBeNull();
      expect(result.message).toBe('Brand tidak ditemukan');
    });

    it('should fail when new brand_name already exists', async () => {
      const duplicateBrand = { id: 2, brand_name: 'Toyota Motor' };
      
      mockRepository.findOne
        .mockResolvedValueOnce(existingBrand) // Find existing brand
        .mockResolvedValueOnce(duplicateBrand); // Find duplicate name

      await expect(service.update(1, updateDto)).rejects.toThrow('Business rule validation gagal: Nama brand \'Toyota Motor\' sudah ada');
    });

    it('should fail when brand_name is empty string', async () => {
      const invalidDto = { brand_name: '' };

      mockRepository.findOne.mockResolvedValue(existingBrand);

      await expect(service.update(1, invalidDto)).rejects.toThrow('Validasi gagal: brand_name tidak boleh kosong atau hanya berisi whitespace');
    });

    it('should fail when brand_name is whitespace only', async () => {
      const invalidDto = { brand_name: '   ' };

      mockRepository.findOne.mockResolvedValue(existingBrand);

      await expect(service.update(1, invalidDto)).rejects.toThrow('Validasi gagal: brand_name tidak boleh kosong atau hanya berisi whitespace');
    });
  });

  describe('findById', () => {
    it('should return brand when found', async () => {
      const mockBrand = { id: 1, brand_name: 'Toyota', createdAt: new Date(), updatedAt: new Date() };
      
      mockRepository.findOne.mockResolvedValue(mockBrand);

      const result = await service.findById(1);

      expect(result.data).toEqual(mockBrand);
      expect(result.message).toBe('Retrieve data success');
    });

    it('should return null when brand not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result.data).toBeNull();
      expect(result.message).toBe('Brand tidak ditemukan');
    });
  });

  describe('remove', () => {
    it('should remove brand successfully', async () => {
      const mockBrand = { id: 1, brand_name: 'Toyota' };
      
      mockRepository.findOne.mockResolvedValue(mockBrand);
      mockRepository.softRemove.mockResolvedValue(undefined);

      const result = await service.remove(1);

      expect(result.data).toBeNull();
      expect(result.message).toBe('Brand berhasil dihapus');
    });

    it('should return null when brand not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.remove(999);

      expect(result.data).toBeNull();
      expect(result.message).toBe('Brand tidak ditemukan');
    });
  });
});
