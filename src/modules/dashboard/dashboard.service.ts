import { Injectable, NotFoundException, InternalServerErrorException, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository, SelectQueryBuilder } from 'typeorm';

import {
  successResponse,
  emptyDataResponse,
  throwError,
} from '../../common/helpers/response.helper';
import { ParentBaseDataPro } from '../base-data-production/entities';
import { ApiResponse } from '@nestjs/swagger';
import { SpiderAchievementResponseDto } from './dto/response-dashboard-metrics.dto';
import { an } from '@faker-js/faker/dist/airline-CLphikKp';
import { QueryDashboardMetricsDto } from './dto/query-dashboard-metrics.dto';

export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data?: T;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(ParentBaseDataPro)
    private parentBaseDataProRepository: Repository<ParentBaseDataPro>,
  ) {}

  async findAll(@Query() query: QueryDashboardMetricsDto): Promise<any> {
      try {
        const transformedData = [
          { metric: '', target: 100, actual: 80, percent: 80 },
          { metric: 'Prod', target: 120, actual: 90, percent: 75 },
          { metric: 'EWH', target: 90, actual: 70, percent: 78 },
          { metric: 'FR', target: 95, actual: 95, percent: 100 },
          { metric: 'Speed', target: 110, actual: 100, percent: 91 },
        ];

        return successResponse(transformedData, 'Barge forms retrieved successfully');
      } catch (error) {
        throwError('Failed to retrieve barge forms', 500);
      }
    }

    async getMtdAchievement(): Promise<any> {
      try {
        const transformedData = [
          { metric: 'CT', target: 100, actual: 80, percent: 80 },
          { metric: 'Prod', target: 120, actual: 90, percent: 75 },
          { metric: 'EWH', target: 90, actual: 70, percent: 78 },
          { metric: 'FR', target: 95, actual: 95, percent: 100 },
          { metric: 'Speed', target: 110, actual: 100, percent: 91 },
        ];

        return successResponse(transformedData, 'Barge forms retrieved successfully');
      } catch (error) {
        throwError('Failed to retrieve barge forms', 500);
      }
    }
}