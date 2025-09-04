import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { SettingDashboardService } from './setting-dashboard.service';
import { CreateSettingDashboardDto, UpdateSettingDashboardDto } from './dto/setting-dashboard.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  SettingDashboardListResponseDto,
  SingleSettingDashboardResponseDto,
} from './dto/setting-dashboard.dto';

@ApiTags('Setting Dashboard')
@ApiBearerAuth('jwt')
@Controller('setting-dashboard')
export class SettingDashboardController {
  constructor(private readonly settingDashboardService: SettingDashboardService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Membuat setting dashboard baru',
    description: 'Endpoint untuk membuat setting dashboard dengan cycle_time, fuel_ratio, dan speed',
  })
  @ApiResponse({
    status: 201,
    description: 'Setting dashboard berhasil dibuat',
    type: SingleSettingDashboardResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Data tidak valid',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Token tidak valid',
  })
  create(@Body() createSettingDashboardDto: CreateSettingDashboardDto) {
    return this.settingDashboardService.create(createSettingDashboardDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Mendapatkan semua data setting dashboard dengan pagination',
    description: 'Endpoint untuk mengambil data setting dashboard dengan pagination',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Data setting dashboard berhasil diambil',
    type: SettingDashboardListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Token tidak valid',
  })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.settingDashboardService.findAll(page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Mendapatkan data setting dashboard berdasarkan ID',
    description: 'Endpoint untuk mengambil data setting dashboard berdasarkan ID',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID setting dashboard',
  })
  @ApiResponse({
    status: 200,
    description: 'Data setting dashboard berhasil diambil',
    type: SingleSettingDashboardResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Setting dashboard tidak ditemukan',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Token tidak valid',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.settingDashboardService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({
    summary: 'Mengupdate data setting dashboard berdasarkan ID',
    description: 'Endpoint untuk mengupdate data setting dashboard berdasarkan ID',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID setting dashboard',
  })
  @ApiResponse({
    status: 200,
    description: 'Setting dashboard berhasil diupdate',
    type: SingleSettingDashboardResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Setting dashboard tidak ditemukan',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Data tidak valid',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Token tidak valid',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSettingDashboardDto: UpdateSettingDashboardDto,
  ) {
    return this.settingDashboardService.update(id, updateSettingDashboardDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Menghapus data setting dashboard berdasarkan ID',
    description: 'Endpoint untuk menghapus data setting dashboard berdasarkan ID (soft delete)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID setting dashboard',
  })
  @ApiResponse({
    status: 200,
    description: 'Setting dashboard berhasil dihapus',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Setting dashboard tidak ditemukan',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Token tidak valid',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.settingDashboardService.remove(id);
  }
}
