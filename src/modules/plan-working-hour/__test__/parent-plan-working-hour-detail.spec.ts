import { Test, TestingModule } from '@nestjs/testing';
import { ParentPlanWorkingHourController } from '../parent-plan-working-hour.controller';
import { ParentPlanWorkingHourService } from '../parent-plan-working-hour.service';
import { GetParentPlanWorkingHourDetailQueryDto } from '../dto/parent-plan-working-hour.dto';

describe('ParentPlanWorkingHourController - Detail Endpoint', () => {
  let controller: ParentPlanWorkingHourController;
  let service: ParentPlanWorkingHourService;

  const mockService = {
    getDetail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParentPlanWorkingHourController],
      providers: [
        {
          provide: ParentPlanWorkingHourService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ParentPlanWorkingHourController>(ParentPlanWorkingHourController);
    service = module.get<ParentPlanWorkingHourService>(ParentPlanWorkingHourService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /detail', () => {
    it('should return detail data with pagination', async () => {
      const query: GetParentPlanWorkingHourDetailQueryDto = {
        start_date: '2025-08-01',
        end_date: '2025-08-31',
        month_year: '2025-08',
        page: '1',
        limit: '10',
      };

      const mockResponse = {
        statusCode: 200,
        message: 'Detail parent plan working hour berhasil diambil',
        data: [
          {
            plan_date: '2025-08-01',
            calendar_day: 'available',
            working_hour_day: 8,
            working_hour_month: 216,
            working_hour_longshift: 14.4,
            working_day_longshift: 1.5,
            mohh_per_month: 100,
            total_delay: 10,
            total_idle: 10,
            total_breakdown: 10,
            ewh: 80,
            pa: 1.0,
            ma: 0.89,
            ua: 0.8,
            eu: 0.67,
            is_available_to_edit: true,
            is_available_to_delete: true,
          },
        ],
        pagination: {
          total: 31,
          page: 1,
          limit: 10,
          lastPage: 4,
        },
      };

      mockService.getDetail.mockResolvedValue(mockResponse);

      const result = await controller.getDetail(query);

      expect(service.getDetail).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResponse);
    });

    it('should handle query without optional parameters', async () => {
      const query: GetParentPlanWorkingHourDetailQueryDto = {
        start_date: '2025-08-01',
        end_date: '2025-08-31',
        month_year: '2025-08',
      };

      const mockResponse = {
        statusCode: 200,
        message: 'Detail parent plan working hour berhasil diambil',
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          lastPage: 0,
        },
      };

      mockService.getDetail.mockResolvedValue(mockResponse);

      const result = await controller.getDetail(query);

      expect(service.getDetail).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty data response', async () => {
      const query: GetParentPlanWorkingHourDetailQueryDto = {
        start_date: '2025-08-01',
        end_date: '2025-08-31',
        month_year: '2025-08',
        page: '1',
        limit: '10',
      };

      const mockResponse = {
        statusCode: 200,
        message: 'Detail parent plan working hour berhasil diambil',
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          lastPage: 0,
        },
      };

      mockService.getDetail.mockResolvedValue(mockResponse);

      const result = await controller.getDetail(query);

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });
});
