import { Test, TestingModule } from '@nestjs/testing';
import { BrandController } from '../brand.controller';
import { BrandService } from '../brand.service';
import { CreateBrandDto, UpdateBrandDto } from '../dto/brand.dto';

describe('BrandController', () => {
  let controller: BrandController;
  let service: BrandService;

  const mockBrandService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrandController],
      providers: [
        {
          provide: BrandService,
          useValue: mockBrandService,
        },
      ],
    }).compile();

    controller = module.get<BrandController>(BrandController);
    service = module.get<BrandService>(BrandService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a brand', async () => {
      const createBrandDto: CreateBrandDto = { brand_name: 'Toyota' };
      const expectedResult = {
        statusCode: 200,
        message: 'Brand berhasil dibuat',
        data: { id: 1, brand_name: 'Toyota' },
      };

      mockBrandService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createBrandDto);

      expect(service.create).toHaveBeenCalledWith(createBrandDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all brands', async () => {
      const query = { page: '1', limit: '10' };
      const expectedResult = {
        statusCode: 200,
        message: 'Data brand berhasil diambil',
        data: [],
        pagination: { total: 0, page: 1, limit: 10, lastPage: 0 },
      };

      mockBrandService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a brand by id', async () => {
      const id = 1;
      const expectedResult = {
        statusCode: 200,
        message: 'Retrieve data success',
        data: { id: 1, brand_name: 'Toyota' },
      };

      mockBrandService.findById.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);

      expect(service.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a brand', async () => {
      const id = 1;
      const updateBrandDto: UpdateBrandDto = { brand_name: 'Toyota Motor' };
      const expectedResult = {
        statusCode: 200,
        message: 'Brand berhasil diupdate',
        data: { id: 1, brand_name: 'Toyota Motor' },
      };

      mockBrandService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateBrandDto);

      expect(service.update).toHaveBeenCalledWith(id, updateBrandDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove a brand', async () => {
      const id = 1;
      const expectedResult = {
        statusCode: 200,
        message: 'Brand berhasil dihapus',
        data: null,
      };

      mockBrandService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });
});
