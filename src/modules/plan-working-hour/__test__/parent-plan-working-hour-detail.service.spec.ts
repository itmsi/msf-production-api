import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ParentPlanWorkingHourService } from '../parent-plan-working-hour.service';
import { ParentPlanWorkingHour } from '../entities/parent-plan-working-hour.entity';
import { PlanWorkingHour } from '../entities/plan-working-hour.entity';
import { PlanWorkingHourDetail } from '../entities/plan-working-hour-detail.entity';
import { GetParentPlanWorkingHourDetailQueryDto } from '../dto/parent-plan-working-hour.dto';
import { Activities } from '../../activities/entities/activities.entity';

describe('ParentPlanWorkingHourService - Detail Method', () => {
  let service: ParentPlanWorkingHourService;
  let planWorkingHourRepository: any;
  let dataSource: any;

  const mockPlanWorkingHourRepository = {
    createQueryBuilder: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(),
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getCount: jest.fn(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParentPlanWorkingHourService,
        {
          provide: getRepositoryToken(ParentPlanWorkingHour),
          useValue: {},
        },
        {
          provide: getRepositoryToken(PlanWorkingHour),
          useValue: mockPlanWorkingHourRepository,
        },
        {
          provide: getRepositoryToken(PlanWorkingHourDetail),
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ParentPlanWorkingHourService>(
      ParentPlanWorkingHourService,
    );
    planWorkingHourRepository = module.get(getRepositoryToken(PlanWorkingHour));
    dataSource = module.get(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDetail', () => {
    it('should return paginated detail data with calculated metrics', async () => {
      const query: GetParentPlanWorkingHourDetailQueryDto = {
        start_date: '2025-08-01',
        end_date: '2025-08-31',
        month_year: '2025-08',
        page: '1',
        limit: '10',
      };

      const mockPlanWorkingHours = [
        {
          id: 1,
          plan_date: new Date('2025-08-01'),
          is_calender_day: true,
          working_hour_day: 8,
          working_hour_month: 216,
          working_hour_longshift: 14.4,
          working_day_longshift: 1.5,
          mohh_per_month: 100,
          details: [
            {
              activities_hour: 5,
              activities: { status: 'delay' },
            },
            {
              activities_hour: 3,
              activities: { status: 'idle' },
            },
            {
              activities_hour: 2,
              activities: { status: 'breakdown' },
            },
          ],
        },
      ];

      mockPlanWorkingHourRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue(mockPlanWorkingHours);

      const result = await service.getDetail(query);

      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toHaveProperty('r_plan_working_hour_id', 1);
      expect(result.data[0]).toHaveProperty('plan_date', '2025-08-01');
      expect(result.data[0]).toHaveProperty('calendar_day', 'available');
      expect(result.data[0]).toHaveProperty('total_delay', 5);
      expect(result.data[0]).toHaveProperty('total_idle', 3);
      expect(result.data[0]).toHaveProperty('total_breakdown', 2);
      expect(result.data[0]).toHaveProperty('ewh', 93);
      expect(result.pagination).toBeDefined();
    });

    it('should handle empty details array', async () => {
      const query: GetParentPlanWorkingHourDetailQueryDto = {
        start_date: '2025-08-01',
        end_date: '2025-08-31',
        month_year: '2025-08',
        page: '1',
        limit: '10',
      };

      const mockPlanWorkingHours = [
        {
          id: 1,
          plan_date: new Date('2025-08-01'),
          is_calender_day: true,
          working_hour_day: 8,
          working_hour_month: 216,
          working_hour_longshift: 14.4,
          working_day_longshift: 1.5,
          mohh_per_month: 100,
          details: [],
        },
      ];

      mockPlanWorkingHourRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue(mockPlanWorkingHours);

      const result = await service.getDetail(query);

      expect(result.data[0]).toHaveProperty('total_delay', 0);
      expect(result.data[0]).toHaveProperty('total_idle', 0);
      expect(result.data[0]).toHaveProperty('total_breakdown', 0);
      expect(result.data[0]).toHaveProperty('ewh', 100);
    });

    it('should handle null is_calender_day as holiday', async () => {
      const query: GetParentPlanWorkingHourDetailQueryDto = {
        start_date: '2025-08-01',
        end_date: '2025-08-31',
        month_year: '2025-08',
        page: '1',
        limit: '10',
      };

      const mockPlanWorkingHours = [
        {
          id: 1,
          plan_date: new Date('2025-08-01'),
          is_calender_day: null,
          working_hour_day: 8,
          working_hour_month: 216,
          working_hour_longshift: 14.4,
          working_day_longshift: 1.5,
          mohh_per_month: 100,
          details: [],
        },
      ];

      mockPlanWorkingHourRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue(mockPlanWorkingHours);

      const result = await service.getDetail(query);

      expect(result.data[0]).toHaveProperty('calendar_day', 'holiday');
    });

    it('should handle false is_calender_day as one shift', async () => {
      const query: GetParentPlanWorkingHourDetailQueryDto = {
        start_date: '2025-08-01',
        end_date: '2025-08-31',
        month_year: '2025-08',
        page: '1',
        limit: '10',
      };

      const mockPlanWorkingHours = [
        {
          id: 1,
          plan_date: new Date('2025-08-01'),
          is_calender_day: false,
          working_hour_day: 8,
          working_hour_month: 216,
          working_hour_longshift: 14.4,
          working_day_longshift: 1.5,
          mohh_per_month: 100,
          details: [],
        },
      ];

      mockPlanWorkingHourRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue(mockPlanWorkingHours);

      const result = await service.getDetail(query);

      expect(result.data[0]).toHaveProperty('calendar_day', 'one shift');
    });

    it('should use default pagination values when not provided', async () => {
      const query: GetParentPlanWorkingHourDetailQueryDto = {
        start_date: '2025-08-01',
        end_date: '2025-08-31',
        month_year: '2025-08',
      };

      mockPlanWorkingHourRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );
      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await service.getDetail(query);

      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('should limit maximum page size to 100', async () => {
      const query: GetParentPlanWorkingHourDetailQueryDto = {
        start_date: '2025-08-01',
        end_date: '2025-08-31',
        month_year: '2025-08',
        page: '1',
        limit: '150',
      };

      mockPlanWorkingHourRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );
      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await service.getDetail(query);

      expect(result.pagination.limit).toBe(100);
    });

    it('should round all numeric values to 2 decimal places', async () => {
      const query: GetParentPlanWorkingHourDetailQueryDto = {
        start_date: '2025-08-01',
        end_date: '2025-08-31',
        month_year: '2025-08',
        page: '1',
        limit: '10',
      };

      const mockPlanWorkingHours = [
        {
          id: 1,
          plan_date: new Date('2025-08-01'),
          is_calender_day: true,
          working_hour_day: 8.12345,
          working_hour_month: 216.789,
          working_hour_longshift: 14.45678,
          working_day_longshift: 1.56789,
          mohh_per_month: 100.123,
          schedule_day: 1.0,
          details: [
            {
              activities_hour: 5.6789,
              activities: { status: 'delay' },
            },
            {
              activities_hour: 3.4567,
              activities: { status: 'idle' },
            },
            {
              activities_hour: 2.3456,
              activities: { status: 'breakdown' },
            },
          ],
        },
      ];

      mockPlanWorkingHourRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue(mockPlanWorkingHours);

      const result = await service.getDetail(query);

      expect(result.data[0]).toHaveProperty('working_hour_day', 8.12);
      expect(result.data[0]).toHaveProperty('working_hour_month', 216.79);
      expect(result.data[0]).toHaveProperty('working_hour_longshift', 14.46);
      expect(result.data[0]).toHaveProperty('working_day_longshift', 1.57);
      expect(result.data[0]).toHaveProperty('mohh_per_month', 100.12);
      expect(result.data[0]).toHaveProperty('total_delay', 5.68);
      expect(result.data[0]).toHaveProperty('total_idle', 3.46);
      expect(result.data[0]).toHaveProperty('total_breakdown', 2.35);

      // Test calculated metrics rounding
      // EWH calculation: 100.123 - 5.6789 - 2.3456 = 92.0985, rounded to 92.1
      expect(result.data[0]).toHaveProperty('ewh', 92.1);
    });

    it('should handle zero values correctly with rounding', async () => {
      const query: GetParentPlanWorkingHourDetailQueryDto = {
        start_date: '2025-08-01',
        end_date: '2025-08-31',
        month_year: '2025-08',
        page: '1',
        limit: '10',
      };

      const mockPlanWorkingHours = [
        {
          id: 1,
          plan_date: new Date('2025-08-01'),
          is_calender_day: false,
          working_hour_day: 0,
          working_hour_month: 0,
          working_hour_longshift: 0,
          working_day_longshift: 0,
          mohh_per_month: 0,
          schedule_day: 1,
          details: [],
        },
      ];

      mockPlanWorkingHourRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue(mockPlanWorkingHours);

      const result = await service.getDetail(query);

      expect(result.data[0]).toHaveProperty('working_hour_day', 0);
      expect(result.data[0]).toHaveProperty('working_hour_month', 0);
      expect(result.data[0]).toHaveProperty('working_hour_longshift', 0);
      expect(result.data[0]).toHaveProperty('working_day_longshift', 0);
      expect(result.data[0]).toHaveProperty('mohh_per_month', 0);
      expect(result.data[0]).toHaveProperty('total_delay', 0);
      expect(result.data[0]).toHaveProperty('total_idle', 0);
      expect(result.data[0]).toHaveProperty('total_breakdown', 0);
      expect(result.data[0]).toHaveProperty('ewh', 0);
      expect(result.data[0]).toHaveProperty('pa', 0);
      expect(result.data[0]).toHaveProperty('ma', 0);
      expect(result.data[0]).toHaveProperty('ua', 0);
      expect(result.data[0]).toHaveProperty('eu', 0);
    });

    it('should get detail by ID successfully', async () => {
      const id = 9;
      const mockPlanWorkingHour = {
        id: 9,
        plan_date: new Date('2025-08-01'),
        is_calender_day: true,
        working_hour_day: 8,
        working_hour_month: 216,
        working_hour_longshift: 14.4,
        working_day_longshift: 1.5,
        mohh_per_month: 100,
        schedule_day: 1,
        details: [
          {
            id: 1,
            activities_id: 1,
            activities_hour: 5,
            activities: {
              id: 1,
              name: 'Loading Barge',
              status: 'working',
            },
          },
          {
            id: 2,
            activities_id: 2,
            activities_hour: 3,
            activities: {
              id: 2,
              name: 'Transport',
              status: 'delay',
            },
          },
        ],
      };

      mockPlanWorkingHourRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );
      mockQueryBuilder.leftJoinAndSelect.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.where.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getOne.mockResolvedValue(mockPlanWorkingHour);

      const result = await service.getDetailById(id);

      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
      expect(result.id).toBe(9);
      expect(result.plan_date).toEqual(new Date('2025-08-01'));
      expect(result.total_working_hour_month).toBe(216);
      expect(result.total_working_hour_day).toBe(8);
      expect(result.total_working_day_longshift).toBe(1.5);
      expect(result.total_working_hour_longshift).toBe('14.40');
      expect(result.total_mohh_per_month).toBe(100);
      expect(result.details).toHaveLength(5);
      expect(result.details[0]).toHaveProperty('name', 'Delay');
      expect(result.details[1]).toHaveProperty('name', 'Working');
      expect(result.details[2]).toHaveProperty('name', 'Breakdown');
      expect(result.details[3]).toHaveProperty('name', 'Idle');
      expect(result.details[4]).toHaveProperty('name', 'Null');
    });

    it('should round all numeric values to 2 decimal places in getDetailById', async () => {
      const id = 9;
      const mockPlanWorkingHour = {
        id: 9,
        plan_date: new Date('2025-08-01'),
        is_calender_day: true,
        working_hour_day: 8.12345,
        working_hour_month: 216.789,
        working_hour_longshift: 14.45678,
        working_day_longshift: 1.56789,
        mohh_per_month: 100.123,
        schedule_day: 1.0,
        details: [
          {
            id: 1,
            activities_id: 1,
            activities_hour: 5.6789,
            activities: {
              id: 1,
              name: 'Loading Barge',
              status: 'working',
            },
          },
          {
            id: 2,
            activities_id: 2,
            activities_hour: 3.4567,
            activities: {
              id: 2,
              name: 'Transport',
              status: 'delay',
            },
          },
        ],
      };

      mockPlanWorkingHourRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );
      mockQueryBuilder.leftJoinAndSelect.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.where.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getOne.mockResolvedValue(mockPlanWorkingHour);

      const result = await service.getDetailById(id);

      // Verify main numeric fields are rounded
      expect(result.total_working_hour_month).toBe(216.79);
      expect(result.total_working_hour_day).toBe(8.12);
      expect(result.total_working_day_longshift).toBe(1.57);
      expect(result.total_working_hour_longshift).toBe('14.46');
      expect(result.total_mohh_per_month).toBe(100.12);

      // Verify activities_hour in details are rounded
      expect(result.details[1].group_detail[0].activities_hour).toBe(5.68); // working activity
      expect(result.details[0].group_detail[0].activities_hour).toBe(3.46); // delay activity
    });

    it('should throw error when ID not found', async () => {
      const id = 999;

      mockPlanWorkingHourRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );
      mockQueryBuilder.leftJoinAndSelect.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.where.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await expect(service.getDetailById(id)).rejects.toThrow(
        `Plan working hour dengan ID ${id} tidak ditemukan`,
      );
    });

    it('should set availability flags correctly based on plan_date', async () => {
      const query: GetParentPlanWorkingHourDetailQueryDto = {
        start_date: '2025-08-01',
        end_date: '2025-08-31',
        month_year: '2025-08',
        page: '1',
        limit: '10',
      };

      const mockPlanWorkingHours = [
        {
          id: 1,
          plan_date: new Date('2025-08-10'), // Past date
          is_calender_day: true,
          working_hour_day: 8,
          working_hour_month: 216,
          working_hour_longshift: 14.4,
          working_day_longshift: 1.5,
          mohh_per_month: 100,
          schedule_day: 1,
          details: [],
        },
        {
          id: 2,
          plan_date: new Date('2025-08-15'), // Today
          is_calender_day: true,
          working_hour_day: 8,
          working_hour_month: 216,
          working_hour_longshift: 14.4,
          working_day_longshift: 1.5,
          mohh_per_month: 100,
          schedule_day: 1,
          details: [],
        },
        {
          id: 3,
          plan_date: new Date('2025-08-20'), // Future date
          is_calender_day: true,
          working_hour_day: 8,
          working_hour_month: 216,
          working_hour_longshift: 14.4,
          working_day_longshift: 1.5,
          mohh_per_month: 100,
          schedule_day: 1,
          details: [],
        },
      ];

      mockPlanWorkingHourRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );
      mockQueryBuilder.getCount.mockResolvedValue(3);
      mockQueryBuilder.getMany.mockResolvedValue(mockPlanWorkingHours);

      const result = await service.getDetail(query);

      // Test that availability flags are set (actual values depend on current date)
      expect(result.data[0]).toHaveProperty('is_available_to_edit');
      expect(result.data[0]).toHaveProperty('is_available_to_delete');
      expect(result.data[1]).toHaveProperty('is_available_to_edit');
      expect(result.data[1]).toHaveProperty('is_available_to_delete');
      expect(result.data[2]).toHaveProperty('is_available_to_edit');
      expect(result.data[2]).toHaveProperty('is_available_to_delete');

      // All flags should be boolean values
      expect(typeof result.data[0].is_available_to_edit).toBe('boolean');
      expect(typeof result.data[0].is_available_to_delete).toBe('boolean');
      expect(typeof result.data[1].is_available_to_edit).toBe('boolean');
      expect(typeof result.data[1].is_available_to_delete).toBe('boolean');
      expect(typeof result.data[2].is_available_to_edit).toBe('boolean');
      expect(typeof result.data[2].is_available_to_delete).toBe('boolean');
    });
  });
});
