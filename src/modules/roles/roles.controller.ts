import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiBody } from '@nestjs/swagger';
import {
  CreateRolesDto,
  GetRolesQueryDto,
  UpdateRolesDto,
} from './dto/roles.dto';

@ApiTags('Roles')
@ApiBearerAuth('jwt')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: GetRolesQueryDto) {
    return this.rolesService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.rolesService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBody({
    type: CreateRolesDto,
    description: 'Data untuk membuat role baru',
    examples: {
      example1: {
        summary: 'Contoh pembuatan role dengan semua field',
        description: 'Contoh lengkap untuk membuat role baru',
        value: {
          role_code: 'ADMIN',
          position_name: 'Administrator',
          role_parent: 'SUPER_ADMIN',
          sites_id: 1,
        },
      },
      example2: {
        summary: 'Contoh pembuatan role tanpa role_parent dan sites_id',
        description: 'Contoh minimal untuk membuat role baru',
        value: {
          role_code: 'USER',
          position_name: 'Regular User',
        },
      },
    },
  })
  create(@Body() dto: CreateRolesDto) {
    return this.rolesService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateRolesDto) {
    return this.rolesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.rolesService.remove(id);
  }
}
