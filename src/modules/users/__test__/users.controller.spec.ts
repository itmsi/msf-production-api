import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { UserResponseDto } from '../dto/user.dto';
import { ApiResponse } from '@/common/helpers/response.helper';
import { Users } from '../entities/users.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const userEntity: Users = {
    id: 1,
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    password: 'hashed-password',
    roleId: 2,
    isActive: true,
    createdAt: new Date(),
    deletedAt: null,
  };
  const userDto: UserResponseDto = {
    id: 1,
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    roleId: 2,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should return all users', async () => {
    const result: ApiResponse<UserResponseDto[]> = {
      statusCode: 200,
      message: 'Success',
      data: [userDto],
    };

    jest.spyOn(service, 'findAll').mockResolvedValue(result);
    expect(await controller.findAll({} as any)).toEqual(result);
  });

  it('should return user by id', async () => {
    const result: ApiResponse<UserResponseDto> = {
      statusCode: 200,
      message: 'User found',
      data: userDto,
    };

    jest.spyOn(service, 'findById').mockResolvedValue(result);
    expect(await controller.findOne(1)).toEqual(result);
  });

  it('should create a user', async () => {
    const result: ApiResponse<UserResponseDto> = {
      statusCode: 201,
      message: 'User created',
      data: userDto,
    };

    jest.spyOn(service, 'create').mockResolvedValue(result);

    const createDto = {
      username: 'johndoe',
      password: 'password123',
      name: 'John Doe',
      email: 'john@example.com',
      roleId: 2,
    };

    expect(await controller.create(createDto)).toEqual(result);
  });

  it('should update a user', async () => {
    const result: ApiResponse<Users> = {
      statusCode: 200,
      message: 'User updated',
      data: userEntity,
    };

    jest.spyOn(service, 'update').mockResolvedValue(result);

    const updateDto = {
      name: 'John Updated',
      email: 'updated@example.com',
      roleId: 2,
    };

    expect(await controller.update(1, updateDto)).toEqual(result);
  });

  it('should remove a user', async () => {
    const result: ApiResponse<null> = {
      statusCode: 200,
      message: 'User deleted',
      data: null,
    };

    jest.spyOn(service, 'remove').mockResolvedValue(result);

    expect(await controller.remove(1)).toEqual(result);
  });
});
