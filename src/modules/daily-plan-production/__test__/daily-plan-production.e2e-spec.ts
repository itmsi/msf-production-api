import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DailyPlanProductionModule } from '../daily-plan-production.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

describe('DailyPlanProduction (e2e)', () => {
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
          username: process.env.POSTGRES_USER || 'postgres',
          password: process.env.POSTGRES_PASSWORD || 'password',
          database: process.env.POSTGRES_DB || 'test_db',
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: true,
          logging: false,
        }),
        DailyPlanProductionModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/daily-plan-production (POST)', () => {
    it('should create daily plan production', () => {
      const createDto = {
        plan_date: '2025-01-01',
        average_day_ewh: 1.5,
        average_shift_ewh: 0.75,
        ob_target: 1000,
        ore_target: 800,
        quarry: 200,
        ore_shipment_target: 750,
        total_fleet: 15,
      };

      return request(app.getHttpServer())
        .post('/daily-plan-production')
        .send(createDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Daily plan production berhasil dibuat',
          );
          expect(res.body.data).toBeDefined();
          expect(res.body.data.plan_date).toBeDefined();
          expect(res.body.data.sr_target).toBe(1.25);
          expect(res.body.data.shift_ob_target).toBe(500);
          expect(res.body.data.shift_ore_target).toBe(400);
          expect(res.body.data.shift_quarrt).toBe(100);
          expect(res.body.data.shift_sr_target).toBe(1.25);
          expect(res.body.data.remaining_stock).toBe(0);
        });
    });

    it('should fail with duplicate plan_date', async () => {
      const createDto = {
        plan_date: '2025-01-01',
        average_day_ewh: 1.5,
        average_shift_ewh: 0.75,
        ob_target: 1000,
        ore_target: 800,
        quarry: 200,
        ore_shipment_target: 750,
        total_fleet: 15,
      };

      // Create first record
      await request(app.getHttpServer())
        .post('/daily-plan-production')
        .send(createDto)
        .expect(201);

      // Try to create duplicate
      return request(app.getHttpServer())
        .post('/daily-plan-production')
        .send(createDto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe('Plan date sudah ada dalam database');
        });
    });

    it('should fail with invalid data', () => {
      const invalidDto = {
        plan_date: 'invalid-date',
        average_day_ewh: -1,
        ob_target: 0,
      };

      return request(app.getHttpServer())
        .post('/daily-plan-production')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('/daily-plan-production (GET)', () => {
    beforeEach(async () => {
      // Create test data
      const createDto = {
        plan_date: '2025-01-01',
        average_day_ewh: 1.5,
        average_shift_ewh: 0.75,
        ob_target: 1000,
        ore_target: 800,
        quarry: 200,
        ore_shipment_target: 750,
        total_fleet: 15,
      };

      await request(app.getHttpServer())
        .post('/daily-plan-production')
        .send(createDto);
    });

    it('should return all daily plan productions', () => {
      return request(app.getHttpServer())
        .get('/daily-plan-production')
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Data daily plan production berhasil diambil',
          );
          expect(res.body.data).toBeDefined();
          expect(res.body.data.data).toBeInstanceOf(Array);
          expect(res.body.data.pagination).toBeDefined();
        });
    });

    it('should return paginated results', () => {
      return request(app.getHttpServer())
        .get('/daily-plan-production?page=1&limit=5')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.pagination.page).toBe(1);
          expect(res.body.data.pagination.limit).toBe(5);
        });
    });

    it('should filter by date range', () => {
      return request(app.getHttpServer())
        .get('/daily-plan-production?start_date=2025-01-01&end_date=2025-01-31')
        .expect(200)
        .expect((res) => {
          expect(res.body.data.data.length).toBeGreaterThan(0);
        });
    });
  });

  describe('/daily-plan-production/:id (GET)', () => {
    let createdId: number;

    beforeEach(async () => {
      const createDto = {
        plan_date: '2025-01-02',
        average_day_ewh: 1.5,
        average_shift_ewh: 0.75,
        ob_target: 1000,
        ore_target: 800,
        quarry: 200,
        ore_shipment_target: 750,
        total_fleet: 15,
      };

      const response = await request(app.getHttpServer())
        .post('/daily-plan-production')
        .send(createDto);

      createdId = response.body.data.id;
    });

    it('should return daily plan production by id', () => {
      return request(app.getHttpServer())
        .get(`/daily-plan-production/${createdId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Data daily plan production berhasil diambil',
          );
          expect(res.body.data.id).toBe(createdId);
        });
    });

    it('should return 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .get('/daily-plan-production/999')
        .expect(404);
    });
  });

  describe('/daily-plan-production/:id (PATCH)', () => {
    let createdId: number;

    beforeEach(async () => {
      const createDto = {
        plan_date: '2025-01-03',
        average_day_ewh: 1.5,
        average_shift_ewh: 0.75,
        ob_target: 1000,
        ore_target: 800,
        quarry: 200,
        ore_shipment_target: 750,
        total_fleet: 15,
      };

      const response = await request(app.getHttpServer())
        .post('/daily-plan-production')
        .send(createDto);

      createdId = response.body.data.id;
    });

    it('should update daily plan production', () => {
      const updateDto = {
        ob_target: 1200,
        ore_target: 900,
      };

      return request(app.getHttpServer())
        .patch(`/daily-plan-production/${createdId}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Daily plan production berhasil diupdate',
          );
          expect(res.body.data.ob_target).toBe(1200);
          expect(res.body.data.ore_target).toBe(900);
          expect(res.body.data.sr_target).toBe(1.33);
          expect(res.body.data.shift_ob_target).toBe(600);
          expect(res.body.data.shift_ore_target).toBe(450);
        });
    });

    it('should return 404 for non-existent id', () => {
      const updateDto = { ob_target: 1200 };

      return request(app.getHttpServer())
        .patch('/daily-plan-production/999')
        .send(updateDto)
        .expect(404);
    });
  });

  describe('/daily-plan-production/:id (DELETE)', () => {
    let createdId: number;

    beforeEach(async () => {
      const createDto = {
        plan_date: '2025-01-04',
        average_day_ewh: 1.5,
        average_shift_ewh: 0.75,
        ob_target: 1000,
        ore_target: 800,
        quarry: 200,
        ore_shipment_target: 750,
        total_fleet: 15,
      };

      const response = await request(app.getHttpServer())
        .post('/daily-plan-production')
        .send(createDto);

      createdId = response.body.data.id;
    });

    it('should delete daily plan production', () => {
      return request(app.getHttpServer())
        .delete(`/daily-plan-production/${createdId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe(
            'Daily plan production berhasil dihapus',
          );
        });
    });

    it('should return 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .delete('/daily-plan-production/999')
        .expect(404);
    });
  });
});
