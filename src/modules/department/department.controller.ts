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
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerApiResponse } from '@nestjs/swagger';
import { DepartmentService } from './department.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  DepartmentResponseDto,
  GetDepartmentsQueryDto,
} from './dto/department.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';

@ApiTags('Departments')
@Controller('departments')
@UseGuards(JwtAuthGuard)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new department' })
  @SwaggerApiResponse({
    status: 201,
    description: 'Department created successfully',
    type: DepartmentResponseDto,
  })
  @SwaggerApiResponse({
    status: 409,
    description: 'Department name already exists',
  })
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentService.create(createDepartmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all departments with pagination and search' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Departments retrieved successfully',
    type: [DepartmentResponseDto],
  })
  findAll(@Query() query: GetDepartmentsQueryDto) {
    return this.departmentService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Department retrieved successfully',
    type: DepartmentResponseDto,
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Department not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update department by ID' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Department updated successfully',
    type: DepartmentResponseDto,
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Department not found',
  })
  @SwaggerApiResponse({
    status: 409,
    description: 'Department name already exists',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete department by ID (soft delete)' })
  @SwaggerApiResponse({
    status: 200,
    description: 'Department deleted successfully',
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'Department not found',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.remove(id);
  }
}
