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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BaseDataProductionService } from './base-data-production.service';
import {
  CreateBaseDataProductionDto,
  UpdateBaseDataProductionDto,
  QueryBaseDataProductionDto,
} from './dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import {
  SwaggerCreateBaseDataProduction,
  SwaggerFindAllBaseDataProduction,
  SwaggerFindOneBaseDataProduction,
  SwaggerUpdateBaseDataProduction,
  SwaggerDeleteBaseDataProduction,
} from './swagger/base-data-production.swagger';

@ApiTags('Base Data Production')
@ApiBearerAuth('jwt')
@Controller('base-data-production')
export class BaseDataProductionController {
  constructor(
    private readonly baseDataProductionService: BaseDataProductionService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @SwaggerCreateBaseDataProduction()
  create(@Body() dto: CreateBaseDataProductionDto, @Request() req: any) {
    return this.baseDataProductionService.create(dto, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @SwaggerFindAllBaseDataProduction()
  findAll(@Query() queryDto: QueryBaseDataProductionDto) {
    return this.baseDataProductionService.findAll(queryDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @SwaggerFindOneBaseDataProduction()
  findOne(@Param('id') id: string) {
    return this.baseDataProductionService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @SwaggerUpdateBaseDataProduction()
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBaseDataProductionDto,
    @Request() req: any,
  ) {
    return this.baseDataProductionService.update(+id, dto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @SwaggerDeleteBaseDataProduction()
  remove(@Param('id') id: string) {
    return this.baseDataProductionService.remove(+id);
  }
}
