import {
  Injectable,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Roles } from './entities/roles.entity';
import { ILike, Not, Repository } from 'typeorm';
import {
  ApiResponse,
  successResponse,
  throwError,
  emptyDataResponse,
} from '../../common/helpers/response.helper';
import { paginateResponse } from '../../common/helpers/public.helper';
import * as bcrypt from 'bcrypt';
import {
  CreateRolesDto,
  RolesResponseDto,
  GetRolesQueryDto,
  UpdateRolesDto,
} from './dto/roles.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Roles)
    private rolesRepository: Repository<Roles>,
  ) {}

  async findByPositionName(position_name: string): Promise<Roles | null> {
    return this.rolesRepository.findOne({
      where: {
        position_name,
      },
      withDeleted: false,
    });
  }

  async findById(id: number): Promise<ApiResponse<any>> {
    try {
      const result: any = await this.rolesRepository.findOne({ where: { id } });
      if (!result) {
        return emptyDataResponse('Role not found', null);
      }
      const response: any = {
        id: result.id,
        position_name: result.position_name,
      };
      return successResponse(response);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch role');
    }
  }

  async findAll(query: GetRolesQueryDto): Promise<ApiResponse<Roles[]>> {
    try {
      const page = parseInt(query.page ?? '1', 10);
      const limit = parseInt(query.limit ?? '10', 10);
      const skip = (page - 1) * limit;

      const [result, total] = await this.rolesRepository.findAndCount({
        where: query.search ? [{ position_name: ILike(`%${query.search}%`) }] : {},
        order: {
          id: 'DESC',
        },
        skip,
        take: limit,
      });

      return paginateResponse(
        result,
        total,
        page,
        limit,
        'Get roles successfully',
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to fetch roles');
    }
  }

  async create(data: CreateRolesDto): Promise<ApiResponse<RolesResponseDto>> {
    try {
      // Check if role_code already exists
      const existingRoleCode = await this.rolesRepository.findOne({
        where: { role_code: data.role_code },
      });
      if (existingRoleCode) {
        throwError('Role code already exists', 409);
      }

      // Check if position_name already exists
      const existingPositionName = await this.findByPositionName(data.position_name);
      if (existingPositionName) {
        throwError('Role name already exists', 409);
      }

      const newRole = this.rolesRepository.create(data);
      const result = await this.rolesRepository.save(newRole);
      const response: RolesResponseDto = {
        id: result.id,
        role_code: result.role_code,
        position_name: result.position_name,
        role_parent: result.role_parent,
        sites_id: result.sites_id,
      };

      return successResponse(response, 'Create new role successfully', 201);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create role');
    }
  }

  async update(
    id: number,
    updateDto: UpdateRolesDto,
  ): Promise<ApiResponse<Roles | null>> {
    try {
      const roles = await this.rolesRepository.findOne({ where: { id } });
      if (!roles) {
        return emptyDataResponse('Role not found', null);
      }

      if (updateDto.role_code) {
        const existingRole = await this.rolesRepository.findOne({
          where: {
            role_code: updateDto.role_code,
            id: Not(id),
          },
        });
        if (existingRole) {
          throwError('Role Code already in use by another role', 409);
        }
      }

      const updatedData = {
        ...updateDto,
      };

      const updateRoles = this.rolesRepository.merge(roles!, updatedData);
      const result = await this.rolesRepository.save(updateRoles);

      const response: any = {
        id: result.id,
        role_code: result.role_code,
        position_name: result.position_name,
        role_parent: result.role_parent,
        sites_id: result.sites_id,
      };

      return successResponse(response, 'Roles updated successfully');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update roles');
    }
  }

  async remove(id: number): Promise<ApiResponse<null>> {
    try {
      const roles = await this.rolesRepository.findOne({ where: { id } });

      if (!roles) {
        return emptyDataResponse('Role not found', null);
      }
      await this.rolesRepository.softRemove(roles!);

      return successResponse(null, 'Roles deleted successfully');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete roles');
    }
  }
}
