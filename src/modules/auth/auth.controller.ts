import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  LoginResponseDto,
  ProfileResponseDto,
} from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto, CheckTokenDto } from './dto/reset-password.dto';
import { successResponse } from '../../common/helpers/response.helper';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Login user ke sistem',
    description:
      'Melakukan autentikasi user dengan username dan password, mengembalikan JWT access token',
  })
  @ApiBody({
    type: LoginDto,
    description: 'Data login user',
    examples: {
      example1: {
        summary: 'Contoh login dengan admin',
        description: 'Contoh login menggunakan akun admin',
        value: {
          username: 'admin',
          password: 'admin123',
        },
      },
      example2: {
        summary: 'Contoh login dengan user biasa',
        description: 'Contoh login menggunakan akun user biasa',
        value: {
          username: 'usertest',
          password: 'user123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login berhasil',
    type: LoginResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Login succesfully!',
        data: {
          access_token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJ0ZXN0Iiwic3ViIjoxLCJpc0FjdGl2ZSI6dHJ1ZSwicm9sZXMiOltdLCJpYXQiOjE2MjM5Mjk5MDYsImV4cCI6MTYyMzk3MzEwNn0.example',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Data login tidak valid',
    schema: {
      example: {
        statusCode: 400,
        message: 'password should not be empty',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Username atau password salah',
    schema: {
      example: {
        statusCode: 404,
        message: 'Please check your account or password!',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(
      body.username,
      body.password,
    );
    const exec = this.authService.login(user);
    return successResponse(exec, 'Login succesfully!');
  }

  @ApiBearerAuth('jwt')
  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Mendapatkan profile user yang sedang login',
    description:
      'Mengambil data profile user berdasarkan JWT token yang diberikan, termasuk role dan employee data',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile berhasil diambil',
    type: ProfileResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Get profile successfully!',
        data: {
          id: 1,
          username: 'usertest',
          email: 'john@example.com',
          isActive: true,
          employee_id: 1,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          userRoles: [
            {
              role: {
                id: 1,
                role_code: 'ADMIN',
                position_name: 'Administrator',
              },
            },
          ],
          employees: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            department: 'IT',
            position: 'Developer',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User tidak ditemukan',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  async getProfile(@Request() req) {
    const user = await this.authService.getProfileWithRole(req.user.id);
    return successResponse(user, 'Get profile successfully!');
  }
}
