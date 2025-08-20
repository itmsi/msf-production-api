import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { BargeModule } from '../barge.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

describe('BargeController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
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
          entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
          synchronize: true,
          dropSchema: true,
        }),
        BargeModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/barges (GET)', () => {
    it('should return empty array when no barges exist', () => {
      return request(app.getHttpServer())
        .get('/barges')
        .expect(200)
        .expect((res) => {
          expect(res.body.statusCode).toBe(200);
          expect(res.body.data).toEqual([]);
          expect(res.body.meta.total).toBe(0);
        });
    });
  });

  describe('/barges (POST)', () => {
    it('should create a new barge', () => {
      const createBargeDto = {
        name: 'Barge Kalimantan',
        capacity: 1000,
        remarks: 'Test remarks',
      };

      return request(app.getHttpServer())
        .post('/barges')
        .send(createBargeDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.statusCode).toBe(201);
                  expect(res.body.data.name).toBe(createBargeDto.name);
          expect(res.body.data.capacity).toBe(createBargeDto.capacity);
          expect(res.body.data.remarks).toBe(createBargeDto.remarks);
          expect(res.body.data.id).toBeDefined();
        });
    });

    it('should validate required fields', () => {
      const invalidBargeDto = {
        shipment: 'A'.repeat(256), // Exceeds max length
        capacity: -1, // Invalid capacity
      };

      return request(app.getHttpServer())
        .post('/barges')
        .send(invalidBargeDto)
        .expect(400);
    });
  });

  describe('/barges/:id (GET)', () => {
    it('should return 404 for non-existent barge', () => {
      return request(app.getHttpServer())
        .get('/barges/999')
        .expect(404);
    });

    it('should return barge by id after creation', async () => {
      // First create a barge
      const createBargeDto = {
        name: 'Barge Sumatra',
        capacity: 1500,
        remarks: 'Test remarks',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/barges')
        .send(createBargeDto)
        .expect(201);

      const bargeId = createResponse.body.data.id;

      // Then get the barge by id
      return request(app.getHttpServer())
        .get(`/barges/${bargeId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.statusCode).toBe(200);
                  expect(res.body.data.id).toBe(bargeId);
      });
    });
  });

  describe('/barges/:id (PUT)', () => {
    it('should update existing barge', async () => {
      // First create a barge
      const createBargeDto = {
        shipment: 'Barge-003',
        name: 'Barge Sulawesi',
        capacity: 800,
        remarks: 'Test remarks',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/barges')
        .send(createBargeDto)
        .expect(201);

      const bargeId = createResponse.body.data.id;

      // Then update the barge
      const updateBargeDto = {
        name: 'Barge Sulawesi Updated',
        capacity: 1200,
      };

      return request(app.getHttpServer())
        .put(`/barges/${bargeId}`)
        .send(updateBargeDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.statusCode).toBe(200);
          expect(res.body.data.name).toBe(updateBargeDto.name);
          expect(res.body.data.capacity).toBe(updateBargeDto.capacity);
        });
    });

    it('should return 404 for non-existent barge', () => {
      const updateBargeDto = {
        name: 'Updated Name',
      };

      return request(app.getHttpServer())
        .put('/barges/999')
        .send(updateBargeDto)
        .expect(404);
    });
  });

  describe('/barges/:id (DELETE)', () => {
    it('should soft delete existing barge', async () => {
      // First create a barge
      const createBargeDto = {
        shipment: 'Barge-004',
        name: 'Barge Papua',
        capacity: 1200,
        remarks: 'Test remarks',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/barges')
        .send(createBargeDto)
        .expect(201);

      const bargeId = createResponse.body.data.id;

      // Then delete the barge
      return request(app.getHttpServer())
        .delete(`/barges/${bargeId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.statusCode).toBe(200);
          expect(res.body.message).toBe('Barge berhasil dihapus');
        });
    });

    it('should return 404 for non-existent barge', () => {
      return request(app.getHttpServer())
        .delete('/barges/999')
        .expect(404);
    });
  });

  describe('/barges/:id/restore (POST)', () => {
    it('should restore deleted barge', async () => {
      // First create a barge
      const createBargeDto = {
        shipment: 'Barge-005',
        name: 'Barge Jawa',
        capacity: 600,
        remarks: 'Test remarks',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/barges')
        .send(createBargeDto)
        .expect(201);

      const bargeId = createResponse.body.data.id;

      // Then delete the barge
      await request(app.getHttpServer())
        .delete(`/barges/${bargeId}`)
        .expect(200);

      // Then restore the barge
      return request(app.getHttpServer())
        .post(`/barges/${bargeId}/restore`)
        .expect(200)
        .expect((res) => {
          expect(res.body.statusCode).toBe(200);
          expect(res.body.message).toBe('Barge berhasil dipulihkan');
        });
    });

    it('should return 404 for non-existent barge', () => {
      return request(app.getHttpServer())
        .post('/barges/999/restore')
        .expect(404);
    });
  });
});
