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
import { RoleHasPermissionService } from './role-has-permission.service';
import {
  CreateRoleHasPermissionDto,
  UpdateRoleHasPermissionDto,
  RoleHasPermissionResponseDto,
} from './dto/role-has-permission.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';

@ApiTags('Role Has Permission')
@ApiBearerAuth('jwt')
@Controller('role-has-permissions')
export class RoleHasPermissionController {
  constructor(
    private readonly roleHasPermissionService: RoleHasPermissionService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createRoleHasPermissionDto: CreateRoleHasPermissionDto,
    @Request() req: any,
  ) {
    if (!createRoleHasPermissionDto.createdBy) {
      createRoleHasPermissionDto.createdBy = req.user?.id;
    }
    return this.roleHasPermissionService.create(createRoleHasPermissionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.roleHasPermissionService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-role/:roleId')
  findByRoleId(@Param('roleId', ParseIntPipe) roleId: number) {
    return this.roleHasPermissionService.findByRoleId(roleId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-permission/:permissionId')
  findByPermissionId(
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ) {
    return this.roleHasPermissionService.findByPermissionId(permissionId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-menu-has-permission/:mhpId')
  findByMenuHasPermissionId(@Param('mhpId', ParseIntPipe) mhpId: number) {
    return this.roleHasPermissionService.findByMenuHasPermissionId(mhpId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roleHasPermissionService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleHasPermissionDto: UpdateRoleHasPermissionDto,
    @Request() req: any,
  ) {
    if (!updateRoleHasPermissionDto.updatedBy) {
      updateRoleHasPermissionDto.updatedBy = req.user?.id;
    }
    return this.roleHasPermissionService.update(id, updateRoleHasPermissionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roleHasPermissionService.remove(id);
  }
}
