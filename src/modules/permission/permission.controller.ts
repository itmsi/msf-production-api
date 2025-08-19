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
import { PermissionService } from './permission.service';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  PermissionResponseDto,
} from './dto/permission.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';

@ApiTags('Permission')
@ApiBearerAuth('jwt')
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createPermissionDto: CreatePermissionDto,
    @Request() req: any,
  ) {
    if (!createPermissionDto.createdBy) {
      createPermissionDto.createdBy = req.user?.id;
    }
    return this.permissionService.create(createPermissionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.permissionService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.permissionService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
    @Request() req: any,
  ) {
    if (!updatePermissionDto.updatedBy) {
      updatePermissionDto.updatedBy = req.user?.id;
    }
    return this.permissionService.update(id, updatePermissionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const deletedBy = req.user?.id;
    return this.permissionService.remove(id, deletedBy);
  }
}
