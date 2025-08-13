import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { successResponse } from '../../../common/helpers/response.helper';
import { LoginDto } from '../dto/login.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockUser = { id: 1, username: 'admin' };
  const mockJwt = { access_token: 'mocked-jwt-token' };
  const mockProfile = { id: 1, name: 'Admin', role: 'admin' };
  const mockForgot = { success: true };
  const mockReset = { updated: true };
  const mockCheckToken = { valid: true };

  const mockAuthService = {
    validateUser: jest.fn().mockResolvedValue(mockUser),
    login: jest.fn().mockReturnValue(mockJwt),
    getProfileWithRole: jest.fn().mockResolvedValue(mockProfile),
    sendResetPasswordEmail: jest.fn().mockResolvedValue(mockForgot),
    resetPassword: jest.fn().mockResolvedValue(mockReset),
    cekTokenReset: jest.fn().mockResolvedValue(mockCheckToken),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('login()', () => {
    it('should login and return token', async () => {
      const body: LoginDto = { username: 'admin', password: 'admin123' };
      const result = await authController.login(body);

      expect(authService.validateUser).toHaveBeenCalledWith(
        body.username,
        body.password,
      );
      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(successResponse(mockJwt, 'Login succesfully!'));
    });
  });

  describe('getProfile()', () => {
    it('should return user profile (mocked)', async () => {
      const mockRequest = { user: { id: 1 } };
      const result = await authController.getProfile(mockRequest);

      expect(authService.getProfileWithRole).toHaveBeenCalledWith(1);
      expect(result).toEqual(
        successResponse(mockProfile, 'Get profile successfully!'),
      );
    });
  });

  describe('forgotPassword()', () => {
    it('should send reset email', async () => {
      const body: ForgotPasswordDto = { email: 'admin@mail.com' };
      const result = await authController.forgotPassword(body);

      expect(authService.sendResetPasswordEmail).toHaveBeenCalledWith(
        body.email,
      );
      expect(result).toEqual(
        successResponse(mockForgot, 'Reset link sent to email'),
      );
    });
  });

  describe('resetPassword()', () => {
    it('should reset password successfully', async () => {
      const body: ResetPasswordDto = {
        token: 'reset-token',
        password: 'newpassword',
        confirmPassword: 'newpassword',
      };
      const result = await authController.resetPassword(body);

      expect(authService.resetPassword).toHaveBeenCalledWith(body);
      expect(result).toEqual(
        successResponse(mockReset, 'Password has been reset successfully!'),
      );
    });
  });

  describe('cekTokenReset()', () => {
    it('should validate reset token', async () => {
      const body: ResetPasswordDto = {
        token: 'valid-token',
        password: 'pass123',
        confirmPassword: 'pass123',
      };
      const result = await authController.cekTokenReset(body);

      expect(authService.cekTokenReset).toHaveBeenCalledWith(body);
      expect(result).toEqual(
        successResponse(mockCheckToken, 'Token is Valid!'),
      );
    });
  });
});
