import { Test, TestingModule } from '@nestjs/testing';
import { DailyPlanProductionModule } from '../daily-plan-production.module';
import { DailyPlanProductionService } from '../daily-plan-production.service';
import { DailyPlanProductionController } from '../daily-plan-production.controller';

describe('DailyPlanProduction Integration', () => {
  let module: TestingModule;
  let service: DailyPlanProductionService;
  let controller: DailyPlanProductionController;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [DailyPlanProductionModule],
    }).compile();

    service = module.get<DailyPlanProductionService>(DailyPlanProductionService);
    controller = module.get<DailyPlanProductionController>(DailyPlanProductionController);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
    expect(service).toBeDefined();
    expect(controller).toBeDefined();
  });

  it('should have correct module structure', () => {
    const moduleInstance = module.get(DailyPlanProductionModule);
    expect(moduleInstance).toBeDefined();
  });
});
