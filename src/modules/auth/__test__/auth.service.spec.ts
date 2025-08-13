import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import * as bcrypt from 'bcrypt';
import { ResetPasswordDto } from '../dto/reset-password.dto';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUsersService = {
    findByUsername: jest.fn(),
    findByIdWithRole: jest.fn(),
    sendResetPasswordEmail: jest.fn(),
    findByPassword: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if valid', async () => {
      const mockUser = { id: 1, username: 'admin', password: 'hashed' };
      usersService.findByUsername.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('admin', 'password');
      expect(result).toEqual({ id: 1, username: 'admin' });
    });

    it('should throw error if user not found or password invalid', async () => {
      usersService.findByUsername.mockResolvedValue(null);
      await expect(service.validateUser('admin', 'wrong')).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should return access_token', () => {
      const mockUser = {
        id: 1,
        username: 'admin',
        roles: { name: 'admin' },
        roleId: 1,
        isActive: true,
      };
      jwtService.sign.mockReturnValue('signed-token');
      const result = service.login(mockUser);
      expect(result).toEqual({ access_token: 'signed-token' });
    });
  });

  describe('getProfileWithRole', () => {
    it('should return user profile without password', async () => {
      const mockUser = {
        id: 1,
        username: 'admin',
        password: 'hashed',
        role: { name: 'admin' },
      };
      usersService.findByIdWithRole.mockResolvedValue(mockUser as any);

      const result = await service.getProfileWithRole(1);
      expect(result).not.toHaveProperty('password');
      expect((result as { username: string }).username).toBe('admin');
    });

    it('should throw error if user not found', async () => {
      usersService.findByIdWithRole.mockResolvedValue(null);
      await expect(service.getProfileWithRole(999)).rejects.toThrow();
    });
  });

  describe('sendResetPasswordEmail', () => {
    it('should call usersService.sendResetPasswordEmail', async () => {
      usersService.sendResetPasswordEmail.mockResolvedValue({
        success: true,
      } as any);
      const result = await service.sendResetPasswordEmail('user@example.com');
      expect(result).toEqual({ success: true });
      expect(usersService.sendResetPasswordEmail).toHaveBeenCalledWith(
        'user@example.com',
      );
    });
  });

  describe('resetPassword', () => {
    const dto: ResetPasswordDto = {
      token: 'token123',
      password: 'newpassword',
      confirmPassword: 'newpassword',
    };

    it('should update user password if valid token and not expired', async () => {
      const user = {
        id: 1,
        email: 'user@example.com',
        reset_password_token: 'token123',
        reset_password_expires: new Date(Date.now() + 100000),
      };
      usersService.findByPassword.mockResolvedValue(user as any);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await service.resetPassword(dto);
      expect(usersService.update).toHaveBeenCalled();
      expect(result).toEqual({ email: 'user@example.com' });
    });

    it('should throw error if passwords do not match', async () => {
      const invalidDto = { ...dto, confirmPassword: 'wrong' };
      await expect(service.resetPassword(invalidDto)).rejects.toThrow(
        'Passwords do not match',
      );
    });

    it('should throw error if token expired', async () => {
      const expiredUser = {
        reset_password_expires: new Date(Date.now() - 1000),
      };
      usersService.findByPassword.mockResolvedValue(expiredUser as any);
      await expect(service.resetPassword(dto)).rejects.toThrow(
        'Invalid or expired reset token',
      );
    });

    it('should throw error if user not found', async () => {
      usersService.findByPassword.mockResolvedValue(null);
      await expect(service.resetPassword(dto)).rejects.toThrow(
        'Invalid or expired reset token',
      );
    });

    it('should throw error if reset_password_expires is missing or expired', async () => {
      const user = {
        id: 1,
        reset_password_token: 'token123',
        reset_password_expires: undefined, // or can be null
      };
      usersService.findByPassword.mockResolvedValue(user as any);

      await expect(service.resetPassword(dto)).rejects.toThrow(
        'Invalid or expired reset token',
      );
    });

    it('should throw error if reset_password_expires < now', async () => {
      const user = {
        id: 1,
        reset_password_token: 'token123',
        reset_password_expires: new Date(Date.now() - 5000),
      };
      usersService.findByPassword.mockResolvedValue(user as any);

      await expect(service.resetPassword(dto)).rejects.toThrow(
        'Invalid or expired reset token',
      );
    });
  });

  describe('cekTokenReset', () => {
    const dto: ResetPasswordDto = {
      token: 'token123',
      password: '',
      confirmPassword: '',
    };

    it('should return email and countdown if token valid', async () => {
      const user = {
        email: 'user@example.com',
        reset_password_expires: new Date(Date.now() + 60000),
      };
      usersService.findByPassword.mockResolvedValue(user as any);

      const result = await service.cekTokenReset(dto);
      expect(result.email).toBe('user@example.com');
      expect(result.expired).toBeDefined();
    });

    it('should throw error if token invalid or expired', async () => {
      usersService.findByPassword.mockResolvedValue(null);
      await expect(service.cekTokenReset(dto)).rejects.toThrow();
    });

    it('should throw error if user not found', async () => {
      usersService.findByPassword.mockResolvedValue(null);

      await expect(service.cekTokenReset(dto)).rejects.toThrow(
        'Invalid or expired reset token',
      );
    });

    it('should throw error if reset_password_expires is missing or expired', async () => {
      const expiredUser = {
        email: 'user@example.com',
        reset_password_expires: new Date(Date.now() - 5000),
      };
      usersService.findByPassword.mockResolvedValue(expiredUser as any);

      await expect(service.cekTokenReset(dto)).rejects.toThrow(
        'Invalid or expired reset token',
      );
    });
  });
});
