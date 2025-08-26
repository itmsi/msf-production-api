import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Department } from '../department/entities/department.entity';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, Department])],
  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
