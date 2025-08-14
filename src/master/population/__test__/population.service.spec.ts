import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PopulationService } from '../population.service';
import { Population } from '../entities/population.entity';
import { UnitType } from '../../unit-type/entities/unit-type.entity';
import { Activities } from '../../activities/entities/activities.entity';
import { Sites } from '../../sites/entities/sites.entity';

describe('PopulationService', () => {
  let service: PopulationService;
  let repository: Repository<Population>;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
    softRemove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
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
        PopulationService,
        {
          provide: getRepositoryToken(Population),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PopulationService>(PopulationService);
    repository = module.get<Repository<Population>>(getRepositoryToken(Population));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return population by id', async () => {
      const mockPopulation = {
        id: 1,
        date_arrive: new Date('2024-01-01'),
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
        createdAt: new Date(),
        updatedAt: new Date(),
        unitType: {
          id: 1,
          unit_name: 'Excavator',
          type_name: 'Heavy Equipment',
          model_name: 'PC200-8',
          brand: {
            id: 1,
            brand_name: 'Komatsu'
          }
        },
        activities: {
          id: 1,
          activity_name: 'Mining'
        },
        site: {
          id: 1,
          site_name: 'Site A'
        }
      };

      mockRepository.findOne.mockResolvedValue(mockPopulation);

      const result = await service.findById(1);

      // Test bahwa response memiliki struktur yang benar
      expect(result.statusCode).toBe(200);
      expect(result.data).toBeDefined();
      expect(result.data!.id).toBe(1);
      expect(result.data!.no_unit).toBe('EXC001');
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['unitType', 'unitType.brand', 'activities', 'site'],
      });
    });

    it('should throw error when population not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow('Population tidak ditemukan');
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

      const mockPopulation = {
        id: 1,
        ...createDto,
        date_arrive: new Date(createDto.date_arrive),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock untuk check duplikasi VIN
      mockRepository.findOne.mockResolvedValueOnce(null);
      // Mock untuk check duplikasi no_unit
      mockRepository.findOne.mockResolvedValueOnce(null);
      // Mock untuk check duplikasi no_unit_system
      mockRepository.findOne.mockResolvedValueOnce(null);
      
      mockRepository.create.mockReturnValue(mockPopulation);
      mockRepository.save.mockResolvedValue(mockPopulation);
      
      // Mock untuk final fetch dengan relations
      mockRepository.findOne.mockResolvedValueOnce(mockPopulation);

      const result = await service.create(createDto);

      expect(result.message).toBe('Population berhasil dibuat');
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        date_arrive: new Date(createDto.date_arrive),
      });
    });

    it('should throw error when VIN number already exists', async () => {
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

      mockRepository.findOne.mockResolvedValue({ id: 1 }); // Existing VIN

      await expect(service.create(createDto)).rejects.toThrow('VIN number sudah terdaftar');
    });
  });

  describe('update', () => {
    it('should update population', async () => {
      const updateDto = {
        no_unit: 'EXC002',
        remarks: 'Updated remarks',
      };

      const existingPopulation = {
        id: 1,
        no_unit: 'EXC001',
        vin_number: 'VIN123456789',
        no_unit_system: 'SYS001',
        // ... other fields
      };

      const updatedPopulation = {
        ...existingPopulation,
        ...updateDto,
      };

      // Mock untuk find existing population
      mockRepository.findOne.mockResolvedValueOnce(existingPopulation);
      // Mock untuk check duplikasi no_unit
      mockRepository.findOne.mockResolvedValueOnce(null);
      
      mockRepository.merge.mockReturnValue(updatedPopulation);
      mockRepository.save.mockResolvedValue(updatedPopulation);
      
      // Mock untuk final fetch dengan relations
      mockRepository.findOne.mockResolvedValueOnce(updatedPopulation);

      const result = await service.update(1, updateDto);

      expect(result.message).toBe('Population berhasil diupdate');
      expect(mockRepository.merge).toHaveBeenCalledWith(existingPopulation, updateDto);
    });

    it('should throw error when population not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, {})).rejects.toThrow('Population tidak ditemukan');
    });
  });

  describe('remove', () => {
    it('should remove population', async () => {
      const mockPopulation = { id: 1, no_unit: 'EXC001' };

      mockRepository.findOne.mockResolvedValue(mockPopulation);
      mockRepository.softRemove.mockResolvedValue(mockPopulation);

      const result = await service.remove(1);

      expect(result.message).toBe('Population berhasil dihapus');
      expect(mockRepository.softRemove).toHaveBeenCalledWith(mockPopulation);
    });

    it('should throw error when population not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow('Population tidak ditemukan');
    });
  });
});
