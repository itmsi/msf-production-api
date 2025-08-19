import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
  UseGuards,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MenuHasPermissionService } from './menu-has-permission.service';
import {
  CreateMenuHasPermissionDto,
  UpdateMenuHasPermissionDto,
  MenuHasPermissionResponseDto,
} from './dto/menu-has-permission.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';

@ApiTags('Menu Has Permission')
@ApiBearerAuth('jwt')
@Controller('menu-has-permissions')
export class MenuHasPermissionController {
  constructor(
    private readonly menuHasPermissionService: MenuHasPermissionService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createMenuHasPermissionDto: CreateMenuHasPermissionDto,
    @Request() req: any,
  ) {
    if (!createMenuHasPermissionDto.createdBy) {
      createMenuHasPermissionDto.createdBy = req.user?.id;
    }
    return this.menuHasPermissionService.create(createMenuHasPermissionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.menuHasPermissionService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-menu/:menuId')
  findByMenuId(@Param('menuId', ParseIntPipe) menuId: number) {
    return this.menuHasPermissionService.findByMenuId(menuId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-permission/:permissionId')
  findByPermissionId(
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ) {
    return this.menuHasPermissionService.findByPermissionId(permissionId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuHasPermissionService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuHasPermissionDto: UpdateMenuHasPermissionDto,
    @Request() req: any,
  ) {
    if (!updateMenuHasPermissionDto.updatedBy) {
      updateMenuHasPermissionDto.updatedBy = req.user?.id;
    }
    return this.menuHasPermissionService.update(id, updateMenuHasPermissionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.menuHasPermissionService.remove(id);
  }
}
