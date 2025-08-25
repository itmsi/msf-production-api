import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import {
  CreateDailyPlanProductionDto,
  UpdateDailyPlanProductionDto,
  QueryDailyPlanProductionDto,
} from '../dto/daily-plan-production.dto';

describe('DailyPlanProduction DTOs', () => {
  describe('CreateDailyPlanProductionDto', () => {
    it('should validate valid data', async () => {
      const validData = {
        plan_date: '2025-01-01',
        average_day_ewh: 1.5,
        average_shift_ewh: 0.75,
        ob_target: 1000,
        ore_target: 800,
        quarry: 200,
        ore_shipment_target: 750,
        total_fleet: 15,
      };

      const dto = plainToClass(CreateDailyPlanProductionDto, validData);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should fail with invalid plan_date', async () => {
      const invalidData = {
        plan_date: 'invalid-date',
        average_day_ewh: 1.5,
        average_shift_ewh: 0.75,
        ob_target: 1000,
        ore_target: 800,
        quarry: 200,
        ore_shipment_target: 750,
        total_fleet: 15,
      };

      const dto = plainToClass(CreateDailyPlanProductionDto, invalidData);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isDateString).toBeDefined();
    });

    it('should fail with missing required fields', async () => {
      const invalidData = {
        plan_date: '2025-01-01',
        // Missing other required fields
      };

      const dto = plainToClass(CreateDailyPlanProductionDto, invalidData);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('UpdateDailyPlanProductionDto', () => {
    it('should validate valid data', async () => {
      const validData = {
        ob_target: 1200,
        ore_target: 900,
      };

      const dto = plainToClass(UpdateDailyPlanProductionDto, validData);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should allow partial updates', async () => {
      const partialData = {
        ob_target: 1200,
      };

      const dto = plainToClass(UpdateDailyPlanProductionDto, partialData);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should fail with invalid data types', async () => {
      const invalidData = {
        ob_target: 'invalid-number',
        ore_target: -100,
      };

      const dto = plainToClass(UpdateDailyPlanProductionDto, invalidData);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('QueryDailyPlanProductionDto', () => {
    it('should validate valid query parameters', async () => {
      const validData = {
        start_date: '2025-01-01',
        end_date: '2025-01-31',
        page: 1,
        limit: 20,
      };

      const dto = plainToClass(QueryDailyPlanProductionDto, validData);
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should use default values', () => {
      const dto = plainToClass(QueryDailyPlanProductionDto, {});

      expect(dto.page).toBe(1);
      expect(dto.limit).toBe(10);
    });

    it('should fail with invalid date format', async () => {
      const invalidData = {
        start_date: 'invalid-date',
        end_date: '2025-01-31',
      };

      const dto = plainToClass(QueryDailyPlanProductionDto, invalidData);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail with invalid page/limit', async () => {
      const invalidData = {
        page: -1,
        limit: 0,
      };

      const dto = plainToClass(QueryDailyPlanProductionDto, invalidData);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
