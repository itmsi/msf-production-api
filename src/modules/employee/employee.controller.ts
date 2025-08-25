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
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  GetEmployeesQueryDto,
  EmployeeResponseDto,
  EmployeeListResponseDto,
  SingleEmployeeResponseDto,
  EmployeeStatus,
} from './dto/employee.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';

@ApiTags('Employee')
@ApiBearerAuth('jwt')
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Membuat employee baru',
    description:
      'Membuat employee baru dengan validasi duplikasi NIP. NIP harus unik dalam sistem.',
  })
  @ApiResponse({
    status: 201,
    description: 'Employee berhasil dibuat',
    type: SingleEmployeeResponseDto,
    schema: {
      example: {
        statusCode: 201,
        message: 'Employee created successfully',
        data: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          name: 'John Doe',
          department: 'IT',
          position: 'Software Engineer',
          nip: 123456789,
          status: 'active',
          salary: '5000000',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Data tidak valid',
    schema: {
      example: {
        statusCode: 400,
        message: 'firstName should not be empty',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'NIP sudah terdaftar',
    schema: {
      example: {
        statusCode: 409,
        message: 'NIP already exists',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary:
      'Mendapatkan semua data employee dengan pagination, filtering, dan sorting',
    description: `
      Endpoint ini mendukung:
      - Pagination dengan parameter page dan limit
      - Pencarian umum dengan parameter search
      - Filter berdasarkan department dan status
      - Sorting berdasarkan field tertentu
      - Urutan sorting ASC atau DESC
    `,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: String,
    description: 'Nomor halaman (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: String,
    description: 'Jumlah data per halaman (default: 10, max: 100)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description:
      'Pencarian umum di field firstName, lastName, department, position',
  })
  @ApiQuery({
    name: 'department',
    required: false,
    type: String,
    description: 'Filter berdasarkan department',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: EmployeeStatus,
    description: 'Filter berdasarkan status',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Field untuk sorting',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Urutan sorting',
  })
  @ApiResponse({
    status: 200,
    description: 'Data employee berhasil diambil',
    type: EmployeeListResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Get employees successfully',
        data: [
          {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            name: 'John Doe',
            department: 'IT',
            position: 'Software Engineer',
            nip: 123456789,
            status: 'active',
            salary: '5000000',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
          {
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            name: 'Jane Smith',
            department: 'HR',
            position: 'HR Manager',
            nip: 987654321,
            status: 'active',
            salary: '8000000',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 10,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Parameter query tidak valid',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  findAll(@Query() query: GetEmployeesQueryDto) {
    return this.employeeService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-department/:department')
  @ApiOperation({
    summary: 'Mendapatkan employee berdasarkan department',
    description: 'Mengambil semua employee yang berada di department tertentu',
  })
  @ApiParam({
    name: 'department',
    description: 'Nama department yang akan dicari',
    example: 'IT',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Data employee berdasarkan department berhasil diambil',
    type: [EmployeeResponseDto],
    schema: {
      example: {
        statusCode: 200,
        message: 'Get employees by department successfully',
        data: [
          {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            name: 'John Doe',
            department: 'IT',
            position: 'Software Engineer',
            nip: 123456789,
            status: 'active',
            salary: '5000000',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
  })
  findByDepartment(@Param('department') department: string) {
    return this.employeeService.findByDepartment(department);
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-status/:status')
  @ApiOperation({
    summary: 'Mendapatkan employee berdasarkan status',
    description: 'Mengambil semua employee yang memiliki status tertentu',
  })
  @ApiParam({
    name: 'status',
    description: 'Status employee yang akan dicari',
    enum: EmployeeStatus,
    example: 'active',
  })
  @ApiResponse({
    status: 200,
    description: 'Data employee berdasarkan status berhasil diambil',
    type: [EmployeeResponseDto],
    schema: {
      example: {
        statusCode: 200,
        message: 'Get employees by status successfully',
        data: [
          {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            name: 'John Doe',
            department: 'IT',
            position: 'Software Engineer',
            nip: 123456789,
            status: 'active',
            salary: '5000000',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
  })
  findByStatus(@Param('status') status: string) {
    return this.employeeService.findByStatus(status);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Mendapatkan data employee berdasarkan ID',
    description: 'Mengambil data employee berdasarkan ID yang diberikan',
  })
  @ApiParam({
    name: 'id',
    description: 'ID employee yang akan diambil',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Data employee berhasil diambil',
    type: SingleEmployeeResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Get employee successfully',
        data: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          name: 'John Doe',
          department: 'IT',
          position: 'Software Engineer',
          nip: 123456789,
          status: 'active',
          salary: '5000000',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - ID tidak valid',
    schema: {
      example: {
        statusCode: 400,
        message: 'ID harus berupa angka',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Employee tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'Employee not found',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.employeeService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({
    summary: 'Mengupdate data employee berdasarkan ID',
    description:
      'Mengupdate data employee dengan validasi duplikasi NIP. Hanya field yang dikirim yang akan diupdate.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID employee yang akan diupdate',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Employee berhasil diupdate',
    type: SingleEmployeeResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Employee updated successfully',
        data: {
          id: 1,
          firstName: 'John Updated',
          lastName: 'Doe',
          name: 'John Updated Doe',
          department: 'IT',
          position: 'Senior Software Engineer',
          nip: 123456789,
          status: 'active',
          salary: '6000000',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Data tidak valid',
    schema: {
      example: {
        statusCode: 400,
        message: 'firstName should not be empty',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Employee tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'Employee not found',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'NIP sudah digunakan oleh employee lain',
    schema: {
      example: {
        statusCode: 409,
        message: 'NIP already exists',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeeService.update(id, updateEmployeeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Menghapus data employee berdasarkan ID (soft delete)',
    description: `
      Melakukan soft delete pada employee:
      - Data tidak benar-benar dihapus dari database
      - Field deletedAt akan diisi dengan timestamp saat ini
      - Data yang sudah di-soft delete tidak akan muncul di query findAll
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'ID employee yang akan dihapus',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Employee berhasil dihapus',
    schema: {
      example: {
        statusCode: 200,
        message: 'Employee deleted successfully',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - ID tidak valid',
    schema: {
      example: {
        statusCode: 400,
        message: 'ID harus berupa angka',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Employee tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'Employee not found',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.employeeService.remove(id);
  }
}
