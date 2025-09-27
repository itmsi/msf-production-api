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
  Res,
  UseInterceptors,
  UploadedFile,
  Req,
  StreamableFile,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { BaseDataProductionService } from './base-data-production.service';
import {
  CreateBaseDataProductionDto,
  UpdateBaseDataProductionDto,
  QueryBaseDataProductionDto,
  PaginatedBaseDataProductionResponseDto,
  ParentBaseDataProResponseDto,
  QueryExportBaseDataProductionDto,
} from './dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { join } from 'path';
import { createReadStream } from 'fs';

@ApiTags('Base Data Production')
@ApiBearerAuth('jwt')
@Controller('base-data-production')
export class BaseDataProductionController {
  constructor(private readonly baseDataProductionService: BaseDataProductionService) {}

  @Get('export')
  @ApiOperation({
    summary: 'Export data production dari CSV',
  })
  async exportData(@Query() queryDto: QueryExportBaseDataProductionDto, @Res({ passthrough: false }) res: Response) {
    return await this.baseDataProductionService.exportData(queryDto, res);
  }

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
  create(@Body() createBaseDataProductionDto: CreateBaseDataProductionDto, @Request() req: any) {
    return this.baseDataProductionService.create(createBaseDataProductionDto, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all base data production with pagination and filters',
  })
  @ApiOperation({
    summary: 'Get all base data production with pagination and filters',
  })
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
  update(@Param('id') id: string, @Body() updateBaseDataProductionDto: UpdateBaseDataProductionDto, @Request() req: any) {
    return this.baseDataProductionService.update(+id, updateBaseDataProductionDto, req.user.id);
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

  @Get('import/template')
  @ApiOperation({
    summary: 'Download template CSV untuk import Base Data Pro',
    description: 'Mendownload template CSV yang berisi format kolom yang diperlukan',
  })
  downloadTemplate(): StreamableFile {
    try {
      const file = join(process.cwd(), 'src/modules/base-data-production/template-production-import.csv');
      const stream = createReadStream(file);
      return new StreamableFile(stream, {
        type: 'text/csv',
        disposition: 'attachment; filename="template-production-import.csv"',
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to download CSV template');
    }
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importData(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    const userId = req.user?.id;
    return this.baseDataProductionService.importData(file, userId);
  }
}
