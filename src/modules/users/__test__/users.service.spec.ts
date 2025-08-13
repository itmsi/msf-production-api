import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { Repository, Timestamp } from 'typeorm';
import { Users } from '../entities/users.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MailService } from '../../../integrations/mail/mail.service';
import {
  CreateUserDto,
  UpdateUserDto,
  GetUsersQueryDto,
} from '../dto/user.dto';
import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

const mockUser: Users = {
  id: 1,
  username: 'testuser',
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashedpassword',
  roleId: 1,
  isActive: true,
  deletedAt: null,
  createdAt: new Date(),
  reset_password_token: null,
  reset_password_expires: null,
};

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<Users>>;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(Users),
          useValue: {
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            merge: jest.fn(),
            softRemove: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(Users));
    mailService = module.get(MailService);
  });
  describe('findByIdWithRole', () => {
    it('should return user with roles when found', async () => {
      const mockUserWithRole = plainToInstance(Users, {
        id: 1,
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        roleId: 1,
        isActive: true,
        reset_password_token: null,
        reset_password_expires: null,
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-01T00:00:00Z'),
        deletedAt: null,
        roles: [
          {
            id: 1,
            roleCode: 'ADMIN',
            name: 'Administrator',
            role_parent: null,
            createdAt: new Date('2025-01-01T00:00:00Z'),
            updatedAt: new Date('2025-01-01T00:00:00Z'),
            deletedAt: null,
          },
        ],
      });

      repository.findOne.mockResolvedValueOnce(mockUserWithRole);

      const result = await service.findByIdWithRole(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['roles'],
      });

      expect(result).toEqual(mockUserWithRole);
    });

    it('should return null if user not found', async () => {
      repository.findOne.mockResolvedValueOnce(null);

      const result = await service.findByIdWithRole(999);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: ['roles'],
      });

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user when user exists', async () => {
      const fixedDate = new Date('2025-01-01T00:00:00.000Z');

      const mockUser = {
        id: 1,
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        roleId: 1,
        isActive: true,
        reset_password_token: null,
        reset_password_expires: null,
        createdAt: fixedDate,
        updatedAt: fixedDate,
        deletedAt: null,
      };

      repository.findOne.mockResolvedValueOnce(mockUser);

      const result = await service.findById(mockUser.id);
      expect(result).toMatchObject({
        statusCode: 200,
        message: 'Retrieve data success',
      });
    });

    it('should throw 404 when user not found', async () => {
      repository.findOne.mockResolvedValueOnce(null);

      await expect(service.findById(999)).rejects.toThrow('User not found');
    });
  });

  describe('findByResetPasswordToken', () => {
    it('should return user if token is valid', async () => {
      repository.findOne.mockResolvedValueOnce(mockUser);

      const result = await service.findByPassword('abc');
      expect(result).toMatchObject({
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const query: GetUsersQueryDto = { page: '1', limit: '10', search: '' };
      repository.findAndCount.mockResolvedValueOnce([[mockUser], 1]);

      const result = await service.findAll(query);
      expect(result.data?.length).toBe(1);
    });

    it('should throw InternalServerErrorException on error', async () => {
      repository.findAndCount.mockRejectedValueOnce(new Error('DB error'));

      await expect(service.findAll({ page: '1', limit: '10' })).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('create', () => {
    const dto: CreateUserDto = {
      username: 'testuser',
      password: 'password123',
      name: 'Test User',
      email: 'test@example.com',
      roleId: 1,
    };

    it('should create a new user', async () => {
      repository.findOne.mockResolvedValueOnce(null); // no duplicate
      repository.create.mockReturnValue(mockUser);
      repository.save.mockResolvedValueOnce(mockUser);
      // jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpassword');

      const result = await service.create(dto);
      expect(result.data?.username).toBe(dto.username);
    });

    it('should throw conflict if username exists', async () => {
      repository.findOne.mockResolvedValueOnce(mockUser);
      await expect(service.create(dto)).rejects.toThrow(HttpException);
    });

    it('should throw InternalServerErrorException on failure', async () => {
      repository.findOne.mockResolvedValueOnce(null);
      repository.create.mockReturnValue(mockUser);
      repository.save.mockRejectedValueOnce(new Error('DB error'));
      // jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpassword');

      await expect(service.create(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    const dto: UpdateUserDto = {
      name: 'Updated Name',
      email: 'updated@example.com',
    };

    it('should update user', async () => {
      repository.findOne.mockResolvedValueOnce(mockUser);
      repository.merge.mockReturnValueOnce({ ...mockUser, ...dto });
      repository.save.mockResolvedValueOnce({ ...mockUser, ...dto });

      const result = await service.update(1, dto);
      expect(result.data?.name).toBe(dto.name);
    });

    it('should throw not found if user missing', async () => {
      repository.findOne.mockResolvedValueOnce(null);
      await expect(service.update(1, dto)).rejects.toThrow(HttpException);
    });

    it('should throw InternalServerErrorException on error', async () => {
      repository.findOne.mockResolvedValueOnce(mockUser);
      repository.merge.mockReturnValueOnce({ ...mockUser, ...dto });
      repository.save.mockRejectedValueOnce(new Error('DB error'));

      await expect(service.update(1, dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete user', async () => {
      repository.findOne.mockResolvedValueOnce(mockUser);
      // repository.softRemove.mockResolvedValueOnce(undefined);

      const result = await service.remove(1);
      expect(result.message).toContain('User deleted');
    });

    it('should throw 404 if user not found', async () => {
      repository.findOne.mockResolvedValueOnce(null);
      await expect(service.remove(1)).rejects.toThrow(HttpException);
    });

    it('should throw InternalServerErrorException on error', async () => {
      repository.findOne.mockResolvedValueOnce(mockUser);
      repository.softRemove.mockRejectedValueOnce(new Error('fail'));
      await expect(service.remove(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('sendResetPasswordEmail', () => {
    it('should send reset email if user exists', async () => {
      repository.findOne.mockResolvedValueOnce(mockUser);
      repository.save.mockResolvedValueOnce({
        ...mockUser,
        reset_password_token: 'abc',
      });
      const result = await service.sendResetPasswordEmail(mockUser.email);

      expect(mailService.sendEmail).toHaveBeenCalled();
      expect(result?.message).toContain('reset link');
    });

    it('should still respond success even if user not found', async () => {
      repository.findOne.mockResolvedValueOnce(null);
      const result = await service.sendResetPasswordEmail('nouser@example.com');

      expect(result?.message).toContain('If your email is registered');
    });

    it('should throw 500 on failure', async () => {
      repository.findOne.mockRejectedValueOnce(new Error('DB error'));

      await expect(
        service.sendResetPasswordEmail(mockUser.email),
      ).rejects.toThrow(HttpException);
    });
  });
});
