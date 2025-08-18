import { Injectable, HttpException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from './entities/user-role.entity';
import { CreateUserRoleDto, UpdateUserRoleDto } from './dto/user-role.dto';
import { ApiResponse, successResponse, throwError, emptyDataResponse } from '../../common/helpers/response.helper';

@Injectable()
export class UserRoleService {
  constructor(
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
  ) {}

  async create(createUserRoleDto: CreateUserRoleDto): Promise<ApiResponse<UserRole>> {
    try {
      // Check if combination already exists
      const existing = await this.userRoleRepository.findOne({
        where: {
          user_id: createUserRoleDto.user_id,
          role_id: createUserRoleDto.role_id,
        },
      });

      if (existing) {
        throwError('User role combination already exists', 409);
      }

      const userRole = this.userRoleRepository.create(createUserRoleDto);
      const result = await this.userRoleRepository.save(userRole);

      return successResponse(result, 'User role created successfully', 201);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to create user role');
    }
  }

  async findAll(): Promise<ApiResponse<UserRole[]>> {
    try {
      const result = await this.userRoleRepository.find({
        relations: ['user', 'role'],
        order: { createdAt: 'DESC' },
      });

      return successResponse(result, 'Get user roles successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch user roles');
    }
  }

  async findOne(id: number): Promise<ApiResponse<UserRole | null>> {
    try {
      const userRole = await this.userRoleRepository.findOne({
        where: { id },
        relations: ['user', 'role'],
      });

      if (!userRole) {
        return emptyDataResponse('User role not found', null);
      }

      return successResponse(userRole, 'Get user role successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch user role');
    }
  }

  async update(id: number, updateUserRoleDto: UpdateUserRoleDto): Promise<ApiResponse<UserRole | null>> {
    try {
      const userRole = await this.userRoleRepository.findOne({
        where: { id },
      });

      if (!userRole) {
        return emptyDataResponse('User role not found', null);
      }

      // Check if new combination already exists (if being updated)
      if (updateUserRoleDto.user_id || updateUserRoleDto.role_id) {
        const newUserId = updateUserRoleDto.user_id || userRole.user_id;
        const newRoleId = updateUserRoleDto.role_id || userRole.role_id;

        const existing = await this.userRoleRepository.findOne({
          where: {
            user_id: newUserId,
            role_id: newRoleId,
          },
        });

        if (existing && existing.id !== id) {
          throwError('User role combination already exists', 409);
        }
      }

      Object.assign(userRole, updateUserRoleDto);
      const result = await this.userRoleRepository.save(userRole);

      return successResponse(result, 'User role updated successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to update user role');
    }
  }

  async remove(id: number): Promise<ApiResponse<null>> {
    try {
      const userRole = await this.userRoleRepository.findOne({
        where: { id },
      });

      if (!userRole) {
        return emptyDataResponse('User role not found', null);
      }

      await this.userRoleRepository.remove(userRole);

      return successResponse(null, 'User role deleted successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to delete user role');
    }
  }

  async findByUserId(userId: number): Promise<ApiResponse<UserRole[]>> {
    try {
      const result = await this.userRoleRepository.find({
        where: { user_id: userId },
        relations: ['role'],
      });

      return successResponse(result, 'Get user roles by user ID successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch user roles by user ID');
    }
  }

  async findByRoleId(roleId: number): Promise<ApiResponse<UserRole[]>> {
    try {
      const result = await this.userRoleRepository.find({
        where: { role_id: roleId },
        relations: ['user'],
      });

      return successResponse(result, 'Get user roles by role ID successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch user roles by role ID');
    }
  }

  async assignRoleToUser(userId: number, roleId: number, createdBy: number): Promise<ApiResponse<UserRole>> {
    const createUserRoleDto: CreateUserRoleDto = {
      user_id: userId,
      role_id: roleId,
      createdBy,
    };
    return this.create(createUserRoleDto);
  }

  async removeRoleFromUser(userId: number, roleId: number): Promise<ApiResponse<null>> {
    try {
      const userRole = await this.userRoleRepository.findOne({
        where: { user_id: userId, role_id: roleId },
      });

      if (!userRole) {
        return emptyDataResponse('User role combination not found', null);
      }

      await this.userRoleRepository.remove(userRole);

      return successResponse(null, 'Role removed from user successfully');
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to remove role from user');
    }
  }
}
