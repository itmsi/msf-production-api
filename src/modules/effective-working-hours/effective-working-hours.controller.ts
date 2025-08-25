import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { EffectiveWorkingHoursService } from './effective-working-hours.service';
import {
  CreateEffectiveWorkingHoursDto,
  UpdateEffectiveWorkingHoursDto,
  QueryEffectiveWorkingHoursDto,
  EffectiveWorkingHoursResponseDto,
} from './dto/effective-working-hours.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { successResponse } from '../../common/helpers/response.helper';

@ApiTags('Effective Working Hours')
@ApiBearerAuth('jwt')
@Controller('effective-working-hours')
@UseGuards(JwtAuthGuard)
export class EffectiveWorkingHoursController {
  constructor(
    private readonly effectiveWorkingHoursService: EffectiveWorkingHoursService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create new effective working hours',
    description: 'Create a new effective working hours record with automatic duration calculation',
  })
  @ApiBody({
    type: CreateEffectiveWorkingHoursDto,
    description: 'Effective working hours data to create',
    examples: {
      standby: {
        summary: 'Standby Time Example',
        description: 'Example for creating standby time record',
        value: {
          dateActivity: '2024-01-15',
          lossType: 'STB',
          shift: 'DS',
          populationId: 1,
          activitiesId: 1,
          description: 'Standby karena hujan',
          start: '2024-01-15T08:00:00Z',
          stop: '2024-01-15T10:00:00Z',
        } as CreateEffectiveWorkingHoursDto,
      },
      breakdown: {
        summary: 'Breakdown Time Example',
        description: 'Example for creating breakdown time record',
        value: {
          dateActivity: '2024-01-15',
          lossType: 'BD',
          shift: 'NS',
          populationId: 2,
          activitiesId: 2,
          description: 'Breakdown mesin',
          start: '2024-01-15T20:00:00Z',
          stop: '2024-01-15T22:00:00Z',
        } as CreateEffectiveWorkingHoursDto,
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Effective working hours created successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 201 },
        message: { type: 'string', example: 'Effective working hours created successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            dateActivity: { type: 'string', example: '2024-01-15' },
            lossType: { type: 'string', enum: ['STB', 'BD'], example: 'STB' },
            shift: { type: 'string', enum: ['DS', 'NS'], example: 'DS' },
            populationId: { type: 'number', example: 1 },
            activitiesId: { type: 'number', example: 1 },
            description: { type: 'string', example: 'Standby karena hujan' },
            start: { type: 'string', format: 'date-time', example: '2024-01-15T08:00:00Z' },
            end: { type: 'string', format: 'date-time', example: '2024-01-15T10:00:00Z' },
            duration: { type: 'number', example: 120 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad request - validation error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'array', items: { type: 'string' }, example: ['dateActivity should not be empty'] },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - JWT token required',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  async create(@Body() createDto: CreateEffectiveWorkingHoursDto) {
    const result = await this.effectiveWorkingHoursService.create(createDto);
    return successResponse(result, 'Effective working hours created successfully');
  }

  @Get()
  @ApiOperation({
    summary: 'Get all effective working hours',
    description: 'Retrieve all effective working hours with filtering, searching, and pagination',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date for filtering (YYYY-MM-DD format)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date for filtering (YYYY-MM-DD format)',
    example: '2024-01-31',
  })
  @ApiQuery({
    name: 'lossType',
    required: false,
    description: 'Filter by loss type',
    enum: ['STB', 'BD'],
    example: 'STB',
  })
  @ApiQuery({
    name: 'keyword',
    required: false,
    description: 'Search keyword for description, activity name, unit name, type name, or model name',
    example: 'standby',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiOkResponse({
    description: 'Effective working hours retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Data retrieved successfully' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              dateActivity: { type: 'string', example: '2024-01-15' },
              lossType: { type: 'string', example: 'StandBy' },
              shift: { type: 'string', example: 'DS' },
              unit: { type: 'string', example: 'EXCAVATOR-HITACHI-EX1200' },
              activity: { type: 'string', example: 'Loading' },
              description: { type: 'string', example: 'Standby karena hujan' },
              start: { type: 'string', format: 'date-time', example: '2024-01-15T08:00:00Z' },
              end: { type: 'string', format: 'date-time', example: '2024-01-15T10:00:00Z' },
              duration: { type: 'number', example: 120 },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 25 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad request - validation error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'array', items: { type: 'string' }, example: ['Invalid date format'] },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - JWT token required',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  async findAll(@Query() query: QueryEffectiveWorkingHoursDto) {
    const result = await this.effectiveWorkingHoursService.findAll(query);
    return result;
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get effective working hours by ID',
    description: 'Retrieve a specific effective working hours record by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Effective working hours ID',
    example: 1,
    type: 'number',
  })
  @ApiOkResponse({
    description: 'Effective working hours retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Effective working hours retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            dateActivity: { type: 'string', example: '2024-01-15' },
            lossType: { type: 'string', enum: ['STB', 'BD'], example: 'STB' },
            shift: { type: 'string', enum: ['DS', 'NS'], example: 'DS' },
            populationId: { type: 'number', example: 1 },
            activitiesId: { type: 'number', example: 1 },
            description: { type: 'string', example: 'Standby karena hujan' },
            start: { type: 'string', format: 'date-time', example: '2024-01-15T08:00:00Z' },
            end: { type: 'string', format: 'date-time', example: '2024-01-15T10:00:00Z' },
            duration: { type: 'number', example: 120 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Effective working hours not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Effective working hours with ID 1 not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad request - invalid ID format',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Validation failed (numeric string is expected)' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - JWT token required',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.effectiveWorkingHoursService.findOne(id);
    return successResponse(result, 'Effective working hours retrieved successfully');
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update effective working hours',
    description: 'Update an existing effective working hours record. Duration will be recalculated if start/end times are provided.',
  })
  @ApiParam({
    name: 'id',
    description: 'Effective working hours ID to update',
    example: 1,
    type: 'number',
  })
  @ApiBody({
    type: UpdateEffectiveWorkingHoursDto,
    description: 'Effective working hours data to update',
    examples: {
      partialUpdate: {
        summary: 'Partial Update Example',
        description: 'Example for updating only specific fields',
        value: {
          description: 'Standby karena hujan lebat',
          end: '2024-01-15T11:00:00Z',
        } as UpdateEffectiveWorkingHoursDto,
      },
      fullUpdate: {
        summary: 'Full Update Example',
        description: 'Example for updating multiple fields (matches curl request)',
        value: {
          dateActivity: '2024-01-15',
          lossType: 'STB',
          shift: 'DS',
          populationId: 6,
          activitiesId: 1,
          description: 'Standby karena hujan edit',
          start: '2024-01-15T08:00:00Z',
          stop: '2024-01-15T10:00:00Z',
        } as UpdateEffectiveWorkingHoursDto,
      },
    },
  })
  @ApiOkResponse({
    description: 'Effective working hours updated successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Effective working hours updated successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            dateActivity: { type: 'string', example: '2024-01-15' },
            lossType: { type: 'string', enum: ['STB', 'BD'], example: 'STB' },
            shift: { type: 'string', enum: ['DS', 'NS'], example: 'DS' },
            populationId: { type: 'number', example: 1 },
            activitiesId: { type: 'number', example: 1 },
            description: { type: 'string', example: 'Standby karena hujan lebat' },
            start: { type: 'string', format: 'date-time', example: '2024-01-15T08:00:00Z' },
            end: { type: 'string', format: 'date-time', example: '2024-01-15T11:00:00Z' },
            duration: { type: 'number', example: 180 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Effective working hours not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Effective working hours with ID 1 not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad request - validation error or invalid ID format',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'array', items: { type: 'string' }, example: ['Invalid date format'] },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - JWT token required',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateEffectiveWorkingHoursDto,
    ) {
    const result = await this.effectiveWorkingHoursService.update(id, updateDto);
    return successResponse(result, 'Effective working hours updated successfully');
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete effective working hours',
    description: 'Soft delete an effective working hours record. The record will be marked as deleted but not removed from the database.',
  })
  @ApiParam({
    name: 'id',
    description: 'Effective working hours ID to delete',
    example: 1,
    type: 'number',
  })
  @ApiOkResponse({
    description: 'Effective working hours deleted successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Effective working hours deleted successfully' },
        data: { type: 'null', example: null },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Effective working hours not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Effective working hours with ID 1 not found' },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad request - invalid ID format',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Validation failed (numeric string is expected)' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - JWT token required',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.effectiveWorkingHoursService.remove(id);
    return successResponse(null, 'Effective working hours deleted successfully');
  }
}
