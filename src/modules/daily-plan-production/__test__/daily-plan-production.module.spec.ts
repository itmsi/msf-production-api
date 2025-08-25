import { Test, TestingModule } from '@nestjs/testing';
import { DailyPlanProductionModule } from '../daily-plan-production.module';
import { DailyPlanProductionService } from '../daily-plan-production.service';
import { DailyPlanProductionController } from '../daily-plan-production.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DailyPlanProduction } from '../entities/daily-plan-production.entity';

describe('DailyPlanProductionModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [DailyPlanProductionModule],
    })
      .overrideProvider(getRepositoryToken(DailyPlanProduction))
      .useValue({
        findOne: jest.fn(),
        save: jest.fn(),
        findAndCount: jest.fn(),
        softDelete: jest.fn(),
      })
      .compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide DailyPlanProductionService', () => {
    const service = module.get<DailyPlanProductionService>(
      DailyPlanProductionService,
    );
    expect(service).toBeDefined();
  });

  it('should provide DailyPlanProductionController', () => {
    const controller = module.get<DailyPlanProductionController>(
      DailyPlanProductionController,
    );
    expect(controller).toBeDefined();
  });

  it('should export DailyPlanProductionService', () => {
    const service = module.get<DailyPlanProductionService>(
      DailyPlanProductionService,
    );
    expect(service).toBeDefined();
  });

  it('should have correct module structure', () => {
    const moduleInstance = module.get(DailyPlanProductionModule);
    expect(moduleInstance).toBeDefined();
  });
});
