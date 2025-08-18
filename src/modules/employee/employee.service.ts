import { Injectable, HttpException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Not } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeResponseDto, GetEmployeesQueryDto } from './dto/employee.dto';
import { ApiResponse, successResponse, throwError, emptyDataResponse } from '../../common/helpers/response.helper';
import { paginateResponse } from '../../common/helpers/public.helper';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<ApiResponse<EmployeeResponseDto>> {
    try {
      // Check if NIP already exists
      const existingEmployee = await this.employeeRepository.findOne({
        where: { nip: createEmployeeDto.nip },
      });

      if (existingEmployee) {
        throwError('NIP already exists', 409);
      }

      const employee = this.employeeRepository.create(createEmployeeDto);
      const result = await this.employeeRepository.save(employee);

      const response: EmployeeResponseDto = {
        id: result.id,
        firstName: result.firstName,
        lastName: result.lastName,
        name: result.name,
        department: result.department,
        position: result.position,
        nip: result.nip,
        status: result.status as any,
        salary: result.salary,
        createdAt: result.createdAt!,
        updatedAt: result.updatedAt!,
      };

      return successResponse(response, 'Employee created successfully', 201);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to create employee');
    }
  }

  async findAll(query: GetEmployeesQueryDto): Promise<ApiResponse<EmployeeResponseDto[]>> {
    try {
      const page = parseInt(query.page || '1', 10);
      const limit = parseInt(query.limit || '10', 10);
      const skip = (page - 1) * limit;

      const qb: SelectQueryBuilder<Employee> = this.employeeRepository
        .createQueryBuilder('employee')
        .where('employee.deletedAt IS NULL');

      if (query.search) {
        qb.andWhere(
          '(employee.firstName ILIKE :search OR employee.lastName ILIKE :search OR employee.department ILIKE :search OR employee.position ILIKE :search)',
          { search: `%${query.search}%` },
        );
      }

      if (query.department) {
        qb.andWhere('employee.department = :department', { department: query.department });
      }

      if (query.status) {
        qb.andWhere('employee.status = :status', { status: query.status });
      }

      qb.orderBy('employee.id', 'DESC').skip(skip).take(limit);

      const [result, total] = await qb.getManyAndCount();

      const transformedResult = result.map(employee => ({
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        name: employee.name,
        department: employee.department,
        position: employee.position,
        nip: employee.nip,
        status: employee.status as any,
        salary: employee.salary,
        createdAt: employee.createdAt!,
        updatedAt: employee.updatedAt!,
      }));

      return paginateResponse(
        transformedResult,
        total,
        page,
        limit,
        'Get employees successfully',
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch employees');
    }
  }

  async findOne(id: number): Promise<ApiResponse<EmployeeResponseDto | null>> {
    try {
      const employee = await this.employeeRepository.findOne({
        where: { id, deletedAt: null as any },
      });

      if (!employee) {
        return emptyDataResponse('Employee not found', null);
      }

      const response: EmployeeResponseDto = {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        name: employee.name,
        department: employee.department,
        position: employee.position,
        nip: employee.nip,
        status: employee.status as any,
        salary: employee.salary,
        createdAt: employee.createdAt!,
        updatedAt: employee.updatedAt!,
      };

      return successResponse(response, 'Get employee successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch employee');
    }
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto): Promise<ApiResponse<EmployeeResponseDto | null>> {
    try {
      const employee = await this.employeeRepository.findOne({
        where: { id, deletedAt: null as any },
      });

      if (!employee) {
        return emptyDataResponse('Employee not found', null);
      }

      // Check if NIP already exists (if being updated)
      if (updateEmployeeDto.nip && updateEmployeeDto.nip !== employee.nip) {
        const existingEmployee = await this.employeeRepository.findOne({
          where: { nip: updateEmployeeDto.nip, deletedAt: null as any },
        });

        if (existingEmployee) {
          throwError('NIP already exists', 409);
        }
      }

      Object.assign(employee, updateEmployeeDto);
      const result = await this.employeeRepository.save(employee);

      const response: EmployeeResponseDto = {
        id: result.id,
        firstName: result.firstName,
        lastName: result.lastName,
        name: result.name,
        department: result.department,
        position: result.position,
        nip: result.nip,
        status: result.status as any,
        salary: result.salary,
        createdAt: result.createdAt!,
        updatedAt: result.updatedAt!,
      };

      return successResponse(response, 'Employee updated successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to update employee');
    }
  }

  async remove(id: number): Promise<ApiResponse<null>> {
    try {
      const employee = await this.employeeRepository.findOne({
        where: { id, deletedAt: null as any },
      });

      if (!employee) {
        return emptyDataResponse('Employee not found', null);
      }

      await this.employeeRepository.softDelete(id);

      return successResponse(null, 'Employee deleted successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to delete employee');
    }
  }

  async findByNip(nip: number): Promise<Employee | null> {
    return this.employeeRepository.findOne({
      where: { nip, deletedAt: null as any },
    });
  }

  async findByDepartment(department: string): Promise<ApiResponse<EmployeeResponseDto[]>> {
    try {
      const result = await this.employeeRepository.find({
        where: { department, deletedAt: null as any },
        order: { firstName: 'ASC', lastName: 'ASC' },
      });

      const transformedResult = result.map(employee => ({
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        name: employee.name,
        department: employee.department,
        position: employee.position,
        nip: employee.nip,
        status: employee.status as any,
        salary: employee.salary,
        createdAt: employee.createdAt!,
        updatedAt: employee.updatedAt!,
      }));

      return successResponse(transformedResult, 'Get employees by department successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch employees by department');
    }
  }

  async findByStatus(status: string): Promise<ApiResponse<EmployeeResponseDto[]>> {
    try {
      const result = await this.employeeRepository.find({
        where: { status, deletedAt: null as any },
        order: { firstName: 'ASC', lastName: 'ASC' },
      });

      const transformedResult = result.map(employee => ({
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        name: employee.name,
        department: employee.department,
        position: employee.position,
        nip: employee.nip,
        status: employee.status as any,
        salary: employee.salary,
        createdAt: employee.createdAt!,
        updatedAt: employee.updatedAt!,
      }));

      return successResponse(transformedResult, 'Get employees by status successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch employees by status');
    }
  }
}
