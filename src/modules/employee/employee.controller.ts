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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto, UpdateEmployeeDto, GetEmployeesQueryDto } from './dto/employee.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';

@ApiTags('Employee')
@ApiBearerAuth('jwt')
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: GetEmployeesQueryDto) {
    return this.employeeService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-department/:department')
  findByDepartment(@Param('department') department: string) {
    return this.employeeService.findByDepartment(department);
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-status/:status')
  findByStatus(@Param('status') status: string) {
    return this.employeeService.findByStatus(status);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.employeeService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeeService.update(id, updateEmployeeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.employeeService.remove(id);
  }
}
