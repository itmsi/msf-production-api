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
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BaseDataProductionService } from './base-data-production.service';
import {
  CreateBaseDataProductionDto,
  UpdateBaseDataProductionDto,
  QueryBaseDataProductionDto,
  PaginatedBaseDataProductionResponseDto,
  ParentBaseDataProResponseDto,
} from './dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';

@ApiTags('Base Data Production')
@ApiBearerAuth('jwt')
@Controller('base-data-production')
export class BaseDataProductionController {
  constructor(
    private readonly baseDataProductionService: BaseDataProductionService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create new base data production' })
  @ApiResponse({
    status: 201,
    description: 'Base data production created successfully',
    type: ParentBaseDataProResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @Body() createBaseDataProductionDto: CreateBaseDataProductionDto,
    @Request() req: any,
  ) {
    return this.baseDataProductionService.create(
      createBaseDataProductionDto,
      req.user.id,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all base data production with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'Base data production retrieved successfully',
    type: PaginatedBaseDataProductionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query() queryDto: QueryBaseDataProductionDto) {
    return this.baseDataProductionService.findAll(queryDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get base data production by ID' })
  @ApiResponse({
    status: 200,
    description: 'Base data production retrieved successfully',
    type: ParentBaseDataProResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Base data production not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.baseDataProductionService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update base data production by ID' })
  @ApiResponse({
    status: 200,
    description: 'Base data production updated successfully',
    type: ParentBaseDataProResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Base data production not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Param('id') id: string,
    @Body() updateBaseDataProductionDto: UpdateBaseDataProductionDto,
    @Request() req: any,
  ) {
    return this.baseDataProductionService.update(
      +id,
      updateBaseDataProductionDto,
      req.user.id,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete base data production by ID' })
  @ApiResponse({
    status: 200,
    description: 'Base data production deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Base data production not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string) {
    return this.baseDataProductionService.remove(+id);
  }
}
