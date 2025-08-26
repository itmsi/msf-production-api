import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiExtraModels,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';
import { DepartmentService } from './department.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  DepartmentResponseDto,
  GetDepartmentsQueryDto,
} from './dto';

@ApiTags('Department')
@ApiBearerAuth('jwt')
@Controller('departments')
@UseGuards(JwtAuthGuard)
@ApiExtraModels(DepartmentResponseDto)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Membuat department baru',
    description: 'Membuat department baru dengan nama yang unik. Nama department tidak boleh kosong dan maksimal 255 karakter.',
  })
  @ApiResponse({
    status: 201,
    description: 'Department berhasil dibuat',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 201 },
        message: { type: 'string', example: 'Department berhasil dibuat' },
        data: { $ref: '#/components/schemas/DepartmentResponseDto' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validasi error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Validation failed' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - department dengan nama tersebut sudah ada',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'Department dengan nama tersebut sudah ada' },
        error: { type: 'string', example: 'Conflict' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - token tidak valid',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentService.create(createDepartmentDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Mendapatkan semua department',
    description: 'Mengambil semua department dengan pagination, filtering, dan sorting. Mendukung pencarian berdasarkan nama department.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Nomor halaman untuk pagination',
    example: 1,
    type: 'number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Jumlah item per halaman (maksimal 100)',
    example: 10,
    type: 'number',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Kata kunci pencarian berdasarkan nama department',
    example: 'human',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Field untuk sorting',
    example: 'name',
    enum: ['id', 'name', 'createdAt', 'updatedAt'],
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Urutan sorting',
    example: 'ASC',
    enum: ['ASC', 'DESC'],
  })
  @ApiResponse({
    status: 200,
    description: 'Department berhasil diambil',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Data department berhasil diambil' },
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/DepartmentResponseDto' },
        },
        pagination: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 25 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            lastPage: { type: 'number', example: 3 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tidak ada department ditemukan',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Data department berhasil diambil' },
        data: { type: 'array', items: {} },
        pagination: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 0 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            lastPage: { type: 'number', example: 0 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - token tidak valid',
  })
  async findAll(@Query() queryDto: GetDepartmentsQueryDto) {
    return this.departmentService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Mendapatkan department berdasarkan ID',
    description: 'Mengambil department spesifik berdasarkan ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID Department',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Department berhasil diambil',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Department berhasil diambil' },
        data: { $ref: '#/components/schemas/DepartmentResponseDto' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Department tidak ditemukan',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Department tidak ditemukan' },
        data: { type: 'null' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - token tidak valid',
  })
  @ApiResponse({
    status: 404,
    description: 'Department tidak ditemukan',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Memperbarui department',
    description: 'Memperbarui department yang sudah ada. Nama department harus unik.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID Department',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Department berhasil diperbarui',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Department berhasil diperbarui' },
        data: { $ref: '#/components/schemas/DepartmentResponseDto' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validasi error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Validation failed' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Department tidak ditemukan',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - department dengan nama tersebut sudah ada',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'Department dengan nama tersebut sudah ada' },
        error: { type: 'string', example: 'Conflict' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - token tidak valid',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Menghapus department',
    description: 'Soft delete department berdasarkan ID. Data tidak benar-benar dihapus dari database.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID Department',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Department berhasil dihapus',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Department berhasil dihapus' },
        data: { type: 'null' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - token tidak valid',
  })
  @ApiResponse({
    status: 404,
    description: 'Department tidak ditemukan',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.remove(id);
  }
}