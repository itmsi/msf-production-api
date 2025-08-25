import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BargeModule } from '../barge.module';
import { Barge } from '../entities/barge.entity';
import { BargeService } from '../barge.service';
import { BargeController } from '../barge.controller';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Barge Integration Tests', () => {
  let app: INestApplication;
  let bargeService: BargeService;
  let bargeController: BargeController;
  let bargeRepository: Repository<Barge>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.POSTGRES_HOST || 'localhost',
          port: parseInt(process.env.POSTGRES_PORT || '5432'),
          username: process.env.POSTGRES_USER || 'test',
          password: process.env.POSTGRES_PASSWORD || 'test',
          database: process.env.POSTGRES_DB || 'test',
          entities: [Barge],
          synchronize: true,
          dropSchema: true,
        }),
        BargeModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    bargeService = moduleFixture.get<BargeService>(BargeService);
    bargeController = moduleFixture.get<BargeController>(BargeController);
    bargeRepository = moduleFixture.get<Repository<Barge>>(
      getRepositoryToken(Barge),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clear database before each test
    await bargeRepository.clear();
  });

  describe('BargeService Integration', () => {
    it('should create and find barge', async () => {
      const createBargeDto = {
        name: 'Barge Kalimantan',
        capacity: 1000,
        remarks: 'Test remarks',
      };

      const createdBarge = await bargeService.create(createBargeDto, 1);
      expect(createdBarge.statusCode).toBe(200);

      const foundBarge = await bargeService.findById(createdBarge.data.id);
      expect(foundBarge.statusCode).toBe(200);
      expect(foundBarge.data.id).toBe(createdBarge.data.id);
    });

    it('should update barge', async () => {
      const createBargeDto = {
        name: 'Barge Sumatra',
        capacity: 1500,
        remarks: 'Test remarks',
      };

      const createdBarge = await bargeService.create(createBargeDto, 1);
      const bargeId = createdBarge.data.id;

      const updateBargeDto = {
        name: 'Barge Sumatra Updated',
        capacity: 2000,
      };

      const updatedBarge = await bargeService.update(
        bargeId,
        updateBargeDto,
        1,
      );
      expect(updatedBarge.statusCode).toBe(200);
      expect(updatedBarge.data.name).toBe(updateBargeDto.name);
      expect(updatedBarge.data.capacity).toBe(updateBargeDto.capacity);
    });

    it('should soft delete and restore barge', async () => {
      const createBargeDto = {
        name: 'Barge Sulawesi',
        capacity: 800,
        remarks: 'Test remarks',
      };

      const createdBarge = await bargeService.create(createBargeDto, 1);
      const bargeId = createdBarge.data.id;

      // Soft delete
      const deletedBarge = await bargeService.delete(bargeId, 1);
      expect(deletedBarge.statusCode).toBe(200);
      expect(deletedBarge.message).toBe('Barge berhasil dihapus');

      // Try to find deleted barge
      const foundBarge = await bargeService.findById(bargeId);
      expect(foundBarge.data).toBeNull();

      // Restore barge
      const restoredBarge = await bargeService.restore(bargeId, 1);
      expect(restoredBarge.statusCode).toBe(200);
      expect(restoredBarge.message).toBe('Barge berhasil dipulihkan');

      // Verify barge is restored
      const foundRestoredBarge = await bargeService.findById(bargeId);
      expect(foundRestoredBarge.data).not.toBeNull();
    });

    it('should find all barges with pagination', async () => {
      // Create multiple barges
      const bargeData = [
        { name: 'Barge Papua', capacity: 1200, remarks: 'Test 1' },
        { name: 'Barge Jawa', capacity: 600, remarks: 'Test 2' },
        { name: 'Barge Bali', capacity: 400, remarks: 'Test 3' },
      ];

      for (const data of bargeData) {
        await bargeService.create(data, 1);
      }

      const allBarges = await bargeService.findAll({ page: '1', limit: '10' });
      expect(allBarges.statusCode).toBe(200);
      expect(allBarges.data).toHaveLength(3);
      expect(allBarges.meta.total).toBe(3);
    });

    it('should apply search filter', async () => {
      const bargeData = [
        { name: 'Barge Kalimantan', capacity: 1000, remarks: 'Test remarks' },
        { name: 'Barge Sumatra', capacity: 1500, remarks: 'Other remarks' },
      ];

      for (const data of bargeData) {
        await bargeService.create(data, 1);
      }

      const searchResult = await bargeService.findAll({ search: 'Kalimantan' });
      expect(searchResult.statusCode).toBe(200);
      expect(searchResult.data).toHaveLength(1);
      expect(searchResult.data[0].name).toBe('Barge Kalimantan');
    });

    it('should apply capacity filter', async () => {
      const bargeData = [
        { name: 'Barge Small', capacity: 500, remarks: 'Small barge' },
        { name: 'Barge Medium', capacity: 1000, remarks: 'Small barge' },
        { name: 'Barge Large', capacity: 2000, remarks: 'Large barge' },
      ];

      for (const data of bargeData) {
        await bargeService.create(data, 1);
      }

      const filteredResult = await bargeService.findAll({
        minCapacity: '800',
        maxCapacity: '1500',
      });
      expect(filteredResult.statusCode).toBe(200);
      expect(filteredResult.data).toHaveLength(1);
      expect(filteredResult.data[0].capacity).toBe(1000);
    });
  });

  describe('BargeController Integration', () => {
    it('should handle controller methods correctly', async () => {
      const createBargeDto = {
        name: 'Barge Controller Test',
        capacity: 1000,
        remarks: 'Controller test remarks',
      };

      const mockRequest = { user: { id: 1 } };

      // Test create through controller
      const createdBarge = await bargeController.create(
        createBargeDto,
        mockRequest,
      );
      expect(createdBarge.statusCode).toBe(200);

      const bargeId = createdBarge.data.id;

      // Test findById through controller
      const foundBarge = await bargeController.findById(bargeId);
      expect(foundBarge.statusCode).toBe(200);
      expect(foundBarge.data.id).toBe(bargeId);

      // Test update through controller
      const updateBargeDto = {
        name: 'Barge Controller Updated',
      };

      const updatedBarge = await bargeController.update(
        bargeId,
        updateBargeDto,
        mockRequest,
      );
      expect(updatedBarge.statusCode).toBe(200);
      expect(updatedBarge.data.name).toBe(updateBargeDto.name);
    });
  });

  describe('Database Integration', () => {
    it('should persist data correctly', async () => {
      const createBargeDto = {
        name: 'Barge Database Test',
        capacity: 1000,
        remarks: 'Database test remarks',
      };

      const createdBarge = await bargeService.create(createBargeDto, 1);
      const bargeId = createdBarge.data.id;

      // Verify data is in database
      const dbBarge = await bargeRepository.findOne({ where: { id: bargeId } });
      expect(dbBarge).toBeDefined();
      expect(dbBarge.name).toBe(createBargeDto.name);
      expect(dbBarge.capacity).toBe(createBargeDto.capacity);
      expect(dbBarge.remarks).toBe(createBargeDto.remarks);
      expect(dbBarge.createdBy).toBe(1);
      expect(dbBarge.updatedBy).toBe(1);
    });

    it('should handle soft delete correctly', async () => {
      const createBargeDto = {
        name: 'Barge Soft Delete Test',
        capacity: 1000,
        remarks: 'Soft delete test remarks',
      };

      const createdBarge = await bargeService.create(createBargeDto, 1);
      const bargeId = createdBarge.data.id;

      // Soft delete
      await bargeService.delete(bargeId, 1);

      // Verify soft delete in database
      const dbBarge = await bargeRepository.findOne({ where: { id: bargeId } });
      expect(dbBarge.deletedAt).toBeDefined();
      expect(dbBarge.deletedBy).toBe(1);
    });
  });
});
