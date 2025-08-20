import { Test, TestingModule } from '@nestjs/testing';
import { BargeController } from '../barge.controller';
import { BargeService } from '../barge.service';
import { CreateBargeDto, UpdateBargeDto } from '../dto/barge.dto';

describe('BargeController', () => {
  let controller: BargeController;
  let service: BargeService;

  const mockBargeService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    restore: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BargeController],
      providers: [
        {
          provide: BargeService,
          useValue: mockBargeService,
        },
      ],
    }).compile();

    controller = module.get<BargeController>(BargeController);
    service = module.get<BargeService>(BargeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all barges', async () => {
      const mockResponse = {
        statusCode: 200,
        message: 'Data barge berhasil diambil',
        data: [],
        meta: { total: 0, page: 1, limit: 10 },
      };

      mockBargeService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll({});
      expect(result).toEqual(mockResponse);
      expect(service.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('findById', () => {
    it('should return a barge by id', async () => {
      const mockResponse = {
        statusCode: 200,
        message: 'Data barge berhasil diambil',
        data: {
          id: 1,
          name: 'Barge Kalimantan',
          capacity: 1000,
          remarks: 'Test remarks',
          createdAt: new Date(),
          createdBy: 1,
          updatedAt: new Date(),
          updatedBy: 1,
        },
      };

      mockBargeService.findById.mockResolvedValue(mockResponse);

      const result = await controller.findById(1);
      expect(result).toEqual(mockResponse);
      expect(service.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a new barge', async () => {
      const createBargeDto: CreateBargeDto = {
        name: 'Barge Kalimantan',
        capacity: 1000,
        remarks: 'Test remarks',
      };

      const mockResponse = {
        statusCode: 201,
        message: 'Barge berhasil dibuat',
        data: {
          id: 1,
          ...createBargeDto,
          createdAt: new Date(),
          createdBy: 1,
          updatedAt: new Date(),
          updatedBy: 1,
        },
      };

      mockBargeService.create.mockResolvedValue(mockResponse);

      const mockRequest = { user: { id: 1 } };
      const result = await controller.create(createBargeDto, mockRequest);
      
      expect(result).toEqual(mockResponse);
      expect(service.create).toHaveBeenCalledWith(createBargeDto, 1);
    });
  });

  describe('update', () => {
    it('should update a barge', async () => {
      const updateBargeDto: UpdateBargeDto = {
        name: 'Barge Kalimantan Updated',
        capacity: 1500,
      };

      const mockResponse = {
        statusCode: 200,
        message: 'Barge berhasil diupdate',
        data: {
          id: 1,
          shipment: 'Barge-001',
          name: 'Barge Kalimantan Updated',
          capacity: 1500,
          remarks: 'Test remarks',
          createdAt: new Date(),
          createdBy: 1,
          updatedAt: new Date(),
          updatedBy: 1,
        },
      };

      mockBargeService.update.mockResolvedValue(mockResponse);

      const mockRequest = { user: { id: 1 } };
      const result = await controller.update(1, updateBargeDto, mockRequest);
      
      expect(result).toEqual(mockResponse);
      expect(service.update).toHaveBeenCalledWith(1, updateBargeDto, 1);
    });
  });

  describe('delete', () => {
    it('should delete a barge', async () => {
      const mockResponse = {
        statusCode: 200,
        message: 'Barge berhasil dihapus',
        data: null,
      };

      mockBargeService.delete.mockResolvedValue(mockResponse);

      const mockRequest = { user: { id: 1 } };
      const result = await controller.delete(1, mockRequest);
      
      expect(result).toEqual(mockResponse);
      expect(service.delete).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('restore', () => {
    it('should restore a deleted barge', async () => {
      const mockResponse = {
        statusCode: 200,
        message: 'Barge berhasil dipulihkan',
        data: {
          id: 1,
          name: 'Barge Kalimantan',
          capacity: 1000,
          remarks: 'Test remarks',
          createdAt: new Date(),
          createdBy: 1,
          updatedAt: new Date(),
          updatedBy: 1,
        },
      };

      mockBargeService.restore.mockResolvedValue(mockResponse);

      const mockRequest = { user: { id: 1 } };
      const result = await controller.restore(1, mockRequest);
      
      expect(result).toEqual(mockResponse);
      expect(service.restore).toHaveBeenCalledWith(1, 1);
    });
  });
});
