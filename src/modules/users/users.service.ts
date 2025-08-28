import {
  Injectable,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Not } from 'typeorm';
import { Users } from './entities/users.entity';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/user.dto';
import {
  ApiResponse,
  successResponse,
  throwError,
  emptyDataResponse,
} from '../../common/helpers/response.helper';
import { paginateResponse } from '../../common/helpers/public.helper';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { UserRole } from './entities/user-role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: string,
    position_name?: string,
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC',
  ): Promise<ApiResponse<UserResponseDto[]>> {
    try {
      const skip = (page - 1) * limit;
      const qb: SelectQueryBuilder<Users> = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.employees', 'employee')
        .leftJoinAndSelect('user.userRoles', 'userRole')
        .leftJoinAndSelect('userRole.role', 'role')
        .where('user.deletedAt IS NULL'); // Exclude soft deleted records

      if (search) {
        qb.andWhere(
          '(user.username ILIKE :search OR user.email ILIKE :search OR employee.firstName ILIKE :search OR employee.lastName ILIKE :search)',
          { search: `%${search}%` },
        );
      }

      if (role) {
        qb.andWhere('role.roleCode = :role', { role });
      }

      // Filter by position_name (case-insensitive)
      if (position_name) {
        qb.andWhere('LOWER(role.position_name) = LOWER(:position_name)', { position_name });
      }

      // Validate limit
      if (limit > 100) {
        throwError('Limit tidak boleh lebih dari 100', 400);
      }

      // Validate sortBy field to prevent SQL injection
      const allowedSortFields = [
        'id',
        'username',
        'email',
        'createdAt',
        'updatedAt',
      ];
      const validSortBy = allowedSortFields.includes(sortBy || '')
        ? sortBy
        : 'id';
      const validSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

      qb.orderBy(`user.${validSortBy}`, validSortOrder)
        .skip(skip)
        .take(limit);

      const [result, total] = await qb.getManyAndCount();

      const transformedResult = result.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        isActive: user.isActive,
        employee_id: user.employee_id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt || undefined,
        roles:
          user.userRoles?.map((ur) => ({
            id: ur.role.id,
            role_code: ur.role.role_code,
            position_name: ur.role.position_name,
          })) || [],
        employees: user.employees
          ? {
              id: user.employees.id,
              firstName: user.employees.firstName,
              lastName: user.employees.lastName,
              email: `${user.employees.firstName.toLowerCase()}.${user.employees.lastName.toLowerCase()}@company.com`,
            }
          : undefined,
      }));

      return paginateResponse(
        transformedResult,
        total,
        page,
        limit,
        'Get users successfully',
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async create(data: CreateUserDto): Promise<ApiResponse<UserResponseDto>> {
    try {
      const existing = await this.findByUsername(data.username);
      if (existing) {
        throwError('Username already registered', 409);
      }

      const existingMail = await this.findByEmail(data.email);
      if (existingMail) {
        throwError('Email already registered', 409);
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const newUser = this.userRepository.create({
        username: data.username,
        password: hashedPassword,
        email: data.email,
        employee_id: data.employee_id,
        isActive: true,
      });

      const result = await this.userRepository.save(newUser);

      // Create user-role relationship
      if (data.roleId) {
        const userRole = this.userRoleRepository.create({
          user_id: result.id,
          role_id: data.roleId,
        });
        await this.userRoleRepository.save(userRole);
      }

      const response: UserResponseDto = {
        id: result.id,
        username: result.username,
        email: result.email,
        isActive: result.isActive,
        employee_id: result.employee_id,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt || undefined,
        roles: [],
        employees: undefined,
      };

      return successResponse(response);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async update(
    id: number,
    updateDto: UpdateUserDto,
  ): Promise<ApiResponse<Users | null>> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });

      if (!user) {
        return emptyDataResponse('User not found', null);
      }

      if ('password' in updateDto) {
        delete updateDto.password;
      }

      if (updateDto.email) {
        const existingVin = await this.userRepository.findOne({
          where: {
            email: updateDto.email,
            id: Not(id),
          },
        });
        if (existingVin) {
          throwError(
            `Email ${updateDto.email} already in use by another user`,
            409,
          );
        }
      }

      const updatedUser = this.userRepository.merge(user, updateDto);
      const result = await this.userRepository.save(updatedUser);

      // Update user-role relationship if roleId is provided
      if (updateDto.roleId) {
        // Remove existing user-role relationships
        await this.userRoleRepository.delete({ user_id: id });

        // Create new user-role relationship
        const userRole = this.userRoleRepository.create({
          user_id: id,
          role_id: updateDto.roleId,
        });
        await this.userRoleRepository.save(userRole);
      }

      const response: any = {
        id: result.id,
        username: result.username,
        email: result.email,
        employee_id: result.employee_id,
      };
      return successResponse(response, 'User updated successfully');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async findOne(id: number): Promise<ApiResponse<Users | null>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['employees', 'userRoles', 'userRoles.role'],
      });

      if (!user) {
        return emptyDataResponse('User not found', null);
      }

      return successResponse(user, 'User found successfully');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async findByUsername(username: string): Promise<Users | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<Users | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async remove(id: number): Promise<ApiResponse<null>> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });

      if (!user) {
        return emptyDataResponse('User not found', null);
      }

      // Remove user-role relationships first
      await this.userRoleRepository.delete({ user_id: id });

      // Remove user
      await this.userRepository.softDelete(id);

      return successResponse(null, 'User deleted successfully');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
