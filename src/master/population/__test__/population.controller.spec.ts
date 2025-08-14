import { Test, TestingModule } from '@nestjs/testing';
import { PopulationController } from '../population.controller';
import { PopulationService } from '../population.service';

describe('PopulationController', () => {
  let controller: PopulationController;
  let service: PopulationService;

  const mockPopulationService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PopulationController],
      providers: [
        {
          provide: PopulationService,
          useValue: mockPopulationService,
        },
      ],
    }).compile();

    controller = module.get<PopulationController>(PopulationController);
    service = module.get<PopulationService>(PopulationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all populations', async () => {
      const mockQuery = { page: '1', limit: '10' };
      const mockResult = {
        statusCode: 200,
        message: 'Data population berhasil diambil',
        data: [],
        meta: { total: 0, page: 1, limit: 10 }
      };

      mockPopulationService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(mockQuery);

      expect(result).toEqual(mockResult);
      expect(service.findAll).toHaveBeenCalledWith(mockQuery);
    });
  });

  describe('findOne', () => {
    it('should return population by id', async () => {
      const mockId = 1;
      const mockResult = {
        statusCode: 200,
        message: 'Retrieve data success',
        data: {
          id: 1,
          no_unit: 'EXC001',
          vin_number: 'VIN123456789',
        }
      };

      mockPopulationService.findById.mockResolvedValue(mockResult);

      const result = await controller.findOne(mockId);

      expect(result).toEqual(mockResult);
      expect(service.findById).toHaveBeenCalledWith(mockId);
    });
  });

  describe('create', () => {
    it('should create new population', async () => {
      const createDto = {
        date_arrive: '2024-01-01',
        status: 'active',
        unit_type_id: 1,
        no_unit: 'EXC001',
        vin_number: 'VIN123456789',
        no_unit_system: 'SYS001',
        engine_brand: 'cummins',
        serial_engine: 'ENG123456',
        activities_id: 1,
        site_origin: 'Site A',
        remarks: 'Unit dalam kondisi baik',
        site_id: 1,
        company: 'PT ABC',
        tyre_type: '6x4',
      };

      const mockResult = {
        statusCode: 201,
        message: 'Population berhasil dibuat',
        data: { id: 1, ...createDto }
      };

      mockPopulationService.create.mockResolvedValue(mockResult);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockResult);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update population', async () => {
      const updateDto = {
        no_unit: 'EXC002',
        remarks: 'Updated remarks',
      };

      const mockId = 1;
      const mockResult = {
        statusCode: 200,
        message: 'Population berhasil diupdate',
        data: { id: 1, ...updateDto }
      };

      mockPopulationService.update.mockResolvedValue(mockResult);

      const result = await controller.update(mockId, updateDto);

      expect(result).toEqual(mockResult);
      expect(service.update).toHaveBeenCalledWith(mockId, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove population', async () => {
      const mockId = 1;
      const mockResult = {
        statusCode: 200,
        message: 'Population berhasil dihapus',
        data: null
      };

      mockPopulationService.remove.mockResolvedValue(mockResult);

      const result = await controller.remove(mockId);

      expect(result).toEqual(mockResult);
      expect(service.remove).toHaveBeenCalledWith(mockId);
    });
  });
});
