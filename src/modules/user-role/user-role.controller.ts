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
import { UserRoleService } from './user-role.service';
import {
  CreateUserRoleDto,
  UpdateUserRoleDto,
  UserRoleResponseDto,
} from './dto/user-role.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';

@ApiTags('User Role')
@ApiBearerAuth('jwt')
@Controller('user-roles')
export class UserRoleController {
  constructor(private readonly userRoleService: UserRoleService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createUserRoleDto: CreateUserRoleDto, @Request() req: any) {
    if (!createUserRoleDto.createdBy) {
      createUserRoleDto.createdBy = req.user?.id;
    }
    return this.userRoleService.create(createUserRoleDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('assign')
  assignRoleToUser(
    @Body() body: { user_id: number; role_id: number },
    @Request() req: any,
  ) {
    const createdBy = req.user?.id;
    return this.userRoleService.assignRoleToUser(
      body.user_id,
      body.role_id,
      createdBy,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('remove')
  removeRoleFromUser(@Body() body: { user_id: number; role_id: number }) {
    return this.userRoleService.removeRoleFromUser(body.user_id, body.role_id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.userRoleService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-user/:userId')
  findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.userRoleService.findByUserId(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-role/:roleId')
  findByRoleId(@Param('roleId', ParseIntPipe) roleId: number) {
    return this.userRoleService.findByRoleId(roleId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userRoleService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
    @Request() req: any,
  ) {
    if (!updateUserRoleDto.updatedBy) {
      updateUserRoleDto.updatedBy = req.user?.id;
    }
    return this.userRoleService.update(id, updateUserRoleDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userRoleService.remove(id);
  }
}
