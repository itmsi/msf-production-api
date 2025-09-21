import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  PaginatedBaseDataProductionResponseDto,
  ParentBaseDataProResponseDto,
} from '../dto';

export function SwaggerCreateBaseDataProduction() {
  return applyDecorators(
    ApiOperation({ summary: 'Create new base data production' }),
    ApiResponse({
      status: 201,
      description: 'Base data production created successfully',
      type: ParentBaseDataProResponseDto,
    }),
    ApiResponse({ status: 400, description: 'Bad request' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
}

export function SwaggerFindAllBaseDataProduction() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all base data production with pagination and filters',
    }),
    ApiResponse({
      status: 200,
      description: 'Base data production retrieved successfully',
      type: PaginatedBaseDataProductionResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
}

export function SwaggerFindOneBaseDataProduction() {
  return applyDecorators(
    ApiOperation({ summary: 'Get base data production by ID' }),
    ApiResponse({
      status: 200,
      description: 'Base data production retrieved successfully',
      type: ParentBaseDataProResponseDto,
    }),
    ApiResponse({ status: 404, description: 'Base data production not found' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
}

export function SwaggerUpdateBaseDataProduction() {
  return applyDecorators(
    ApiOperation({ summary: 'Update base data production by ID' }),
    ApiResponse({
      status: 200,
      description: 'Base data production updated successfully',
      type: ParentBaseDataProResponseDto,
    }),
    ApiResponse({ status: 404, description: 'Base data production not found' }),
    ApiResponse({ status: 400, description: 'Bad request' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
}

export function SwaggerDeleteBaseDataProduction() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete base data production by ID' }),
    ApiResponse({
      status: 200,
      description: 'Base data production deleted successfully',
    }),
    ApiResponse({ status: 404, description: 'Base data production not found' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
}
