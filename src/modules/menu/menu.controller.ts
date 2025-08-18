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
import { MenuService } from './menu.service';
import { CreateMenuDto, UpdateMenuDto, MenuResponseDto } from './dto/menu.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';

@ApiTags('Menu')
@ApiBearerAuth('jwt')
@Controller('menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createMenuDto: CreateMenuDto, @Request() req: any) {
    if (!createMenuDto.createdBy) {
      createMenuDto.createdBy = req.user?.id;
    }
    return this.menuService.create(createMenuDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.menuService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('tree')
  getMenuTree() {
    return this.menuService.getMenuTree();
  }

  @UseGuards(JwtAuthGuard)
  @Get('module/:module')
  findByModule(@Param('module') module: string) {
    return this.menuService.findByModule(module);
  }

  @UseGuards(JwtAuthGuard)
  @Get('tree/module/:module')
  getMenuTreeByModule(@Param('module') module: string) {
    return this.menuService.getMenuTreeByModule(module);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuDto: UpdateMenuDto,
    @Request() req: any,
  ) {
    if (!updateMenuDto.updatedBy) {
      updateMenuDto.updatedBy = req.user?.id;
    }
    return this.menuService.update(id, updateMenuDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const deletedBy = req.user?.id;
    return this.menuService.remove(id, deletedBy);
  }
}
