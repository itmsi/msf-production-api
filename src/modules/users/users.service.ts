import {
  Injectable,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/users.entity';
import { FindOneOptions, ILike, Not, Repository } from 'typeorm';
import { RabbitmqService } from '../../integrations/rabbitmq/rabbitmq.service';
import {
  ApiResponse,
  successResponse,
  throwError,
} from '../../common/helpers/response.helper';
import { paginateResponse } from '../../common/helpers/public.helper';
import * as bcrypt from 'bcrypt';
import {
  CreateUserDto,
  UserResponseDto,
  GetUsersQueryDto,
  UpdateUserDto,
  ForgotPassDto,
} from './dto/user.dto';
import { plainToInstance } from 'class-transformer';
import { randomBytes } from 'crypto';
import { MailService } from '../../integrations/mail/mail.service';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    private readonly mailService: MailService,
    private readonly dataSource: DataSource,
  ) {}

  async findByUsername(username: string): Promise<Users | null> {
    return this.userRepository.findOne({
      where: {
        username,
        isActive: true,
      },
      withDeleted: false,
      relations: ['roles', 'employees', 'sites'],
    });
  }

  async findByEmail(email: string): Promise<Users | null> {
    return this.userRepository.findOne({
      where: {
        email,
        isActive: true,
      },
      withDeleted: false,
      relations: ['roles', 'employees', 'sites'],
    });
  }

  async findByIdWithRole(id: number) {
    return this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'employees', 'sites'],
    });
  }

  async findById(id: number): Promise<ApiResponse<any>> {
    const result: any = await this.userRepository.findOne({
      where: { id },
      relations: ['employees', 'roles'],
    });
    if (!result) {
      throwError('User not found', 404);
    }
    const response: any = {
      id: result.id,
      username: result.username,
      name: result.name,
      roleId: result.roleId,
    };
    return successResponse(result);
  }

  async findAll(
    query: GetUsersQueryDto,
  ): Promise<ApiResponse<UserResponseDto[]>> {
    try {
      const page = parseInt(query.page ?? '1', 10);
      const limit = parseInt(query.limit ?? '10', 10);
      const skip = (page - 1) * limit;
      const search = query.search?.toLowerCase() ?? '';
      const role = query.role?.toLowerCase() ?? '';

      const qb = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.employees', 'employees')
        .leftJoinAndSelect('user.roles', 'roles')
        .leftJoinAndSelect('user.sites', 'sites');

      if (search) {
        qb.where('user.username ILIKE :search', {
          search: `%${search}%`,
        }).orWhere('user.name ILIKE :search', {
          search: `%${search}%`,
        });
      }
      if (role) {
        qb.andWhere('roles.name ILIKE :role', { role: `%${role}%` });
      }

      qb.orderBy('user.id', 'DESC').skip(skip).take(limit);

      const [result, total] = await qb.getManyAndCount();

      const transformedResult = plainToInstance(Users, result, {
        excludeExtraneousValues: true,
      });

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
        ...data,
        password: hashedPassword,
      });
      const result = await this.userRepository.save(newUser);
      const response: UserResponseDto = {
        id: result.id,
        username: result.username,
        email: result.email,
        roleId: result.roleId,
        employee_id: result.employee_id,
        sites_id: result.sites_id,
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
  ): Promise<ApiResponse<Users>> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });

      if (!user) {
        throwError('User not found', 404);
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

      const updatedUser = this.userRepository.merge(user!, updateDto);
      const result = await this.userRepository.save(updatedUser);
      const response: any = {
        id: result.id,
        username: result.username,
        email: result.email,
        roleId: result.roleId,
        sites_id: result.sites_id,
      };
      return successResponse(response, 'User updated successfully');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async remove(id: number): Promise<ApiResponse<null>> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });

      if (!user) {
        throwError('User not found', 404);
      }
      await this.userRepository.softRemove(user!);

      return successResponse(null, 'User deleted successfully');
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
